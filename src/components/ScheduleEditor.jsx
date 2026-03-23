import { useEffect } from 'react'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { COLOR_MAP, CATEGORY_ICON } from '../data/seedTemplates'

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function ScheduleEditor({ onClose }) {
  const { weeklySchedule, templates, setDayTemplate } = useWorkoutStore()

  useEffect(() => {
    const y = window.scrollY
    document.body.style.top = `-${y}px`
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, y)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end bg-black/25 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-auto bg-surface-container-lowest rounded-t-[2rem] shadow-2xl flex flex-col"
        style={{ maxHeight: '92vh', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-outline-variant/40 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pt-3 pb-4 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-headline font-extrabold text-xl text-on-surface">
                Weekly Schedule
              </h2>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Assign templates to each day
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>
                close
              </span>
            </button>
          </div>
        </div>

        {/* Day list */}
        <div className="flex-1 overflow-y-auto px-6 pb-3">
          <div className="space-y-2">
            {DAY_NAMES.map((dayName, dow) => {
              const currentTplId = weeklySchedule[dow] ?? null
              const currentTpl = templates.find(t => t.id === currentTplId)
              const colors = currentTpl ? (COLOR_MAP[currentTpl.colorKey] ?? COLOR_MAP.purple) : null

              return (
                <div key={dow} className="bg-white rounded-2xl p-3 shadow-sm border border-black/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                      <span className="text-xs font-extrabold text-on-surface-variant">
                        {DAY_SHORT[dow]}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {currentTpl ? (
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${colors.grad} flex items-center justify-center shrink-0`}>
                            <span className="material-symbols-outlined text-white/80" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
                              {CATEGORY_ICON[currentTpl.category] ?? 'fitness_center'}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-on-surface truncate">
                            {currentTpl.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-on-surface-variant/50">
                          Rest Day
                        </span>
                      )}
                    </div>

                    <select
                      value={currentTplId ?? ''}
                      onChange={e => setDayTemplate(dow, e.target.value || null)}
                      className="bg-surface-container text-on-surface text-xs font-semibold rounded-xl px-3 py-2 outline-none appearance-none cursor-pointer"
                      style={{ fontSize: '16px' }}
                    >
                      <option value="">Rest</option>
                      {templates.map(tpl => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
