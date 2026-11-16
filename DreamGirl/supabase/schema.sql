-- DreamHer: portraits drawn through Surplus Intelligence, plus the public gallery.
-- Run once in Supabase: SQL Editor > New query > paste all of this > Run.
--
-- All access goes through the Vercel API with the secret key. RLS is on with no
-- policies, so the public anon key can't read or write these tables directly.
-- Images live in the public "portraits" storage bucket (unguessable file names).

create table if not exists public.portraits (
  id                uuid primary key default gen_random_uuid(),
  username          text check (username ~ '^[A-Za-z0-9_]{1,15}$'),  -- null = not in the gallery
  username_lc       text generated always as (lower(username)) stored,
  image_url         text not null check (char_length(image_url) <= 1000),
  storage_path      text,                         -- picture is deleted on removal; the row stays for limits
  caption           text not null check (char_length(caption) <= 400),
  style             text check (char_length(style) <= 120),
  model             text not null,
  cost_micro        bigint not null default 0,  -- what Surplus charged, USD microdollars
  list_micro        bigint not null default 0,  -- the same image at the model's list price
  gen_ms            integer,
  delete_token_hash text not null,
  ip_hash           text not null,
  hidden            boolean not null default false,
  created_at        timestamptz not null default now()
);

create index if not exists portraits_recent on public.portraits (created_at desc) where username is not null and not hidden;
create index if not exists portraits_by_user on public.portraits (username_lc, created_at desc) where username is not null and not hidden;
create index if not exists portraits_by_ip on public.portraits (ip_hash, created_at desc);
create index if not exists portraits_by_name on public.portraits (username_lc, created_at desc);
create index if not exists portraits_by_day on public.portraits (created_at);

-- One report per visitor per portrait; three reports from different visitors hide it.
create table if not exists public.portrait_reports (
  portrait_id uuid not null references public.portraits (id) on delete cascade,
  ip_hash     text not null,
  created_at  timestamptz not null default now(),
  primary key (portrait_id, ip_hash)
);

-- Every request to draw a portrait, kept for good: what was asked, the exact prompt sent
-- to Surplus, and what happened. Includes requests that were blocked, rate-limited or
-- failed, which never become portraits. Only reachable with the secret key.
create table if not exists public.prompt_log (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  status       text not null check (status in ('drawn', 'blocked', 'limited', 'failed', 'invalid')),
  reason       text,                    -- why it was blocked, limited or failed
  username     text,                    -- as typed, unverified
  ip_hash      text not null,           -- salted hash, never the raw IP
  answers      jsonb,                   -- the ten answers (as sent, for invalid requests)
  prompt       text,                    -- the text sent to Surplus
  portrait_id  uuid references public.portraits (id) on delete set null,
  model        text,
  cost_micro   bigint
);

create index if not exists prompt_log_recent on public.prompt_log (created_at desc);
create index if not exists prompt_log_by_status on public.prompt_log (status, created_at desc);

alter table public.portraits enable row level security;
alter table public.portrait_reports enable row level security;
alter table public.prompt_log enable row level security;

create or replace function public.report_portrait(p_id uuid, p_ip_hash text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into portrait_reports (portrait_id, ip_hash) values (p_id, p_ip_hash) on conflict do nothing;
  update portraits set hidden = true
   where id = p_id and (select count(*) from portrait_reports where portrait_id = p_id) >= 3;
end;
$$;

-- Totals for the "drawn for $X on Surplus" counters. Counts every portrait drawn,
-- including removed and hidden ones, because that money was really spent.
create or replace function public.portrait_stats()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'portraits', count(*),
    'cost_micro', coalesce(sum(cost_micro), 0),
    'list_micro', coalesce(sum(list_micro), 0)
  ) from portraits;
$$;

-- Spend since a time, for the daily budget cap.
create or replace function public.spent_since(p_since timestamptz)
returns bigint language sql stable security definer set search_path = public as $$
  select coalesce(sum(cost_micro), 0) from portraits where created_at >= p_since;
$$;

revoke execute on function public.report_portrait(uuid, text) from public, anon, authenticated;
revoke execute on function public.portrait_stats() from public, anon, authenticated;
revoke execute on function public.spent_since(timestamptz) from public, anon, authenticated;

-- Public bucket for the images. Writes need the secret key; reads are by URL.
insert into storage.buckets (id, name, public)
values ('portraits', 'portraits', true)
on conflict (id) do nothing;

-- Reading the prompt log:
--   latest requests:   select created_at, status, username, answers, prompt from prompt_log order by id desc limit 100;
--   what got blocked:  select created_at, reason, answers from prompt_log where status = 'blocked' order by id desc;
--   most-picked style: select answers->>'imageGenerationStyle' s, count(*) from prompt_log where status = 'drawn' group by 1 order by 2 desc;

-- Moderating by hand (Table Editor or SQL):
--   hide a post:       update portraits set hidden = true  where id = '...';
--   bring it back:     update portraits set hidden = false where id = '...';
--   hide a username:   update portraits set hidden = true  where username_lc = lower('SomeName');
