-- ─────────────────────────────────────────────────────────────
-- QUANT — Prediction Market Schema
-- Run this once in the Supabase SQL editor
-- ─────────────────────────────────────────────────────────────

-- ── Users ────────────────────────────────────────────────────
create table if not exists users (
  wallet_address  text primary key,
  username        text unique,
  avatar_color    text not null default '#01e29e',
  created_at      timestamptz not null default now()
);

-- ── Markets ──────────────────────────────────────────────────
create table if not exists markets (
  id              text primary key,
  question        text not null,
  type            text not null check (type in ('binary', 'multiple')),
  category        text not null,
  image           text,
  yes_percent     int,          -- binary only
  no_percent      int,          -- binary only
  total_volume    numeric(18,2) not null default 0,
  expires_at      timestamptz not null,
  resolved        boolean not null default false,
  winning_option  text,
  created_by      text references users(wallet_address),
  created_at      timestamptz not null default now()
);

-- ── Market options (multiple-choice markets) ─────────────────
create table if not exists market_options (
  id              serial primary key,
  market_id       text not null references markets(id) on delete cascade,
  label           text not null,
  percent         int not null default 0,
  display_order   int not null default 0
);

-- ── Positions (bets) ─────────────────────────────────────────
create table if not exists positions (
  id              uuid primary key default gen_random_uuid(),
  market_id       text not null references markets(id),
  user_wallet     text not null references users(wallet_address),
  option_label    text not null,          -- 'YES' | 'NO' | option label
  amount_usd      numeric(18,6) not null, -- amount staked
  shares          numeric(18,6) not null, -- shares received
  tx_signature    text unique,            -- Solana tx hash (null until contract live)
  status          text not null default 'open'
                    check (status in ('open', 'won', 'lost', 'cancelled')),
  payout          numeric(18,6),          -- filled on resolution
  created_at      timestamptz not null default now()
);

-- ── Comments ─────────────────────────────────────────────────
create table if not exists comments (
  id              uuid primary key default gen_random_uuid(),
  market_id       text not null references markets(id),
  user_wallet     text not null references users(wallet_address),
  body            text not null,
  created_at      timestamptz not null default now()
);

-- ── Comment likes (prevents double-liking) ───────────────────
create table if not exists comment_likes (
  comment_id      uuid not null references comments(id) on delete cascade,
  user_wallet     text not null references users(wallet_address),
  primary key (comment_id, user_wallet)
);

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists positions_market_id_idx    on positions(market_id);
create index if not exists positions_user_wallet_idx  on positions(user_wallet);
create index if not exists positions_status_idx       on positions(status);
create index if not exists comments_market_id_idx     on comments(market_id);
create index if not exists market_options_market_idx  on market_options(market_id);

-- ── Row-Level Security ────────────────────────────────────────
alter table users           enable row level security;
alter table markets         enable row level security;
alter table market_options  enable row level security;
alter table positions       enable row level security;
alter table comments        enable row level security;
alter table comment_likes   enable row level security;

-- Public reads
create policy "public read users"          on users           for select using (true);
create policy "public read markets"        on markets         for select using (true);
create policy "public read market_options" on market_options  for select using (true);
create policy "public read positions"      on positions       for select using (true);
create policy "public read comments"       on comments        for select using (true);
create policy "public read comment_likes"  on comment_likes   for select using (true);

-- All writes go through the service-role key (our API routes) — no direct client writes
-- ─────────────────────────────────────────────────────────────

-- ── Seed markets from static data ────────────────────────────
insert into markets (id, question, type, category, image, yes_percent, no_percent, total_volume, expires_at, created_at)
values
  ('1',  'Next PumpFun hackaton winner',             'multiple', 'PumpFun',  '/hackaton.jpg', null, null, 404000, '2026-07-01 00:00:00+00', '2026-03-16 00:00:00+00'),
  ('2',  'Next PumpFun token to reach 100M mcap',   'multiple', 'Memes',    '/100m.png',     null, null, 380000, '2026-06-01 00:00:00+00', '2026-03-16 00:00:00+00'),
  ('3',  'Next meme to hit 10M mcap',               'multiple', 'Memes',    '/10m.png',      null, null, 220000, '2026-05-01 00:00:00+00', '2026-03-16 00:00:00+00'),
  ('4',  'PumpFun airdrop by end of March?',        'binary',   'PumpFun',  '/airdrop.png',  62,   38,   540000, '2026-03-31 00:00:00+00', '2026-03-16 00:00:00+00'),
  ('5',  'Will $TRUMP flip $PUMP by end of March?', 'binary',   'Crypto',   '/trump.png',    34,   66,   487000, '2026-03-31 00:00:00+00', '2026-03-16 00:00:00+00'),
  ('11', 'Will Alon join Forbes Top 100 by end of 2026?', 'binary', 'Business', '/alon.jpg', 47, 53,   210000, '2026-12-31 00:00:00+00', '2026-03-16 00:00:00+00')
on conflict (id) do nothing;

insert into market_options (market_id, label, percent, display_order) values
  ('1', 'Until',            18, 0), ('1', 'Codec',      12, 1), ('1', 'Dexter AI',  21, 2),
  ('1', 'Juice',             9, 3), ('1', 'Trenches Game', 14, 4), ('1', 'Pumpville', 8, 5),
  ('1', 'Percolator',        7, 6), ('1', 'None of the above', 11, 7),
  ('2', 'Alchemist AI',     22, 0), ('2', 'jelly-my-jelly', 18, 1), ('2', 'The White Whale', 15, 2),
  ('2', 'Ai Ring Complex',  13, 3), ('2', 'WAR',  11, 4), ('2', 'Neet', 9, 5),
  ('2', 'Troll',             7, 6), ('2', 'None of the above', 5, 7),
  ('3', 'Punch',            19, 0), ('3', 'Chillhouse', 16, 1), ('3', 'PsyopAnime', 14, 2),
  ('3', 'Wojak',            13, 3), ('3', 'Afk', 12, 4), ('3', 'What The Dog Doing?', 9, 5),
  ('3', 'Maxxing',           6, 6), ('3', 'None of the above', 11, 7)
on conflict do nothing;
