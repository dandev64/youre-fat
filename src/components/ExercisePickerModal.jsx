import { useState, useMemo } from 'react'
import { EXERCISE_LIBRARY, LIBRARY_CATEGORIES } from '../data/exerciseLibrary'
import { useWorkoutStore } from '../store/useWorkoutStore'

export default function ExercisePickerModal({ onPick, onClose }) {
  const customExercises = useWorkoutStore(s => s.customExercises)
  const deleteCustomExercise = useWorkoutStore(s => s.deleteCustomExercise)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')

  const categories = useMemo(() => {
    if (customExercises.length > 0) return [...LIBRARY_CATEGORIES, 'Custom']
    return LIBRARY_CATEGORIES
  }, [customExercises.length])

  const filtered = useMemo(() => {
    let list = [...EXERCISE_LIBRARY, ...customExercises]
    if (cat !== 'All') list = list.filter(e => e.category === cat)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        (e.muscles || []).some(m => m.toLowerCase().includes(q)) ||
        (e.tags || []).some(t => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [search, cat, customExercises])

  const handlePick = (ex) => {
    onPick({
      name: ex.name,
      weight: ex.defaultWeight,
      sets: ex.defaultSets,
      reps: ex.defaultReps,
      rest: ex.defaultRest,
      ...(ex.duration ? { duration: ex.duration } : {}),
      ...(ex.videoUrl ? { videoUrl: ex.videoUrl } : {}),
      ...(ex.imageUrl ? { imageUrl: ex.imageUrl } : {})
    })
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end bg-black/25 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-auto bg-white rounded-t-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: '85vh', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-outline-variant/40 rounded-full" />
        </div>

        <div className="px-5 pt-2 pb-3 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-headline font-extrabold text-xl text-on-surface">
              Exercise Library
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center active:scale-90"
            >
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <span
              className="material-symbols-outlined text-on-surface-variant/40 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ fontSize: '18px' }}
            >
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search exercises, muscles, tags…"
              autoFocus
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-surface-container text-on-surface text-[16px] font-medium outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/30"
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                  cat === c
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {c === 'All' ? 'All' : c.replace('Upper Body — ', '').replace(' & ', '/')}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-5 pb-3">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <span
                className="material-symbols-outlined text-on-surface-variant/20 block mb-2"
                style={{ fontSize: '40px' }}
              >
                search_off
              </span>
              <p className="text-sm text-on-surface-variant/40 font-medium">No exercises found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(ex => (
                <button
                  key={ex.libraryId}
                  onClick={() => handlePick(ex)}
                  className="w-full text-left bg-surface-container-low rounded-2xl p-3.5 active:scale-[0.98] transition-all flex items-center gap-3"
                >
                  {/* Video thumbnail or icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400/20 to-purple-600/20 flex items-center justify-center shrink-0 overflow-hidden">
                    {ex.videoUrl ? (
                      <img
                        src={`https://img.youtube.com/vi/${ex.videoUrl.match(/v=([^&]+)/)?.[1]}/default.jpg`}
                        alt=""
                        className="w-full h-full object-cover rounded-xl"
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                      />
                    ) : null}
                    <span
                      className="material-symbols-outlined text-primary/50"
                      style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1", display: ex.videoUrl ? 'none' : 'flex' }}
                    >
                      fitness_center
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-on-surface leading-tight truncate">{ex.name}</p>
                    <p className="text-[10px] text-on-surface-variant/60 mt-0.5 truncate">
                      {(ex.muscles || []).length ? ex.muscles.join(' · ') : ex.category}
                    </p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-on-surface-variant font-medium">
                        {ex.defaultSets} × {ex.defaultReps}
                      </span>
                      {ex.defaultWeight && ex.defaultWeight !== '-' && (
                        <span className="text-[10px] text-on-surface-variant font-medium">
                          {ex.defaultWeight}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {ex.category === 'Custom' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteCustomExercise(ex.libraryId) }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-all"
                      >
                        <span className="material-symbols-outlined text-error/50" style={{ fontSize: '18px' }}>delete</span>
                      </button>
                    )}
                    <span
                      className="material-symbols-outlined text-primary/40"
                      style={{ fontSize: '20px' }}
                    >
                      add_circle
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
