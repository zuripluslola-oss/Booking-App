create or replace function private.has_business_role(
  bid uuid,
  allowed_roles public.business_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_members membership
    where membership.business_id = bid
      and membership.user_id = (select auth.uid())
      and membership.active
      and membership.role = any(allowed_roles)
  )
$$;

revoke all on function private.has_business_role(uuid, public.business_role[]) from public;
grant execute on function private.has_business_role(uuid, public.business_role[]) to authenticated;

drop policy if exists members_write on public.business_members;

create policy members_insert
on public.business_members
for insert
to authenticated
with check (
  (
    user_id = (select auth.uid())
    and role = 'owner'
    and exists (
      select 1
      from public.businesses business
      where business.id = business_id
        and business.owner_user_id = (select auth.uid())
    )
  )
  or private.has_business_role(
    business_id,
    array['owner', 'manager']::public.business_role[]
  )
);

create policy members_update
on public.business_members
for update
to authenticated
using (
  private.has_business_role(
    business_id,
    array['owner', 'manager']::public.business_role[]
  )
)
with check (
  private.has_business_role(
    business_id,
    array['owner', 'manager']::public.business_role[]
  )
);

create policy members_delete
on public.business_members
for delete
to authenticated
using (
  private.has_business_role(
    business_id,
    array['owner', 'manager']::public.business_role[]
  )
  and not (
    user_id = (select auth.uid())
    and role = 'owner'
  )
);
