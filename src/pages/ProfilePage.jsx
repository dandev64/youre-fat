import { useNavigate } from 'react-router-dom'
import TopAppBar from '../components/TopAppBar'
import BottomNavBar from '../components/BottomNavBar'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { syncEnabled } from '../lib/supabase'

const SYNC_LABEL = {
  idle:    { icon: 'cloud_off',   text: 'Not synced',    cls: 'text-on-surface-variant/50' },
  syncing: { icon: 'sync',        text: 'Syncing…',      cls: 'text-primary animate-spin' },
  synced:  { icon: 'cloud_done',  text: 'Up to date',    cls: 'text-emerald-500' },
  error:   { icon: 'cloud_off',   text: 'Sync failed',   cls: 'text-error' }
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const {
    user, signOut, manualSync,
    syncStatus, syncError,
    workoutPlan, completedExercises, templates
  } = useWorkoutStore()

  const totalWorkouts = Object.values(workoutPlan).filter(
    d => d.sessions?.some(s => s.exercises.length > 0)
  ).length

  const totalExercises = Object.values(workoutPlan).reduce(
    (acc, d) => acc + (d.sessions?.reduce((a, s) => a + s.exercises.length, 0) ?? 0),
    0
  )

  const stats = [
    { label: 'Planned', value: totalWorkouts, icon: 'calendar_month' },
    { label: 'Exercises', value: totalExercises, icon: 'fitness_center' },
    { label: 'Completed', value: completedExercises.size, icon: 'check_circle' },
    { label: 'Templates', value: templates.length, icon: 'library_books' }
  ]

  const syncInfo = SYNC_LABEL[syncStatus] ?? SYNC_LABEL.idle
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'You'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />

      <main className="pt-24 px-5 max-w-2xl mx-auto pb-nav">

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6 bg-white rounded-3xl p-5 shadow-sm border border-black/5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <span className="font-headline font-extrabold text-white text-xl">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-headline font-extrabold text-xl text-on-surface leading-tight truncate">
              {user ? displayName : "You're Fat"}
            </h2>
            {user ? (
              <p className="text-xs text-on-surface-variant mt-0.5 truncate">{user.email}</p>
            ) : (
              <p className="text-xs text-on-surface-variant/60 mt-0.5">Offline mode</p>
            )}
          </div>
          {user && (
            <button
              onClick={() => signOut()}
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center active:scale-90 transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-on-surface-variant/60" style={{ fontSize: '18px' }}>
                logout
              </span>
            </button>
          )}
        </div>

        {/* Sync status card */}
        {syncEnabled && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-black/5 mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined ${syncInfo.cls}`}
                  style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}
                >
                  {syncInfo.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-on-surface">Cloud Sync</p>
                  <p className={`text-xs mt-0.5 ${syncInfo.cls}`}>{syncInfo.text}</p>
                  {syncError && (
                    <p className="text-[10px] text-error/80 mt-0.5 leading-tight">{syncError}</p>
                  )}
                </div>
              </div>

              {user ? (
                <button
                  onClick={() => manualSync()}
                  disabled={syncStatus === 'syncing'}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold active:scale-95 transition-all disabled:opacity-40"
                >
                  <span
                    className={`material-symbols-outlined ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}
                    style={{ fontSize: '15px' }}
                  >
                    sync
                  </span>
                  Sync now
                </button>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-400 text-white text-xs font-bold active:scale-95 transition-all shadow-sm shadow-purple-500/20"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                    login
                  </span>
                  Sign in
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sign-in prompt when Supabase is configured but no user */}
        {syncEnabled && !user && (
          <button
            onClick={() => navigate('/auth')}
            className="w-full bg-gradient-to-br from-primary to-primary-dim rounded-3xl p-5 text-left mb-5 active:scale-[0.98] transition-all shadow-lg shadow-purple-500/20"
          >
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined text-white/80"
                style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}
              >
                devices
              </span>
              <div>
                <p className="font-headline font-extrabold text-white text-base leading-tight">
                  Sync across devices
                </p>
                <p className="text-white/70 text-xs mt-0.5">
                  Sign in to keep your workouts everywhere
                </p>
              </div>
              <span className="material-symbols-outlined text-white/60 ml-auto" style={{ fontSize: '20px' }}>
                chevron_right
              </span>
            </div>
          </button>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map(stat => (
            <div
              key={stat.label}
              className="bg-white rounded-3xl p-5 shadow-sm border border-black/5 flex items-center gap-4"
            >
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontSize: '26px', fontVariationSettings: "'FILL' 1" }}
              >
                {stat.icon}
              </span>
              <div>
                <p className="font-headline font-extrabold text-2xl text-on-surface leading-none">
                  {stat.value}
                </p>
                <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider mt-1">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Motivational card */}
        <div className="bg-gradient-to-br from-primary to-primary-dim rounded-3xl p-6 text-white shadow-xl shadow-purple-500/20">
          <p className="font-label text-[10px] uppercase tracking-widest font-bold text-white/60 mb-2">
            Daily Reminder
          </p>
          <h2 className="font-headline font-extrabold text-xl leading-snug">
            You didn't come this far to only come this far.
          </h2>
          <p className="text-sm text-white/70 mt-2">Keep showing up. Results follow consistency.</p>
        </div>
      </main>

      <BottomNavBar />
    </div>
  )
}
