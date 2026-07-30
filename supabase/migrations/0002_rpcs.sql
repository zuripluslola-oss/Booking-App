-- 0002_rpcs.sql
-- Server-side booking logic. The app already calls these exact functions:
--   supabase.rpc("create_studio_appointment", {...})
--   supabase.rpc("update_studio_appointment_status", {...})
-- Putting this in the database (not the browser) is the whole point: the rules
-- can't be bypassed by a tampered client, and the appointment is created
-- atomically so two people can't grab the same slot.

-- helper: is the caller allowed to act on this business?
create or replace function public.is_member(p_business_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.business_members m
    where m.business_id = p_business_id and m.user_id = auth.uid()
  );
$$;

-- ── create_studio_appointment ─────────────────────────────────
-- Atomically: authorize caller, upsert the client, resolve the service,
-- compute end time, and insert the appointment. The no-overlap exclusion
-- constraint raises a unique_violation-style error if the slot is taken;
-- we translate that into a clean 'overlap' message the UI already handles.
create or replace function public.create_studio_appointment(
  p_business_id      uuid,
  p_client_name      text,
  p_client_email     text,
  p_client_phone     text,
  p_client_notes     text,
  p_service_name     text,
  p_starts_at        timestamptz,
  p_duration_minutes integer,
  p_subtotal_cents   integer,
  p_resource_id      uuid default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_client_id uuid;
  v_service_id uuid;
  v_ends_at timestamptz;
  v_appt_id uuid;
begin
  if not public.is_member(p_business_id) then
    raise exception 'not authorized for this business' using errcode = '42501';
  end if;
  if p_duration_minutes is null or p_duration_minutes < 5 then
    raise exception 'invalid duration';
  end if;

  v_ends_at := p_starts_at + make_interval(mins => p_duration_minutes);

  -- upsert client by (business, email); fall back to name-only when no email
  if coalesce(p_client_email,'') <> '' then
    insert into public.clients (business_id, name, email, phone, notes)
    values (p_business_id, p_client_name, p_client_email, coalesce(p_client_phone,''), coalesce(p_client_notes,''))
    on conflict (business_id, lower(email)) where email <> ''
    do update set name = excluded.name,
                  phone = case when excluded.phone <> '' then excluded.phone else clients.phone end,
                  updated_at = now()
    returning id into v_client_id;
  else
    insert into public.clients (business_id, name, phone, notes)
    values (p_business_id, p_client_name, coalesce(p_client_phone,''), coalesce(p_client_notes,''))
    returning id into v_client_id;
  end if;

  -- resolve service snapshot -> id if it exists (optional link)
  select id into v_service_id
  from public.services
  where business_id = p_business_id and name = p_service_name and active
  limit 1;

  begin
    insert into public.appointments (
      business_id, client_id, service_id, resource_id, service_name,
      starts_at, ends_at, status, source, subtotal_cents, client_notes
    ) values (
      p_business_id, v_client_id, v_service_id, p_resource_id, p_service_name,
      p_starts_at, v_ends_at, 'confirmed', 'staff', coalesce(p_subtotal_cents,0), coalesce(p_client_notes,'')
    ) returning id into v_appt_id;
  exception when exclusion_violation then
    raise exception 'overlap: that time was just booked' using errcode = 'P0001';
  end;

  -- bump the client's visit count
  update public.clients set visit_count = visit_count + 1, updated_at = now()
  where id = v_client_id;

  -- queue a confirmation to be sent by the outbox drainer
  insert into public.notification_outbox (business_id, appointment_id, channel, template, recipient, scheduled_for)
  select p_business_id, v_appt_id, 'email', 'confirmation', p_client_email, now()
  where coalesce(p_client_email,'') <> '';

  return v_appt_id;
end;
$$;

-- ── update_studio_appointment_status ──────────────────────────
create or replace function public.update_studio_appointment_status(
  p_appointment_id uuid,
  p_status text,
  p_cancellation_reason text default ''
) returns void
language plpgsql security definer set search_path = public as $$
declare v_business_id uuid; v_client_id uuid;
begin
  select business_id, client_id into v_business_id, v_client_id
  from public.appointments where id = p_appointment_id;
  if v_business_id is null then raise exception 'appointment not found'; end if;
  if not public.is_member(v_business_id) then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_status not in ('confirmed','checked_in','completed','cancelled','no_show') then
    raise exception 'invalid status';
  end if;

  update public.appointments
     set status = p_status,
         cancellation_reason = case when p_status = 'cancelled' then p_cancellation_reason else cancellation_reason end
   where id = p_appointment_id;

  -- track no-shows on the client record
  if p_status = 'no_show' and v_client_id is not null then
    update public.clients set no_show_count = no_show_count + 1, updated_at = now()
    where id = v_client_id;
  end if;
end;
$$;

-- lock down execution to authenticated users (RLS still applies to table reads)
revoke all on function public.create_studio_appointment(uuid,text,text,text,text,text,timestamptz,integer,integer,uuid) from public;
revoke all on function public.update_studio_appointment_status(uuid,text,text) from public;
grant execute on function public.create_studio_appointment(uuid,text,text,text,text,text,timestamptz,integer,integer,uuid) to authenticated;
grant execute on function public.update_studio_appointment_status(uuid,text,text) to authenticated;
