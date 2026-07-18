-- Free trial pivot: 21-day trial with server-side activation + machine binding.
-- Run this manually in the Supabase SQL editor.

-- 1. Add status column to customers ('unpaid' | 'trial' | 'paid').
alter table customers
  add column if not exists status text not null default 'unpaid';

-- 2. New trials table. Kept separate from `licenses` (which is the payment artifact).
create table if not exists trials (
  id                      uuid primary key default gen_random_uuid(),
  email                   text unique not null,
  first_name              text,
  last_name               text,
  token                   text unique not null,
  token_consumed          boolean not null default false,
  signup_at               timestamptz not null default now(),
  started_at              timestamptz,
  expires_at              timestamptz,
  machine_id              text,
  converted_license_key   text,
  created_at              timestamptz not null default now()
);

create index if not exists trials_token_idx       on trials (token);
create index if not exists trials_machine_id_idx  on trials (machine_id);
