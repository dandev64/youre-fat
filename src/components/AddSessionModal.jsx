import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { COLOR_MAP, CATEGORY_ICON } from '../data/seedTemplates'

const CATEGORY_FILTERS = ['All', 'Strength Training', 'Cardio & Conditioning', 'Yoga & Flow']

export default function AddSessionModal({ date, onClose, preselectedTemplateId = null }) {
  const { templates, addSessionFromTemplate } = useWorkoutStore()
  const navigate = useNavigate()

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

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const dateStr = format(dateObj, 'yyyy-MM-dd')

  const [selectedTemplateId, setSelectedTemplateId] = useState(preselectedTemplateId)
  const [time, setTime] = useState('08:00')
  const [filter, setFilter] = useState('All')
  const [showTimePicker, setShowTimePicker] = useState(false)

  const filtered =
    filter === 'All' ? templates : templates.filter(t => t.category === filter)

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  const handleAdd = () => {
    if (!selectedTemplateId) return
    const [h, m] = time.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayH = hour % 12 === 0 ? 12 : hour % 12
    const displayTime = `${displayH}:${m} ${ampm}`

    addSessionFromTemplate(dateStr, selectedTemplateId, displayTime)
    onClose()
    navigate(`/day/${dateStr}`)
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end bg-black/25 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-auto bg-surface-container-lowest rounded-t-[2rem] shadow-2xl flex flex-col"
        style={{
          maxHeight: '92vh',
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))'
        }}
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
                Add Session
              </h2>
              <p className="text-sm text-on-surface-variant mt-0.5">
                {format(dateObj, 'EEEE, MMMM d')}
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

          {/* Time picker row */}
          <button
            onClick={() => setShowTimePicker(v => !v)}
            className="mt-3 flex items-center gap-2 px-3 py-2 rounded-2xl bg-surface-container active:scale-[0.97] transition-all"
          >
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>
              schedule
            </span>
            <span className="text-sm font-semibold text-on-surface">Session time:</span>
            <span className="text-sm font-bold text-primary ml-1">{formatDisplayTime(time)}</span>
            <span className="material-symbols-outlined text-on-surface-variant ml-auto" style={{ fontSize: '16px' }}>
              {showTimePicker ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {showTimePicker && (
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="mt-2 w-full px-4 py-3 rounded-2xl bg-surface-container text-on-surface text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30"
            />
          )}
        </div>

        {/* Category filter pills */}
        <div className="px-6 pb-3 shrink-0">
          <div className="flex gap-2 overflow-x-auto">
            {CATEGORY_FILTERS.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 ${
                  filter === cat
                    ? 'bg-primary text-white shadow-sm shadow-primary/30'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {cat === 'All' ? 'All' : cat.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Template grid — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-3">
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(tpl => {
              const colors = COLOR_MAP[tpl.colorKey] ?? COLOR_MAP.purple
              const isSelected = tpl.id === selectedTemplateId
              return (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(isSelected ? null : tpl.id)}
                  className={[
                    'rounded-2xl overflow-hidden text-left transition-all duration-200 active:scale-[0.97]',
                    isSelected
                      ? 'ring-2 ring-primary shadow-lg shadow-primary/15 scale-[1.02]'
                      : 'shadow-sm'
                  ].join(' ')}
                >
                  {/* Gradient header */}
                  <div className={`bg-gradient-to-br ${colors.grad} p-4 relative`}>
                    <span
                      className="material-symbols-outlined text-white/30 absolute right-3 top-3"
                      style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}
                    >
                      {CATEGORY_ICON[tpl.category] ?? 'fitness_center'}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2.5 left-2.5 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
                          check
                        </span>
                      </div>
                    )}
                    <p className="font-headline font-extrabold text-white text-sm leading-snug mt-4">
                      {tpl.name}
                    </p>
                    <p className="text-white/70 text-[10px] font-medium mt-0.5">{tpl.duration}</p>
                  </div>
                  {/* Card body */}
                  <div className="bg-white px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${colors.badge}`}>
                        {tpl.category.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-medium">
                        {tpl.exercises.length} ex
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}

            {/* Create new template shortcut */}
            <button
              onClick={() => { onClose(); navigate('/workouts/new') }}
              className="rounded-2xl border-2 border-dashed border-outline-variant/30 p-4 flex flex-col items-center justify-center gap-2 active:scale-[0.97] transition-all min-h-[120px]"
            >
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant/50" style={{ fontSize: '22px' }}>
                  add
                </span>
              </div>
              <p className="text-[11px] font-bold text-on-surface-variant/50 text-center leading-tight">
                New Template
              </p>
            </button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="px-6 pt-3 shrink-0">
          {selectedTemplate && (
            <div className="bg-surface-container rounded-2xl px-4 py-3 mb-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${COLOR_MAP[selectedTemplate.colorKey]?.grad ?? ''} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-white/80" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
                  {CATEGORY_ICON[selectedTemplate.category] ?? 'fitness_center'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-on-surface truncate">{selectedTemplate.name}</p>
                <p className="text-[10px] text-on-surface-variant">
                  {selectedTemplate.exercises.length} exercises · {selectedTemplate.duration}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!selectedTemplateId}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${
              selectedTemplateId
                ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-lg shadow-purple-500/20 active:scale-[0.98]'
                : 'bg-surface-container text-on-surface-variant/40 cursor-not-allowed'
            }`}
          >
            {selectedTemplateId ? `Add Session → ${format(dateObj, 'MMM d')}` : 'Select a template'}
          </button>
        </div>
      </div>
    </div>
  )
}

function formatDisplayTime(timeStr) {
  if (!timeStr) return '—'
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayH = hour % 12 === 0 ? 12 : hour % 12
  return `${displayH}:${m} ${ampm}`
}
