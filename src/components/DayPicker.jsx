import { useRef, useEffect } from 'react'
import { format, isSameDay, isToday, addDays } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useWorkoutStore } from '../store/useWorkoutStore'

export default function DayPicker({ weekStart }) {
  const { selectedDate, setSelectedDate, workoutPlan } = useWorkoutStore()
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const activeRef = useRef(null)

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }, [selectedDate])

  const handleDayClick = (day) => {
    setSelectedDate(day)
    navigate(`/day/${format(day, 'yyyy-MM-dd')}`)
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 py-2"
    >
      <div className="w-2 shrink-0" />
      {days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const active = isSameDay(day, selectedDate)
        const today = isToday(day)
        const hasWorkout = workoutPlan[dateStr]?.sessions?.some(s => s.exercises.length > 0)

        return (
          <button
            key={dateStr}
            ref={active ? activeRef : null}
            onClick={() => handleDayClick(day)}
            className={[
              'snap-center shrink-0 w-[72px] p-3.5 rounded-[20px] flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-95',
              active
                ? 'bg-gradient-to-tr from-primary to-primary-container text-white shadow-lg shadow-purple-500/20'
                : 'bg-white text-on-surface-variant shadow-sm',
              today && !active ? 'ring-2 ring-primary/30' : ''
            ].join(' ')}
          >
            <span
              className={`text-[10px] font-bold uppercase leading-none ${
                active ? 'text-white/80' : 'text-on-surface-variant/60'
              }`}
            >
              {format(day, 'EEE')}
            </span>
            <span className="font-headline text-xl font-extrabold leading-none">
              {format(day, 'd')}
            </span>
            <div
              className={`w-1.5 h-1.5 rounded-full transition-opacity ${
                hasWorkout
                  ? active
                    ? 'bg-white/70 opacity-100'
                    : 'bg-primary/50 opacity-100'
                  : 'opacity-0'
              }`}
            />
          </button>
        )
      })}
      <div className="w-2 shrink-0" />
    </div>
  )
}
