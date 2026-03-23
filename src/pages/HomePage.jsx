import { useState } from 'react'
import { format, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns'
import { useWorkoutStore } from '../store/useWorkoutStore'
import TopAppBar from '../components/TopAppBar'
import BottomNavBar from '../components/BottomNavBar'
import DayPicker from '../components/DayPicker'
import SessionCard from '../components/SessionCard'
import AddSessionModal from '../components/AddSessionModal'
import ScheduleEditor from '../components/ScheduleEditor'

export default function HomePage() {
  const { selectedDate, workoutPlan, deleteSession } = useWorkoutStore()
  const [weekOffset, setWeekOffset] = useState(0)
  const [showAddSession, setShowAddSession] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)

  const baseWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const displayWeekStart =
    weekOffset === 0
      ? baseWeekStart
      : weekOffset > 0
      ? addWeeks(baseWeekStart, weekOffset)
      : subWeeks(baseWeekStart, -weekOffset)

  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const dayData = workoutPlan[dateStr]
  const sessions = dayData?.sessions ?? []

  const isToday = isSameDay(selectedDate, new Date())
  const sectionLabel = isToday
    ? "Today's Sessions"
    : `${format(selectedDate, 'EEEE, MMM d')} Sessions`

  const handleDeleteSession = (sessionId) => {
    deleteSession(dateStr, sessionId)
  }

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />

      <main className="pt-24 px-5 max-w-2xl mx-auto pb-nav"
      style={{
          paddingTop: 'calc(max(env(safe-area-inset-top), 20px) + 70px)'
        }}>
        {/* Month navigation header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-1">
              {format(selectedDate, 'MMMM yyyy')}
            </p>
            <h2 className="font-headline text-2xl font-extrabold text-on-surface leading-tight">
              Movement Schedule
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSchedule(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm active:scale-90 transition-all"
              title="Edit weekly schedule"
            >
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>
                tune
              </span>
            </button>
            <button
              onClick={() => setWeekOffset(w => w - 1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px' }}>
                chevron_left
              </span>
            </button>
            <button
              onClick={() => setWeekOffset(w => w + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px' }}>
                chevron_right
              </span>
            </button>
          </div>
        </div>

        {/* Day picker strip */}
        <DayPicker weekStart={displayWeekStart} />

        {/* Timeline */}
        <div className="mt-8">
          <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mb-5">
            {sectionLabel}
          </p>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[18px] top-0 bottom-0 w-px bg-outline-variant/20 pointer-events-none" />

            <div className="space-y-5">
              {sessions.map(session => (
                <div key={session.id} className="flex gap-4 items-start">
                  <div className="shrink-0 w-9 flex flex-col items-center pt-1 z-10">
                    <div
                      className={`w-3 h-3 rounded-full ring-2 ring-white ${
                        session.title === 'Rest Day'
                          ? 'bg-outline-variant/40 ring-outline-variant/20'
                          : 'bg-primary/60 ring-primary/20'
                      }`}
                    />
                    {session.time && (
                      <p className="text-[9px] text-on-surface-variant/40 mt-1 font-medium whitespace-nowrap -ml-3">
                        {session.time}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 -mt-0.5">
                    <SessionCard
                      session={session}
                      date={selectedDate}
                      onDelete={handleDeleteSession}
                    />
                  </div>
                </div>
              ))}

              {sessions.length === 0 && (
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 w-9 flex justify-center pt-1 z-10">
                    <div className="w-3 h-3 rounded-full bg-outline-variant/30 ring-2 ring-white" />
                  </div>
                  <div className="flex-1 -mt-0.5 bg-surface-container-low rounded-2xl p-4 text-center">
                    <p className="text-sm text-on-surface-variant/50 font-medium">
                      No sessions — tap below to add one
                    </p>
                  </div>
                </div>
              )}

              {/* Add session card */}
              <div className="flex gap-4 items-start">
                <div className="shrink-0 w-9 flex justify-center pt-1 z-10">
                  <div className="w-3 h-3 rounded-full border-2 border-outline-variant/30 bg-background" />
                </div>
                <button
                  onClick={() => setShowAddSession(true)}
                  className="flex-1 -mt-0.5 border-2 border-dashed border-outline-variant/25 rounded-2xl p-4 flex items-center gap-2 active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined text-on-surface-variant/30" style={{ fontSize: '20px' }}>
                    add_circle
                  </span>
                  <span className="text-sm text-on-surface-variant/40 font-medium">Add Session</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowAddSession(true)}
        className="fixed bottom-32 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-purple-400 shadow-xl shadow-purple-500/30 flex items-center justify-center active:scale-90 transition-all z-40"
      >
        <span className="material-symbols-outlined text-white" style={{ fontSize: '26px' }}>
          add
        </span>
      </button>

      {showAddSession && (
        <AddSessionModal
          date={selectedDate}
          onClose={() => setShowAddSession(false)}
        />
      )}

      {showSchedule && (
        <ScheduleEditor onClose={() => setShowSchedule(false)} />
      )}

      <BottomNavBar />
    </div>
  )
}
