import { format, addDays } from 'date-fns'

const PLAN_START = new Date(2026, 1, 16) // Feb 16 2026 (Mon)
const TOTAL_WEEKS = 12

// Default weekly schedule: 0=Mon … 6=Sun → template ID or null (rest)
export const DEFAULT_SCHEDULE = {
  0: 'tpl-strength-a',
  1: 'tpl-cardio-walk',
  2: null,
  3: 'tpl-strength-b',
  4: 'tpl-strength-a',
  5: 'tpl-cardio-swim',
  6: null
}

export function generateWorkoutPlan(templates = [], schedule = DEFAULT_SCHEDULE) {
  const tplMap = {}
  templates.forEach(t => { tplMap[t.id] = t })

  const plan = {}

  for (let w = 0; w < TOTAL_WEEKS; w++) {
    const weekStart = addDays(PLAN_START, w * 7)

    for (let d = 0; d < 7; d++) {
      const date = addDays(weekStart, d)
      const dateStr = format(date, 'yyyy-MM-dd')
      const templateId = schedule[d] ?? null

      if (!templateId || !tplMap[templateId]) {
        plan[dateStr] = {
          sessions: [{
            id: `${dateStr}-rest`,
            title: 'Rest Day',
            sessionNum: '00',
            category: 'Recovery',
            duration: '-',
            location: 'Home',
            time: '',
            exercises: [],
            source: 'schedule',
            templateId: null
          }]
        }
        continue
      }

      const tpl = tplMap[templateId]
      const sessionId = `${dateStr}-${templateId}`
      const exercises = tpl.exercises.map((ex, idx) => ({
        ...ex,
        id: `${sessionId}-ex${idx}`,
        date: dateStr,
        order: idx
      }))

      plan[dateStr] = {
        sessions: [{
          id: sessionId,
          title: tpl.name,
          sessionNum: '01',
          category: tpl.category,
          duration: tpl.duration,
          location: tpl.location,
          colorKey: tpl.colorKey,
          time: '08:00 AM',
          exercises,
          source: 'schedule',
          templateId
        }]
      }
    }
  }

  return plan
}
