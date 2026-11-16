
CREATE POLICY "Members view profile photos" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'photos');
CREATE POLICY "Users upload own photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own photos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own photos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);
