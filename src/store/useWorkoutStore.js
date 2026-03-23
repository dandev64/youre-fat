import { create } from 'zustand'
import { format } from 'date-fns'
import { generateWorkoutPlan, DEFAULT_SCHEDULE } from '../data/workoutPlan'
import { SEED_TEMPLATES } from '../data/seedTemplates'
import {
  db,
  getCompletions,
  setCompleted,
  setIncomplete,
  markAllComplete,
  getAllTemplates,
  saveTemplate,
  deleteTemplateById,
  seedTemplatesIfEmpty,
  getAllCustomExercises,
  saveCustomExercise,
  deleteCustomExerciseById,
  getWeeklySchedule,
  saveWeeklySchedule
} from '../db/db'
import { supabase, syncEnabled } from '../lib/supabase'
import {
  pullAllUserData,
  remoteUpsertTemplate,
  remoteDeleteTemplate,
  remoteUpsertSession,
  remoteSetCompleted,
  remoteSetIncomplete,
  flushPendingQueue,
  subscribeToCompletions,
  subscribeToSessions
} from '../lib/sync'

function nextDayNumber(workoutPlan) {
  return (
    Object.values(workoutPlan).reduce(
      (acc, d) =>
        acc +
        (d.sessions?.filter(s => s.exercises.length > 0 && s.title !== 'Rest Day').length ?? 0),
      0
    ) + 1
  )
}

const initialPlan = generateWorkoutPlan(SEED_TEMPLATES, DEFAULT_SCHEDULE)

export const useWorkoutStore = create((set, get) => ({
  // ── calendar ─────────────────────────────────────────────
  selectedDate: new Date(),
  workoutPlan: initialPlan,

  // ── weekly schedule ────────────────────────────────────────
  weeklySchedule: DEFAULT_SCHEDULE,

  // ── exercise ─────────────────────────────────────────────
  completedExercises: new Set(),
  expandedExercise: null,

  // ── templates ────────────────────────────────────────────
  templates: SEED_TEMPLATES,

  // ── custom exercise library ────────────────────────────
  customExercises: [],

  // ── auth / sync ──────────────────────────────────────────
  user: null,
  authLoading: true,
  syncStatus: 'idle',
  syncError: null,
  _realtimeUnsubs: [],

  initialized: false,

  // ─────────────────────────────────────────────────────────
  // Bootstrap
  // ─────────────────────────────────────────────────────────
  initializeStore: async () => {
    try {
      await seedTemplatesIfEmpty(SEED_TEMPLATES)
      const [completions, dbTemplates, dbCustomExercises, dbSchedule] = await Promise.all([
        getCompletions(),
        getAllTemplates(),
        getAllCustomExercises(),
        getWeeklySchedule()
      ])
      const templates = dbTemplates.length ? dbTemplates : SEED_TEMPLATES
      const schedule = dbSchedule ?? DEFAULT_SCHEDULE
      const plan = generateWorkoutPlan(templates, schedule)

      set({
        completedExercises: new Set(completions.map(c => c.exerciseId)),
        templates,
        customExercises: dbCustomExercises,
        weeklySchedule: schedule,
        workoutPlan: plan,
        initialized: true
      })
    } catch {
      set({ initialized: true })
    }

    if (!syncEnabled) {
      set({ authLoading: false })
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      set({ user: session.user, authLoading: false })
      await get()._onSignIn(session.user)
    } else {
      set({ authLoading: false })
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        set({ user: session.user })
        await get()._onSignIn(session.user)
      } else if (event === 'SIGNED_OUT') {
        get()._onSignOut()
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        set({ user: session.user })
      }
    })

    window.addEventListener('online', () => {
      const { user } = get()
      if (user) flushPendingQueue(user.id).catch(() => {})
    })
  },

  // ─────────────────────────────────────────────────────────
  // Plan regeneration
  // ─────────────────────────────────────────────────────────
  regeneratePlan: () => {
    const { templates, weeklySchedule, workoutPlan } = get()
    const freshPlan = generateWorkoutPlan(templates, weeklySchedule)

    // Merge: replace schedule sessions, keep manual sessions
    const merged = {}
    const allDates = new Set([...Object.keys(freshPlan), ...Object.keys(workoutPlan)])

    for (const dateStr of allDates) {
      const oldSessions = workoutPlan[dateStr]?.sessions ?? []
      const newScheduleSessions = freshPlan[dateStr]?.sessions ?? []

      // Keep sessions that were manually added
      const manualSessions = oldSessions.filter(s => s.source === 'manual')

      merged[dateStr] = {
        sessions: [...newScheduleSessions, ...manualSessions]
      }
    }

    set({ workoutPlan: merged })
  },

  // ─────────────────────────────────────────────────────────
  // Internal auth handlers
  // ─────────────────────────────────────────────────────────
  _onSignIn: async (user) => {
    set({ syncStatus: 'syncing', syncError: null })

    try {
      await flushPendingQueue(user.id)
      const { templates, sessionsMap, completions } = await pullAllUserData(user.id)

      const { weeklySchedule } = get()
      const freshPlan = generateWorkoutPlan(
        templates.length ? templates : get().templates,
        weeklySchedule
      )
      const mergedPlan = { ...freshPlan }
      for (const [date, dayData] of Object.entries(sessionsMap)) {
        mergedPlan[date] = dayData
      }

      await db.completions.clear()
      const completionRows = [...completions].map(id => ({ exerciseId: id, date: '' }))
      await db.completions.bulkPut(completionRows)

      if (templates.length) {
        await db.templates.clear()
        await db.templates.bulkPut(templates)
      }

      set({
        workoutPlan: mergedPlan,
        completedExercises: completions,
        templates: templates.length ? templates : get().templates,
        syncStatus: 'synced',
        syncError: null
      })

      get()._subscribeRealtime(user.id)
    } catch (err) {
      console.error('[sync] pull failed:', err.message)
      set({ syncStatus: 'error', syncError: err.message })
    }
  },

  _onSignOut: () => {
    get()._realtimeUnsubs.forEach(fn => fn())

    const schedule = get().weeklySchedule
    set({
      user: null,
      workoutPlan: generateWorkoutPlan(SEED_TEMPLATES, schedule),
      completedExercises: new Set(),
      templates: SEED_TEMPLATES,
      syncStatus: 'idle',
      syncError: null,
      _realtimeUnsubs: []
    })
  },

  _subscribeRealtime: (userId) => {
    const unsubCompletions = subscribeToCompletions(
      userId,
      (exerciseId) => {
        set(state => {
          const next = new Set(state.completedExercises)
          next.add(exerciseId)
          return { completedExercises: next }
        })
      },
      (exerciseId) => {
        set(state => {
          const next = new Set(state.completedExercises)
          next.delete(exerciseId)
          return { completedExercises: next }
        })
      }
    )

    const unsubSessions = subscribeToSessions(
      userId,
      (date, session, eventType) => {
        if (!date || !session) return
        set(state => {
          const existing = state.workoutPlan[date]?.sessions ?? []
          let sessions
          if (eventType === 'DELETE') {
            sessions = existing.filter(s => s.id !== session.id)
          } else {
            const idx = existing.findIndex(s => s.id === session.id)
            sessions = idx >= 0
              ? existing.map((s, i) => i === idx ? session : s)
              : [...existing, session]
          }
          return {
            workoutPlan: {
              ...state.workoutPlan,
              [date]: { sessions }
            }
          }
        })
      }
    )

    set({ _realtimeUnsubs: [unsubCompletions, unsubSessions] })
  },

  // ─────────────────────────────────────────────────────────
  // Auth actions (public)
  // ─────────────────────────────────────────────────────────
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  },

  signOut: async () => {
    await supabase.auth.signOut()
  },

  manualSync: async () => {
    const { user } = get()
    if (!user) return
    await get()._onSignIn(user)
  },

  // ─────────────────────────────────────────────────────────
  // Calendar
  // ─────────────────────────────────────────────────────────
  setSelectedDate: (date) =>
    set({ selectedDate: date instanceof Date ? date : new Date(date) }),

  // ─────────────────────────────────────────────────────────
  // Weekly Schedule
  // ─────────────────────────────────────────────────────────
  setDayTemplate: async (dow, templateId) => {
    const { weeklySchedule } = get()
    const updated = { ...weeklySchedule, [dow]: templateId }
    set({ weeklySchedule: updated })
    await saveWeeklySchedule(updated)
    get().regeneratePlan()
  },

  // ─────────────────────────────────────────────────────────
  // Exercise completion
  // ─────────────────────────────────────────────────────────
  toggleExerciseComplete: async (id) => {
    const { completedExercises, selectedDate, user } = get()
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const newSet = new Set(completedExercises)

    if (newSet.has(id)) {
      newSet.delete(id)
      await setIncomplete(id)
      if (user) remoteSetIncomplete(user.id, id).catch(() => {})
    } else {
      newSet.add(id)
      await setCompleted(id, dateStr)
      if (user) remoteSetCompleted(user.id, id, dateStr).catch(() => {})
    }

    set({ completedExercises: newSet })
  },

  setExpandedExercise: (id) =>
    set(state => ({ expandedExercise: state.expandedExercise === id ? null : id })),

  markAllDone: async (date) => {
    const { workoutPlan, completedExercises, user } = get()
    const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd')
    const dayPlan = workoutPlan[dateStr]
    if (!dayPlan) return

    const allExercises = dayPlan.sessions.flatMap(s => s.exercises)
    const newSet = new Set(completedExercises)
    allExercises.forEach(ex => newSet.add(ex.id))

    await markAllComplete(allExercises, dateStr)

    if (user) {
      allExercises.forEach(ex =>
        remoteSetCompleted(user.id, ex.id, dateStr).catch(() => {})
      )
    }

    set({ completedExercises: newSet })
  },

  // ─────────────────────────────────────────────────────────
  // Sessions
  // ─────────────────────────────────────────────────────────
  deleteSession: (dateStr, sessionId) => {
    const { workoutPlan } = get()
    const dayData = workoutPlan[dateStr]
    if (!dayData) return

    const sessions = dayData.sessions.filter(s => s.id !== sessionId)
    set({
      workoutPlan: {
        ...workoutPlan,
        [dateStr]: { sessions }
      }
    })
  },

  addExercise: (date, exercise) => {
    const { workoutPlan, user } = get()
    const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd')
    const dayPlan = workoutPlan[dateStr]
    if (!dayPlan?.sessions?.length) return

    const newEx = {
      ...exercise,
      id: `${dateStr}-custom-${Date.now()}`,
      date: dateStr,
      order: dayPlan.sessions[0].exercises.length
    }

    const updatedSession = { ...dayPlan.sessions[0], exercises: [...dayPlan.sessions[0].exercises, newEx] }
    const updatedPlan = {
      ...workoutPlan,
      [dateStr]: {
        ...dayPlan,
        sessions: dayPlan.sessions.map((s, i) => i === 0 ? updatedSession : s)
      }
    }

    set({ workoutPlan: updatedPlan })
    db.exercises.add(newEx).catch(() => {})

    if (user) {
      remoteUpsertSession(user.id, dateStr, updatedSession).catch(() => {})
    }
  },

  addSessionFromTemplate: (dateStr, templateId, time = '08:00 AM') => {
    const { workoutPlan, templates, user } = get()
    const template = templates.find(t => t.id === templateId)
    if (!template) return

    const dayNum = nextDayNumber(workoutPlan)
    const sessionId = `${dateStr}-${templateId}-${Date.now()}`

    const exercises = template.exercises.map((ex, idx) => ({
      ...ex,
      id: `${sessionId}-ex${idx}`,
      date: dateStr,
      order: idx
    }))

    const newSession = {
      id: sessionId,
      title: template.name,
      sessionNum: String(dayNum).padStart(2, '0'),
      category: template.category,
      duration: template.duration,
      location: template.location,
      colorKey: template.colorKey,
      time,
      exercises,
      source: 'manual',
      templateId
    }

    const prior = (workoutPlan[dateStr]?.sessions ?? []).filter(s => s.title !== 'Rest Day')

    set({
      workoutPlan: {
        ...workoutPlan,
        [dateStr]: { sessions: [...prior, newSession] }
      }
    })

    if (user) {
      remoteUpsertSession(user.id, dateStr, newSession).catch(() => {})
    }
  },

  // ─────────────────────────────────────────────────────────
  // Templates CRUD
  // ─────────────────────────────────────────────────────────
  addTemplate: async (template) => {
    const { user } = get()
    const newTpl = { ...template, id: `tpl-custom-${Date.now()}` }
    await saveTemplate(newTpl)
    if (user) remoteUpsertTemplate(user.id, newTpl).catch(() => {})
    set(state => ({ templates: [...state.templates, newTpl] }))
    return newTpl.id
  },

  updateTemplate: async (id, updates) => {
    const { user, templates } = get()
    const updated = templates.map(t => (t.id === id ? { ...t, ...updates } : t))
    const tpl = updated.find(t => t.id === id)
    await saveTemplate(tpl)
    if (user) remoteUpsertTemplate(user.id, tpl).catch(() => {})
    set({ templates: updated })
    // Regenerate plan so scheduled sessions pick up the new exercises
    get().regeneratePlan()
  },

  deleteTemplate: async (id) => {
    const { user, weeklySchedule } = get()
    await deleteTemplateById(id)
    if (user) remoteDeleteTemplate(user.id, id).catch(() => {})
    set(state => ({ templates: state.templates.filter(t => t.id !== id) }))

    // Clear this template from the schedule if it was assigned
    const updatedSchedule = { ...weeklySchedule }
    let scheduleChanged = false
    for (const dow in updatedSchedule) {
      if (updatedSchedule[dow] === id) {
        updatedSchedule[dow] = null
        scheduleChanged = true
      }
    }
    if (scheduleChanged) {
      set({ weeklySchedule: updatedSchedule })
      await saveWeeklySchedule(updatedSchedule)
    }
    get().regeneratePlan()
  },

  // ─────────────────────────────────────────────────────────
  // Custom Exercise Library
  // ─────────────────────────────────────────────────────────
  addCustomExercise: async (exercise) => {
    const entry = {
      libraryId: `custom-${Date.now()}`,
      name: exercise.name,
      category: 'Custom',
      muscles: [],
      defaultWeight: exercise.weight || '-',
      defaultSets: exercise.sets || 3,
      defaultReps: exercise.reps || '10',
      defaultRest: exercise.rest || '60s',
      ...(exercise.duration ? { duration: exercise.duration } : {}),
      ...(exercise.videoUrl ? { videoUrl: exercise.videoUrl } : {}),
      ...(exercise.imageUrl ? { imageUrl: exercise.imageUrl } : {}),
      tags: ['custom']
    }
    await saveCustomExercise(entry)
    set(state => ({ customExercises: [...state.customExercises, entry] }))
  },

  deleteCustomExercise: async (libraryId) => {
    await deleteCustomExerciseById(libraryId)
    set(state => ({ customExercises: state.customExercises.filter(e => e.libraryId !== libraryId) }))
  }
}))
