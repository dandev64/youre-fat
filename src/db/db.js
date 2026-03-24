import Dexie from 'dexie'

export const db = new Dexie('YouAreFatDB')

// v1 — original schema
db.version(1).stores({
  workoutDays: 'date, title',
  exercises: '++id, date, name, order',
  completions: 'exerciseId, date'
})

// v2 — add templates table
db.version(2).stores({
  workoutDays: 'date, title',
  exercises: '++id, date, name, order',
  completions: 'exerciseId, date',
  templates: 'id, name, category'
})

// v3 — add pending sync queue
db.version(3).stores({
  workoutDays: 'date, title',
  exercises: '++id, date, name, order',
  completions: 'exerciseId, date',
  templates: 'id, name, category',
  pendingSyncs: '++id, operation, createdAt'
})

// v4 — add custom exercise library
db.version(4).stores({
  workoutDays: 'date, title',
  exercises: '++id, date, name, order',
  completions: 'exerciseId, date',
  templates: 'id, name, category',
  pendingSyncs: '++id, operation, createdAt',
  customExercises: 'libraryId, name, category'
})

// v5 — add weekly schedule
db.version(5).stores({
  workoutDays: 'date, title',
  exercises: '++id, date, name, order',
  completions: 'exerciseId, date',
  templates: 'id, name, category',
  pendingSyncs: '++id, operation, createdAt',
  customExercises: 'libraryId, name, category',
  weeklySchedule: 'dow'
})

// v6 — add session overrides (manual edits to scheduled sessions)
db.version(6).stores({
  workoutDays: 'date, title',
  exercises: '++id, date, name, order',
  completions: 'exerciseId, date',
  templates: 'id, name, category',
  pendingSyncs: '++id, operation, createdAt',
  customExercises: 'libraryId, name, category',
  weeklySchedule: 'dow',
  sessionOverrides: 'id, date'
})

// ── completions ────────────────────────────────────────────────────────────
export async function getCompletions() {
  return db.completions.toArray()
}

export async function setCompleted(exerciseId, date) {
  await db.completions.put({ exerciseId, date })
}

export async function setIncomplete(exerciseId) {
  await db.completions.delete(exerciseId)
}

export async function markAllComplete(exercises, date) {
  const records = exercises.map(ex => ({ exerciseId: ex.id, date }))
  await db.completions.bulkPut(records)
}

// ── templates ──────────────────────────────────────────────────────────────
export async function getAllTemplates() {
  return db.templates.toArray()
}

export async function saveTemplate(template) {
  await db.templates.put(template)
}

export async function deleteTemplateById(id) {
  await db.templates.delete(id)
}

export async function seedTemplatesIfEmpty(seeds) {
  const count = await db.templates.count()
  if (count === 0) {
    await db.templates.bulkPut(seeds)
  }
}

// ── custom exercises ──────────────────────────────────────────────────────
export async function getAllCustomExercises() {
  return db.customExercises.toArray()
}

export async function saveCustomExercise(exercise) {
  await db.customExercises.put(exercise)
}

export async function deleteCustomExerciseById(libraryId) {
  await db.customExercises.delete(libraryId)
}

// ── weekly schedule ──────────────────────────────────────────────────────
export async function getWeeklySchedule() {
  const rows = await db.weeklySchedule.toArray()
  if (!rows.length) return null
  const schedule = {}
  rows.forEach(r => { schedule[r.dow] = r.templateId })
  return schedule
}

export async function saveWeeklySchedule(schedule) {
  const rows = Object.entries(schedule).map(([dow, templateId]) => ({
    dow: parseInt(dow),
    templateId
  }))
  await db.weeklySchedule.clear()
  await db.weeklySchedule.bulkPut(rows)
}

// ── session overrides (locally modified sessions) ─────────────────────────
export async function getAllSessionOverrides() {
  return db.sessionOverrides.toArray()
}

export async function saveSessionOverride(date, session) {
  await db.sessionOverrides.put({ id: session.id, date, ...session })
}

export async function clearSessionOverrides() {
  await db.sessionOverrides.clear()
}

export async function bulkPutSessionOverrides(rows) {
  if (rows.length) await db.sessionOverrides.bulkPut(rows)
}

// ── pending syncs ──────────────────────────────────────────────────────────
export async function clearPendingSyncs() {
  await db.pendingSyncs.clear()
}
