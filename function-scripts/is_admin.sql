
  select exists (
    select 1 from public.app_roles
    where user_id = auth.uid() and role = 'admin'
  );
