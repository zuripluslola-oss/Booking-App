create or replace function public.create_studio_appointment(
  p_business_id uuid,
  p_client_name text,
  p_client_email text,
  p_client_phone text,
  p_client_notes text,
  p_service_name text,
  p_starts_at timestamptz,
  p_duration_minutes integer,
  p_subtotal_cents integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client_id uuid;
  v_service_id uuid;
  v_appointment_id uuid;
begin
  if not private.has_business_role(
    p_business_id,
    array['owner', 'manager', 'staff', 'booth_renter']::public.business_role[]
  ) then
    raise exception 'You do not have access to this business';
  end if;

  if nullif(trim(p_client_name), '') is null then
    raise exception 'Client name is required';
  end if;

  select id into v_client_id
  from public.clients
  where business_id = p_business_id
    and (
      (nullif(trim(p_client_email), '') is not null and email = trim(p_client_email)::extensions.citext)
      or
      (nullif(trim(p_client_phone), '') is not null and phone = trim(p_client_phone))
    )
  order by created_at
  limit 1;

  if v_client_id is null then
    insert into public.clients (business_id, name, email, phone, notes)
    values (
      p_business_id,
      trim(p_client_name),
      nullif(lower(trim(p_client_email)), '')::extensions.citext,
      nullif(trim(p_client_phone), ''),
      coalesce(p_client_notes, '')
    )
    returning id into v_client_id;
  else
    update public.clients
    set name = trim(p_client_name),
        email = coalesce(nullif(lower(trim(p_client_email)), '')::extensions.citext, email),
        phone = coalesce(nullif(trim(p_client_phone), ''), phone),
        notes = case when nullif(trim(p_client_notes), '') is null then notes else trim(p_client_notes) end,
        updated_at = now()
    where id = v_client_id;
  end if;

  select id into v_service_id
  from public.services
  where business_id = p_business_id and lower(name) = lower(trim(p_service_name))
  limit 1;

  if v_service_id is null then
    insert into public.services (
      business_id, name, description, category, duration_minutes,
      price_cents, deposit_cents, active
    )
    values (
      p_business_id, trim(p_service_name), 'Created in Business Studio',
      'Business Studio', greatest(5, least(p_duration_minutes, 1440)),
      greatest(0, p_subtotal_cents), 0, true
    )
    returning id into v_service_id;
  end if;

  insert into public.appointments (
    business_id, service_id, staff_user_id, client_id, starts_at, ends_at,
    status, manage_token_hash, client_notes, subtotal_cents, total_cents
  )
  values (
    p_business_id, v_service_id, (select auth.uid()), v_client_id, p_starts_at,
    p_starts_at + make_interval(mins => greatest(5, least(p_duration_minutes, 1440))),
    'confirmed', encode(extensions.digest(gen_random_uuid()::text, 'sha256'), 'hex'),
    coalesce(p_client_notes, ''), greatest(0, p_subtotal_cents), greatest(0, p_subtotal_cents)
  )
  returning id into v_appointment_id;

  insert into public.appointment_events (
    business_id, appointment_id, actor_user_id, event_type, event_data
  )
  values (
    p_business_id, v_appointment_id, (select auth.uid()), 'created',
    jsonb_build_object('source', 'business_studio')
  );

  return v_appointment_id;
end;
$$;

revoke all on function public.create_studio_appointment(uuid, text, text, text, text, text, timestamptz, integer, integer) from public;
grant execute on function public.create_studio_appointment(uuid, text, text, text, text, text, timestamptz, integer, integer) to authenticated;

create or replace function public.update_studio_appointment_status(
  p_appointment_id uuid,
  p_status public.appointment_status,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business_id uuid;
begin
  select business_id into v_business_id
  from public.appointments
  where id = p_appointment_id;

  if v_business_id is null or not private.has_business_role(
    v_business_id,
    array['owner', 'manager', 'staff', 'booth_renter']::public.business_role[]
  ) then
    raise exception 'Appointment not found';
  end if;

  update public.appointments
  set status = p_status,
      cancellation_reason = case when p_status = 'cancelled' then nullif(trim(p_reason), '') else cancellation_reason end,
      cancelled_at = case when p_status = 'cancelled' then now() else cancelled_at end,
      no_show_at = case when p_status = 'no_show' then now() else no_show_at end,
      updated_at = now()
  where id = p_appointment_id;

  insert into public.appointment_events (
    business_id, appointment_id, actor_user_id, event_type, event_data
  )
  values (
    v_business_id, p_appointment_id, (select auth.uid()), p_status::text,
    jsonb_build_object('reason', coalesce(p_reason, ''))
  );
end;
$$;

revoke all on function public.update_studio_appointment_status(uuid, public.appointment_status, text) from public;
grant execute on function public.update_studio_appointment_status(uuid, public.appointment_status, text) to authenticated;

create or replace function public.reschedule_studio_appointment(
  p_appointment_id uuid,
  p_starts_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business_id uuid;
  v_duration interval;
begin
  select business_id, ends_at - starts_at
  into v_business_id, v_duration
  from public.appointments
  where id = p_appointment_id;

  if v_business_id is null or not private.has_business_role(
    v_business_id,
    array['owner', 'manager', 'staff', 'booth_renter']::public.business_role[]
  ) then
    raise exception 'Appointment not found';
  end if;

  update public.appointments
  set starts_at = p_starts_at,
      ends_at = p_starts_at + v_duration,
      status = 'confirmed',
      updated_at = now()
  where id = p_appointment_id;

  insert into public.appointment_events (
    business_id, appointment_id, actor_user_id, event_type, event_data
  )
  values (
    v_business_id, p_appointment_id, (select auth.uid()), 'rescheduled',
    jsonb_build_object('starts_at', p_starts_at)
  );
end;
$$;

revoke all on function public.reschedule_studio_appointment(uuid, timestamptz) from public;
grant execute on function public.reschedule_studio_appointment(uuid, timestamptz) to authenticated;
