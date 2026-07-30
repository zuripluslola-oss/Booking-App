-- 0001_core_schema.sql
-- BookKit / Veya backend — core schema on Supabase Postgres.
-- Matches the tables the app actually calls: businesses, business_members,
-- clients, services, appointments, client_photos. Money in integer cents,
-- timestamps as timestamptz (UTC). gen_random_uuid() from pgcrypto.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;   -- needed for the no-overlap exclusion constraint

-- ── businesses ────────────────────────────────────────────────
create table if not exists public.businesses (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  slug            text not null unique,
  profession_pack text not null default 'braider',
  timezone        text not null default 'America/New_York',
  brand_color     text not null default '#e0a92e',
  template        text not null default 'braider',
  buffer_after_min integer not null default 0,
  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists businesses_owner_idx on public.businesses(owner_id);

-- ── membership (who can act on a business) ────────────────────
create table if not exists public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'owner',   -- owner | staff | frontdesk
  created_at  timestamptz not null default now(),
  primary key (business_id, user_id)
);
create index if not exists business_members_user_idx on public.business_members(user_id);

-- ── resources (staff/chairs) ──────────────────────────────────
create table if not exists public.resources (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references public.businesses(id) on delete cascade,
  name          text not null,
  type          text not null default 'staff', -- staff | station
  commission_rate numeric(4,3) not null default 0,   -- 0..1
  active        boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists resources_business_idx on public.resources(business_id);

-- ── services ──────────────────────────────────────────────────
create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references public.businesses(id) on delete cascade,
  name             text not null,
  category         text not null default '',
  duration_min     integer not null,
  price_cents      integer not null default 0,
  price_is_from    boolean not null default false,
  deposit_type     text not null default 'none',   -- none | fixed | percent
  deposit_value    integer not null default 0,      -- cents if fixed, 0..100 if percent
  requires_consult boolean not null default false,
  requires_upload  boolean not null default false,
  active           boolean not null default true,
  display_order    integer not null default 0,
  created_at       timestamptz not null default now()
);
create index if not exists services_business_idx on public.services(business_id);

-- ── clients ───────────────────────────────────────────────────
create table if not exists public.clients (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references public.businesses(id) on delete cascade,
  name          text not null,
  email         text not null default '',
  phone         text not null default '',
  notes         text not null default '',
  visit_count   integer not null default 0,
  no_show_count integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
-- one client record per (business, email) when email is present
create unique index if not exists clients_business_email_idx
  on public.clients(business_id, lower(email)) where email <> '';
create index if not exists clients_business_idx on public.clients(business_id);

-- ── appointments ──────────────────────────────────────────────
create table if not exists public.appointments (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  client_id       uuid references public.clients(id) on delete set null,
  service_id      uuid references public.services(id) on delete set null,
  resource_id     uuid references public.resources(id) on delete set null,
  service_name    text not null,           -- snapshot (name can change later)
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  status          text not null default 'confirmed', -- confirmed|checked_in|completed|cancelled|no_show
  source          text not null default 'staff',      -- online|walk_in|staff
  subtotal_cents  integer not null default 0,
  deposit_cents   integer not null default 0,
  deposit_status  text not null default 'none',       -- none|held|paid|forfeited
  client_notes    text not null default '',
  cancellation_reason text,
  manage_token    uuid not null default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint appointments_time_valid check (ends_at > starts_at)
);
create index if not exists appointments_business_start_idx
  on public.appointments(business_id, starts_at);
create index if not exists appointments_resource_idx
  on public.appointments(resource_id, starts_at);
create index if not exists appointments_client_idx on public.appointments(client_id);

-- ── the integrity rule that matters most: no double-booking ───
-- A given resource cannot have two active appointments that overlap in time.
-- Cancelled / no_show rows are excluded so freed slots can be rebooked.
-- This is enforced by Postgres itself — the browser cannot bypass it.
alter table public.appointments
  drop constraint if exists appointments_no_overlap;
alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    resource_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (resource_id is not null and status in ('confirmed','checked_in','completed'));

-- ── client photos (metadata; file lives in Supabase Storage) ──
create table if not exists public.client_photos (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references public.businesses(id) on delete cascade,
  client_id     uuid not null references public.clients(id) on delete cascade,
  storage_path  text not null,
  created_at    timestamptz not null default now()
);
create index if not exists client_photos_client_idx on public.client_photos(client_id);

-- ── notification outbox (reminders/confirmations are drained by a job) ─
create table if not exists public.notification_outbox (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references public.businesses(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete cascade,
  channel        text not null,           -- sms | email
  template       text not null,           -- confirmation | reminder | followup
  recipient      text not null,
  status         text not null default 'pending',
  scheduled_for  timestamptz not null,
  created_at     timestamptz not null default now()
);
create index if not exists outbox_due_idx
  on public.notification_outbox(status, scheduled_for);

-- keep updated_at fresh
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists businesses_touch on public.businesses;
create trigger businesses_touch before update on public.businesses
  for each row execute function public.touch_updated_at();
drop trigger if exists appointments_touch on public.appointments;
create trigger appointments_touch before update on public.appointments
  for each row execute function public.touch_updated_at();
drop trigger if exists clients_touch on public.clients;
create trigger clients_touch before update on public.clients
  for each row execute function public.touch_updated_at();
