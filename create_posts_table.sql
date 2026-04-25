-- ────────────────────────────────────────────────────────────────────────────
-- TABLA: posts  (NewsFeed en Tiempo Real)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.posts (
  id          BIGSERIAL PRIMARY KEY,
  content     TEXT        NOT NULL,
  author_id   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Política: cualquier usuario autenticado puede leer
CREATE POLICY "Authenticated users can read posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING (true);

-- Política: cualquier usuario autenticado puede publicar
CREATE POLICY "Authenticated users can insert posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Política: el autor o el admin (por email) puede eliminar
CREATE POLICY "Author or admin can delete posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (
    auth.uid() = author_id
    OR auth.email() = 'admin@petunias.com'   -- ← reemplazá por el email de tu admin
  );

-- ── Habilitar Realtime para la tabla posts ──────────────────────────────────
-- (También podés hacerlo en Database → Replication → Tables)
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
