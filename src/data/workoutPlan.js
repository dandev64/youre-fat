import { format, addDays } from 'date-fns'

// ── Exercise builders ──────────────────────────────────────────────────────

const mkStrengthA = (d, p) => [
  { id: `${d}-${p}-0`, name: 'Squats',                          weight: 'Bodyweight',  sets: 3, reps: '10-12',  rest: '90s', order: 0, date: d, videoUrl: 'https://www.youtube.com/watch?v=YaXPRqUwItQ' },
  { id: `${d}-${p}-1`, name: 'Glute Bridges',                   weight: 'Green band',  sets: 3, reps: '12',     rest: '90s', order: 1, date: d, videoUrl: 'https://www.youtube.com/watch?v=OUgsJ8-Vi0E' },
  { id: `${d}-${p}-2`, name: 'Dumbbell Chest Press / Push-ups', weight: '4 lbs',       sets: 3, reps: '8-10',   rest: '90s', order: 2, date: d, videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94' },
  { id: `${d}-${p}-3`, name: 'Reverse Lunge',                   weight: 'Bodyweight',  sets: 3, reps: '8 each', rest: '90s', order: 3, date: d, videoUrl: 'https://www.youtube.com/watch?v=xrPteyQLGAo' },
  { id: `${d}-${p}-4`, name: 'Wall Sit',                        weight: 'Bodyweight',  sets: 3, reps: '20-30s', rest: '90s', order: 4, date: d, videoUrl: 'https://www.youtube.com/watch?v=y-wV4Lz6wJU' },
  { id: `${d}-${p}-5`, name: 'Plank',                           weight: 'Bodyweight',  sets: 3, reps: '20s',    rest: '90s', order: 5, date: d, videoUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c' },
]

const mkStrengthB = (d, p) => [
  { id: `${d}-${p}-0`, name: 'Dumbbell Rows',          weight: '4 lbs',      sets: 3, reps: '10',       rest: '60s', order: 0, date: d, videoUrl: 'https://www.youtube.com/watch?v=pYcpY20QaE8' },
  { id: `${d}-${p}-1`, name: 'Dumbbell Shoulder Press', weight: '4 lbs',      sets: 3, reps: '8-10',    rest: '60s', order: 1, date: d, videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog' },
  { id: `${d}-${p}-2`, name: 'Romanian Deadlifts',     weight: 'Light',      sets: 3, reps: '10',       rest: '60s', order: 2, date: d, videoUrl: 'https://www.youtube.com/watch?v=7j-2w4-P14I' },
  { id: `${d}-${p}-3`, name: 'Bird Dogs',              weight: 'Bodyweight', sets: 3, reps: '10 each',  rest: '60s', order: 3, date: d, videoUrl: 'https://www.youtube.com/watch?v=wiFNA3sqjCA' },
  { id: `${d}-${p}-4`, name: 'Side Plank',             weight: 'Bodyweight', sets: 3, reps: '15s each', rest: '60s', order: 4, date: d, videoUrl: 'https://www.youtube.com/watch?v=K2VljzCC16g' },
]

const mkCardioWalk = (d, p) => [
  { id: `${d}-${p}-0`, name: 'Brisk Walk (uphill)', weight: '-', sets: 2, reps: '1', rest: '3 min', duration: '20 min', order: 0, date: d, videoUrl: 'https://www.youtube.com/watch?v=wxy2SENRQJE' },
]

const mkCardioSwim = (d, p) => [
  { id: `${d}-${p}-0`, name: 'Swim', weight: '-', sets: 2, reps: '1', rest: '3 min', duration: '20 min', order: 0, date: d, videoUrl: 'https://www.youtube.com/watch?v=gh5V0sbb5sA' },
]

// ── Plan generation ────────────────────────────────────────────────────────

// Plan starts Mon 2/16/2026 — generate 12 weeks of data
const PLAN_START = new Date(2026, 1, 16) // Feb 16 2026 (Mon)
const TOTAL_WEEKS = 12

export function generateWorkoutPlan() {
  const plan = {}
  let weekNum = 0

  for (let w = 0; w < TOTAL_WEEKS; w++) {
    weekNum = w + 1
    const weekStart = addDays(PLAN_START, w * 7) // Monday of this week

    for (let d = 0; d < 7; d++) {
      const date = addDays(weekStart, d)
      const dateStr = format(date, 'yyyy-MM-dd')
      const dow = d // 0=Mon … 6=Sun (since weekStart is always Monday)

      if (dow === 0 || dow === 4) {
        // Mon / Fri — Strength A
        plan[dateStr] = {
          sessions: [{
            id: `${dateStr}-sa`,
            title: 'Strength A',
            sessionNum: dow === 0 ? '01' : '05',
            category: 'Strength Training',
            duration: '45 min',
            location: 'Home',
            time: '08:00 AM',
            exercises: mkStrengthA(dateStr, `sa-w${weekNum}`)
          }]
        }
      } else if (dow === 1) {
        // Tue — Cardio (Walk)
        plan[dateStr] = {
          sessions: [{
            id: `${dateStr}-cw`,
            title: 'Cardio — Walk',
            sessionNum: '02',
            category: 'Cardio & Conditioning',
            duration: '45 min',
            location: 'Outdoors',
            time: '08:00 AM',
            exercises: mkCardioWalk(dateStr, `cw-w${weekNum}`)
          }]
        }
      } else if (dow === 3) {
        // Thu — Strength B
        plan[dateStr] = {
          sessions: [{
            id: `${dateStr}-sb`,
            title: 'Strength B',
            sessionNum: '04',
            category: 'Strength Training',
            duration: '40 min',
            location: 'Home',
            time: '08:00 AM',
            exercises: mkStrengthB(dateStr, `sb-w${weekNum}`)
          }]
        }
      } else if (dow === 5) {
        // Sat — Cardio (Swim)
        plan[dateStr] = {
          sessions: [{
            id: `${dateStr}-cs`,
            title: 'Cardio — Swim',
            sessionNum: '06',
            category: 'Cardio & Conditioning',
            duration: '45 min',
            location: 'Pool',
            time: '09:00 AM',
            exercises: mkCardioSwim(dateStr, `cs-w${weekNum}`)
          }]
        }
      } else {
        // Wed / Sun — Rest
        plan[dateStr] = {
          sessions: [{
            id: `${dateStr}-rest`,
            title: 'Rest Day',
            sessionNum: '00',
            category: 'Recovery',
            duration: '-',
            location: 'Home',
            time: '',
            exercises: dow === 2
              ? [{ id: `${dateStr}-walk-0`, name: 'Walk to school', weight: '-', sets: 1, reps: '1', rest: '-', duration: '~15 min', order: 0, date: dateStr }]
              : []
          }]
        }
      }
    }
  }

  return plan
}
