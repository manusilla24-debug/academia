-- Supabase-only, idempotent. Run after the Drizzle migrations.
CREATE TABLE IF NOT EXISTS public.app_owner (
 id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
 user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE RESTRICT
);
ALTER TABLE public.app_owner ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_owner FROM anon, authenticated;
GRANT SELECT ON public.app_owner TO authenticated;
DROP POLICY IF EXISTS owner_identity ON public.app_owner;
CREATE POLICY owner_identity ON public.app_owner FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
DO $$
DECLARE name text;
BEGIN
 FOREACH name IN ARRAY ARRAY['videos','transcripts','segments','concepts','concept_sources','lessons','lesson_sources','exercises','attempts','cards','reviews','progress','hands','leaks','jobs','usage','settings'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', name);
  EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', name);
  EXECUTE format('GRANT SELECT, INSERT, UPDATE ON public.%I TO authenticated', name);
  EXECUTE format('DROP POLICY IF EXISTS owner_access ON public.%I', name);
  EXECUTE format('CREATE POLICY owner_access ON public.%I TO authenticated USING (EXISTS (SELECT 1 FROM public.app_owner WHERE user_id = (SELECT auth.uid()))) WITH CHECK (EXISTS (SELECT 1 FROM public.app_owner WHERE user_id = (SELECT auth.uid())))', name);
 END LOOP;
END $$;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('transcripts', 'transcripts', false, 8388608, ARRAY['text/plain'])
ON CONFLICT (id) DO UPDATE SET public=false, file_size_limit=8388608, allowed_mime_types=ARRAY['text/plain'];
DROP POLICY IF EXISTS transcript_owner_read ON storage.objects;
DROP POLICY IF EXISTS transcript_owner_insert ON storage.objects;
CREATE POLICY transcript_owner_read ON storage.objects FOR SELECT TO authenticated
 USING (bucket_id='transcripts' AND (storage.foldername(name))[1]=(SELECT auth.uid())::text AND EXISTS(SELECT 1 FROM public.app_owner WHERE user_id=(SELECT auth.uid())));
CREATE POLICY transcript_owner_insert ON storage.objects FOR INSERT TO authenticated
 WITH CHECK (bucket_id='transcripts' AND (storage.foldername(name))[1]=(SELECT auth.uid())::text AND EXISTS(SELECT 1 FROM public.app_owner WHERE user_id=(SELECT auth.uid())));
