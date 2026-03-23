import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

const BADGE = {
  'Strength Training': 'bg-primary-container text-on-primary-container',
  'Cardio & Conditioning': 'bg-tertiary-container text-on-tertiary-container',
  'Yoga & Flow': 'bg-secondary-container text-on-secondary-container',
  'Recovery': 'bg-surface-container text-on-surface-variant'
}

const THUMB_GRAD = {
  'Strength Training': 'from-purple-400 to-purple-600',
  'Cardio & Conditioning': 'from-blue-400 to-cyan-500',
  'Yoga & Flow': 'from-pink-400 to-rose-500',
  'Recovery': 'from-slate-300 to-slate-400'
}

const THUMB_ICON = {
  'Strength Training': 'fitness_center',
  'Cardio & Conditioning': 'directions_run',
  'Yoga & Flow': 'self_improvement',
  'Recovery': 'spa'
}

export default function SessionCard({ session, date }) {
  const navigate = useNavigate()
  const dateStr = format(date instanceof Date ? date : new Date(date), 'yyyy-MM-dd')

  if (session.title === 'Rest Day') {
    return (
      <div className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-3 opacity-60">
        <span
          className="material-symbols-outlined text-on-surface-variant/50"
          style={{ fontSize: '28px' }}
        >
          hotel
        </span>
        <div>
          <p className="font-headline font-bold text-sm text-on-surface-variant">Rest Day</p>
          <p className="text-xs text-on-surface-variant/60">Recovery & Rest</p>
        </div>
      </div>
    )
  }

  const badgeClass = BADGE[session.category] || BADGE['Recovery']
  const gradClass = THUMB_GRAD[session.category] || THUMB_GRAD['Recovery']
  const iconName = THUMB_ICON[session.category] || 'fitness_center'

  return (
    <button
      onClick={() => navigate(`/day/${dateStr}`)}
      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-black/5 active:scale-[0.98] transition-all text-left"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${badgeClass}`}>
              {session.category}
            </span>
          </div>
          <h3 className="font-headline text-base font-bold text-on-surface leading-tight mb-2">
            {session.title}
          </h3>
          <div className="flex items-center gap-4 flex-wrap">
            {session.duration && session.duration !== '-' && (
              <div className="flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-on-surface-variant/50"
                  style={{ fontSize: '13px' }}
                >
                  schedule
                </span>
                <span className="text-[11px] text-on-surface-variant">{session.duration}</span>
              </div>
            )}
            {session.location && (
              <div className="flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-on-surface-variant/50"
                  style={{ fontSize: '13px' }}
                >
                  location_on
                </span>
                <span className="text-[11px] text-on-surface-variant">{session.location}</span>
              </div>
            )}
            {session.exercises?.length > 0 && (
              <div className="flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-on-surface-variant/50"
                  style={{ fontSize: '13px' }}
                >
                  format_list_numbered
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  {session.exercises.length} exercises
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradClass} flex items-center justify-center shrink-0`}
        >
          <span
            className="material-symbols-outlined text-white/90"
            style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}
          >
            {iconName}
          </span>
        </div>
      </div>
    </button>
  )
}
