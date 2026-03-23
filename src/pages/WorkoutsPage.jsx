import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { COLOR_MAP } from '../data/seedTemplates'
import TopAppBar from '../components/TopAppBar'
import BottomNavBar from '../components/BottomNavBar'
import TemplateCard from '../components/TemplateCard'
import AddSessionModal from '../components/AddSessionModal'

const FILTERS = ['All', 'Strength Training', 'Cardio & Conditioning', 'Yoga & Flow']

export default function WorkoutsPage() {
  const { templates, selectedDate } = useWorkoutStore()
  const navigate = useNavigate()

  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [useModalTemplate, setUseModalTemplate] = useState(null) // templateId or null
  const [showAddSession, setShowAddSession] = useState(false)

  const visible = templates.filter(t => {
    const matchesCat = filter === 'All' || t.category === filter
    const matchesSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />

      <main className="pt-24 px-5 max-w-2xl mx-auto pb-nav"
      style={{ 
          // 1. Get the safe area (or 20px minimum)
          // 2. Add 64px (the h-16 height of your TopAppBar)
          // This ensures the first piece of text starts exactly below the top bar!
          paddingTop: 'calc(max(env(safe-area-inset-top), 20px) + 70px)'
        }}>
        {/* Page title */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-1">
              Library
            </p>
            <h2 className="font-headline text-2xl font-extrabold text-on-surface leading-tight">
              Workout Templates
            </h2>
          </div>
          <span className="font-headline font-extrabold text-3xl text-primary/20">
            {templates.length}
          </span>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm mb-4">
          <span className="material-symbols-outlined text-on-surface-variant/50" style={{ fontSize: '20px' }}>
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search templates…"
            className="flex-1 text-sm text-on-surface bg-transparent outline-none placeholder:text-on-surface-variant/40 font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <span className="material-symbols-outlined text-on-surface-variant/40" style={{ fontSize: '18px' }}>
                close
              </span>
            </button>
          )}
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto mb-6 -mx-1 px-1 py-1">
          {FILTERS.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 ${
                filter === cat
                  ? 'bg-primary text-white shadow-sm shadow-primary/20'
                  : 'bg-white text-on-surface-variant shadow-sm'
              }`}
            >
              {cat === 'All' ? 'All' : cat.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Template grid */}
        {visible.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {visible.map(tpl => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                onUse={() => {
                  setUseModalTemplate(tpl.id)
                  setShowAddSession(true)
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span
              className="material-symbols-outlined text-on-surface-variant/20 mb-3"
              style={{ fontSize: '56px' }}
            >
              search_off
            </span>
            <p className="font-headline font-bold text-on-surface-variant/40">No templates found</p>
            <p className="text-sm text-on-surface-variant/30 mt-1">Try a different filter</p>
          </div>
        )}

        {/* Create new template card */}
        <button
          onClick={() => navigate('/workouts/new')}
          className="w-full mt-4 border-2 border-dashed border-outline-variant/25 rounded-3xl p-6 flex items-center gap-4 active:scale-[0.98] transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-surface-variant/50" style={{ fontSize: '24px' }}>
              add
            </span>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-on-surface-variant/60">Create Template</p>
            <p className="text-xs text-on-surface-variant/40 mt-0.5">Build your own workout</p>
          </div>
        </button>
      </main>

      {/* "Use template" shortcut opens AddSessionModal pre-seeded to today */}
      {showAddSession && (
        <AddSessionModal
          date={selectedDate}
          onClose={() => {
            setShowAddSession(false)
            setUseModalTemplate(null)
          }}
          preselectedTemplateId={useModalTemplate}
        />
      )}

      {/* FAB — create new template */}
      <button
        onClick={() => navigate('/workouts/new')}
        className="fixed bottom-32 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-purple-400 shadow-xl shadow-purple-500/30 flex items-center justify-center active:scale-90 transition-all z-40"
      >
        <span className="material-symbols-outlined text-white" style={{ fontSize: '26px' }}>
          add
        </span>
      </button>

      <BottomNavBar />
    </div>
  )
}
