-- Run this in your Supabase SQL editor

create table roasts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  category text not null,
  roast text not null,
  fix text,
  score integer not null check (score between 1 and 10),
  one_liner text not null,
  subscores jsonb not null default '{}'::jsonb,
  savage_mode boolean not null default false,
  display_name text not null default 'Anonymous',
  reactions jsonb not null default '{"💀":0,"🔥":0,"🤌":0,"😬":0,"🫡":0,"😭":0}'::jsonb,
  crowd_score float not null default 0
);

-- Index for sorting
create index roasts_score_idx on roasts (score desc);
create index roasts_created_at_idx on roasts (created_at desc);
create index roasts_crowd_score_idx on roasts (crowd_score desc);
create index roasts_category_idx on roasts (category);

-- Enable RLS
alter table roasts enable row level security;

-- Public read
create policy "Public read" on roasts
  for select using (true);

-- Only backend (service role) can insert/update
-- Your FastAPI uses anon key so we allow insert for now
-- In production swap to service role key for writes
create policy "Public insert" on roasts
  for insert with check (true);

create policy "Public update reactions" on roasts
  for update using (true);
