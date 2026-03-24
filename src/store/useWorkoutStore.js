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
import { pushAllUserData, pullAllUserData } from '../lib/sync'

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
  syncStatus: 'idle',   // 'idle' | 'pushing' | 'pulling' | 'synced' | 'error'
  syncError: null,

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
    } else {
      set({ authLoading: false })
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        set({ user: session.user })
      } else if (event === 'SIGNED_OUT') {
        const schedule = get().weeklySchedule
        set({
          user: null,
          workoutPlan: generateWorkoutPlan(SEED_TEMPLATES, schedule),
          completedExercises: new Set(),
          templates: SEED_TEMPLATES,
          syncStatus: 'idle',
          syncError: null
        })
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        set({ user: session.user })
      }
    })
  },

  // ─────────────────────────────────────────────────────────
  // Plan regeneration
  // ─────────────────────────────────────────────────────────
  regeneratePlan: () => {
    const { templates, weeklySchedule, workoutPlan } = get()
    const freshPlan = generateWorkoutPlan(templates, weeklySchedule)

    const merged = {}
    const allDates = new Set([...Object.keys(freshPlan), ...Object.keys(workoutPlan)])

    for (const dateStr of allDates) {
      const oldSessions = workoutPlan[dateStr]?.sessions ?? []
      const newScheduleSessions = freshPlan[dateStr]?.sessions ?? []
      const manualSessions = oldSessions.filter(s => s.source === 'manual')

      merged[dateStr] = {
        sessions: [...newScheduleSessions, ...manualSessions]
      }
    }

    set({ workoutPlan: merged })
  },

  // ─────────────────────────────────────────────────────────
  // Auth actions
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

  // ─────────────────────────────────────────────────────────
  // Manual Push / Pull
  // ─────────────────────────────────────────────────────────
  pushToCloud: async () => {
    const { user, templates, workoutPlan, completedExercises, customExercises, weeklySchedule } = get()
    if (!user) return
    set({ syncStatus: 'pushing', syncError: null })
    try {
      await pushAllUserData(user.id, { templates, workoutPlan, completedExercises, customExercises, weeklySchedule })
      set({ syncStatus: 'synced', syncError: null })
    } catch (err) {
      console.error('[sync] push failed:', err.message)
      set({ syncStatus: 'error', syncError: err.message })
    }
  },

  pullFromCloud: async () => {
    const { user } = get()
    if (!user) return
    set({ syncStatus: 'pulling', syncError: null })
    try {
      const { templates, sessionsMap, completions, customExercises, weeklySchedule } = await pullAllUserData(user.id)

      const pulledTemplates = templates.length ? templates : get().templates
      const pulledSchedule = weeklySchedule ?? get().weeklySchedule
      const pulledCustomExercises = customExercises ?? get().customExercises

      const freshPlan = generateWorkoutPlan(pulledTemplates, pulledSchedule)
      const mergedPlan = { ...freshPlan }
      for (const [date, dayData] of Object.entries(sessionsMap)) {
        const scheduleSessions = freshPlan[date]?.sessions ?? []
        mergedPlan[date] = { sessions: [...scheduleSessions, ...dayData.sessions] }
      }

      // Persist pulled data to Dexie
      await db.completions.clear()
      const completionRows = [...completions].map(id => ({ exerciseId: id, date: '' }))
      if (completionRows.length) await db.completions.bulkPut(completionRows)

      if (templates.length) {
        await db.templates.clear()
        await db.templates.bulkPut(templates)
      }

      if (customExercises) {
        await db.customExercises.clear()
        if (customExercises.length) await db.customExercises.bulkPut(customExercises)
      }

      if (weeklySchedule) {
        await saveWeeklySchedule(weeklySchedule)
      }

      set({
        workoutPlan: mergedPlan,
        completedExercises: completions,
        templates: pulledTemplates,
        customExercises: pulledCustomExercises,
        weeklySchedule: pulledSchedule,
        syncStatus: 'synced',
        syncError: null
      })
    } catch (err) {
      console.error('[sync] pull failed:', err.message)
      set({ syncStatus: 'error', syncError: err.message })
    }
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
    const { completedExercises, selectedDate } = get()
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const newSet = new Set(completedExercises)

    if (newSet.has(id)) {
      newSet.delete(id)
      await setIncomplete(id)
    } else {
      newSet.add(id)
      await setCompleted(id, dateStr)
    }

    set({ completedExercises: newSet })
  },

  setExpandedExercise: (id) =>
    set(state => ({ expandedExercise: state.expandedExercise === id ? null : id })),

  markAllDone: async (date) => {
    const { workoutPlan, completedExercises } = get()
    const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd')
    const dayPlan = workoutPlan[dateStr]
    if (!dayPlan) return

    const allExercises = dayPlan.sessions.flatMap(s => s.exercises)
    const newSet = new Set(completedExercises)
    allExercises.forEach(ex => newSet.add(ex.id))

    await markAllComplete(allExercises, dateStr)
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

  deleteExercise: (dateStr, exerciseId) => {
    const { workoutPlan } = get()
    const dayData = workoutPlan[dateStr]
    if (!dayData) return

    const sessions = dayData.sessions.map(s => ({
      ...s,
      exercises: s.exercises.filter(ex => ex.id !== exerciseId)
    }))
    set({
      workoutPlan: {
        ...workoutPlan,
        [dateStr]: { sessions }
      }
    })
  },

  updateExercise: (dateStr, exerciseId, updates) => {
    const { workoutPlan } = get()
    const dayData = workoutPlan[dateStr]
    if (!dayData) return

    const sessions = dayData.sessions.map(s => ({
      ...s,
      exercises: s.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, ...updates } : ex
      )
    }))
    set({
      workoutPlan: {
        ...workoutPlan,
        [dateStr]: { sessions }
      }
    })
  },

  addExercise: (date, exercise) => {
    const { workoutPlan } = get()
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
  },

  addSessionFromTemplate: (dateStr, templateId, time = '08:00 AM') => {
    const { workoutPlan, templates } = get()
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
  },

  // ─────────────────────────────────────────────────────────
  // Templates CRUD
  // ─────────────────────────────────────────────────────────
  addTemplate: async (template) => {
    const newTpl = { ...template, id: `tpl-custom-${Date.now()}` }
    await saveTemplate(newTpl)
    set(state => ({ templates: [...state.templates, newTpl] }))
    return newTpl.id
  },

  updateTemplate: async (id, updates) => {
    const { templates } = get()
    const updated = templates.map(t => (t.id === id ? { ...t, ...updates } : t))
    const tpl = updated.find(t => t.id === id)
    await saveTemplate(tpl)
    set({ templates: updated })
    get().regeneratePlan()
  },

  deleteTemplate: async (id) => {
    const { weeklySchedule } = get()
    await deleteTemplateById(id)
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
