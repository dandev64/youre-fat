/**
 * Sync service — wraps all Supabase read/write operations.
 *
 * Strategy:
 *  • Every mutating action writes to Dexie immediately (offline-first).
 *  • If the user is authenticated and online it also writes to Supabase.
 *  • If the Supabase write fails (offline), the operation is queued in
 *    Dexie `pendingSyncs` and retried the next time `flushPendingQueue`
 *    is called (on app focus / reconnect).
 *  • On sign-in we pull all remote data and merge it into local state.
 */

import { supabase, syncEnabled } from './supabase'
import { db } from '../db/db'

// ── helpers ────────────────────────────────────────────────────────────────

function now() {
  return new Date().toISOString()
}

async function queue(operation, payload) {
  await db.pendingSyncs.add({ operation, payload, createdAt: Date.now() })
}

// ── Templates ──────────────────────────────────────────────────────────────

export async function remoteUpsertTemplate(userId, template) {
  if (!syncEnabled) return
  const { error } = await supabase
    .from('templates')
    .upsert({ id: template.id, user_id: userId, data: template, updated_at: now() })
  if (error) {
    await queue('upsert_template', { userId, template })
    console.warn('[sync] queued upsert_template:', error.message)
  }
}

export async function remoteDeleteTemplate(userId, templateId) {
  if (!syncEnabled) return
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', templateId)
    .eq('user_id', userId)
  if (error) {
    await queue('delete_template', { userId, templateId })
    console.warn('[sync] queued delete_template:', error.message)
  }
}

export async function pullTemplates(userId) {
  const { data, error } = await supabase
    .from('templates')
    .select('data')
    .eq('user_id', userId)
  if (error) throw error
  return data.map(r => r.data)
}

// ── Sessions ───────────────────────────────────────────────────────────────

export async function remoteUpsertSession(userId, dateStr, session) {
  if (!syncEnabled) return
  const { error } = await supabase
    .from('workout_sessions')
    .upsert({ id: session.id, user_id: userId, date: dateStr, data: session, updated_at: now() })
  if (error) {
    await queue('upsert_session', { userId, dateStr, session })
    console.warn('[sync] queued upsert_session:', error.message)
  }
}

export async function remoteDeleteSession(userId, sessionId) {
  if (!syncEnabled) return
  const { error } = await supabase
    .from('workout_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId)
  if (error) {
    await queue('delete_session', { userId, sessionId })
  }
}

export async function pullSessions(userId) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('date, data')
    .eq('user_id', userId)
  if (error) throw error

  // Group into { [date]: { sessions: [...] } }
  const map = {}
  for (const row of data) {
    if (!map[row.date]) map[row.date] = { sessions: [] }
    map[row.date].sessions.push(row.data)
  }
  return map
}

// ── Completions ────────────────────────────────────────────────────────────

export async function remoteSetCompleted(userId, exerciseId, date) {
  if (!syncEnabled) return
  const { error } = await supabase
    .from('completions')
    .upsert({ exercise_id: exerciseId, user_id: userId, date, completed_at: now() })
  if (error) {
    await queue('upsert_completion', { userId, exerciseId, date })
    console.warn('[sync] queued upsert_completion:', error.message)
  }
}

export async function remoteSetIncomplete(userId, exerciseId) {
  if (!syncEnabled) return
  const { error } = await supabase
    .from('completions')
    .delete()
    .eq('exercise_id', exerciseId)
    .eq('user_id', userId)
  if (error) {
    await queue('delete_completion', { userId, exerciseId })
    console.warn('[sync] queued delete_completion:', error.message)
  }
}

export async function pullCompletions(userId) {
  const { data, error } = await supabase
    .from('completions')
    .select('exercise_id')
    .eq('user_id', userId)
  if (error) throw error
  return new Set(data.map(r => r.exercise_id))
}

// ── Full pull on sign-in ────────────────────────────────────────────────────

export async function pullAllUserData(userId) {
  const [templates, sessionsMap, completions] = await Promise.all([
    pullTemplates(userId),
    pullSessions(userId),
    pullCompletions(userId)
  ])
  return { templates, sessionsMap, completions }
}

// ── Pending queue flush ────────────────────────────────────────────────────

export async function flushPendingQueue(userId) {
  if (!syncEnabled || !userId) return

  const items = await db.pendingSyncs.toArray()
  if (!items.length) return

  console.info(`[sync] flushing ${items.length} pending operation(s)`)

  for (const item of items) {
    try {
      const p = item.payload
      switch (item.operation) {
        case 'upsert_template':
          await supabase.from('templates').upsert({ id: p.template.id, user_id: userId, data: p.template, updated_at: now() })
          break
        case 'delete_template':
          await supabase.from('templates').delete().eq('id', p.templateId).eq('user_id', userId)
          break
        case 'upsert_session':
          await supabase.from('workout_sessions').upsert({ id: p.session.id, user_id: userId, date: p.dateStr, data: p.session, updated_at: now() })
          break
        case 'delete_session':
          await supabase.from('workout_sessions').delete().eq('id', p.sessionId).eq('user_id', userId)
          break
        case 'upsert_completion':
          await supabase.from('completions').upsert({ exercise_id: p.exerciseId, user_id: userId, date: p.date, completed_at: now() })
          break
        case 'delete_completion':
          await supabase.from('completions').delete().eq('exercise_id', p.exerciseId).eq('user_id', userId)
          break
      }
      await db.pendingSyncs.delete(item.id)
    } catch (err) {
      console.warn('[sync] flush failed for item', item.id, err.message)
    }
  }
}

// ── Realtime subscription ──────────────────────────────────────────────────

/**
 * Subscribe to remote completion changes so device B instantly reflects
 * what device A just checked off.
 * Returns an unsubscribe function.
 */
export function subscribeToCompletions(userId, onInsert, onDelete) {
  if (!syncEnabled) return () => {}

  const channel = supabase
    .channel(`completions:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'completions', filter: `user_id=eq.${userId}` },
      (payload) => onInsert(payload.new.exercise_id)
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'completions', filter: `user_id=eq.${userId}` },
      (payload) => onDelete(payload.old.exercise_id)
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

/**
 * Subscribe to remote session changes — another device added a session.
 * Returns an unsubscribe function.
 */
export function subscribeToSessions(userId, onUpsert) {
  if (!syncEnabled) return () => {}

  const channel = supabase
    .channel(`sessions:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'workout_sessions', filter: `user_id=eq.${userId}` },
      (payload) => onUpsert(payload.new?.date, payload.new?.data, payload.eventType)
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}
