import { useState, useRef, useEffect } from 'react'
import { useWorkoutStore } from '../store/useWorkoutStore'

const CARD_GRADS = [
  'from-purple-400 to-purple-600',
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-rose-400 to-pink-500'
]

function getYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?\s]+)/)
  return m?.[1] ?? null
}

export default function ExerciseCard({ exercise, index, onEdit, onDelete }) {
  const { completedExercises, expandedExercise, toggleExerciseComplete, setExpandedExercise } =
    useWorkoutStore()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  const isCompleted = completedExercises.has(exercise.id)
  const isExpanded = expandedExercise === exercise.id
  const gradClass = CARD_GRADS[index % CARD_GRADS.length]

  // Close menu on outside tap
  useEffect(() => {
    if (!showMenu) return
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    document.addEventListener('pointerdown', handle)
    return () => document.removeEventListener('pointerdown', handle)
  }, [showMenu])

  const handleCheckbox = (e) => {
    e.stopPropagation()
    toggleExerciseComplete(exercise.id)
  }

  const handleCard = () => {
    if (!isCompleted) setExpandedExercise(exercise.id)
  }

  let cardClass =
    'rounded-3xl p-6 transition-all duration-300 active-scale cursor-pointer select-none'
  if (isCompleted) {
    cardClass += ' bg-surface-container-low opacity-60'
  } else if (isExpanded) {
    cardClass +=
      ' bg-surface-container-lowest shadow-[0_8px_32px_rgba(101,81,138,0.06)] border border-primary-container/20 ring-1 ring-primary/5'
  } else {
    cardClass += ' bg-surface-container-lowest shadow-[0_4px_16px_rgba(101,81,138,0.03)]'
  }

  const setsReps = exercise.duration
    ? exercise.duration
    : `${exercise.sets} × ${exercise.reps}`

  // Resolve media for expanded panel
  const ytId = getYouTubeId(exercise.videoUrl)
  const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null

  // Priority: uploaded/pasted image > YouTube thumbnail > gradient placeholder
  const mediaSrc = exercise.imageUrl || ytThumb || null
  const videoHref = exercise.videoUrl
    || `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + ' proper form tutorial')}`

  return (
    <div className={cardClass} onClick={handleCard}>
      {/* Header row */}
      <div className="flex items-start gap-4 mb-5">
        <button
          onClick={handleCheckbox}
          className="checkbox-bounce shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center"
          style={
            isCompleted
              ? { background: 'linear-gradient(135deg, #65518a, #c8b1f0)', border: 'none' }
              : { border: '2px solid #adacb0', background: 'transparent' }
          }
        >
          {isCompleted && (
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}
            >
              check
            </span>
          )}
        </button>

        <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
          <h3
            className={`font-headline font-bold text-base leading-snug ${
              isCompleted
                ? 'line-through decoration-primary decoration-2 text-on-surface-variant'
                : 'text-on-surface'
            }`}
          >
            {exercise.name}
          </h3>

          {!isCompleted && isExpanded && (
            <span
              className="material-symbols-outlined text-primary animate-pulse shrink-0"
              style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}
            >
              bolt
            </span>
          )}

          {!isCompleted && !isExpanded && (
            <div className="flex items-center gap-0.5 shrink-0 relative" ref={menuRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v) }}
                className="w-8 h-8 flex items-center justify-center rounded-full active:bg-surface-container transition-colors"
              >
                <span
                  className="material-symbols-outlined text-on-surface-variant/50"
                  style={{ fontSize: '18px' }}
                >
                  more_vert
                </span>
              </button>
              {showMenu && (
                <div className="absolute right-0 top-9 z-50 bg-white rounded-2xl shadow-xl border border-black/5 py-1.5 min-w-[140px] overflow-hidden">
                  {onEdit && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit(exercise) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 active:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>edit</span>
                      <span className="text-sm font-medium text-on-surface">Edit</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(exercise.id) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 active:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-red-500" style={{ fontSize: '18px' }}>delete</span>
                      <span className="text-sm font-medium text-red-500">Delete</span>
                    </button>
                  )}
                </div>
              )}
              <span
                className="material-symbols-outlined text-on-surface-variant/40"
                style={{ fontSize: '20px' }}
              >
                expand_more
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 ml-10">
        <div>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Weight</p>
          <p className="text-sm font-semibold text-on-surface">{exercise.weight}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Sets & Reps</p>
          <p className="text-sm font-semibold text-on-surface">{setsReps}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Rest</p>
          <p className="text-sm font-semibold text-on-surface">{exercise.rest}</p>
        </div>
      </div>

      {/* Expanded media panel */}
      {isExpanded && !isCompleted && (
        <div className="ml-10 mt-5">
          <div className="aspect-video rounded-2xl overflow-hidden relative bg-surface-container">
            {/* Image layer */}
            {mediaSrc ? (
              <img
                src={mediaSrc}
                alt={exercise.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${gradClass} flex items-center justify-center`}>
                <span
                  className="material-symbols-outlined text-white/20"
                  style={{ fontSize: '72px', fontVariationSettings: "'FILL' 1" }}
                >
                  fitness_center
                </span>
              </div>
            )}

            {/* Dark overlay on images so play button stays readable */}
            {mediaSrc && (
              <div className="absolute inset-0 bg-black/25" />
            )}

            {/* Play button — only if there's a video */}
            {exercise.videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <a
                  href={videoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-16 h-16 rounded-full bg-white/95 shadow-2xl flex items-center justify-center active:scale-90 transition-all"
                >
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontSize: '30px', fontVariationSettings: "'FILL' 1", marginLeft: '3px' }}
                  >
                    play_arrow
                  </span>
                </a>
              </div>
            )}

            {/* Image-only indicator (no video) */}
            {!exercise.videoUrl && mediaSrc && (
              <div className="absolute bottom-2 right-2 bg-black/40 rounded-lg px-2 py-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-white/80" style={{ fontSize: '12px' }}>image</span>
                <span className="text-white/80 text-[10px] font-medium">Reference</span>
              </div>
            )}
          </div>

          {/* Form technique row */}
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Form Technique
              </p>
              <p className="text-xs text-on-surface-variant/60 mt-0.5">{exercise.name}</p>
            </div>
            <a
              href={videoHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold active:scale-95 transition-all"
            >
              {exercise.videoUrl ? 'Watch Video' : 'Search Form'}
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                open_in_new
              </span>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
