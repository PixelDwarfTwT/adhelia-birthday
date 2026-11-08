-- Membership table used by public.is_admin(). This table is intentionally
-- managed from the Supabase SQL editor / service role, never from the browser.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- The SECURITY DEFINER helper public.is_admin() can still read this table.
-- Browser roles must not read or mutate membership directly.
revoke all on table public.admin_users from public, anon, authenticated;

-- Keep updated_at authoritative in Postgres instead of relying on every client.
drop trigger if exists birthday_content_set_updated_at on public.birthday_content;

create trigger birthday_content_set_updated_at
before insert or update on public.birthday_content
for each row execute function public.update_updated_at_column();
