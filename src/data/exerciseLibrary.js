/**
 * Master exercise library.
 *
 * Every exercise in the app (seed plan, templates, user-created) can
 * reference an entry here by `libraryId`.  The picker lets users browse
 * this list and tap-to-add with sensible defaults pre-filled.
 *
 * `videoUrl` points to a YouTube tutorial. The ExerciseCard component
 * auto-extracts the video ID to show a thumbnail in the expanded panel.
 */

// ── helpers ────────────────────────────────────────────────────────────
const yt = (id) => `https://www.youtube.com/watch?v=${id}`

// ── library ────────────────────────────────────────────────────────────
export const EXERCISE_LIBRARY = [

  // ╭──────────────────────────────────────────────────────────────────╮
  // │  LOWER BODY                                                      │
  // ╰──────────────────────────────────────────────────────────────────╯
  {
    libraryId: 'squat-bw',
    name: 'Squats',
    category: 'Lower Body',
    muscles: ['Quads', 'Glutes', 'Core'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '10-12', defaultRest: '90s',
    videoUrl: yt('YaXPRqUwItQ'),   // Buff Dudes — How to Squat
    tags: ['beginner', 'compound', 'bodyweight']
  },
  {
    libraryId: 'goblet-squat',
    name: 'Goblet Squat',
    category: 'Lower Body',
    muscles: ['Quads', 'Glutes', 'Core'],
    defaultWeight: '10 kg', defaultSets: 3, defaultReps: '12', defaultRest: '90s',
    videoUrl: yt('MeIiIdhvXT4'),   // Buff Dudes — Goblet Squat
    tags: ['beginner', 'compound', 'dumbbell']
  },
  {
    libraryId: 'barbell-squat',
    name: 'Barbell Back Squat',
    category: 'Lower Body',
    muscles: ['Quads', 'Glutes', 'Hamstrings', 'Core'],
    defaultWeight: '60 kg', defaultSets: 4, defaultReps: '8', defaultRest: '120s',
    videoUrl: yt('bEv6CCg2BC8'),   // Jeff Nippard — Squat Guide
    tags: ['intermediate', 'compound', 'barbell']
  },
  {
    libraryId: 'glute-bridge',
    name: 'Glute Bridges',
    category: 'Lower Body',
    muscles: ['Glutes', 'Hamstrings'],
    defaultWeight: 'Green band', defaultSets: 3, defaultReps: '12', defaultRest: '90s',
    videoUrl: yt('OUgsJ8-Vi0E'),   // Minus the Gym — Glute Bridge
    tags: ['beginner', 'isolation', 'bodyweight']
  },
  {
    libraryId: 'hip-thrust',
    name: 'Hip Thrust',
    category: 'Lower Body',
    muscles: ['Glutes', 'Hamstrings'],
    defaultWeight: '40 kg', defaultSets: 3, defaultReps: '12', defaultRest: '90s',
    videoUrl: yt('SEdqd1n0icg'),   // Bret Contreras — Hip Thrust
    tags: ['intermediate', 'compound', 'barbell']
  },
  {
    libraryId: 'rdl',
    name: 'Romanian Deadlifts',
    category: 'Lower Body',
    muscles: ['Hamstrings', 'Glutes', 'Lower Back'],
    defaultWeight: 'Light', defaultSets: 3, defaultReps: '10', defaultRest: '60s',
    videoUrl: yt('7j-2w4-P14I'),   // Jeff Nippard — RDL Guide
    tags: ['beginner', 'compound', 'dumbbell']
  },
  {
    libraryId: 'reverse-lunge',
    name: 'Reverse Lunge',
    category: 'Lower Body',
    muscles: ['Quads', 'Glutes', 'Hamstrings'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '8 each', defaultRest: '90s',
    videoUrl: yt('xrPteyQLGAo'),   // ATHLEAN-X — Reverse Lunge
    tags: ['beginner', 'compound', 'bodyweight']
  },
  {
    libraryId: 'walking-lunge',
    name: 'Walking Lunge',
    category: 'Lower Body',
    muscles: ['Quads', 'Glutes', 'Hamstrings'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '10 each', defaultRest: '90s',
    videoUrl: yt('L8fvypPHRts'),   // ATHLEAN-X — Walking Lunge
    tags: ['beginner', 'compound', 'bodyweight']
  },
  {
    libraryId: 'bulgarian-split',
    name: 'Bulgarian Split Squat',
    category: 'Lower Body',
    muscles: ['Quads', 'Glutes'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '10 each', defaultRest: '90s',
    videoUrl: yt('2C-uNgKwPLE'),   // Jeff Nippard — BSS
    tags: ['intermediate', 'compound', 'bodyweight']
  },
  {
    libraryId: 'wall-sit',
    name: 'Wall Sit',
    category: 'Lower Body',
    muscles: ['Quads', 'Glutes'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '20-30s', defaultRest: '90s',
    videoUrl: yt('y-wV4Lz6wJU'),   // OFFICIALTHENX — Wall Sit
    tags: ['beginner', 'isometric', 'bodyweight']
  },
  {
    libraryId: 'leg-press',
    name: 'Leg Press',
    category: 'Lower Body',
    muscles: ['Quads', 'Glutes', 'Hamstrings'],
    defaultWeight: '80 kg', defaultSets: 3, defaultReps: '12', defaultRest: '90s',
    videoUrl: yt('IZxyjW7MPJQ'),   // Jeff Nippard — Leg Press
    tags: ['beginner', 'compound', 'machine']
  },
  {
    libraryId: 'calf-raise',
    name: 'Calf Raises',
    category: 'Lower Body',
    muscles: ['Calves'],
    defaultWeight: '20 kg', defaultSets: 4, defaultReps: '15', defaultRest: '45s',
    videoUrl: yt('-M4-G8p8fmc'),   // Jeff Nippard — Calf Raise
    tags: ['beginner', 'isolation', 'bodyweight']
  },
  {
    libraryId: 'step-up',
    name: 'Step Ups',
    category: 'Lower Body',
    muscles: ['Quads', 'Glutes'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '10 each', defaultRest: '60s',
    videoUrl: yt('dQqApCGd5Ss'),   // ATHLEAN-X — Step Up
    tags: ['beginner', 'compound', 'bodyweight']
  },
  {
    libraryId: 'sumo-squat',
    name: 'Sumo Squat',
    category: 'Lower Body',
    muscles: ['Glutes', 'Adductors', 'Quads'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '12', defaultRest: '90s',
    videoUrl: yt('9ZuXKqRbT9k'),   // Healthline — Sumo Squat
    tags: ['beginner', 'compound', 'bodyweight']
  },

  // ╭──────────────────────────────────────────────────────────────────╮
  // │  UPPER BODY — PUSH                                               │
  // ╰──────────────────────────────────────────────────────────────────╯
  {
    libraryId: 'push-up',
    name: 'Push-ups',
    category: 'Upper Body — Push',
    muscles: ['Chest', 'Triceps', 'Shoulders'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '10-15', defaultRest: '60s',
    videoUrl: yt('IODxDxX7oi4'),   // Calisthenicmovement — Push-up
    tags: ['beginner', 'compound', 'bodyweight']
  },
  {
    libraryId: 'db-chest-press',
    name: 'Dumbbell Chest Press / Push-ups',
    category: 'Upper Body — Push',
    muscles: ['Chest', 'Triceps', 'Shoulders'],
    defaultWeight: '4 lbs', defaultSets: 3, defaultReps: '8-10', defaultRest: '90s',
    videoUrl: yt('VmB1G1K7v94'),   // Buff Dudes — DB Chest Press
    tags: ['beginner', 'compound', 'dumbbell']
  },
  {
    libraryId: 'barbell-bench',
    name: 'Barbell Bench Press',
    category: 'Upper Body — Push',
    muscles: ['Chest', 'Triceps', 'Shoulders'],
    defaultWeight: '50 kg', defaultSets: 4, defaultReps: '8', defaultRest: '120s',
    videoUrl: yt('rT7DgCr-3pg'),   // Jeff Nippard — Bench Press
    tags: ['intermediate', 'compound', 'barbell']
  },
  {
    libraryId: 'incline-db-press',
    name: 'Incline Dumbbell Press',
    category: 'Upper Body — Push',
    muscles: ['Upper Chest', 'Shoulders', 'Triceps'],
    defaultWeight: '12 kg', defaultSets: 3, defaultReps: '10', defaultRest: '90s',
    videoUrl: yt('8iPEnn-ltC8'),   // Jeff Nippard — Incline Press
    tags: ['intermediate', 'compound', 'dumbbell']
  },
  {
    libraryId: 'db-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    category: 'Upper Body — Push',
    muscles: ['Shoulders', 'Triceps'],
    defaultWeight: '4 lbs', defaultSets: 3, defaultReps: '8-10', defaultRest: '60s',
    videoUrl: yt('qEwKCR5JCog'),   // ATHLEAN-X — Shoulder Press
    tags: ['beginner', 'compound', 'dumbbell']
  },
  {
    libraryId: 'ohp',
    name: 'Overhead Press (Barbell)',
    category: 'Upper Body — Push',
    muscles: ['Shoulders', 'Triceps', 'Core'],
    defaultWeight: '30 kg', defaultSets: 3, defaultReps: '8', defaultRest: '90s',
    videoUrl: yt('_RlRDWO2jfg'),   // Jeff Nippard — OHP Guide
    tags: ['intermediate', 'compound', 'barbell']
  },
  {
    libraryId: 'lateral-raise',
    name: 'Lateral Raises',
    category: 'Upper Body — Push',
    muscles: ['Side Delts'],
    defaultWeight: '4 kg', defaultSets: 3, defaultReps: '12', defaultRest: '45s',
    videoUrl: yt('3VcKaXpzqRo'),   // Jeff Nippard — Lateral Raise
    tags: ['beginner', 'isolation', 'dumbbell']
  },
  {
    libraryId: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    category: 'Upper Body — Push',
    muscles: ['Triceps'],
    defaultWeight: '15 kg', defaultSets: 3, defaultReps: '12', defaultRest: '45s',
    videoUrl: yt('2-LAMcpzODU'),   // Buff Dudes — Tricep Pushdown
    tags: ['beginner', 'isolation', 'cable']
  },
  {
    libraryId: 'dips',
    name: 'Dips',
    category: 'Upper Body — Push',
    muscles: ['Chest', 'Triceps', 'Shoulders'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '8-12', defaultRest: '90s',
    videoUrl: yt('2z8JmcrW-As'),   // Calisthenicmovement — Dips
    tags: ['intermediate', 'compound', 'bodyweight']
  },
  {
    libraryId: 'pike-pushup',
    name: 'Pike Push-up',
    category: 'Upper Body — Push',
    muscles: ['Shoulders', 'Triceps'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '8', defaultRest: '60s',
    videoUrl: yt('sposDXWEB0A'),   // THENX — Pike Push-up
    tags: ['beginner', 'compound', 'bodyweight']
  },

  // ╭──────────────────────────────────────────────────────────────────╮
  // │  UPPER BODY — PULL                                               │
  // ╰──────────────────────────────────────────────────────────────────╯
  {
    libraryId: 'db-row',
    name: 'Dumbbell Rows',
    category: 'Upper Body — Pull',
    muscles: ['Lats', 'Rhomboids', 'Biceps'],
    defaultWeight: '4 lbs', defaultSets: 3, defaultReps: '10', defaultRest: '60s',
    videoUrl: yt('pYcpY20QaE8'),   // Jeff Nippard — DB Row
    tags: ['beginner', 'compound', 'dumbbell']
  },
  {
    libraryId: 'barbell-row',
    name: 'Barbell Row',
    category: 'Upper Body — Pull',
    muscles: ['Lats', 'Rhomboids', 'Biceps', 'Lower Back'],
    defaultWeight: '40 kg', defaultSets: 4, defaultReps: '8', defaultRest: '90s',
    videoUrl: yt('FWJR5Ve8bnQ'),   // ATHLEAN-X — Barbell Row
    tags: ['intermediate', 'compound', 'barbell']
  },
  {
    libraryId: 'pull-up',
    name: 'Pull-ups',
    category: 'Upper Body — Pull',
    muscles: ['Lats', 'Biceps', 'Rhomboids'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '5-8', defaultRest: '120s',
    videoUrl: yt('eGo4IYlbE5g'),   // Calisthenicmovement — Pull-up
    tags: ['intermediate', 'compound', 'bodyweight']
  },
  {
    libraryId: 'chin-up',
    name: 'Chin-ups',
    category: 'Upper Body — Pull',
    muscles: ['Biceps', 'Lats'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '5-8', defaultRest: '120s',
    videoUrl: yt('brhRXlOhWVM'),   // ATHLEAN-X — Chin-up
    tags: ['intermediate', 'compound', 'bodyweight']
  },
  {
    libraryId: 'lat-pulldown',
    name: 'Lat Pulldown',
    category: 'Upper Body — Pull',
    muscles: ['Lats', 'Biceps'],
    defaultWeight: '35 kg', defaultSets: 3, defaultReps: '12', defaultRest: '60s',
    videoUrl: yt('CAwf7n6Luuc'),   // Jeff Nippard — Lat Pulldown
    tags: ['beginner', 'compound', 'cable']
  },
  {
    libraryId: 'face-pull',
    name: 'Face Pulls',
    category: 'Upper Body — Pull',
    muscles: ['Rear Delts', 'Rhomboids', 'Rotator Cuff'],
    defaultWeight: '10 kg', defaultSets: 3, defaultReps: '15', defaultRest: '45s',
    videoUrl: yt('rep-qVOkqgk'),   // ATHLEAN-X — Face Pull
    tags: ['beginner', 'isolation', 'cable']
  },
  {
    libraryId: 'bicep-curl',
    name: 'Bicep Curl',
    category: 'Upper Body — Pull',
    muscles: ['Biceps'],
    defaultWeight: '8 kg', defaultSets: 3, defaultReps: '12', defaultRest: '45s',
    videoUrl: yt('ykJmrZ5v0Oo'),   // Jeff Nippard — Bicep Curl
    tags: ['beginner', 'isolation', 'dumbbell']
  },
  {
    libraryId: 'hammer-curl',
    name: 'Hammer Curl',
    category: 'Upper Body — Pull',
    muscles: ['Biceps', 'Forearms'],
    defaultWeight: '8 kg', defaultSets: 3, defaultReps: '12', defaultRest: '45s',
    videoUrl: yt('zC3nLlEvin4'),   // Buff Dudes — Hammer Curl
    tags: ['beginner', 'isolation', 'dumbbell']
  },
  {
    libraryId: 'seated-cable-row',
    name: 'Seated Cable Row',
    category: 'Upper Body — Pull',
    muscles: ['Lats', 'Rhomboids', 'Biceps'],
    defaultWeight: '30 kg', defaultSets: 3, defaultReps: '12', defaultRest: '60s',
    videoUrl: yt('GZbfZ033f74'),   // Jeff Nippard — Cable Row
    tags: ['beginner', 'compound', 'cable']
  },

  // ╭──────────────────────────────────────────────────────────────────╮
  // │  CORE & STABILITY                                                │
  // ╰──────────────────────────────────────────────────────────────────╯
  {
    libraryId: 'plank',
    name: 'Plank',
    category: 'Core & Stability',
    muscles: ['Core', 'Shoulders'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '20s', defaultRest: '90s',
    videoUrl: yt('ASdvN_XEl_c'),   // ATHLEAN-X — Plank
    tags: ['beginner', 'isometric', 'bodyweight']
  },
  {
    libraryId: 'side-plank',
    name: 'Side Plank',
    category: 'Core & Stability',
    muscles: ['Obliques', 'Core', 'Hips'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '15s each', defaultRest: '60s',
    videoUrl: yt('K2VljzCC16g'),   // ATHLEAN-X — Side Plank
    tags: ['beginner', 'isometric', 'bodyweight']
  },
  {
    libraryId: 'bird-dog',
    name: 'Bird Dogs',
    category: 'Core & Stability',
    muscles: ['Core', 'Lower Back', 'Glutes'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '10 each', defaultRest: '60s',
    videoUrl: yt('wiFNA3sqjCA'),   // ATHLEAN-X — Bird Dog
    tags: ['beginner', 'stability', 'bodyweight']
  },
  {
    libraryId: 'dead-bug',
    name: 'Dead Bug',
    category: 'Core & Stability',
    muscles: ['Core', 'Hip Flexors'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '10 each', defaultRest: '60s',
    videoUrl: yt('I5xbsA71v1A'),   // Squat University — Dead Bug
    tags: ['beginner', 'stability', 'bodyweight']
  },
  {
    libraryId: 'mountain-climber',
    name: 'Mountain Climbers',
    category: 'Core & Stability',
    muscles: ['Core', 'Shoulders', 'Hip Flexors'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '20', defaultRest: '45s',
    videoUrl: yt('nmwgirgXLYM'),   // THENX — Mountain Climbers
    tags: ['beginner', 'cardio', 'bodyweight']
  },
  {
    libraryId: 'russian-twist',
    name: 'Russian Twist',
    category: 'Core & Stability',
    muscles: ['Obliques', 'Core'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '20', defaultRest: '45s',
    videoUrl: yt('wkD8rjkodUI'),   // ATHLEAN-X — Russian Twist
    tags: ['beginner', 'rotational', 'bodyweight']
  },
  {
    libraryId: 'bicycle-crunch',
    name: 'Bicycle Crunches',
    category: 'Core & Stability',
    muscles: ['Core', 'Obliques'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '20', defaultRest: '45s',
    videoUrl: yt('9FGilxCbdz8'),   // Buff Dudes — Bicycle Crunch
    tags: ['beginner', 'core', 'bodyweight']
  },

  // ╭──────────────────────────────────────────────────────────────────╮
  // │  CARDIO                                                          │
  // ╰──────────────────────────────────────────────────────────────────╯
  {
    libraryId: 'brisk-walk',
    name: 'Brisk Walk (uphill)',
    category: 'Cardio',
    muscles: ['Full Body'],
    defaultWeight: '-', defaultSets: 2, defaultReps: '1', defaultRest: '3 min',
    duration: '20 min',
    videoUrl: yt('wxy2SENRQJE'),   // Hybrid Calisthenics — Walking
    tags: ['beginner', 'low-impact', 'outdoor']
  },
  {
    libraryId: 'swim',
    name: 'Swim',
    category: 'Cardio',
    muscles: ['Full Body'],
    defaultWeight: '-', defaultSets: 2, defaultReps: '1', defaultRest: '3 min',
    duration: '20 min',
    videoUrl: yt('gh5V0sbb5sA'),   // Effortless Swimming — Freestyle
    tags: ['beginner', 'low-impact', 'pool']
  },
  {
    libraryId: 'running',
    name: 'Running',
    category: 'Cardio',
    muscles: ['Legs', 'Core', 'Cardiovascular'],
    defaultWeight: '-', defaultSets: 1, defaultReps: '1', defaultRest: '-',
    duration: '20 min',
    videoUrl: yt('brFHyOtTwH4'),   // Global Triathlon — Running Form
    tags: ['beginner', 'outdoor']
  },
  {
    libraryId: 'cycling',
    name: 'Stationary Bike',
    category: 'Cardio',
    muscles: ['Quads', 'Hamstrings', 'Cardiovascular'],
    defaultWeight: '-', defaultSets: 1, defaultReps: '1', defaultRest: '-',
    duration: '20 min',
    videoUrl: yt('0JPR4h-gQEo'),   // GCN — Bike Form
    tags: ['beginner', 'low-impact', 'machine']
  },
  {
    libraryId: 'rowing',
    name: 'Rowing',
    category: 'Cardio',
    muscles: ['Back', 'Legs', 'Core', 'Cardiovascular'],
    defaultWeight: '-', defaultSets: 1, defaultReps: '1', defaultRest: '-',
    duration: '15 min',
    videoUrl: yt('zQ82RYIFLN8'),   // Dark Horse — Rowing Form
    tags: ['beginner', 'full-body', 'machine']
  },
  {
    libraryId: 'jump-rope',
    name: 'Jump Rope',
    category: 'Cardio',
    muscles: ['Calves', 'Shoulders', 'Cardiovascular'],
    defaultWeight: '-', defaultSets: 5, defaultReps: '1 min', defaultRest: '30s',
    videoUrl: yt('FJmRQ5iTXKE'),   // Jump Rope Dudes
    tags: ['beginner', 'cardio', 'equipment']
  },
  {
    libraryId: 'elliptical',
    name: 'Elliptical',
    category: 'Cardio',
    muscles: ['Legs', 'Arms', 'Cardiovascular'],
    defaultWeight: '-', defaultSets: 1, defaultReps: '1', defaultRest: '-',
    duration: '20 min',
    videoUrl: yt('gCVjEOtOi0E'),   // PureGym — Elliptical
    tags: ['beginner', 'low-impact', 'machine']
  },

  // ╭──────────────────────────────────────────────────────────────────╮
  // │  FULL BODY / COMPOUND                                            │
  // ╰──────────────────────────────────────────────────────────────────╯
  {
    libraryId: 'deadlift',
    name: 'Deadlift',
    category: 'Full Body',
    muscles: ['Hamstrings', 'Glutes', 'Lower Back', 'Traps'],
    defaultWeight: '60 kg', defaultSets: 3, defaultReps: '5', defaultRest: '180s',
    videoUrl: yt('r4MzxtBKyNE'),   // Buff Dudes — Deadlift
    tags: ['intermediate', 'compound', 'barbell']
  },
  {
    libraryId: 'kb-swing',
    name: 'Kettlebell Swing',
    category: 'Full Body',
    muscles: ['Glutes', 'Hamstrings', 'Core', 'Shoulders'],
    defaultWeight: '12 kg', defaultSets: 3, defaultReps: '15', defaultRest: '60s',
    videoUrl: yt('YSxHifyI6s8'),   // ATHLEAN-X — KB Swing
    tags: ['intermediate', 'compound', 'kettlebell']
  },
  {
    libraryId: 'burpee',
    name: 'Burpees',
    category: 'Full Body',
    muscles: ['Full Body', 'Cardiovascular'],
    defaultWeight: 'Bodyweight', defaultSets: 3, defaultReps: '10', defaultRest: '60s',
    videoUrl: yt('dZgVxmf6jkA'),   // THENX — Burpees
    tags: ['beginner', 'cardio', 'bodyweight']
  },
  {
    libraryId: 'walk-school',
    name: 'Walk to school',
    category: 'Cardio',
    muscles: ['Full Body'],
    defaultWeight: '-', defaultSets: 1, defaultReps: '1', defaultRest: '-',
    duration: '~15 min',
    videoUrl: null,
    tags: ['beginner', 'low-impact', 'daily']
  },
]

// ── indexes ────────────────────────────────────────────────────────────

export const LIBRARY_BY_ID = Object.fromEntries(
  EXERCISE_LIBRARY.map(ex => [ex.libraryId, ex])
)

export const LIBRARY_CATEGORIES = [
  'All',
  'Lower Body',
  'Upper Body — Push',
  'Upper Body — Pull',
  'Core & Stability',
  'Cardio',
  'Full Body'
]
