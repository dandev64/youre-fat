/**
 * Sync service — manual push/pull to Supabase.
 *
 * Strategy:
 *  • All mutations write to Dexie immediately (offline-first).
 *  • User explicitly pushes local → remote or pulls remote → local.
 *  • No auto-sync or realtime subscriptions.
 */

import { supabase, syncEnabled } from './supabase'
import { db } from '../db/db'

// ── helpers ────────────────────────────────────────────────────────────────

function now() {
  return new Date().toISOString()
}

// ── Templates ──────────────────────────────────────────────────────────────

async function pushTemplates(userId, templates) {
  // Clear remote then bulk insert
  await supabase.from('templates').delete().eq('user_id', userId)
  if (templates.length) {
    const rows = templates.map(t => ({ id: t.id, user_id: userId, data: t, updated_at: now() }))
    const { error } = await supabase.from('templates').upsert(rows)
    if (error) throw error
  }
}

async function pullTemplates(userId) {
  const { data, error } = await supabase
    .from('templates')
    .select('data')
    .eq('user_id', userId)
  if (error) throw error
  return data.map(r => r.data)
}

// ── Sessions ───────────────────────────────────────────────────────────────

async function pushSessions(userId, workoutPlan) {
  // Collect all sessions with source === 'manual' (user-added, not from schedule)
  const rows = []
  for (const [dateStr, dayData] of Object.entries(workoutPlan)) {
    for (const session of (dayData.sessions ?? [])) {
      if (session.source === 'manual') {
        rows.push({ id: session.id, user_id: userId, date: dateStr, data: session, updated_at: now() })
      }
    }
  }
  await supabase.from('workout_sessions').delete().eq('user_id', userId)
  if (rows.length) {
    const { error } = await supabase.from('workout_sessions').upsert(rows)
    if (error) throw error
  }
}

async function pullSessions(userId) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('date, data')
    .eq('user_id', userId)
  if (error) throw error

  const map = {}
  for (const row of data) {
    if (!map[row.date]) map[row.date] = { sessions: [] }
    map[row.date].sessions.push(row.data)
  }
  return map
}

// ── Completions ────────────────────────────────────────────────────────────

async function pushCompletions(userId, completedExercises) {
  await supabase.from('completions').delete().eq('user_id', userId)
  const ids = [...completedExercises]
  if (ids.length) {
    const rows = ids.map(id => ({ exercise_id: id, user_id: userId, date: '', completed_at: now() }))
    // Supabase has row limits for bulk inserts, chunk at 500
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await supabase.from('completions').upsert(rows.slice(i, i + 500))
      if (error) throw error
    }
  }
}

async function pullCompletions(userId) {
  const { data, error } = await supabase
    .from('completions')
    .select('exercise_id')
    .eq('user_id', userId)
  if (error) throw error
  return new Set(data.map(r => r.exercise_id))
}

// ── Custom Exercises ───────────────────────────────────────────────────────

async function pushCustomExercises(userId, customExercises) {
  await supabase.from('custom_exercises').delete().eq('user_id', userId)
  if (customExercises.length) {
    const rows = customExercises.map(ex => ({
      id: ex.libraryId,
      user_id: userId,
      data: ex,
      updated_at: now()
    }))
    const { error } = await supabase.from('custom_exercises').upsert(rows)
    if (error) {
      console.warn('[sync] custom_exercises table may not exist yet, skipping:', error.message)
    }
  }
}

async function pullCustomExercises(userId) {
  const { data, error } = await supabase
    .from('custom_exercises')
    .select('data')
    .eq('user_id', userId)
  if (error) {
    console.warn('[sync] custom_exercises table may not exist yet, skipping:', error.message)
    return null
  }
  return data.map(r => r.data)
}

// ── Weekly Schedule ────────────────────────────────────────────────────────

async function pushWeeklySchedule(userId, schedule) {
  await supabase.from('weekly_schedule').delete().eq('user_id', userId)
  const rows = Object.entries(schedule).map(([dow, templateId]) => ({
    id: `${userId}-${dow}`,
    user_id: userId,
    dow: parseInt(dow),
    template_id: templateId,
    updated_at: now()
  }))
  if (rows.length) {
    const { error } = await supabase.from('weekly_schedule').upsert(rows)
    if (error) {
      console.warn('[sync] weekly_schedule table may not exist yet, skipping:', error.message)
    }
  }
}

async function pullWeeklySchedule(userId) {
  const { data, error } = await supabase
    .from('weekly_schedule')
    .select('dow, template_id')
    .eq('user_id', userId)
  if (error) {
    console.warn('[sync] weekly_schedule table may not exist yet, skipping:', error.message)
    return null
  }
  if (!data.length) return null
  const schedule = {}
  data.forEach(r => { schedule[r.dow] = r.template_id })
  return schedule
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Push all local data to Supabase (overwrites remote).
 */
export async function pushAllUserData(userId, { templates, workoutPlan, completedExercises, customExercises, weeklySchedule }) {
  if (!syncEnabled) throw new Error('Sync not configured')

  await Promise.all([
    pushTemplates(userId, templates),
    pushSessions(userId, workoutPlan),
    pushCompletions(userId, completedExercises),
    pushCustomExercises(userId, customExercises),
    pushWeeklySchedule(userId, weeklySchedule)
  ])

  // Clear any stale pending queue
  await db.pendingSyncs.clear()
}

/**
 * Pull all remote data from Supabase.
 */
export async function pullAllUserData(userId) {
  if (!syncEnabled) throw new Error('Sync not configured')

  const [templates, sessionsMap, completions, customExercises, weeklySchedule] = await Promise.all([
    pullTemplates(userId),
    pullSessions(userId),
    pullCompletions(userId),
    pullCustomExercises(userId),
    pullWeeklySchedule(userId)
  ])
  return { templates, sessionsMap, completions, customExercises, weeklySchedule }
}
