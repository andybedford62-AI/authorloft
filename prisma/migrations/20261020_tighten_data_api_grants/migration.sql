-- Least-privilege Data API grants ahead of Supabase's Oct 30 2026 change
-- (new public tables no longer get automatic grants).
-- anon becomes read-only on every existing public table; the app never writes
-- through the Data API (Prisma connects as a superuser) and RLS already blocks
-- anon writes, so this removes only inert privileges.
DO $$
DECLARE t record;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  LOOP
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', t.tablename);
    EXECUTE format('GRANT SELECT ON TABLE public.%I TO anon', t.tablename);
  END LOOP;
END $$;

-- Event-trigger helper that auto-enables RLS on new tables; it should not be
-- callable through /rest/v1/rpc. The event trigger itself is unaffected.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
