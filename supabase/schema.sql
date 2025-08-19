-- Enable UUID extension if not already
create extension if not exists "uuid-ossp";

-- Auth: profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  company text,
  role text,
  created_at timestamp with time zone default now()
);

-- Validations table
create table if not exists public.validations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  lc_text text,
  results jsonb not null,
  created_at timestamp with time zone default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.validations enable row level security;

-- Policies
drop policy if exists "Public read own profile" on public.profiles;
create policy "Public read own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Insert own profile" on public.profiles;
create policy "Insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Read own validations" on public.validations;
create policy "Read own validations" on public.validations
  for select using (auth.uid() = user_id);

drop policy if exists "Insert own validations" on public.validations;
create policy "Insert own validations" on public.validations
  for insert with check (auth.uid() = user_id);


