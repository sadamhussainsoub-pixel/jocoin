-- ============ ENUMS ============
create type public.app_role as enum ('admin', 'moderator', 'user');
create type public.account_status as enum ('active', 'suspended');
create type public.ledger_entry_type as enum ('mining', 'referral_bonus', 'referral_commission', 'airdrop', 'withdrawal_hold', 'withdrawal_refund');
create type public.withdrawal_status as enum ('pending', 'approved', 'rejected', 'cancelled');
create type public.session_status as enum ('active', 'claimed');

-- ============ TABLES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Miner' check (char_length(display_name) between 2 and 40),
  avatar_url text check (avatar_url is null or char_length(avatar_url) <= 500),
  locale text not null default 'en' check (locale in ('en', 'ar')),
  referral_code text not null unique,
  referred_by uuid references public.profiles(id) on delete set null,
  status public.account_status not null default 'active',
  suspended_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.profiles to authenticated;
grant update (display_name, avatar_url, locale) on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create table public.app_settings (
  id int primary key default 1 check (id = 1),
  mining_enabled boolean not null default true,
  claim_interval_minutes int not null default 60 check (claim_interval_minutes between 1 and 10080),
  reward_per_claim numeric(20,8) not null default 10 check (reward_per_claim >= 0 and reward_per_claim <= 1000000),
  referral_enabled boolean not null default true,
  referral_signup_bonus numeric(20,8) not null default 50 check (referral_signup_bonus >= 0 and referral_signup_bonus <= 1000000),
  referral_commission_pct numeric(5,2) not null default 10 check (referral_commission_pct between 0 and 50),
  max_referrals_per_user int not null default 500 check (max_referrals_per_user between 0 and 100000),
  withdrawals_enabled boolean not null default true,
  min_withdrawal numeric(20,8) not null default 1000 check (min_withdrawal > 0),
  rate_limit_per_minute int not null default 10 check (rate_limit_per_minute between 1 and 1000),
  distribution_mode text not null default 'simulated' check (distribution_mode in ('simulated', 'testnet', 'mainnet')),
  updated_at timestamptz not null default now(),
  updated_by uuid
);
grant select on public.app_settings to anon, authenticated;
grant all on public.app_settings to service_role;
alter table public.app_settings enable row level security;

create table public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance numeric(20,8) not null default 0 check (balance >= 0),
  locked numeric(20,8) not null default 0 check (locked >= 0),
  total_mined numeric(20,8) not null default 0,
  total_referral numeric(20,8) not null default 0,
  total_airdrop numeric(20,8) not null default 0,
  total_earned numeric(20,8) generated always as (total_mined + total_referral + total_airdrop) stored,
  updated_at timestamptz not null default now()
);
grant select on public.wallets to authenticated;
grant all on public.wallets to service_role;
alter table public.wallets enable row level security;
create index wallets_total_earned_idx on public.wallets (total_earned desc);

create table public.reward_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  amount numeric(20,8) not null check (amount <> 0),
  entry_type public.ledger_entry_type not null,
  reference_id uuid,
  idempotency_key text not null unique,
  balance_after numeric(20,8) not null,
  description text,
  created_at timestamptz not null default now()
);
grant select on public.reward_ledger to authenticated;
grant all on public.reward_ledger to service_role;
alter table public.reward_ledger enable row level security;
create index reward_ledger_user_created_idx on public.reward_ledger (user_id, created_at desc);

create table public.mining_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.session_status not null default 'active',
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  claimed_at timestamptz,
  reward numeric(20,8),
  created_at timestamptz not null default now()
);
grant select on public.mining_sessions to authenticated;
grant all on public.mining_sessions to service_role;
alter table public.mining_sessions enable row level security;
create unique index mining_sessions_one_active_idx on public.mining_sessions (user_id) where status = 'active';
create index mining_sessions_user_created_idx on public.mining_sessions (user_id, created_at desc);
create index mining_sessions_claimed_idx on public.mining_sessions (claimed_at desc) where claimed_at is not null;

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referee_id uuid not null unique references public.profiles(id) on delete cascade,
  bonus_paid boolean not null default false,
  total_commission numeric(20,8) not null default 0,
  created_at timestamptz not null default now(),
  check (referrer_id <> referee_id)
);
grant select on public.referrals to authenticated;
grant all on public.referrals to service_role;
alter table public.referrals enable row level security;
create index referrals_referrer_idx on public.referrals (referrer_id);

create table public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(20,8) not null check (amount > 0),
  wallet_address text not null,
  network text not null default 'pending',
  status public.withdrawal_status not null default 'pending',
  admin_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  tx_hash text,
  chain_id int,
  created_at timestamptz not null default now()
);
grant select on public.withdrawal_requests to authenticated;
grant all on public.withdrawal_requests to service_role;
alter table public.withdrawal_requests enable row level security;
create index withdrawal_requests_user_idx on public.withdrawal_requests (user_id, created_at desc);
create index withdrawal_requests_status_idx on public.withdrawal_requests (status, created_at);
create unique index withdrawal_requests_one_pending_idx on public.withdrawal_requests (user_id) where status = 'pending';

create table public.airdrops (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 120),
  title_ar text,
  description text,
  description_ar text,
  amount numeric(20,8) not null check (amount > 0),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  max_claims int check (max_claims is null or max_claims > 0),
  claims_count int not null default 0,
  is_active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now()
);
grant select on public.airdrops to authenticated;
grant all on public.airdrops to service_role;
alter table public.airdrops enable row level security;

create table public.airdrop_claims (
  id uuid primary key default gen_random_uuid(),
  airdrop_id uuid not null references public.airdrops(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(20,8) not null,
  created_at timestamptz not null default now(),
  unique (airdrop_id, user_id)
);
grant select on public.airdrop_claims to authenticated;
grant all on public.airdrop_claims to service_role;
alter table public.airdrop_claims enable row level security;
create index airdrop_claims_user_idx on public.airdrop_claims (user_id);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  target_type text,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create index audit_logs_created_idx on public.audit_logs (created_at desc);
create index audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc);
create index audit_logs_action_idx on public.audit_logs (action, created_at desc);

create table public.rate_limit_events (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  action text not null,
  created_at timestamptz not null default now()
);
grant all on public.rate_limit_events to service_role;
alter table public.rate_limit_events enable row level security;
create index rate_limit_events_lookup_idx on public.rate_limit_events (user_id, action, created_at desc);

-- ============ HELPER FUNCTIONS ============
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.prevent_mutation()
returns trigger language plpgsql set search_path = public as $$
begin
  raise exception 'IMMUTABLE: rows in % cannot be modified or deleted', tg_table_name;
end $$;

create trigger reward_ledger_immutable before update or delete on public.reward_ledger
  for each row execute function public.prevent_mutation();
create trigger audit_logs_immutable before update or delete on public.audit_logs
  for each row execute function public.prevent_mutation();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end $$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

create or replace function public._audit(p_action text, p_target_type text, p_target_id text, p_details jsonb)
returns void language sql security definer set search_path = public as $$
  insert into public.audit_logs (actor_id, action, target_type, target_id, details)
  values (auth.uid(), p_action, p_target_type, p_target_id, coalesce(p_details, '{}'::jsonb));
$$;

create or replace function public._rate_limit(p_action text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_limit int; v_count int;
begin
  select rate_limit_per_minute into v_limit from public.app_settings where id = 1;
  delete from public.rate_limit_events where user_id = auth.uid() and created_at < now() - interval '1 hour';
  select count(*) into v_count from public.rate_limit_events
    where user_id = auth.uid() and action = p_action and created_at > now() - interval '1 minute';
  if v_count >= coalesce(v_limit, 10) then return false; end if;
  insert into public.rate_limit_events (user_id, action) values (auth.uid(), p_action);
  return true;
end $$;

create or replace function public._is_suspended(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = p_user and status = 'suspended')
$$;

-- Atomic balance change + immutable ledger row. Only callable from other definer functions.
create or replace function public._apply_ledger(p_user uuid, p_amount numeric, p_type public.ledger_entry_type, p_ref uuid, p_key text, p_desc text)
returns numeric language plpgsql security definer set search_path = public as $$
declare v_balance numeric;
begin
  update public.wallets set
    balance = balance + p_amount,
    total_mined = total_mined + case when p_type = 'mining' then p_amount else 0 end,
    total_referral = total_referral + case when p_type in ('referral_bonus', 'referral_commission') then p_amount else 0 end,
    total_airdrop = total_airdrop + case when p_type = 'airdrop' then p_amount else 0 end,
    updated_at = now()
  where user_id = p_user
  returning balance into v_balance;
  if not found then raise exception 'WALLET_NOT_FOUND'; end if;
  insert into public.reward_ledger (user_id, amount, entry_type, reference_id, idempotency_key, balance_after, description)
  values (p_user, p_amount, p_type, p_ref, p_key, v_balance, p_desc);
  return v_balance;
end $$;

create or replace function public._require_admin()
returns void language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.has_role(auth.uid(), 'admin') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
end $$;

-- ============ SIGNUP TRIGGER ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_code text; v_name text; v_ref_code text; v_referrer uuid; v_settings record; v_count int;
begin
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Miner');
  v_name := left(v_name, 40);
  if char_length(v_name) < 2 then v_name := 'Miner'; end if;

  loop
    v_code := 'JOC' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from public.profiles where referral_code = v_code);
  end loop;

  select * into v_settings from public.app_settings where id = 1;
  v_ref_code := upper(trim(coalesce(new.raw_user_meta_data->>'referral_code', '')));
  if v_ref_code <> '' and coalesce(v_settings.referral_enabled, false) then
    select p.id into v_referrer from public.profiles p where p.referral_code = v_ref_code and p.status = 'active';
    if v_referrer is not null then
      select count(*) into v_count from public.referrals where referrer_id = v_referrer;
      if v_count >= v_settings.max_referrals_per_user then v_referrer := null; end if;
    end if;
  end if;

  insert into public.profiles (id, display_name, referral_code, referred_by, locale)
  values (new.id, v_name, v_code, v_referrer,
          case when new.raw_user_meta_data->>'locale' = 'ar' then 'ar' else 'en' end);
  insert into public.wallets (user_id) values (new.id);
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  if v_referrer is not null then
    insert into public.referrals (referrer_id, referee_id) values (v_referrer, new.id);
  end if;
  insert into public.audit_logs (actor_id, action, target_type, target_id, details)
  values (new.id, 'user.signup', 'user', new.id::text, jsonb_build_object('referred', v_referrer is not null));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ USER ACTIONS ============
create or replace function public.start_mining()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_s record; v_settings record; v_ends timestamptz;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED'); end if;
  if public._is_suspended(v_uid) then return jsonb_build_object('ok', false, 'error', 'ACCOUNT_SUSPENDED'); end if;
  select * into v_s from public.mining_sessions where user_id = v_uid and status = 'active';
  if found then return jsonb_build_object('ok', true, 'started', false, 'ends_at', v_s.ends_at); end if;
  if not public._rate_limit('mining_start') then return jsonb_build_object('ok', false, 'error', 'RATE_LIMITED'); end if;
  select * into v_settings from public.app_settings where id = 1;
  if not v_settings.mining_enabled then return jsonb_build_object('ok', false, 'error', 'MINING_PAUSED'); end if;
  v_ends := now() + make_interval(mins => v_settings.claim_interval_minutes);
  insert into public.mining_sessions (user_id, started_at, ends_at) values (v_uid, now(), v_ends);
  perform public._audit('mining.start', 'user', v_uid::text, '{}'::jsonb);
  return jsonb_build_object('ok', true, 'started', true, 'ends_at', v_ends);
exception when unique_violation then
  select ends_at into v_ends from public.mining_sessions where user_id = v_uid and status = 'active';
  return jsonb_build_object('ok', true, 'started', false, 'ends_at', v_ends);
end $$;

create or replace function public.claim_mining_reward(p_idempotency_key text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_key text; v_existing record; v_session record; v_settings record;
  v_reward numeric; v_balance numeric; v_ref record; v_commission numeric; v_next timestamptz;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED'); end if;
  if p_idempotency_key is null or char_length(p_idempotency_key) not between 8 and 100 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_REQUEST');
  end if;
  v_key := 'mining:' || v_uid::text || ':' || p_idempotency_key;

  -- Idempotent replay: same key returns the original result without crediting again.
  select amount, balance_after into v_existing from public.reward_ledger where idempotency_key = v_key;
  if found then
    select ends_at into v_next from public.mining_sessions where user_id = v_uid and status = 'active';
    return jsonb_build_object('ok', true, 'replayed', true, 'reward', v_existing.amount, 'balance', v_existing.balance_after, 'next_claim_at', v_next);
  end if;

  if public._is_suspended(v_uid) then return jsonb_build_object('ok', false, 'error', 'ACCOUNT_SUSPENDED'); end if;
  if not public._rate_limit('mining_claim') then return jsonb_build_object('ok', false, 'error', 'RATE_LIMITED'); end if;
  select * into v_settings from public.app_settings where id = 1;
  if not v_settings.mining_enabled then return jsonb_build_object('ok', false, 'error', 'MINING_PAUSED'); end if;

  select * into v_session from public.mining_sessions where user_id = v_uid and status = 'active' for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'NO_ACTIVE_SESSION'); end if;
  if v_session.ends_at > now() then
    return jsonb_build_object('ok', false, 'error', 'SESSION_NOT_READY', 'next_claim_at', v_session.ends_at);
  end if;

  v_reward := v_settings.reward_per_claim;
  update public.mining_sessions set status = 'claimed', claimed_at = now(), reward = v_reward where id = v_session.id;
  v_balance := public._apply_ledger(v_uid, v_reward, 'mining', v_session.id, v_key, 'Mining session reward');

  select * into v_ref from public.referrals where referee_id = v_uid for update;
  if found and v_settings.referral_enabled and not public._is_suspended(v_ref.referrer_id) then
    if not v_ref.bonus_paid and v_settings.referral_signup_bonus > 0 then
      perform public._apply_ledger(v_ref.referrer_id, v_settings.referral_signup_bonus, 'referral_bonus', v_ref.id, 'refbonus:' || v_ref.id::text, 'Referral activation bonus');
      update public.referrals set bonus_paid = true where id = v_ref.id;
    end if;
    v_commission := round(v_reward * v_settings.referral_commission_pct / 100, 8);
    if v_commission > 0 then
      perform public._apply_ledger(v_ref.referrer_id, v_commission, 'referral_commission', v_session.id, 'refcomm:' || v_session.id::text, 'Referral commission');
      update public.referrals set total_commission = total_commission + v_commission where id = v_ref.id;
    end if;
  end if;

  v_next := now() + make_interval(mins => v_settings.claim_interval_minutes);
  insert into public.mining_sessions (user_id, started_at, ends_at) values (v_uid, now(), v_next);
  perform public._audit('mining.claim', 'mining_session', v_session.id::text, jsonb_build_object('reward', v_reward));
  return jsonb_build_object('ok', true, 'replayed', false, 'reward', v_reward, 'balance', v_balance, 'next_claim_at', v_next);
exception when unique_violation then
  return jsonb_build_object('ok', false, 'error', 'DUPLICATE_CLAIM');
end $$;

create or replace function public.claim_airdrop(p_airdrop_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_a record; v_balance numeric;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED'); end if;
  if public._is_suspended(v_uid) then return jsonb_build_object('ok', false, 'error', 'ACCOUNT_SUSPENDED'); end if;
  if not public._rate_limit('airdrop_claim') then return jsonb_build_object('ok', false, 'error', 'RATE_LIMITED'); end if;
  select * into v_a from public.airdrops where id = p_airdrop_id for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'NOT_FOUND'); end if;
  if not v_a.is_active or now() < v_a.starts_at or (v_a.ends_at is not null and now() > v_a.ends_at) then
    return jsonb_build_object('ok', false, 'error', 'AIRDROP_INACTIVE');
  end if;
  if v_a.max_claims is not null and v_a.claims_count >= v_a.max_claims then
    return jsonb_build_object('ok', false, 'error', 'AIRDROP_EXHAUSTED');
  end if;
  if exists (select 1 from public.airdrop_claims where airdrop_id = v_a.id and user_id = v_uid) then
    return jsonb_build_object('ok', false, 'error', 'ALREADY_CLAIMED');
  end if;
  insert into public.airdrop_claims (airdrop_id, user_id, amount) values (v_a.id, v_uid, v_a.amount);
  update public.airdrops set claims_count = claims_count + 1 where id = v_a.id;
  v_balance := public._apply_ledger(v_uid, v_a.amount, 'airdrop', v_a.id, 'airdrop:' || v_a.id::text || ':' || v_uid::text, 'Airdrop: ' || v_a.title);
  perform public._audit('airdrop.claim', 'airdrop', v_a.id::text, jsonb_build_object('amount', v_a.amount));
  return jsonb_build_object('ok', true, 'amount', v_a.amount, 'balance', v_balance);
exception when unique_violation then
  return jsonb_build_object('ok', false, 'error', 'ALREADY_CLAIMED');
end $$;

create or replace function public.request_withdrawal(p_amount numeric, p_wallet_address text, p_network text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_settings record; v_balance numeric; v_id uuid; v_network text;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED'); end if;
  if public._is_suspended(v_uid) then return jsonb_build_object('ok', false, 'error', 'ACCOUNT_SUSPENDED'); end if;
  if not public._rate_limit('withdrawal_request') then return jsonb_build_object('ok', false, 'error', 'RATE_LIMITED'); end if;
  select * into v_settings from public.app_settings where id = 1;
  if not v_settings.withdrawals_enabled then return jsonb_build_object('ok', false, 'error', 'WITHDRAWALS_DISABLED'); end if;
  if p_amount is null or p_amount <= 0 or p_amount > 1000000000000 or scale(p_amount) > 8 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_AMOUNT');
  end if;
  if p_amount < v_settings.min_withdrawal then return jsonb_build_object('ok', false, 'error', 'BELOW_MINIMUM'); end if;
  if p_wallet_address is null or p_wallet_address !~ '^0x[a-fA-F0-9]{40}$' then
    return jsonb_build_object('ok', false, 'error', 'INVALID_ADDRESS');
  end if;
  v_network := coalesce(nullif(p_network, ''), 'bsc');
  if v_network not in ('bsc', 'ethereum', 'polygon') then return jsonb_build_object('ok', false, 'error', 'INVALID_NETWORK'); end if;
  if exists (select 1 from public.withdrawal_requests where user_id = v_uid and status = 'pending') then
    return jsonb_build_object('ok', false, 'error', 'PENDING_EXISTS');
  end if;
  select balance into v_balance from public.wallets where user_id = v_uid for update;
  if v_balance is null or v_balance < p_amount then return jsonb_build_object('ok', false, 'error', 'INSUFFICIENT_BALANCE'); end if;

  insert into public.withdrawal_requests (user_id, amount, wallet_address, network)
  values (v_uid, p_amount, p_wallet_address, v_network) returning id into v_id;
  update public.wallets set locked = locked + p_amount where user_id = v_uid;
  v_balance := public._apply_ledger(v_uid, -p_amount, 'withdrawal_hold', v_id, 'wd:' || v_id::text, 'Withdrawal request (held)');
  perform public._audit('withdrawal.request', 'withdrawal', v_id::text, jsonb_build_object('amount', p_amount, 'network', v_network));
  return jsonb_build_object('ok', true, 'id', v_id, 'balance', v_balance);
exception when unique_violation then
  return jsonb_build_object('ok', false, 'error', 'PENDING_EXISTS');
end $$;

create or replace function public.cancel_withdrawal(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_w record; v_balance numeric;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED'); end if;
  if not public._rate_limit('withdrawal_cancel') then return jsonb_build_object('ok', false, 'error', 'RATE_LIMITED'); end if;
  select * into v_w from public.withdrawal_requests where id = p_id and user_id = v_uid for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'NOT_FOUND'); end if;
  if v_w.status <> 'pending' then return jsonb_build_object('ok', false, 'error', 'NOT_PENDING'); end if;
  update public.withdrawal_requests set status = 'cancelled', reviewed_at = now() where id = v_w.id;
  update public.wallets set locked = greatest(locked - v_w.amount, 0) where user_id = v_uid;
  v_balance := public._apply_ledger(v_uid, v_w.amount, 'withdrawal_refund', v_w.id, 'wdref:' || v_w.id::text, 'Withdrawal cancelled (refund)');
  perform public._audit('withdrawal.cancel', 'withdrawal', v_w.id::text, jsonb_build_object('amount', v_w.amount));
  return jsonb_build_object('ok', true, 'balance', v_balance);
end $$;

create or replace function public.get_leaderboard(p_limit int default 50)
returns table (rank bigint, display_name text, total_earned numeric, total_mined numeric, is_me boolean)
language sql stable security definer set search_path = public as $$
  select row_number() over (order by w.total_earned desc, p.created_at asc) as rank,
         p.display_name, w.total_earned, w.total_mined, (p.id = auth.uid()) as is_me
  from public.wallets w join public.profiles p on p.id = w.user_id
  where p.status = 'active' and w.total_earned > 0
  order by w.total_earned desc, p.created_at asc
  limit least(greatest(coalesce(p_limit, 50), 1), 100)
$$;

create or replace function public.get_my_rank()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('rank', r.rank, 'total', (select count(*) from public.profiles where status = 'active'))
  from (
    select p.id, row_number() over (order by w.total_earned desc, p.created_at asc) as rank
    from public.wallets w join public.profiles p on p.id = w.user_id where p.status = 'active'
  ) r where r.id = auth.uid()
$$;

create or replace function public.get_my_referrals()
returns table (display_name text, joined_at timestamptz, activated boolean, commission numeric)
language sql stable security definer set search_path = public as $$
  select p.display_name, r.created_at, r.bonus_paid, r.total_commission
  from public.referrals r join public.profiles p on p.id = r.referee_id
  where r.referrer_id = auth.uid()
  order by r.created_at desc
  limit 500
$$;

create or replace function public.get_public_stats()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'miners', (select count(*) from public.profiles where status = 'active'),
    'total_distributed', (select coalesce(sum(total_earned), 0) from public.wallets),
    'claims', (select count(*) from public.mining_sessions where status = 'claimed')
  )
$$;

-- ============ ADMIN ACTIONS ============
create or replace function public.admin_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_admin();
  return jsonb_build_object(
    'users', (select count(*) from public.profiles),
    'suspended', (select count(*) from public.profiles where status = 'suspended'),
    'new_users_24h', (select count(*) from public.profiles where created_at > now() - interval '24 hours'),
    'active_miners_24h', (select count(distinct user_id) from public.mining_sessions where claimed_at > now() - interval '24 hours'),
    'claims_24h', (select count(*) from public.mining_sessions where claimed_at > now() - interval '24 hours'),
    'circulating', (select coalesce(sum(balance), 0) from public.wallets),
    'locked', (select coalesce(sum(locked), 0) from public.wallets),
    'total_mined', (select coalesce(sum(total_mined), 0) from public.wallets),
    'total_referral', (select coalesce(sum(total_referral), 0) from public.wallets),
    'total_airdrop', (select coalesce(sum(total_airdrop), 0) from public.wallets),
    'pending_withdrawals', (select count(*) from public.withdrawal_requests where status = 'pending'),
    'pending_withdrawal_amount', (select coalesce(sum(amount), 0) from public.withdrawal_requests where status = 'pending'),
    'referrals', (select count(*) from public.referrals)
  );
end $$;

create or replace function public.admin_list_users(p_search text default null, p_limit int default 50, p_offset int default 0)
returns table (id uuid, email text, display_name text, status public.account_status, suspended_reason text,
               balance numeric, total_earned numeric, created_at timestamptz, is_admin boolean,
               referral_count bigint, last_claim_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_admin();
  return query
  select p.id, u.email::text, p.display_name, p.status, p.suspended_reason,
         w.balance, w.total_earned, p.created_at,
         exists (select 1 from public.user_roles ur where ur.user_id = p.id and ur.role = 'admin'),
         (select count(*) from public.referrals r where r.referrer_id = p.id),
         (select max(ms.claimed_at) from public.mining_sessions ms where ms.user_id = p.id)
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.wallets w on w.user_id = p.id
  where p_search is null or p_search = ''
     or p.display_name ilike '%' || p_search || '%'
     or u.email ilike '%' || p_search || '%'
     or p.referral_code ilike '%' || p_search || '%'
  order by p.created_at desc
  limit least(greatest(coalesce(p_limit, 50), 1), 200) offset greatest(coalesce(p_offset, 0), 0);
end $$;

create or replace function public.admin_set_user_status(p_user uuid, p_status public.account_status, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  if p_user = auth.uid() then raise exception 'CANNOT_MODIFY_SELF'; end if;
  update public.profiles set status = p_status,
    suspended_reason = case when p_status = 'suspended' then left(p_reason, 500) else null end
  where id = p_user;
  if not found then raise exception 'NOT_FOUND'; end if;
  perform public._audit(case when p_status = 'suspended' then 'admin.user.suspend' else 'admin.user.reactivate' end,
                        'user', p_user::text, jsonb_build_object('reason', p_reason));
end $$;

create or replace function public.admin_set_admin(p_user uuid, p_grant boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  if p_user = auth.uid() then raise exception 'CANNOT_MODIFY_SELF'; end if;
  if p_grant then
    insert into public.user_roles (user_id, role) values (p_user, 'admin') on conflict do nothing;
  else
    delete from public.user_roles where user_id = p_user and role = 'admin';
  end if;
  perform public._audit(case when p_grant then 'admin.role.grant' else 'admin.role.revoke' end, 'user', p_user::text, '{}'::jsonb);
end $$;

create or replace function public.admin_update_settings(p jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v_old jsonb; v_new jsonb;
begin
  perform public._require_admin();
  select to_jsonb(s) into v_old from public.app_settings s where id = 1;
  update public.app_settings set
    mining_enabled = coalesce((p->>'mining_enabled')::boolean, mining_enabled),
    claim_interval_minutes = coalesce((p->>'claim_interval_minutes')::int, claim_interval_minutes),
    reward_per_claim = coalesce((p->>'reward_per_claim')::numeric, reward_per_claim),
    referral_enabled = coalesce((p->>'referral_enabled')::boolean, referral_enabled),
    referral_signup_bonus = coalesce((p->>'referral_signup_bonus')::numeric, referral_signup_bonus),
    referral_commission_pct = coalesce((p->>'referral_commission_pct')::numeric, referral_commission_pct),
    max_referrals_per_user = coalesce((p->>'max_referrals_per_user')::int, max_referrals_per_user),
    withdrawals_enabled = coalesce((p->>'withdrawals_enabled')::boolean, withdrawals_enabled),
    min_withdrawal = coalesce((p->>'min_withdrawal')::numeric, min_withdrawal),
    rate_limit_per_minute = coalesce((p->>'rate_limit_per_minute')::int, rate_limit_per_minute),
    updated_at = now(),
    updated_by = auth.uid()
  where id = 1;
  select to_jsonb(s) into v_new from public.app_settings s where id = 1;
  perform public._audit('admin.settings.update', 'app_settings', '1', jsonb_build_object('before', v_old, 'after', v_new));
end $$;

create or replace function public.admin_review_withdrawal(p_id uuid, p_approve boolean, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_w record;
begin
  perform public._require_admin();
  select * into v_w from public.withdrawal_requests where id = p_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_w.status <> 'pending' then raise exception 'NOT_PENDING'; end if;
  update public.withdrawal_requests set
    status = case when p_approve then 'approved'::public.withdrawal_status else 'rejected'::public.withdrawal_status end,
    admin_note = left(p_note, 500), reviewed_by = auth.uid(), reviewed_at = now()
  where id = v_w.id;
  update public.wallets set locked = greatest(locked - v_w.amount, 0) where user_id = v_w.user_id;
  if not p_approve then
    perform public._apply_ledger(v_w.user_id, v_w.amount, 'withdrawal_refund', v_w.id, 'wdref:' || v_w.id::text, 'Withdrawal rejected (refund)');
  end if;
  perform public._audit(case when p_approve then 'admin.withdrawal.approve' else 'admin.withdrawal.reject' end,
                        'withdrawal', v_w.id::text, jsonb_build_object('amount', v_w.amount, 'user_id', v_w.user_id, 'note', p_note));
end $$;

create or replace function public.admin_save_airdrop(
  p_id uuid, p_title text, p_title_ar text, p_description text, p_description_ar text,
  p_amount numeric, p_starts_at timestamptz, p_ends_at timestamptz, p_max_claims int, p_is_active boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  perform public._require_admin();
  if p_ends_at is not null and p_ends_at <= coalesce(p_starts_at, now()) then raise exception 'INVALID_WINDOW'; end if;
  if p_id is null then
    insert into public.airdrops (title, title_ar, description, description_ar, amount, starts_at, ends_at, max_claims, is_active, created_by)
    values (p_title, nullif(p_title_ar, ''), nullif(p_description, ''), nullif(p_description_ar, ''), p_amount,
            coalesce(p_starts_at, now()), p_ends_at, p_max_claims, coalesce(p_is_active, true), auth.uid())
    returning id into v_id;
    perform public._audit('admin.airdrop.create', 'airdrop', v_id::text, jsonb_build_object('title', p_title, 'amount', p_amount));
  else
    update public.airdrops set title = p_title, title_ar = nullif(p_title_ar, ''), description = nullif(p_description, ''),
      description_ar = nullif(p_description_ar, ''), amount = p_amount, starts_at = coalesce(p_starts_at, starts_at),
      ends_at = p_ends_at, max_claims = p_max_claims, is_active = coalesce(p_is_active, is_active)
    where id = p_id returning id into v_id;
    if v_id is null then raise exception 'NOT_FOUND'; end if;
    perform public._audit('admin.airdrop.update', 'airdrop', v_id::text, jsonb_build_object('title', p_title, 'amount', p_amount, 'active', p_is_active));
  end if;
  return v_id;
end $$;

-- ============ POLICIES ============
create policy "Users read own profile; admins read all" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Users update own profile" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "Users read own roles; admins read all" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "Anyone can read settings" on public.app_settings for select to anon, authenticated using (true);

create policy "Users read own wallet; admins read all" on public.wallets for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "Users read own ledger; admins read all" on public.reward_ledger for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "Users read own sessions; admins read all" on public.mining_sessions for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "Participants read referrals; admins read all" on public.referrals for select to authenticated
  using (referrer_id = auth.uid() or referee_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "Users read own withdrawals; admins read all" on public.withdrawal_requests for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "Users read active airdrops; admins read all" on public.airdrops for select to authenticated
  using (is_active or public.has_role(auth.uid(), 'admin'));

create policy "Users read own airdrop claims; admins read all" on public.airdrop_claims for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "Admins read audit logs" on public.audit_logs for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- ============ FUNCTION PRIVILEGES ============
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on all functions in schema public to service_role;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.start_mining() to authenticated;
grant execute on function public.claim_mining_reward(text) to authenticated;
grant execute on function public.claim_airdrop(uuid) to authenticated;
grant execute on function public.request_withdrawal(numeric, text, text) to authenticated;
grant execute on function public.cancel_withdrawal(uuid) to authenticated;
grant execute on function public.get_leaderboard(int) to authenticated;
grant execute on function public.get_my_rank() to authenticated;
grant execute on function public.get_my_referrals() to authenticated;
grant execute on function public.get_public_stats() to anon, authenticated;
grant execute on function public.admin_stats() to authenticated;
grant execute on function public.admin_list_users(text, int, int) to authenticated;
grant execute on function public.admin_set_user_status(uuid, public.account_status, text) to authenticated;
grant execute on function public.admin_set_admin(uuid, boolean) to authenticated;
grant execute on function public.admin_update_settings(jsonb) to authenticated;
grant execute on function public.admin_review_withdrawal(uuid, boolean, text) to authenticated;
grant execute on function public.admin_save_airdrop(uuid, text, text, text, text, numeric, timestamptz, timestamptz, int, boolean) to authenticated;

-- ============ SEED ============
insert into public.app_settings (id) values (1);
insert into public.airdrops (title, title_ar, description, description_ar, amount, starts_at, ends_at, max_claims, is_active)
values ('Genesis Airdrop', 'إيردروب التأسيس',
        'A welcome allocation for early JoCoin community members.',
        'مكافأة ترحيبية لأعضاء مجتمع جوكوين الأوائل.',
        100, now(), now() + interval '90 days', 10000, true);
