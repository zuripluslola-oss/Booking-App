revoke execute on function public.create_studio_appointment(
  uuid, text, text, text, text, text, timestamptz, integer, integer
) from anon;

revoke execute on function public.update_studio_appointment_status(
  uuid, public.appointment_status, text
) from anon;

revoke execute on function public.reschedule_studio_appointment(
  uuid, timestamptz
) from anon;
