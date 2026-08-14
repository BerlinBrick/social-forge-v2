create table public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  platform text not null check (platform = 'instagram'),
  provider_account_id text not null,
  username text not null,
  status text not null default 'connected' check (status in ('connected', 'reauth_required', 'disconnected')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, platform),
  unique (platform, provider_account_id)
);

create table public.social_account_tokens (
  social_account_id uuid primary key references public.social_accounts(id) on delete cascade,
  access_token_ciphertext text not null,
  access_token_iv text not null,
  access_token_tag text not null,
  refresh_token_ciphertext text,
  refresh_token_iv text,
  refresh_token_tag text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.social_oauth_states (
  state_hash text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  platform text not null check (platform = 'instagram'),
  code_verifier_ciphertext text not null,
  code_verifier_iv text not null,
  code_verifier_tag text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.social_accounts enable row level security;
alter table public.social_account_tokens enable row level security;
alter table public.social_oauth_states enable row level security;

create policy "Project members can view social accounts"
on public.social_accounts
for select
to authenticated
using (
  exists (
    select 1
    from public.project_members
    where project_members.project_id = social_accounts.project_id
      and project_members.user_id = (select auth.uid())
  )
);

revoke all on table public.social_account_tokens from anon, authenticated;
revoke all on table public.social_oauth_states from anon, authenticated;
