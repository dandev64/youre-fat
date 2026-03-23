import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { COLOR_MAP, CATEGORY_ICON } from '../data/seedTemplates'
import TopAppBar from '../components/TopAppBar'
import BottomNavBar from '../components/BottomNavBar'
import AddSessionModal from '../components/AddSessionModal'
import ExercisePickerModal from '../components/ExercisePickerModal'

const CATEGORIES = ['Strength Training', 'Cardio & Conditioning', 'Yoga & Flow', 'Recovery']
const COLOR_KEYS = Object.keys(COLOR_MAP)

// ── New/Edit Template Page ────────────────────────────────────────────────────
export default function TemplateDetailPage({ isNew = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { templates, addTemplate, updateTemplate, deleteTemplate, selectedDate, addCustomExercise } = useWorkoutStore()

  const existing = isNew ? null : templates.find(t => t.id === id)

  const [name, setName] = useState(existing?.name ?? '')
  const [category, setCategory] = useState(existing?.category ?? 'Strength Training')
  const [duration, setDuration] = useState(existing?.duration ?? '60 min')
  const [location, setLocation] = useState(existing?.location ?? 'Gym')
  const [colorKey, setColorKey] = useState(existing?.colorKey ?? 'purple')
  const [exercises, setExercises] = useState(existing?.exercises ?? [])
  const [dirty, setDirty] = useState(false)
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [showAddSession, setShowAddSession] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingExerciseIdx, setEditingExerciseIdx] = useState(null)
  const [showLibraryPicker, setShowLibraryPicker] = useState(false)
  const [prefillExercise, setPrefillExercise] = useState(null)

  // Redirect if template not found (non-new mode)
  useEffect(() => {
    if (!isNew && !existing) navigate('/workouts', { replace: true })
  }, [existing, isNew, navigate])

  const colors = COLOR_MAP[colorKey] ?? COLOR_MAP.purple

  const markDirty = () => setDirty(true)

  const handleSave = async () => {
    if (!name.trim()) return
    const payload = { name: name.trim(), category, duration, location, colorKey, exercises }
    if (isNew) {
      const newId = await addTemplate(payload)
      navigate(`/templates/${newId}`, { replace: true })
    } else {
      await updateTemplate(id, payload)
    }
    setDirty(false)
  }

  const handleDelete = async () => {
    await deleteTemplate(id)
    navigate('/workouts', { replace: true })
  }

  const addExercise = (ex) => {
    setExercises(prev => [...prev, { ...ex, order: prev.length }])
    markDirty()
  }

  const removeExercise = (idx) => {
    setExercises(prev => prev.filter((_, i) => i !== idx).map((e, i) => ({ ...e, order: i })))
    markDirty()
  }

  const updateExercise = (idx, updates) => {
    setExercises(prev => prev.map((e, i) => i === idx ? { ...e, ...updates } : e))
    markDirty()
  }

  const moveExercise = (idx, dir) => {
    const next = idx + dir
    if (next < 0 || next >= exercises.length) return
    setExercises(prev => {
      const arr = [...prev]
      ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
      return arr.map((e, i) => ({ ...e, order: i }))
    })
    markDirty()
  }

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />

      <main className="pt-24 max-w-2xl mx-auto pb-nav"
      style={{ 
          // 1. Get the safe area (or 20px minimum)
          // 2. Add 64px (the h-16 height of your TopAppBar)
          // This ensures the first piece of text starts exactly below the top bar!
          paddingTop: 'calc(max(env(safe-area-inset-top), 20px) + 70px)'
        }}>
        {/* Hero header band */}
        <div className={`bg-gradient-to-br ${colors.grad} px-6 pt-6 pb-8 relative overflow-hidden`}>
          <span
            className="material-symbols-outlined text-white/10 absolute -right-4 -bottom-4"
            style={{ fontSize: '140px', fontVariationSettings: "'FILL' 1" }}
          >
            {CATEGORY_ICON[category] ?? 'fitness_center'}
          </span>

          {/* Name input */}
          <input
            value={name}
            onChange={e => { setName(e.target.value); markDirty() }}
            placeholder="Template name…"
            className="w-full bg-transparent font-headline font-extrabold text-3xl text-white placeholder:text-white/40 outline-none leading-tight"
          />

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-2.5 py-1">
              <span className="material-symbols-outlined text-white/70" style={{ fontSize: '12px' }}>schedule</span>
              <input
                value={duration}
                onChange={e => { setDuration(e.target.value); markDirty() }}
                className="bg-transparent text-white text-[16px] font-semibold outline-none w-16"
                placeholder="60 min"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-2.5 py-1">
              <span className="material-symbols-outlined text-white/70" style={{ fontSize: '12px' }}>location_on</span>
              <input
                value={location}
                onChange={e => { setLocation(e.target.value); markDirty() }}
                className="bg-transparent text-white text-[16px] font-semibold outline-none w-16"
                placeholder="Gym"
              />
            </div>
            <span className="text-white/60 text-[16px] font-medium">
              {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Config section */}
        <div className="px-5 pt-5 space-y-5">

          {/* Category selector */}
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Category
            </p>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); markDirty() }}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 ${
                    category === cat
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {cat.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Color selector */}
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Color
            </p>
            <div className="flex gap-2 flex-wrap">
              {COLOR_KEYS.map(key => {
                const c = COLOR_MAP[key]
                return (
                  <button
                    key={key}
                    onClick={() => { setColorKey(key); markDirty() }}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.grad} transition-all active:scale-90 ${
                      colorKey === key ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''
                    }`}
                  />
                )
              })}
            </div>
          </div>

          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Exercises
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLibraryPicker(true)}
                  className="flex items-center gap-1 text-primary text-xs font-bold active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>menu_book</span>
                  Library
                </button>
                <button
                  onClick={() => { setEditingExerciseIdx(null); setShowAddExercise(true) }}
                  className="flex items-center gap-1 text-on-surface-variant text-xs font-bold active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_circle</span>
                  Custom
                </button>
              </div>
            </div>

            {exercises.length === 0 && (
              <button
                onClick={() => setShowLibraryPicker(true)}
                className="w-full border-2 border-dashed border-outline-variant/25 rounded-3xl p-6 flex flex-col items-center gap-2 active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-on-surface-variant/30" style={{ fontSize: '32px' }}>
                  menu_book
                </span>
                <p className="text-sm text-on-surface-variant/40 font-medium">Browse exercise library</p>
              </button>
            )}

            <div className="space-y-3">
              {exercises.map((ex, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-black/5"
                >
                  <div className="flex items-start gap-3">
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-0.5 shrink-0 mt-0.5">
                      <button
                        onClick={() => moveExercise(idx, -1)}
                        disabled={idx === 0}
                        className="w-6 h-6 flex items-center justify-center rounded-lg bg-surface-container disabled:opacity-20 active:scale-90 transition-all"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '14px' }}>
                          keyboard_arrow_up
                        </span>
                      </button>
                      <button
                        onClick={() => moveExercise(idx, 1)}
                        disabled={idx === exercises.length - 1}
                        className="w-6 h-6 flex items-center justify-center rounded-lg bg-surface-container disabled:opacity-20 active:scale-90 transition-all"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '14px' }}>
                          keyboard_arrow_down
                        </span>
                      </button>
                    </div>

                    {/* Exercise info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-on-surface leading-tight">{ex.name}</p>
                      <div className="flex gap-3 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-on-surface-variant font-medium">
                          {ex.duration ?? `${ex.sets} × ${ex.reps}`}
                        </span>
                        {ex.weight && ex.weight !== '-' && (
                          <span className="text-[10px] text-on-surface-variant font-medium">
                            {ex.weight}
                          </span>
                        )}
                        <span className="text-[10px] text-on-surface-variant font-medium">
                          {ex.rest} rest
                        </span>
                      </div>
                    </div>

                    {/* Edit / delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => { setEditingExerciseIdx(idx); setShowAddExercise(true) }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-container active:scale-90 transition-all"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '14px' }}>
                          edit
                        </span>
                      </button>
                      <button
                        onClick={() => removeExercise(idx)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-container active:scale-90 transition-all"
                      >
                        <span className="material-symbols-outlined text-error/70" style={{ fontSize: '14px' }}>
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Sticky bottom action bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-outline-variant/10 px-5 pt-3"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-2xl mx-auto flex gap-3">
          {!isNew && (
            <>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center active:scale-90 transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-error/70" style={{ fontSize: '20px' }}>
                  delete
                </span>
              </button>
              <button
                onClick={() => setShowAddSession(true)}
                className="flex-1 py-3 rounded-2xl bg-surface-container text-on-surface font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
                  add_circle
                </span>
                Use Template
              </button>
            </>
          )}
          <button
            onClick={handleSave}
            disabled={!name.trim() || (!dirty && !isNew)}
            className={`${isNew ? 'flex-1' : 'w-12 shrink-0'} h-12 rounded-2xl font-bold text-sm transition-all flex items-center justify-center ${
              name.trim() && (dirty || isNew)
                ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-lg shadow-purple-500/20 active:scale-[0.98]'
                : 'bg-surface-container text-on-surface-variant/40 cursor-not-allowed'
            }`}
          >
            {isNew ? (
              'Create Template'
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: dirty ? "'FILL' 1" : "'FILL' 0" }}>
                save
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Add / Edit Exercise modal */}
      {showAddExercise && (
        <ExerciseFormModal
          initial={editingExerciseIdx !== null ? exercises[editingExerciseIdx] : prefillExercise}
          onSave={(ex) => {
            if (editingExerciseIdx !== null) {
              updateExercise(editingExerciseIdx, ex)
            } else {
              addExercise(ex)
              if (!prefillExercise) addCustomExercise(ex)
            }
            setShowAddExercise(false)
            setEditingExerciseIdx(null)
            setPrefillExercise(null)
          }}
          onClose={() => { setShowAddExercise(false); setEditingExerciseIdx(null); setPrefillExercise(null) }}
        />
      )}

      {/* Library picker */}
      {showLibraryPicker && (
        <ExercisePickerModal
          onPick={(ex) => {
            setShowLibraryPicker(false)
            setPrefillExercise(ex)
            setEditingExerciseIdx(null)
            setShowAddExercise(true)
          }}
          onClose={() => setShowLibraryPicker(false)}
        />
      )}

      {/* Use template → add to a date */}
      {showAddSession && (
        <AddSessionModal
          date={selectedDate}
          preselectedTemplateId={id}
          onClose={() => setShowAddSession(false)}
        />
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm px-6"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-headline font-extrabold text-xl text-on-surface mb-2">
              Delete Template?
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">
              "{name}" will be permanently removed. Sessions already created won't be affected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-2xl bg-surface-container text-on-surface font-bold text-sm active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-2xl bg-error-container text-white font-bold text-sm active:scale-95 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  )
}

// ── Inline exercise form modal ────────────────────────────────────────────────
function ExerciseFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    weight: initial?.weight ?? '',
    sets: initial?.sets ?? '',
    reps: initial?.reps ?? '',
    rest: initial?.rest ?? '60s',
    duration: initial?.duration ?? '',
    imageUrl: initial?.imageUrl ?? '',
    videoUrl: initial?.videoUrl ?? ''
  })
  const [imagePreview, setImagePreview] = useState(initial?.imageUrl ?? null)
  const [imageTab, setImageTab] = useState('upload') // 'upload' | 'url'
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
    if (form.imageUrl && !form.imageUrl.startsWith('data:')) {
      setImagePreview(form.imageUrl)
    }
  }

  const clearImage = () => {
    setImagePreview(null)
    setForm(prev => ({ ...prev, imageUrl: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      name: form.name.trim(),
      weight: form.weight.trim() || '-',
      sets: parseInt(form.sets) || 3,
      reps: parseInt(form.reps) || 10,
      rest: form.rest.trim() || '60s',
      ...(form.duration.trim() ? { duration: form.duration.trim() } : {}),
      ...(form.imageUrl ? { imageUrl: form.imageUrl } : {}),
      ...(form.videoUrl.trim() ? { videoUrl: form.videoUrl.trim() } : {})
    })
  }

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
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-outline-variant/40 rounded-full" />
        </div>

        <div className="px-6 pt-2 pb-3 shrink-0 flex items-center justify-between">
          <h2 className="font-headline font-extrabold text-xl text-on-surface">
            {initial ? 'Edit Exercise' : 'Add Exercise'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center active:scale-90">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 pb-3">
          <form id="exercise-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <Field label="Exercise Name *">
              <input
                type="text"
                value={form.name}
                onChange={f('name')}
                placeholder="e.g. Bench Press"
                autoFocus
                className="input-base"
              />
            </Field>

            {/* Weight + Rest */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Weight">
                <input type="text" value={form.weight} onChange={f('weight')} placeholder="65 kg" className="input-base" />
              </Field>
              <Field label="Rest">
                <input type="text" value={form.rest} onChange={f('rest')} placeholder="60s" className="input-base" />
              </Field>
            </div>

            {/* Sets / Reps / Duration */}
            <div className="grid grid-cols-3 gap-3">
              <Field label="Sets">
                <input type="number" value={form.sets} onChange={f('sets')} placeholder="3" min="1" className="input-base" />
              </Field>
              <Field label="Reps">
                <input type="number" value={form.reps} onChange={f('reps')} placeholder="10" min="1" className="input-base" />
              </Field>
              <Field label="Duration">
                <input type="text" value={form.duration} onChange={f('duration')} placeholder="—" className="input-base" />
              </Field>
            </div>

            {/* ── Reference Image ─────────────────────────── */}
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Reference Image
              </p>

              {/* Tab toggle */}
              <div className="flex gap-1 bg-surface-container p-1 rounded-2xl mb-3 w-fit">
                {['upload', 'url'].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setImageTab(tab)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      imageTab === tab
                        ? 'bg-white text-on-surface shadow-sm'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {tab === 'upload' ? 'Upload' : 'Paste URL'}
                  </button>
                ))}
              </div>

              {/* Preview or upload area */}
              {imagePreview ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-container">
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center active:scale-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>close</span>
                  </button>
                </div>
              ) : imageTab === 'upload' ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-2xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-3 bg-surface-container/50 active:scale-[0.98] transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant/50" style={{ fontSize: '24px' }}>add_photo_alternate</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-on-surface-variant/60">Tap to upload</p>
                    <p className="text-xs text-on-surface-variant/40 mt-0.5">JPG, PNG, GIF, WebP</p>
                  </div>
                </button>
              ) : (
                <input
                  type="url"
                  value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl}
                  onChange={f('imageUrl')}
                  onBlur={handleImageUrlBlur}
                  placeholder="https://example.com/image.jpg"
                  className="input-base"
                />
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* ── Video Link ──────────────────────────────── */}
            <Field label="Video Link">
              <div className="relative">
                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={f('videoUrl')}
                  placeholder="YouTube, Instagram, or any video URL"
                  className="input-base"
                  style={{ paddingRight: form.videoUrl ? '3rem' : undefined }}
                />
                {form.videoUrl ? (
                  <a
                    href={form.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={e => e.stopPropagation()}
                  >
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>open_in_new</span>
                  </a>
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant/30 absolute right-3 top-1/2 -translate-y-1/2" style={{ fontSize: '18px' }}>
                    smart_display
                  </span>
                )}
              </div>
              {/* YouTube thumbnail preview */}
              {getYouTubeThumbnail(form.videoUrl) && (
                <div className="mt-2 h-16 rounded-xl overflow-hidden relative">
                  <img
                    src={getYouTubeThumbnail(form.videoUrl)}
                    alt="YouTube thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                  </div>
                </div>
              )}
            </Field>
          </form>
        </div>

        {/* Sticky submit */}
        <div className="px-6 pt-3 shrink-0">
          <button
            type="submit"
            form="exercise-form"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-400 text-white font-bold text-sm active:scale-[0.98] transition-all shadow-lg shadow-purple-500/20"
          >
            {initial ? 'Save Changes' : 'Add Exercise'}
          </button>
        </div>
      </div>
    </div>
  )
}

function getYouTubeThumbnail(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?\s]+)/)
  const id = m?.[1]
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
        {label}
      </label>
      <style>{`.input-base { width:100%; padding: 0.75rem 1rem; border-radius: 1rem; background: #e9e7ec; color: #2e2e32; font-size: 0.875rem; font-weight: 500; outline: none; } .input-base:focus { box-shadow: 0 0 0 2px rgba(101,81,138,0.25); } .input-base::placeholder { color: rgba(91,91,95,0.35); }`}</style>
      {children}
    </div>
  )
}
