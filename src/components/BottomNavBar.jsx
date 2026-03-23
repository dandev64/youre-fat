import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { icon: 'calendar_today', label: 'Home', path: '/' },
  { icon: 'fitness_center', label: 'Workouts', path: '/workouts' },
  { icon: 'person', label: 'Profile', path: '/profile' }
]

export default function BottomNavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/day')
    if (path === '/workouts') return location.pathname.startsWith('/workouts') || location.pathname.startsWith('/templates')
    return location.pathname.startsWith(path)
  }

  return (
    <nav
      // ADDED: touch-none select-none to keep it locked in place
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl rounded-t-[2.5rem] shadow-[0_-8px_32px_rgba(101,81,138,0.06)] touch-none select-none"
      style={{ 
        // 1. Force the bottom to absolute 0
        bottom: '0px',
        // 2. Kill the env() bug entirely. 34px is the exact height of the iOS home indicator.
        paddingBottom: '34px',
        // 3. Keep the top padding consistent
        paddingTop: '12px',
        WebkitFontSmoothing: 'antialiased'
      }}
    >
      <div className="flex items-center justify-around px-8 pt-3 max-w-2xl mx-auto">
        {tabs.map(tab => {
          const active = isActive(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-1 min-w-[64px] py-1 active:scale-95 transition-transform"
            >
              <div
                className={`w-14 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-tr from-purple-600 to-purple-400 shadow-lg shadow-purple-200'
                    : ''
                }`}
              >
                <span
                  className={`material-symbols-outlined transition-colors ${active ? 'text-white' : 'text-slate-400'}`}
                  style={{
                    fontSize: '22px',
                    fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0"
                  }}
                >
                  {tab.icon}
                </span>
              </div>
              <span className={`text-[10px] font-semibold ${active ? 'text-primary' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
