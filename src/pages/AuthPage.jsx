import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { syncEnabled } from '../lib/supabase'

export default function AuthPage() {
  const navigate = useNavigate()
  const { signIn, signUp, user } = useWorkoutStore()

  const [mode, setMode] = useState('signin')   // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Already signed in — go home
  if (user) {
    navigate('/', { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      if (mode === 'signup') {
        const { data } = await signUp(email.trim(), password)
        if (data?.user && !data.session) {
          // Email confirmation required
          setSuccessMsg('Check your inbox — we sent you a confirmation link.')
        } else {
          navigate('/', { replace: true })
        }
      } else {
        await signIn(email.trim(), password)
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>

      {/* Back button */}
      <div className="px-5 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '22px' }}>
            arrow_back
          </span>
        </button>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-sm mx-auto w-full">

        {/* Logo */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-xl shadow-purple-500/25 mb-6">
          <span className="font-headline font-extrabold text-white text-2xl">YF</span>
        </div>

        <h1 className="font-headline font-extrabold text-3xl text-on-surface text-center leading-tight mb-1">
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-sm text-on-surface-variant text-center mb-8">
          {mode === 'signin'
            ? 'Sign in to sync your workouts across all devices.'
            : 'Start tracking and sync everywhere you train.'}
        </p>

        {/* Supabase not configured notice */}
        {!syncEnabled && (
          <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-500 shrink-0 mt-0.5" style={{ fontSize: '18px' }}>
              warning
            </span>
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
              Supabase is not configured. Add{' '}
              <code className="font-mono bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> and{' '}
              <code className="font-mono bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>{' '}
              to your <code className="font-mono bg-amber-100 px-1 rounded">.env</code> file.
            </p>
          </div>
        )}

        {/* Form card */}
        <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-black/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-on-surface-variant/40 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ fontSize: '18px' }}>
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={!syncEnabled}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-surface-container text-on-surface text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/30 disabled:opacity-40"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-on-surface-variant/40 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ fontSize: '18px' }}>
                  lock
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  disabled={!syncEnabled}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-surface-container text-on-surface text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/30 disabled:opacity-40"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start gap-2">
                <span className="material-symbols-outlined text-red-500 shrink-0" style={{ fontSize: '16px' }}>
                  error
                </span>
                <p className="text-xs text-red-600 font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {/* Success */}
            {successMsg && (
              <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-start gap-2">
                <span className="material-symbols-outlined text-green-600 shrink-0" style={{ fontSize: '16px' }}>
                  check_circle
                </span>
                <p className="text-xs text-green-700 font-medium leading-relaxed">{successMsg}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !syncEnabled}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-400 text-white font-bold text-sm active:scale-[0.98] transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  {mode === 'signup' ? 'Creating account…' : 'Signing in…'}
                </>
              ) : (
                mode === 'signup' ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Mode toggle */}
        <p className="text-sm text-on-surface-variant mt-5 text-center">
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          {' '}
          <button
            onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(null); setSuccessMsg(null) }}
            className="text-primary font-bold active:opacity-60 transition-opacity"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>

      {/* Continue offline */}
      <div className="px-6 pb-8" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
        <button
          onClick={() => navigate('/')}
          className="w-full py-3.5 rounded-2xl border border-outline-variant/30 text-on-surface-variant text-sm font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>wifi_off</span>
          Continue without syncing
        </button>
      </div>
    </div>
  )
}
