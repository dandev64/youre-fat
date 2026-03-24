import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { syncEnabled } from '../lib/supabase'

const SYNC_DOT = {
  pushing: 'bg-primary animate-pulse',
  pulling: 'bg-primary animate-pulse',
  synced:  'bg-emerald-400',
  error:   'bg-error',
  idle:    null
}

const NAV_ITEMS = [
  { icon: 'calendar_today', label: 'Home', path: '/' },
  { icon: 'fitness_center', label: 'Workouts', path: '/workouts' },
  { icon: 'person', label: 'Profile', path: '/profile' },
]

export default function TopAppBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, syncStatus } = useWorkoutStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const isDetail = location.pathname !== '/'
    && !location.pathname.startsWith('/profile')
    && !location.pathname.startsWith('/workouts')
    && location.pathname !== '/auth'

  const syncDotClass = syncEnabled && user ? SYNC_DOT[syncStatus] : null

  // Close on outside tap
  useEffect(() => {
    if (!menuOpen) return
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', handle)
    return () => document.removeEventListener('pointerdown', handle)
  }, [menuOpen])

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/day')
    if (path === '/workouts') return location.pathname.startsWith('/workouts') || location.pathname.startsWith('/templates')
    return location.pathname.startsWith(path)
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl shadow-sm shadow-purple-500/5"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-5 h-16 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          {/* Hamburger / back button */}
          {isDetail ? (
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface" style={{ fontSize: '22px' }}>
                arrow_back
              </span>
            </button>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface" style={{ fontSize: '22px' }}>
                  {menuOpen ? 'close' : 'menu'}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute top-12 left-0 z-50 bg-white rounded-2xl shadow-xl border border-black/5 py-2 min-w-[170px] overflow-hidden">
                  {NAV_ITEMS.map(item => {
                    const active = isActive(item.path)
                    return (
                      <button
                        key={item.path}
                        onClick={() => { setMenuOpen(false); navigate(item.path) }}
                        className={`w-full flex items-center gap-3 px-4 py-3 active:bg-surface-container transition-colors ${active ? 'bg-primary/5' : ''}`}
                      >
                        <span
                          className={`material-symbols-outlined ${active ? 'text-primary' : 'text-on-surface-variant'}`}
                          style={{ fontSize: '20px', fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {item.icon}
                        </span>
                        <span className={`text-sm font-semibold ${active ? 'text-primary' : 'text-on-surface'}`}>
                          {item.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full object-cover object-top" />
          <h1 className="font-headline font-extrabold text-primary text-lg leading-tight tracking-tight">
            You're Fat
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-on-surface-variant/50 font-mono">v1.0.14</span>

          {/* Avatar — taps to profile / auth */}
          <button
            onClick={() => navigate(user ? '/profile' : '/auth')}
            className="relative w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary-container flex items-center justify-center shadow-sm active:scale-90 transition-all"
          >
            <span className="text-white font-bold text-xs">
              {user
                ? (user.email?.slice(0, 2).toUpperCase() ?? 'YF')
                : 'YF'}
            </span>
            {syncDotClass && (
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${syncDotClass}`}
              />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
