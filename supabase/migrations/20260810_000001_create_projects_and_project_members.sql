create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  constraint projects_slug_format check (slug = lower(slug))
);

create table public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

alter table public.projects enable row level security;
alter table public.project_members enable row level security;

create policy "Users can view assigned projects"
on public.projects
for select
to authenticated
using (
  exists (
    select 1
    from public.project_members
    where project_members.project_id = projects.id
      and project_members.user_id = (select auth.uid())
  )
);

create policy "Users can view their own project memberships"
on public.project_members
for select
to authenticated
using (user_id = (select auth.uid()));

insert into public.projects (name, slug)
values
  ('BerlinBrick', 'berlinbrick'),
  ('Cat-2-Go', 'cat-2-go');
