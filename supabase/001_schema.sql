-- ============================================================
-- Kahutam – Full Schema Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "pgcrypto";


-- ─── Enums ───────────────────────────────────────────────────
create type game_status as enum (
  'lobby',
  'reading',
  'answering',
  'leaderboard',
  'finished'
);


-- ─── Tables ──────────────────────────────────────────────────

-- Questions pool (shared, not game-specific)
create table questions (
  id                  uuid primary key default gen_random_uuid(),
  text                text        not null,
  options             jsonb       not null,  -- array of exactly 4 strings
  correct_option_index int        not null check (correct_option_index between 0 and 3),
  time_limit          int         not null default 20, -- seconds
  created_at          timestamptz not null default now()
);

-- Games
create table games (
  id                     uuid primary key default gen_random_uuid(),
  status                 game_status not null default 'lobby',
  current_question_index int         not null default 0,
  question_start_time    timestamptz,
  settings               jsonb       not null default '{}'::jsonb,
  created_at             timestamptz not null default now()
);

-- Join table: which questions belong to a game and in what order
create table game_questions (
  id           uuid primary key default gen_random_uuid(),
  game_id      uuid not null references games(id) on delete cascade,
  question_id  uuid not null references questions(id) on delete cascade,
  order_index  int  not null,
  unique (game_id, order_index)
);

-- Players (one row per player per game session)
create table players (
  id             uuid primary key default gen_random_uuid(),
  game_id        uuid        not null references games(id) on delete cascade,
  nickname       text        not null,
  avatar         text        not null default '🎮',
  score          int         not null default 0,
  current_streak int         not null default 0,
  joined_at      timestamptz not null default now()
);

-- Answers (one row per player per question)
create table answers (
  id               uuid primary key default gen_random_uuid(),
  player_id        uuid    not null references players(id) on delete cascade,
  question_id      uuid    not null references questions(id) on delete cascade,
  game_id          uuid    not null references games(id)   on delete cascade,
  selected_option  int,                -- null = timed out
  is_correct       boolean not null default false,
  response_time_ms int,                -- null = timed out
  points_earned    int     not null default 0,
  answered_at      timestamptz not null default now(),
  unique (player_id, question_id)
);


-- ─── Indexes ─────────────────────────────────────────────────
create index idx_game_questions_game_id on game_questions(game_id);
create index idx_players_game_id        on players(game_id);
create index idx_answers_player_id      on answers(player_id);
create index idx_answers_game_id        on answers(game_id);
create index idx_answers_question_id    on answers(question_id);


-- ─── Row Level Security ───────────────────────────────────────
alter table questions      enable row level security;
alter table games          enable row level security;
alter table game_questions enable row level security;
alter table players        enable row level security;
alter table answers        enable row level security;

-- questions: everyone can read, only service_role can write
create policy "questions_select_public"
  on questions for select using (true);

-- games: everyone can read
create policy "games_select_public"
  on games for select using (true);

-- game_questions: everyone can read
create policy "game_questions_select_public"
  on game_questions for select using (true);

-- players: everyone can read, anyone can INSERT (to join a game)
create policy "players_select_public"
  on players for select using (true);

create policy "players_insert_public"
  on players for insert with check (true);

-- answers: everyone can read, anyone can INSERT (submit an answer once)
create policy "answers_select_public"
  on answers for select using (true);

create policy "answers_insert_public"
  on answers for insert with check (true);


-- ─── Seed: Sample Questions ───────────────────────────────────
insert into questions (text, options, correct_option_index, time_limit) values
  (
    'מה הבירה של צרפת?',
    '["פריז", "לונדון", "ברלין", "רומא"]',
    0,
    20
  ),
  (
    'כמה ירחים יש לכוכב הלכת מאדים?',
    '["0", "1", "2", "4"]',
    2,
    20
  ),
  (
    'מי כתב את "המלט"?',
    '["מולייר", "שייקספיר", "דיקנס", "גתה"]',
    1,
    20
  ),
  (
    'מהו הסמל הכימי של זהב?',
    '["Ag", "Fe", "Au", "Cu"]',
    2,
    15
  ),
  (
    'באיזו שנה הגיע האדם לירח לראשונה?',
    '["1965", "1967", "1969", "1971"]',
    2,
    20
  ),
  (
    'מה המדינה הגדולה בעולם בשטחה?',
    '["קנדה", "סין", "ארצות הברית", "רוסיה"]',
    3,
    15
  ),
  (
    'כמה צלעות יש למשולש שווה-צלעות?',
    '["2", "3", "4", "6"]',
    1,
    10
  ),
  (
    'מי צייר את "מונה ליזה"?',
    '["מיכאלאנג''לו", "רפאל", "לאונרדו דה וינצ''י", "בוטיצ''לי"]',
    2,
    20
  );
