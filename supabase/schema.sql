-- Horizon banking app — Supabase schema
-- Replaces Appwrite's 3 collections (user, bank, transaction).
-- Run this in Supabase Dashboard > SQL Editor > New query.

-- ============================================================
-- 1. PROFILES
-- Extends auth.users with the extra fields Appwrite stored on
-- its "user" collection. id = auth.users.id (1:1), so there's
-- no separate "userId" field like Appwrite had — the row's own
-- id IS the user id.
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  address1 text,
  city text,
  state text,
  postal_code text,
  date_of_birth date,
  ssn text, -- NOTE: plaintext, same as the original tutorial.
            -- Encrypt this column (e.g. pgsodium) before going anywhere near real users.
  email text not null,
  dwolla_customer_id text,
  dwolla_customer_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Individuals can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Individuals can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);


-- ============================================================
-- 2. BANKS
-- One row per linked bank account (Plaid access token + Dwolla
-- funding source).
-- ============================================================
create table public.banks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id text not null,       -- Plaid account_id
  bank_id text not null,          -- Plaid item_id
  access_token text not null,     -- Plaid access_token
  funding_source_url text not null, -- Dwolla funding source URL
  sharable_id text not null,      -- encrypted account_id, shared with senders
  created_at timestamptz not null default now()
);

alter table public.banks enable row level security;

create policy "Individuals can view their own banks"
  on public.banks for select
  using (auth.uid() = user_id);

create policy "Individuals can insert their own banks"
  on public.banks for insert
  with check (auth.uid() = user_id);

create index banks_user_id_idx on public.banks (user_id);
create index banks_account_id_idx on public.banks (account_id);


-- ============================================================
-- 3. TRANSACTIONS
-- Transfer records between platform users, created after a
-- successful Dwolla transfer. Core columns match exactly what
-- PaymentTransferForm.tsx sends to createTransaction(). channel
-- and category are added with defaults because the tutorial's
-- getAccount() (bank.actions.ts) reads transferData.channel /
-- transferData.category when building the transaction list —
-- several GitHub issues on the original repo (#83, #9) trace
-- back to these being undefined, so they're set here instead.
-- ============================================================
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  amount numeric(12, 2) not null,
  sender_id uuid not null references auth.users(id),
  sender_bank_id uuid not null references public.banks(id),
  receiver_id uuid not null references auth.users(id),
  receiver_bank_id uuid not null references public.banks(id),
  email text not null,
  channel text not null default 'online',
  category text not null default 'Transfer',
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Individuals can view transactions they sent or received"
  on public.transactions for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Individuals can create transactions as the sender"
  on public.transactions for insert
  with check (auth.uid() = sender_id);

create index transactions_sender_bank_idx on public.transactions (sender_bank_id);
create index transactions_receiver_bank_idx on public.transactions (receiver_bank_id);

-- ============================================================
-- Why RLS is enabled even though the server actions use the
-- service-role client (which bypasses RLS entirely):
-- it's a safety net. The transfer feature needs to look up a
-- RECEIVER's bank by sharable_id — someone who isn't the row's
-- owner — so that specific lookup can't be scoped to "own rows
-- only" at the query level. The service-role client mirrors
-- what the tutorial's Appwrite admin client already did (trust
-- the server action code for authorization). RLS then protects
-- these tables if anything ever queries them with the anon/user
-- key instead — e.g. a future client-side Realtime subscription.
-- ============================================================
