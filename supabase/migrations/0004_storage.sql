-- 0004_storage.sql
-- The app uploads to Supabase Storage: supabase.storage.from("client-photos").
-- Create the bucket (private) and restrict access to business members.
-- Files are namespaced by business id as the first path segment, e.g.
--   {business_id}/{client_id}/{filename}
-- so the policy can check membership from the path.

insert into storage.buckets (id, name, public)
values ('client-photos', 'client-photos', false)
on conflict (id) do nothing;

-- read/write only if the first folder in the path is a business you belong to
drop policy if exists "client photos member read" on storage.objects;
create policy "client photos member read" on storage.objects
  for select using (
    bucket_id = 'client-photos'
    and public.is_member( (storage.foldername(name))[1]::uuid )
  );

drop policy if exists "client photos member write" on storage.objects;
create policy "client photos member write" on storage.objects
  for insert with check (
    bucket_id = 'client-photos'
    and public.is_member( (storage.foldername(name))[1]::uuid )
  );

drop policy if exists "client photos member delete" on storage.objects;
create policy "client photos member delete" on storage.objects
  for delete using (
    bucket_id = 'client-photos'
    and public.is_member( (storage.foldername(name))[1]::uuid )
  );
