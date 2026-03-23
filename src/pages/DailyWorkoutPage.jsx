import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { parseISO } from 'date-fns'
import { useWorkoutStore } from '../store/useWorkoutStore'
import TopAppBar from '../components/TopAppBar'
import BottomNavBar from '../components/BottomNavBar'
import ExerciseCard from '../components/ExerciseCard'
import ExercisePickerModal from '../components/ExercisePickerModal'

export default function DailyWorkoutPage() {
  const { date } = useParams()
  const { workoutPlan, markAllDone, completedExercises, setSelectedDate, addExercise: storeAddExercise, addCustomExercise } = useWorkoutStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [addMode, setAddMode] = useState('library') // 'library' | 'custom'
  const [prefillExercise, setPrefillExercise] = useState(null)

  useEffect(() => {
    if (date) setSelectedDate(parseISO(date))
  }, [date, setSelectedDate])

  const dayData = workoutPlan[date]
  const sessions = dayData?.sessions ?? []
  const firstSession = sessions[0]
  const exercises = firstSession?.exercises ?? []

  const allDone = exercises.length > 0 && exercises.every(ex => completedExercises.has(ex.id))
  const doneCount = exercises.filter(ex => completedExercises.has(ex.id)).length

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />

      {/* Mark All Done FAB */}
      <button
        onClick={() => markAllDone(date)}
        className={`fixed bottom-28 right-6 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center active:scale-90 transition-all z-40 ${
          allDone
            ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-500/30'
            : 'bg-gradient-to-tr from-purple-600 to-purple-400 shadow-purple-500/30'
        }`}
      >
        <span
          className="material-symbols-outlined text-white"
          style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}
        >
          {allDone ? 'task_alt' : 'done_all'}
        </span>
      </button>

      <main className="pt-28 px-6 max-w-2xl mx-auto pb-nav"
      style={{ 
          // 1. Get the safe area (or 20px minimum)
          // 2. Add 64px (the h-16 height of your TopAppBar)
          // This ensures the first piece of text starts exactly below the top bar!
          paddingTop: 'calc(max(env(safe-area-inset-top), 20px) + 70px)'
        }}>
        {firstSession ? (
          <>
            {/* Title section */}
            <div className="mb-7">
              <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase px-3 py-1.5 rounded-full">
                  Session {firstSession.sessionNum}
                </span>
                {firstSession.duration && firstSession.duration !== '-' && (
                  <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                    {firstSession.duration}
                  </span>
                )}
                {exercises.length > 0 && (
                  <span className="text-xs text-on-surface-variant/60 font-medium ml-auto">
                    {doneCount}/{exercises.length} done
                  </span>
                )}
              </div>

              <h1 className="font-headline font-extrabold text-4xl tracking-tight text-on-surface leading-tight">
                {firstSession.title}
              </h1>

              {/* Progress bar */}
              {exercises.length > 0 && (
                <div className="mt-4 h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
                    style={{ width: `${(doneCount / exercises.length) * 100}%` }}
                  />
                </div>
              )}
            </div>

            {/* Exercise list */}
            {exercises.length > 0 ? (
              <div className="space-y-4">
                {exercises.map((exercise, idx) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} index={idx} />
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-low rounded-3xl p-8 text-center">
                <span
                  className="material-symbols-outlined text-on-surface-variant/30 block mb-3"
                  style={{ fontSize: '48px' }}
                >
                  hotel
                </span>
                <p className="font-headline font-bold text-on-surface-variant/50">
                  Rest & Recover
                </p>
                <p className="text-sm text-on-surface-variant/40 mt-1">
                  No exercises today. Take it easy!
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <span
              className="material-symbols-outlined text-on-surface-variant/20 mb-4"
              style={{ fontSize: '64px' }}
            >
              event_busy
            </span>
            <h2 className="font-headline font-bold text-xl text-on-surface-variant/50">
              No workout for this day
            </h2>
          </div>
        )}

        {/* Add exercise buttons */}
        {exercises.length > 0 && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => { setAddMode('library'); setShowAddModal(true) }}
              className="flex-1 border-2 border-dashed border-outline-variant/25 rounded-3xl p-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-primary/40" style={{ fontSize: '20px' }}>menu_book</span>
              <span className="text-sm text-on-surface-variant/50 font-medium">Library</span>
            </button>
            <button
              onClick={() => { setAddMode('custom'); setShowAddModal(true) }}
              className="flex-1 border-2 border-dashed border-outline-variant/25 rounded-3xl p-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-on-surface-variant/30" style={{ fontSize: '20px' }}>add_circle</span>
              <span className="text-sm text-on-surface-variant/50 font-medium">Custom</span>
            </button>
          </div>
        )}
      </main>

      {showAddModal && addMode === 'library' && (
        <ExercisePickerModal
          onPick={(ex) => {
            setPrefillExercise(ex)
            setAddMode('custom')
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showAddModal && addMode === 'custom' && (
        <DailyExerciseFormModal
          initial={prefillExercise}
          onSave={(ex) => {
            storeAddExercise(date, ex)
            if (!prefillExercise) addCustomExercise(ex)
            setShowAddModal(false)
            setPrefillExercise(null)
          }}
          onClose={() => { setShowAddModal(false); setPrefillExercise(null) }}
        />
      )}

      <BottomNavBar />
    </div>
  )
}

function DailyExerciseFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '', weight: initial?.weight ?? '', sets: initial?.sets ?? '',
    reps: initial?.reps ?? '', rest: initial?.rest ?? '60s',
    duration: initial?.duration ?? '', imageUrl: initial?.imageUrl ?? '', videoUrl: initial?.videoUrl ?? ''
  })
  const [imagePreview, setImagePreview] = useState(initial?.imageUrl ?? null)
  const [imageTab, setImageTab] = useState('upload')
  const fileInputRef = useRef(null)

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      setImagePreview(dataUrl)
      setForm(prev => ({ ...prev, imageUrl: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const handleImageUrlBlur = () => {
    if (form.imageUrl && !form.imageUrl.startsWith('data:')) setImagePreview(form.imageUrl)
  }

  const clearImage = () => {
    setImagePreview(null)
    setForm(prev => ({ ...prev, imageUrl: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getYouTubeThumbnail = (url) => {
    if (!url) return null
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?\s]+)/)
    return m?.[1] ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      name: form.name.trim(),
      weight: form.weight.trim() || '-',
      sets: parseInt(form.sets) || 3,
      reps: form.reps.toString().trim() || '10',
      rest: form.rest.trim() || '60s',
      ...(form.duration.trim() ? { duration: form.duration.trim() } : {}),
      ...(form.imageUrl ? { imageUrl: form.imageUrl } : {}),
      ...(form.videoUrl.trim() ? { videoUrl: form.videoUrl.trim() } : {})
    })
  }

  const inputCls = 'w-full px-4 py-3 rounded-2xl bg-surface-container text-on-surface text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/30'

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end bg-black/25 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-auto bg-white rounded-t-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: '92vh', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-outline-variant/40 rounded-full" />
        </div>

        <div className="px-6 pt-2 pb-3 shrink-0 flex items-center justify-between">
          <h2 className="font-headline font-extrabold text-xl text-on-surface">{initial ? 'Edit & Add Exercise' : 'Add Exercise'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center active:scale-90">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-3">
          <form id="daily-exercise-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Exercise Name *</label>
              <input type="text" value={form.name} onChange={f('name')} placeholder="e.g. Pull-ups" autoFocus className={inputCls} />
            </div>

            {/* Weight + Rest */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Weight</label>
                <input type="text" value={form.weight} onChange={f('weight')} placeholder="e.g. 20 kg" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Rest</label>
                <input type="text" value={form.rest} onChange={f('rest')} placeholder="60s" className={inputCls} />
              </div>
            </div>

            {/* Sets / Reps / Duration */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Sets</label>
                <input type="number" value={form.sets} onChange={f('sets')} placeholder="3" min="1" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Reps</label>
                <input type="text" value={form.reps} onChange={f('reps')} placeholder="10" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Duration</label>
                <input type="text" value={form.duration} onChange={f('duration')} placeholder="—" className={inputCls} />
              </div>
            </div>

            {/* Reference Image */}
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Reference Image</p>
              <div className="flex gap-1 bg-surface-container p-1 rounded-2xl mb-3 w-fit">
                {['upload', 'url'].map(tab => (
                  <button
                    key={tab} type="button" onClick={() => setImageTab(tab)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${imageTab === tab ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant'}`}
                  >
                    {tab === 'upload' ? 'Upload' : 'Paste URL'}
                  </button>
                ))}
              </div>

              {imagePreview ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-container">
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={clearImage} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>close</span>
                  </button>
                </div>
              ) : imageTab === 'upload' ? (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full aspect-video rounded-2xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-3 bg-surface-container/50 active:scale-[0.98] transition-all">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant/50" style={{ fontSize: '24px' }}>add_photo_alternate</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-on-surface-variant/60">Tap to upload</p>
                    <p className="text-xs text-on-surface-variant/40 mt-0.5">JPG, PNG, GIF, WebP</p>
                  </div>
                </button>
              ) : (
                <input type="url" value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl} onChange={f('imageUrl')} onBlur={handleImageUrlBlur} placeholder="https://example.com/image.jpg" className={inputCls} />
              )}

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Video Link */}
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Video Link</label>
              <div className="relative">
                <input type="url" value={form.videoUrl} onChange={f('videoUrl')} placeholder="YouTube, Instagram, or any video URL" className={inputCls} style={{ paddingRight: form.videoUrl ? '3rem' : undefined }} />
                {form.videoUrl ? (
                  <a href={form.videoUrl} target="_blank" rel="noopener noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={e => e.stopPropagation()}>
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>open_in_new</span>
                  </a>
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant/30 absolute right-3 top-1/2 -translate-y-1/2" style={{ fontSize: '18px' }}>smart_display</span>
                )}
              </div>
              {getYouTubeThumbnail(form.videoUrl) && (
                <div className="mt-2 h-16 rounded-xl overflow-hidden relative">
                  <img src={getYouTubeThumbnail(form.videoUrl)} alt="YouTube thumbnail" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="px-6 pt-3 shrink-0">
          <button type="submit" form="daily-exercise-form" className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-400 text-white font-bold text-sm active:scale-[0.98] transition-all shadow-lg shadow-purple-500/20">
            Add Exercise
          </button>
        </div>
      </div>
    </div>
  )
}
