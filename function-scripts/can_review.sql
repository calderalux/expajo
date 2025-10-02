
  select
    b.user_id = auth.uid()
    and b.status = 'completed'::booking_status
    and not exists (
      select 1 from public.reviews r where r.booking_id = b.id
    )
  from public.bookings b
  where b.id = p_booking_id;
