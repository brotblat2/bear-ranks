create extension if not exists pgcrypto;

create table if not exists public.rank_requests (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  item_1 text not null,
  item_2 text not null,
  item_3 text not null,
  status text not null default 'pending' check (status in ('pending','answered')),
  route text not null default 'email' check (route in ('live','email')),
  ranking_order integer[] null,
  email_fallback_sent boolean not null default false,
  created_at timestamptz not null default now(),
  answered_at timestamptz null,
  constraint valid_ranking check (
    ranking_order is null or
    (array_length(ranking_order, 1) = 3 and ranking_order @> array[1,2,3]::integer[])
  )
);

create table if not exists public.ranker_presence (
  id integer primary key default 1 check (id = 1),
  last_seen_at timestamptz not null default now()
);

insert into public.ranker_presence (id, last_seen_at)
values (1, now() - interval '1 day')
on conflict (id) do nothing;

alter table public.rank_requests enable row level security;
alter table public.ranker_presence enable row level security;

-- All application access uses the server-only Supabase secret key.
-- Do not expose SUPABASE_SECRET_KEY in browser code.
create index if not exists rank_requests_pending_created_idx
  on public.rank_requests (status, created_at);
