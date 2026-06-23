-- Phase 1.8 — Storage RLS for the exhibition-images bucket.
--
-- Public read stays (bucket is public). Authenticated writes/deletes are scoped to a gallery's own
-- prefix: gallery/{gallery_id}/...  Legacy date-prefixed objects (YYYY-MM-DD/uuid.ext) fail the
-- gallery-prefix check cleanly (safe_uuid on a non-uuid folder returns null -> is_gallery_member(null)
-- is false). service-role bypasses these, so the legacy admin keeps uploading during transition.

drop policy if exists exhibition_images_public_read on storage.objects;
create policy exhibition_images_public_read on storage.objects
  for select
  using (bucket_id = 'exhibition-images');

drop policy if exists exhibition_images_member_insert on storage.objects;
create policy exhibition_images_member_insert on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'exhibition-images'
    and (storage.foldername(name))[1] = 'gallery'
    and public.is_gallery_member(public.safe_uuid((storage.foldername(name))[2]))
  );

drop policy if exists exhibition_images_member_update on storage.objects;
create policy exhibition_images_member_update on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'exhibition-images'
    and (storage.foldername(name))[1] = 'gallery'
    and public.is_gallery_member(public.safe_uuid((storage.foldername(name))[2]))
  );

drop policy if exists exhibition_images_member_delete on storage.objects;
create policy exhibition_images_member_delete on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'exhibition-images'
    and (
      public.is_super_admin()
      or (
        (storage.foldername(name))[1] = 'gallery'
        and public.is_gallery_member(public.safe_uuid((storage.foldername(name))[2]))
      )
    )
  );
