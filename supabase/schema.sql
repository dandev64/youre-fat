-- ============================================================
-- You're Fat — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Templates ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.templates (
  id          TEXT        PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data        JSONB       NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own templates"
  ON public.templates FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Workout Sessions ──────────────────────────────────────
-- One row per session (a day can have multiple sessions)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id          TEXT        PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date        TEXT        NOT NULL,   -- YYYY-MM-DD
  data        JSONB       NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own sessions"
  ON public.workout_sessions FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS workout_sessions_user_date
  ON public.workout_sessions (user_id, date);

-- ── Completions ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.completions (
  exercise_id  TEXT        NOT NULL,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date         TEXT        NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (exercise_id, user_id)
);

ALTER TABLE public.completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own completions"
  ON public.completions FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Realtime ──────────────────────────────────────────────
-- Enable realtime on completions so device B sees checkmarks
-- immediately when device A ticks an exercise.
ALTER PUBLICATION supabase_realtime ADD TABLE public.completions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workout_sessions;
