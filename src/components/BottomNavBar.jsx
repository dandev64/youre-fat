import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { icon: 'calendar_today', label: 'Home', path: '/' },
  { icon: 'fitness_center', label: 'Workouts', path: '/workouts' }
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
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl rounded-t-2xl shadow-[0_-8px_32px_rgba(101,81,138,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0.25rem)' }}
    >
      <div className="flex items-center justify-around px-8 pt-2 pb-1 max-w-2xl mx-auto">
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
