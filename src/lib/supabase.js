import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const syncEnabled = !!(url && key)

export const supabase = syncEnabled
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null

if (!syncEnabled) {
  console.info('[sync] Supabase env vars not set — running in offline-only mode.')
}
