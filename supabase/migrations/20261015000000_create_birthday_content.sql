create table public.birthday_content (
  id text primary key check (id in ('draft', 'published')),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint birthday_content_publication_state check (
    (id = 'draft' and published_at is null)
    or (id = 'published' and published_at is not null)
  )
);

alter table public.birthday_content enable row level security;

revoke all on table public.birthday_content from public, anon, authenticated;
grant usage on schema public to anon, authenticated;

-- Anonymous visitors only see the public row through RLS.
grant select (id, content, published_at) on table public.birthday_content to anon;

-- Authenticated visitors can read the published row; RLS hides the draft row.
-- Admins can read/write both rows through the app_metadata role claim.
grant select on table public.birthday_content to authenticated;
grant insert (id, content, published_at, updated_at) on table public.birthday_content to authenticated;
grant update (id, content, published_at, updated_at) on table public.birthday_content to authenticated;

create policy "Visitors can read published birthday copy"
  on public.birthday_content
  for select
  to anon
  using (id = 'published' and published_at is not null);

create policy "Signed in visitors can read published birthday copy"
  on public.birthday_content
  for select
  to authenticated
  using (id = 'published' and published_at is not null);

create policy "Admins can read birthday drafts"
  on public.birthday_content
  for select
  to authenticated
  using (id = 'draft' and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can create birthday copy"
  on public.birthday_content
  for insert
  to authenticated
  with check (
    id in ('draft', 'published')
    and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admins can update birthday copy"
  on public.birthday_content
  for update
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check (
    id in ('draft', 'published')
    and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
