-- ============================================================
-- ProaShield Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────

create type user_type as enum ('exec', 'seller');
create type verdict_type as enum ('pass', 'hold', 'fail');

-- ─────────────────────────────────────────────────────────────
-- USERS (extends auth.users)
-- ─────────────────────────────────────────────────────────────

create table public.users (
  id          uuid        primary key references auth.users(id) on delete cascade,
  email       text        not null,
  user_type   user_type   not null,
  full_name   text        not null,
  created_at  timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read own record"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own record"
  on public.users for update
  using (auth.uid() = id);

-- Auto-insert user row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, user_type, full_name)
  values (
    new.id,
    new.email,
    (new.raw_user_meta_data->>'user_type')::user_type,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- EXEC PROFILES
-- ─────────────────────────────────────────────────────────────

create table public.exec_profiles (
  id                      uuid        primary key default uuid_generate_v4(),
  user_id                 uuid        not null references public.users(id) on delete cascade,
  username                text        not null unique,
  job_title               text        not null default '',
  company_name            text        not null default '',
  company_description     text        not null default '',
  outreach_description    text        not null default '',
  technical_requirements  text,
  accepted_categories     jsonb       not null default '[]',
  rejected_categories     jsonb       not null default '[]',
  objectives              jsonb       not null default '[]',
  green_flags             jsonb       not null default '[]',
  red_flags               jsonb       not null default '[]',
  notification_email      text        not null default '',
  notification_sms        text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

alter table public.exec_profiles enable row level security;

create policy "Exec can read own profile"
  on public.exec_profiles for select
  using (auth.uid() = user_id);

create policy "Exec can update own profile"
  on public.exec_profiles for update
  using (auth.uid() = user_id);

create policy "Exec can insert own profile"
  on public.exec_profiles for insert
  with check (auth.uid() = user_id);

-- Public read for the screening page (anyone can load /username)
create policy "Public can read exec profile by username"
  on public.exec_profiles for select
  using (true);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger exec_profiles_updated_at
  before update on public.exec_profiles
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- SELLER PROFILES
-- ─────────────────────────────────────────────────────────────

create table public.seller_profiles (
  id             uuid        primary key default uuid_generate_v4(),
  user_id        uuid        not null references public.users(id) on delete cascade,
  full_name      text        not null default '',
  company_name   text        not null default '',
  company_email  text        not null default '',
  phone          text        not null default '',
  created_at     timestamptz not null default now()
);

alter table public.seller_profiles enable row level security;

create policy "Seller can read own profile"
  on public.seller_profiles for select
  using (auth.uid() = user_id);

create policy "Seller can update own profile"
  on public.seller_profiles for update
  using (auth.uid() = user_id);

create policy "Seller can insert own profile"
  on public.seller_profiles for insert
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- CONVERSATIONS
-- ─────────────────────────────────────────────────────────────

create table public.conversations (
  id               uuid         primary key default uuid_generate_v4(),
  exec_profile_id  uuid         not null references public.exec_profiles(id) on delete cascade,
  seller_id        uuid         references public.users(id) on delete set null,
  sender_name      text         not null default '',
  sender_company   text         not null default '',
  sender_email     text         not null default '',
  verdict          verdict_type,
  score            integer,
  category         text,
  summary          text,
  reason           text,
  transcript       jsonb        not null default '[]',
  prompt_snapshot  text,
  created_at       timestamptz  not null default now()
);

alter table public.conversations enable row level security;

-- Exec can see all conversations on their profile
create policy "Exec can read own conversations"
  on public.conversations for select
  using (
    exec_profile_id in (
      select id from public.exec_profiles where user_id = auth.uid()
    )
  );

-- Seller can see their own conversations
create policy "Seller can read own conversations"
  on public.conversations for select
  using (auth.uid() = seller_id);

-- Service role (AI screening) inserts conversations
create policy "Service role can insert conversations"
  on public.conversations for insert
  with check (true);

create policy "Service role can update conversations"
  on public.conversations for update
  using (true);

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────

create index idx_exec_profiles_username on public.exec_profiles(username);
create index idx_exec_profiles_user_id on public.exec_profiles(user_id);
create index idx_seller_profiles_user_id on public.seller_profiles(user_id);
create index idx_conversations_exec_profile_id on public.conversations(exec_profile_id);
create index idx_conversations_seller_id on public.conversations(seller_id);
create index idx_conversations_created_at on public.conversations(created_at desc);
