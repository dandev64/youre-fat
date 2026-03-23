export const SEED_TEMPLATES = [
  {
    id: 'tpl-strength-a',
    name: 'Strength A',
    category: 'Strength Training',
    duration: '45 min',
    location: 'Home',
    colorKey: 'purple',
    exercises: [
      { name: 'Squats',                          weight: 'Bodyweight',  sets: 3, reps: '10-12',  rest: '90s', videoUrl: 'https://www.youtube.com/watch?v=YaXPRqUwItQ' },
      { name: 'Glute Bridges',                   weight: 'Green band',  sets: 3, reps: '12',     rest: '90s', videoUrl: 'https://www.youtube.com/watch?v=OUgsJ8-Vi0E' },
      { name: 'Dumbbell Chest Press / Push-ups', weight: '4 lbs',       sets: 3, reps: '8-10',   rest: '90s', videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94' },
      { name: 'Reverse Lunge',                   weight: 'Bodyweight',  sets: 3, reps: '8 each', rest: '90s', videoUrl: 'https://www.youtube.com/watch?v=xrPteyQLGAo' },
      { name: 'Wall Sit',                        weight: 'Bodyweight',  sets: 3, reps: '20-30s', rest: '90s', videoUrl: 'https://www.youtube.com/watch?v=y-wV4Lz6wJU' },
      { name: 'Plank',                           weight: 'Bodyweight',  sets: 3, reps: '20s',    rest: '90s', videoUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c' }
    ]
  },
  {
    id: 'tpl-strength-b',
    name: 'Strength B',
    category: 'Strength Training',
    duration: '40 min',
    location: 'Home',
    colorKey: 'indigo',
    exercises: [
      { name: 'Dumbbell Rows',          weight: '4 lbs',      sets: 3, reps: '10',       rest: '60s', videoUrl: 'https://www.youtube.com/watch?v=pYcpY20QaE8' },
      { name: 'Dumbbell Shoulder Press', weight: '4 lbs',      sets: 3, reps: '8-10',    rest: '60s', videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog' },
      { name: 'Romanian Deadlifts',     weight: 'Light',      sets: 3, reps: '10',       rest: '60s', videoUrl: 'https://www.youtube.com/watch?v=7j-2w4-P14I' },
      { name: 'Bird Dogs',              weight: 'Bodyweight', sets: 3, reps: '10 each',  rest: '60s', videoUrl: 'https://www.youtube.com/watch?v=wiFNA3sqjCA' },
      { name: 'Side Plank',             weight: 'Bodyweight', sets: 3, reps: '15s each', rest: '60s', videoUrl: 'https://www.youtube.com/watch?v=K2VljzCC16g' }
    ]
  },
  {
    id: 'tpl-cardio-walk',
    name: 'Cardio — Walk',
    category: 'Cardio & Conditioning',
    duration: '45 min',
    location: 'Outdoors',
    colorKey: 'emerald',
    exercises: [
      { name: 'Brisk Walk (uphill)', weight: '-', sets: 2, reps: '1', rest: '3 min', duration: '20 min', videoUrl: 'https://www.youtube.com/watch?v=wxy2SENRQJE' }
    ]
  },
  {
    id: 'tpl-cardio-swim',
    name: 'Cardio — Swim',
    category: 'Cardio & Conditioning',
    duration: '45 min',
    location: 'Pool',
    colorKey: 'cyan',
    exercises: [
      { name: 'Swim', weight: '-', sets: 2, reps: '1', rest: '3 min', duration: '20 min', videoUrl: 'https://www.youtube.com/watch?v=gh5V0sbb5sA' }
    ]
  }
]

export const COLOR_MAP = {
  purple:  { grad: 'from-purple-400 to-purple-600',  badge: 'bg-purple-100 text-purple-700',  dot: 'bg-purple-400' },
  violet:  { grad: 'from-violet-400 to-violet-600',  badge: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-400' },
  blue:    { grad: 'from-blue-400 to-blue-600',      badge: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-400' },
  indigo:  { grad: 'from-indigo-400 to-indigo-600',  badge: 'bg-indigo-100 text-indigo-700',  dot: 'bg-indigo-400' },
  rose:    { grad: 'from-rose-400 to-rose-600',      badge: 'bg-rose-100 text-rose-700',      dot: 'bg-rose-400' },
  emerald: { grad: 'from-emerald-400 to-emerald-600',badge: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-400' },
  cyan:    { grad: 'from-cyan-400 to-cyan-600',      badge: 'bg-cyan-100 text-cyan-700',      dot: 'bg-cyan-400' },
  amber:   { grad: 'from-amber-400 to-orange-500',   badge: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-400' },
  pink:    { grad: 'from-pink-400 to-rose-500',      badge: 'bg-pink-100 text-pink-700',      dot: 'bg-pink-400' },
  teal:    { grad: 'from-teal-400 to-teal-600',      badge: 'bg-teal-100 text-teal-700',      dot: 'bg-teal-400' }
}

export const CATEGORY_ICON = {
  'Strength Training':      'fitness_center',
  'Cardio & Conditioning':  'directions_run',
  'Yoga & Flow':            'self_improvement',
  'Recovery':               'spa'
}
