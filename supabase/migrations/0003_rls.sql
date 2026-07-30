-- 0003_rls.sql
-- Row-Level Security. This is what makes it safe for the browser to query
-- Supabase directly: without RLS, any signed-in user could read every
-- business's clients and appointments. With it, a user only ever sees rows
-- for businesses they're a member of. Public booking pages get a narrow,
-- explicit read path instead of blanket access.

alter table public.businesses        enable row level security;
alter table public.business_members  enable row level security;
alter table public.resources         enable row level security;
alter table public.services          enable row level security;
alter table public.clients           enable row level security;
alter table public.appointments      enable row level security;
alter table public.client_photos     enable row level security;
alter table public.notification_outbox enable row level security;

-- helper predicate: current user is a member of the business
-- (defined in 0002 as is_member(); reused here)

-- ── businesses ────────────────────────────────────────────────
drop policy if exists businesses_member_all on public.businesses;
create policy businesses_member_all on public.businesses
  for all using (public.is_member(id)) with check (owner_id = auth.uid());

-- allow creating a business you own even before a membership row exists
drop policy if exists businesses_insert_own on public.businesses;
create policy businesses_insert_own on public.businesses
  for insert with check (owner_id = auth.uid());

-- published business is publicly readable (for the public booking site)
drop policy if exists businesses_public_read on public.businesses;
create policy businesses_public_read on public.businesses
  for select using (published = true);

-- ── business_members ──────────────────────────────────────────
drop policy if exists members_self_read on public.business_members;
create policy members_self_read on public.business_members
  for select using (user_id = auth.uid() or public.is_member(business_id));
drop policy if exists members_owner_write on public.business_members;
create policy members_owner_write on public.business_members
  for insert with check (
    user_id = auth.uid()  -- you may add yourself
    or exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );

-- ── member-scoped tables (resources, services, clients, appointments, photos) ─
-- services are also publicly readable when the business is published, so the
-- public booking page can list them; everything else is member-only.

drop policy if exists resources_member on public.resources;
create policy resources_member on public.resources
  for all using (public.is_member(business_id)) with check (public.is_member(business_id));

drop policy if exists services_member on public.services;
create policy services_member on public.services
  for all using (public.is_member(business_id)) with check (public.is_member(business_id));
drop policy if exists services_public_read on public.services;
create policy services_public_read on public.services
  for select using (
    active and exists (select 1 from public.businesses b where b.id = business_id and b.published)
  );

drop policy if exists clients_member on public.clients;
create policy clients_member on public.clients
  for all using (public.is_member(business_id)) with check (public.is_member(business_id));

drop policy if exists appointments_member on public.appointments;
create policy appointments_member on public.appointments
  for all using (public.is_member(business_id)) with check (public.is_member(business_id));

drop policy if exists photos_member on public.client_photos;
create policy photos_member on public.client_photos
  for all using (public.is_member(business_id)) with check (public.is_member(business_id));

drop policy if exists outbox_member on public.notification_outbox;
create policy outbox_member on public.notification_outbox
  for select using (public.is_member(business_id));

-- Note: writes to appointments/clients happen through the security-definer
-- RPCs (create_studio_appointment / update_studio_appointment_status), which
-- bypass RLS intentionally after doing their own is_member() authorization.
-- Direct table writes remain member-gated by the policies above as a backstop.
