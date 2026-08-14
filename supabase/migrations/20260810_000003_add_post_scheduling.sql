alter table public.posts
  add column if not exists scheduled_at timestamptz,
  add column if not exists published_at timestamptz;

create index if not exists posts_scheduled_publish_idx
  on public.posts (scheduled_at)
  where status = 'Geplant' and published_at is null;
