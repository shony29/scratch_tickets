-- =====================================================================
-- Foil Lounge — online database
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- It is safe to run again later (it updates things in place).
-- =====================================================================

-- ---------- Ticket catalogue (which tickets exist and what they cost) ----------
create table if not exists public.themes (
  id    text primary key,
  price int  not null
);
insert into public.themes (id, price) values
  ('penny',2),('plinko',2),('garden',2),('soccer',2),('bee',2),
  ('sugar',3),('clover',3),('fruit',3),('arcade',3),('pirate',3),
  ('cosmic',5),('deep',5),('dragon',5),('snow',5),('jungle',5),
  ('pharaoh',10),('vegas',10),('blossom',10),('west',10),('aurora',10),
  ('prix',15),('volcano',15),('mirror',15),('robo',15),('bowling',15),
  ('diamond',20),('crown',20),('thunder',20),('sevens',20),('nova',20)
on conflict (id) do update set price = excluded.price;

-- ---------- Players ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  username    text not null check (username ~ '^[A-Za-z0-9_]{3,16}$'),
  balance     int  not null default 50 check (balance >= 0),
  day         date not null default current_date,
  chest_day   date,
  played      int    not null default 0,
  spent       bigint not null default 0,
  won         bigint not null default 0,
  wins        int    not null default 0,
  best        int    not null default 0,
  best_id     text,
  chests      int    not null default 0,
  chest_total int    not null default 0,
  created_at  timestamptz not null default now()
);
create unique index if not exists profiles_username_lower on public.profiles (lower(username));

-- ---------- Tickets bought (the server decides each prize) ----------
create table if not exists public.tickets (
  id         bigserial primary key,
  user_id    uuid not null references public.profiles on delete cascade,
  theme      text not null references public.themes,
  price      int  not null,
  total      int  not null,
  claimed    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists tickets_user on public.tickets (user_id, created_at desc);

-- ---------- Friends ----------
create table if not exists public.friends (
  user_id    uuid not null references public.profiles on delete cascade,
  friend_id  uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);
create table if not exists public.friend_requests (
  from_id    uuid not null references public.profiles on delete cascade,
  to_id      uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (from_id, to_id)
);

-- ---------- Activity (big wins, gifts, invites) ----------
create table if not exists public.events (
  id         bigserial primary key,
  user_id    uuid not null references public.profiles on delete cascade,
  target     uuid references public.profiles on delete cascade,
  kind       text not null,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists events_recent on public.events (created_at desc);

-- ---------- Live rooms ----------
create table if not exists public.rooms (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  host       uuid not null references public.profiles on delete cascade,
  theme      text not null references public.themes,
  price      int  not null,
  status     text not null default 'open',   -- open | playing | done | cancelled
  result     jsonb,
  version    int  not null default 0,
  created_at timestamptz not null default now(),
  started_at timestamptz
);
create table if not exists public.room_players (
  room_id   uuid not null references public.rooms on delete cascade,
  user_id   uuid not null references public.profiles on delete cascade,
  username  text not null,
  total     int,
  finished  boolean not null default false,
  payout    int not null default 0,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

-- Upgrades for persistent rooms and tournaments (safe to run on an existing database)
alter table public.rooms alter column status set default 'lobby';
alter table public.rooms add column if not exists mode  text not null default 'single';
alter table public.rooms add column if not exists tier  text not null default 'low';
alter table public.rooms add column if not exists round int  not null default 0;
alter table public.rooms add column if not exists themes text[];
alter table public.rooms add column if not exists entry int  not null default 0;
alter table public.rooms add column if not exists pot   int  not null default 0;
alter table public.rooms add column if not exists is_public boolean not null default false;
alter table public.rooms add column if not exists banned uuid[] not null default '{}';
alter table public.room_players add column if not exists totals   int[];
alter table public.room_players add column if not exists progress int not null default 0;
alter table public.room_players add column if not exists in_round boolean not null default false;
-- Rooms from the first version are closed. Anyone mid-game gets their entry back.
update public.profiles p set balance = balance + r.price from public.rooms r join public.room_players rp on rp.room_id = r.id
  where r.themes is null and r.status in ('open', 'playing') and p.id = rp.user_id;
update public.rooms set status = 'closed' where themes is null and status <> 'closed';
update public.rooms set themes = array[theme], entry = price where themes is null;

-- ---------- Room chat ----------
create table if not exists public.room_messages (
  id         bigserial primary key,
  room_id    uuid not null references public.rooms on delete cascade,
  user_id    uuid references public.profiles on delete set null,
  username   text not null default '',
  body       text not null,
  kind       text not null default 'chat',   -- chat | system
  created_at timestamptz not null default now()
);
create index if not exists room_messages_room on public.room_messages (room_id, id);

-- =====================================================================
-- Security: players can read only what they should, and can change
-- nothing directly. Every change goes through the functions below.
-- =====================================================================
alter table public.themes          enable row level security;
alter table public.profiles        enable row level security;
alter table public.tickets         enable row level security;
alter table public.friends         enable row level security;
alter table public.friend_requests enable row level security;
alter table public.events          enable row level security;
alter table public.rooms           enable row level security;
alter table public.room_players    enable row level security;
alter table public.room_messages   enable row level security;

create or replace function public.is_room_member(p_room uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from room_players where room_id = p_room and user_id = auth.uid());
$$;

drop policy if exists themes_read   on public.themes;
drop policy if exists profiles_read on public.profiles;
drop policy if exists tickets_read  on public.tickets;
drop policy if exists friends_read  on public.friends;
drop policy if exists requests_read on public.friend_requests;
drop policy if exists events_read   on public.events;
drop policy if exists rooms_read    on public.rooms;
create policy themes_read   on public.themes          for select using (true);
create policy profiles_read on public.profiles        for select to authenticated using (true);
create policy tickets_read  on public.tickets         for select to authenticated using (user_id = auth.uid());
create policy friends_read  on public.friends         for select to authenticated using (user_id = auth.uid());
create policy requests_read on public.friend_requests for select to authenticated using (from_id = auth.uid() or to_id = auth.uid());
create policy events_read   on public.events          for select to authenticated using (
  user_id = auth.uid() or target = auth.uid()
  or (target is null and exists (select 1 from public.friends f where f.user_id = auth.uid() and f.friend_id = events.user_id))
);
create policy rooms_read    on public.rooms           for select to authenticated using (public.is_room_member(id));
drop policy if exists messages_read on public.room_messages;
create policy messages_read on public.room_messages   for select to authenticated using (public.is_room_member(room_id));
-- room_players has no read policy on purpose: use room_state() so nobody sees other scores early.

-- ---------- New account → profile ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_name text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), 'player_' || substr(replace(new.id::text, '-', ''), 1, 8));
begin
  if v_name !~ '^[A-Za-z0-9_]{3,16}$' then
    v_name := 'player_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  if exists (select 1 from profiles where lower(username) = lower(v_name)) then
    v_name := left(v_name, 11) || '_' || substr(replace(new.id::text, '-', ''), 1, 4);
  end if;
  insert into profiles (id, username) values (new.id, v_name) on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Helpers
-- =====================================================================
create or replace function public._uid() returns uuid
language plpgsql stable as $$
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  return auth.uid();
end $$;

-- The player's local date, kept within a day of the server's date.
create or replace function public._day(p_day date) returns date
language sql immutable as $$
  select case when p_day is null or p_day < current_date - 1 or p_day > current_date + 1 then current_date else p_day end;
$$;

-- New day: anyone under 50 chips goes back up to 50.
create or replace function public._daily(p_uid uuid, p_day date) returns void
language sql security definer set search_path = public as $$
  update profiles set day = public._day(p_day), balance = greatest(balance, 50)
  where id = p_uid and day < public._day(p_day);
$$;

-- Same odds as the original single-player game (about 80% paid back on average).
create or replace function public._draw_total(p_price int) returns int
language plpgsql volatile as $$
declare
  r float8 := random();
  acc float8 := 0;
  m int; p float8;
  pay int[] := array[200, 50, 20, 10, 5, 3, 2, 1];
  prob float8[] := array[.0002, .0008, .003, .01, .025, .05, .11, .21];
begin
  for i in 1 .. array_length(pay, 1) loop
    acc := acc + prob[i];
    if r < acc then return pay[i] * p_price; end if;
  end loop;
  return 0;
end $$;

create or replace function public._me(p_uid uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(p) || jsonb_build_object(
    'open_ticket', (select jsonb_build_object('id', t.id, 'theme', t.theme, 'price', t.price, 'total', t.total)
                    from tickets t where t.user_id = p_uid and not t.claimed order by t.id desc limit 1),
    'friend_count', (select count(*) from friends where user_id = p_uid),
    'requests', (select count(*) from friend_requests where to_id = p_uid))
  from profiles p where p.id = p_uid;
$$;

-- =====================================================================
-- Player functions (called from the game)
-- =====================================================================
create or replace function public.username_available(p_name text) returns boolean
language sql stable security definer set search_path = public as $$
  select p_name ~ '^[A-Za-z0-9_]{3,16}$' and not exists (select 1 from profiles where lower(username) = lower(p_name));
$$;

create or replace function public.me(p_day date) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid();
begin
  -- accounts made before this file was run still get a profile
  insert into profiles (id, username) values (v_uid, 'player_' || substr(replace(v_uid::text, '-', ''), 1, 8)) on conflict (id) do nothing;
  perform public._daily(v_uid, p_day);
  return public._me(v_uid);
end $$;

create or replace function public.buy_ticket(p_theme text, p_day date) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public._uid();
  v_price int; v_total int; v_id bigint; v_open record;
begin
  perform public._daily(v_uid, p_day);
  select id, theme, price, total into v_open from tickets where user_id = v_uid and not claimed order by id desc limit 1;
  if found then
    return jsonb_build_object('resumed', true, 'ticket', jsonb_build_object('id', v_open.id, 'theme', v_open.theme, 'price', v_open.price, 'total', v_open.total), 'me', public._me(v_uid));
  end if;
  select price into v_price from themes where id = p_theme;
  if v_price is null then raise exception 'unknown_ticket'; end if;
  update profiles set balance = balance - v_price, spent = spent + v_price, played = played + 1
    where id = v_uid and balance >= v_price;
  if not found then raise exception 'not_enough_chips'; end if;
  v_total := public._draw_total(v_price);
  insert into tickets (user_id, theme, price, total) values (v_uid, p_theme, v_price, v_total) returning id into v_id;
  return jsonb_build_object('resumed', false, 'ticket', jsonb_build_object('id', v_id, 'theme', p_theme, 'price', v_price, 'total', v_total), 'me', public._me(v_uid));
end $$;

create or replace function public.claim_ticket(p_id bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public._uid();
  t record; v_name text;
begin
  update tickets set claimed = true where id = p_id and user_id = v_uid and not claimed
    returning theme, price, total into t;
  if found then
    update profiles set
      balance = balance + t.total,
      won     = won + t.total,
      wins    = wins + (case when t.total > 0 then 1 else 0 end),
      best_id = case when t.total > best then t.theme else best_id end,
      best    = greatest(best, t.total)
    where id = v_uid returning username into v_name;
    if t.total >= 10 * t.price then
      insert into events (user_id, kind, data)
      values (v_uid, 'big_win', jsonb_build_object('username', v_name, 'theme', t.theme, 'amount', t.total, 'price', t.price));
    end if;
  end if;
  return public._me(v_uid);
end $$;

create or replace function public.open_chest(p_day date) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := public._uid();
  v_day date := public._day(p_day);
  v_amount int := 3 + floor(97 * power(random(), 2.1))::int;
begin
  perform public._daily(v_uid, p_day);
  update profiles set chest_day = v_day, balance = balance + v_amount, chests = chests + 1, chest_total = chest_total + v_amount
    where id = v_uid and (chest_day is null or chest_day < v_day);
  if not found then raise exception 'chest_used'; end if;
  return jsonb_build_object('amount', v_amount, 'me', public._me(v_uid));
end $$;

create or replace function public.leaderboard(p_kind text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := public._uid(); v_top jsonb; v_rank int; v_val bigint;
begin
  if p_kind not in ('chips', 'best', 'won') then p_kind := 'chips'; end if;
  with s as (
    select id, username, case p_kind when 'chips' then balance::bigint when 'best' then best::bigint else won end as val, created_at
    from profiles
  ), r as (select *, rank() over (order by val desc) as rk from s)
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'username', username, 'value', val, 'rank', rk) order by rk, created_at) filter (where rk <= 50), '[]'::jsonb),
         max(rk) filter (where id = v_uid), max(val) filter (where id = v_uid)
    into v_top, v_rank, v_val from r;
  return jsonb_build_object('top', v_top, 'my_rank', v_rank, 'my_value', v_val);
end $$;

-- ---------- Friends ----------
create or replace function public.social_state() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'friends', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'username', p.username, 'balance', p.balance, 'best', p.best) order by lower(p.username))
                from friends f join profiles p on p.id = f.friend_id where f.user_id = public._uid()), '[]'::jsonb),
    'incoming', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'username', p.username) order by r.created_at desc)
                from friend_requests r join profiles p on p.id = r.from_id where r.to_id = public._uid()), '[]'::jsonb),
    'outgoing', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'username', p.username) order by r.created_at desc)
                from friend_requests r join profiles p on p.id = r.to_id where r.from_id = public._uid()), '[]'::jsonb));
$$;

create or replace function public._make_friends(a uuid, b uuid) returns void
language sql security definer set search_path = public as $$
  delete from friend_requests where (from_id = a and to_id = b) or (from_id = b and to_id = a);
  insert into friends (user_id, friend_id) values (a, b), (b, a) on conflict do nothing;
$$;

create or replace function public.request_friend(p_username text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid(); v_to uuid; v_me text;
begin
  select id into v_to from profiles where lower(username) = lower(trim(p_username));
  if v_to is null then raise exception 'no_such_player'; end if;
  if v_to = v_uid then raise exception 'thats_you'; end if;
  if exists (select 1 from friends where user_id = v_uid and friend_id = v_to) then raise exception 'already_friends'; end if;
  select username into v_me from profiles where id = v_uid;
  if exists (select 1 from friend_requests where from_id = v_to and to_id = v_uid) then
    perform public._make_friends(v_uid, v_to);
    insert into events (user_id, target, kind, data) values (v_uid, v_to, 'friend_accept', jsonb_build_object('username', v_me));
    return jsonb_build_object('status', 'friends');
  end if;
  insert into friend_requests (from_id, to_id) values (v_uid, v_to) on conflict do nothing;
  insert into events (user_id, target, kind, data) values (v_uid, v_to, 'friend_request', jsonb_build_object('username', v_me));
  return jsonb_build_object('status', 'requested');
end $$;

create or replace function public.respond_friend(p_from uuid, p_accept boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid(); v_me text;
begin
  if not exists (select 1 from friend_requests where from_id = p_from and to_id = v_uid) then raise exception 'no_request'; end if;
  if p_accept then
    perform public._make_friends(v_uid, p_from);
    select username into v_me from profiles where id = v_uid;
    insert into events (user_id, target, kind, data) values (v_uid, p_from, 'friend_accept', jsonb_build_object('username', v_me));
  else
    delete from friend_requests where from_id = p_from and to_id = v_uid;
  end if;
  return public.social_state();
end $$;

create or replace function public.remove_friend(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid();
begin
  delete from friends where (user_id = v_uid and friend_id = p_id) or (user_id = p_id and friend_id = v_uid);
  delete from friend_requests where (from_id = v_uid and to_id = p_id) or (from_id = p_id and to_id = v_uid);
  return public.social_state();
end $$;

create or replace function public.send_chips(p_to uuid, p_amount int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid(); v_me text; v_to_name text;
begin
  if p_amount is null or p_amount < 1 or p_amount > 1000 then raise exception 'bad_amount'; end if;
  if not exists (select 1 from friends where user_id = v_uid and friend_id = p_to) then raise exception 'not_friends'; end if;
  update profiles set balance = balance - p_amount where id = v_uid and balance >= p_amount returning username into v_me;
  if not found then raise exception 'not_enough_chips'; end if;
  update profiles set balance = balance + p_amount where id = p_to returning username into v_to_name;
  insert into events (user_id, target, kind, data) values (v_uid, p_to, 'gift', jsonb_build_object('username', v_me, 'to', v_to_name, 'amount', p_amount));
  return public._me(v_uid);
end $$;

create or replace function public.feed() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(x order by x.created_at desc), '[]'::jsonb) from (
    select e.id, e.kind, e.data, e.created_at, e.user_id = public._uid() as mine, e.target = public._uid() as to_me
    from events e
    where e.kind in ('big_win', 'room_win', 'gift')
      and (e.user_id = public._uid() or e.target = public._uid()
           or (e.target is null and exists (select 1 from friends f where f.user_id = public._uid() and f.friend_id = e.user_id)))
    order by e.created_at desc limit 40) x;
$$;

-- ---------- Live rooms ----------
-- A room stays open until everyone leaves. Each "round" is one game (or a 7-game tournament).

-- Older helpers that were replaced
drop function if exists public.finish_room_ticket(uuid);
drop function if exists public._leave_open_rooms(uuid);

create or replace function public._sys(p_room uuid, p_body text) returns void
language sql security definer set search_path = public as $$
  insert into room_messages (room_id, username, body, kind) values (p_room, '', left(p_body, 300), 'system');
$$;

-- Picks what the next round is: one ticket, or 7 random tickets from a price tier.
create or replace function public._room_lineup(p_room uuid) returns void
language plpgsql security definer set search_path = public as $$
declare r record; v_themes text[]; v_entry int;
begin
  select * into r from rooms where id = p_room;
  if r.mode = 'tourney' then
    -- Tournament entry is fixed per level, whatever 7 games are drawn.
    v_entry := case r.tier when 'high' then 120 when 'mid' then 50 else 20 end;
    select array_agg(id) into v_themes from (
      select id, price from themes
      where price = any(case r.tier when 'high' then array[15, 20] when 'mid' then array[5, 10] else array[2, 3] end)
      order by random() limit 7) x;
  else
    select array[id], price into v_themes, v_entry from themes where id = r.theme;
  end if;
  update rooms set themes = v_themes, entry = v_entry, price = v_entry, version = version + 1 where id = p_room;
end $$;

create or replace function public.room_state(p_room uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := public._uid(); r record;
begin
  select * into r from rooms where id = p_room;
  if r.id is null or not exists (select 1 from room_players where room_id = p_room and user_id = v_uid) then return null; end if;
  return jsonb_build_object(
    'id', r.id, 'code', r.code, 'host', r.host, 'status', r.status, 'mode', r.mode, 'tier', r.tier, 'theme', r.theme, 'is_public', r.is_public,
    'round', r.round, 'themes', to_jsonb(r.themes), 'entry', r.entry, 'pot', r.pot, 'result', r.result,
    'version', r.version, 'started_at', r.started_at,
    'players', (select jsonb_agg(jsonb_build_object(
        'id', rp.user_id, 'username', rp.username, 'in_round', rp.in_round, 'progress', rp.progress,
        'finished', rp.finished, 'payout', rp.payout,
        'totals', case when rp.user_id = v_uid or r.status <> 'playing' then to_jsonb(rp.totals) else to_jsonb(rp.totals[1:rp.progress]) end,
        'score', (select coalesce(sum(x), 0) from unnest(case when r.status <> 'playing' then rp.totals else rp.totals[1:rp.progress] end) x)
      ) order by rp.joined_at)
      from room_players rp where rp.room_id = p_room));
end $$;

create or replace function public.my_room() returns jsonb
language sql stable security definer set search_path = public as $$
  select public.room_state(r.id) from rooms r join room_players rp on rp.room_id = r.id
  where rp.user_id = public._uid() and r.status in ('lobby', 'playing') order by rp.joined_at desc limit 1;
$$;

-- Highest total takes the pot (ties share it). If nobody wins anything, everyone gets their entry back.
create or replace function public._settle_room(p_room uuid) returns void
language plpgsql security definer set search_path = public as $$
declare r record; v_n int; v_top int; v_winners int; v_share int; v_rest int; v_first uuid; w record; v_stand jsonb; v_names text;
begin
  select * into r from rooms where id = p_room for update;
  if r.status <> 'playing' then return; end if;
  update room_players set finished = true, progress = coalesce(array_length(r.themes, 1), 1)
    where room_id = p_room and in_round;
  select count(*), max(s) into v_n, v_top from (
    select coalesce((select sum(x) from unnest(totals) x), 0) s from room_players where room_id = p_room and in_round) q;
  if v_n = 0 then
    update rooms set status = 'lobby', version = version + 1,
      result = jsonb_build_object('round', r.round, 'mode', r.mode, 'pot', r.pot, 'empty', true, 'standings', '[]'::jsonb) where id = p_room;
    return;
  end if;
  if coalesce(v_top, 0) = 0 then
    update room_players set payout = r.entry where room_id = p_room and in_round;
    update profiles p set balance = balance + r.entry from room_players rp where rp.room_id = p_room and rp.in_round and p.id = rp.user_id;
    perform public._sys(p_room, 'Nobody won anything this round, so everyone got their chips back.');
  else
    select count(*) into v_winners from room_players where room_id = p_room and in_round and coalesce((select sum(x) from unnest(totals) x), 0) = v_top;
    v_share := r.pot / v_winners; v_rest := r.pot - v_share * v_winners;
    select user_id into v_first from room_players where room_id = p_room and in_round
      and coalesce((select sum(x) from unnest(totals) x), 0) = v_top order by joined_at limit 1;
    for w in select user_id, username from room_players where room_id = p_room and in_round
        and coalesce((select sum(x) from unnest(totals) x), 0) = v_top loop
      update room_players set payout = v_share + case when w.user_id = v_first then v_rest else 0 end where room_id = p_room and user_id = w.user_id;
      update profiles set balance = balance + v_share + case when w.user_id = v_first then v_rest else 0 end,
                          won = won + v_share + case when w.user_id = v_first then v_rest else 0 end,
                          wins = wins + 1
        where id = w.user_id;
      insert into events (user_id, kind, data) values (w.user_id, 'room_win', jsonb_build_object('username', w.username, 'amount', v_share, 'players', v_n, 'mode', r.mode));
    end loop;
    select string_agg(username, ' & ') into v_names from room_players where room_id = p_room and payout > 0 and in_round;
    perform public._sys(p_room, v_names || case when r.mode = 'tourney' then ' won the tournament and ' else ' ' end || 'took the ' || r.pot || '-chip pot.');
  end if;
  select jsonb_agg(jsonb_build_object('id', user_id, 'username', username, 'payout', payout, 'totals', to_jsonb(totals),
           'score', coalesce((select sum(x) from unnest(totals) x), 0)) order by coalesce((select sum(x) from unnest(totals) x), 0) desc, joined_at)
    into v_stand from room_players where room_id = p_room and in_round;
  update rooms set status = 'lobby', version = version + 1,
    result = jsonb_build_object('round', r.round, 'mode', r.mode, 'themes', to_jsonb(r.themes), 'pot', r.pot, 'refund', coalesce(v_top, 0) = 0, 'standings', v_stand)
    where id = p_room;
  if r.mode = 'tourney' then perform public._room_lineup(p_room); end if;
end $$;

-- Remove one player. Leaving mid-round forfeits that round's entry.
drop function if exists public._leave(uuid, uuid);
create or replace function public._leave(p_uid uuid, p_room uuid, p_quiet boolean default false) returns void
language plpgsql security definer set search_path = public as $$
declare r record; v_name text; v_next uuid;
begin
  select * into r from rooms where id = p_room for update;
  if r.id is null then return; end if;
  delete from room_players where room_id = p_room and user_id = p_uid returning username into v_name;
  if v_name is null then return; end if;
  select user_id into v_next from room_players where room_id = p_room order by joined_at limit 1;
  if v_next is null then
    update rooms set status = 'closed', version = version + 1 where id = p_room;
    return;
  end if;
  if not p_quiet then perform public._sys(p_room, v_name || ' left the room.'); end if;
  if r.host = p_uid then
    update rooms set host = v_next where id = p_room;
    perform public._sys(p_room, (select username from room_players where room_id = p_room and user_id = v_next) || ' is the host now.');
  end if;
  update rooms set version = version + 1 where id = p_room;
  if r.status = 'playing' and not exists (select 1 from room_players where room_id = p_room and in_round and not finished) then
    perform public._settle_room(p_room);
  end if;
end $$;

create or replace function public._leave_all(p_uid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  for r in select ro.id from rooms ro join room_players rp on rp.room_id = ro.id
           where rp.user_id = p_uid and ro.status in ('lobby', 'playing') loop
    perform public._leave(p_uid, r.id);
  end loop;
end $$;

create or replace function public._busy(p_uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from rooms r join room_players rp on rp.room_id = r.id
                 where rp.user_id = p_uid and r.status = 'playing' and rp.in_round and not rp.finished);
$$;

drop function if exists public.create_room(text, date);
create or replace function public.create_room(p_theme text, p_day date, p_public boolean default false) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid(); v_code text; v_id uuid; v_name text;
begin
  perform public._daily(v_uid, p_day);
  if public._busy(v_uid) then raise exception 'in_a_game'; end if;
  if not exists (select 1 from themes where id = p_theme) then raise exception 'unknown_ticket'; end if;
  perform public._leave_all(v_uid);
  select username into v_name from profiles where id = v_uid;
  loop
    v_code := (select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '') from generate_series(1, 5));
    exit when not exists (select 1 from rooms where code = v_code);
  end loop;
  insert into rooms (code, host, theme, price, status, mode, tier, is_public)
    values (v_code, v_uid, p_theme, 0, 'lobby', 'single', 'low', coalesce(p_public, false)) returning id into v_id;
  insert into room_players (room_id, user_id, username) values (v_id, v_uid, v_name);
  perform public._room_lineup(v_id);
  perform public._sys(v_id, v_name || ' opened ' || case when p_public then 'a public' else 'the' end || ' room.');
  return public.room_state(v_id);
end $$;

create or replace function public.join_room(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid(); r record; v_name text;
begin
  select * into r from rooms where code = upper(trim(p_code)) and status in ('lobby', 'playing');
  if r.id is null then raise exception 'no_such_room'; end if;
  if exists (select 1 from room_players where room_id = r.id and user_id = v_uid) then return public.room_state(r.id); end if;
  if v_uid = any(r.banned) then raise exception 'banned'; end if;
  if (select count(*) from room_players where room_id = r.id) >= 8 then raise exception 'room_full'; end if;
  if public._busy(v_uid) then raise exception 'in_a_game'; end if;
  perform public._leave_all(v_uid);
  select username into v_name from profiles where id = v_uid;
  insert into room_players (room_id, user_id, username) values (r.id, v_uid, v_name);
  update rooms set version = version + 1 where id = r.id;
  perform public._sys(r.id, v_name || ' joined.');
  return public.room_state(r.id);
end $$;

create or replace function public.leave_room(p_room uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid();
begin
  perform public._leave(v_uid, p_room);
  return public._me(v_uid);
end $$;

-- Host chooses the next round: a single ticket or a tournament. Calling it again reshuffles the tournament.
create or replace function public.set_room_game(p_room uuid, p_mode text, p_theme text, p_tier text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid(); r record;
begin
  select * into r from rooms where id = p_room for update;
  if r.id is null or r.host <> v_uid then raise exception 'not_host'; end if;
  if r.status <> 'lobby' then raise exception 'round_running'; end if;
  if p_mode not in ('single', 'tourney') then p_mode := r.mode; end if;
  if p_tier not in ('low', 'mid', 'high') then p_tier := r.tier; end if;
  if p_theme is null or not exists (select 1 from themes where id = p_theme) then p_theme := r.theme; end if;
  update rooms set mode = p_mode, theme = p_theme, tier = p_tier where id = p_room;
  perform public._room_lineup(p_room);
  return public.room_state(p_room);
end $$;

create or replace function public.start_round(p_room uuid, p_day date) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid(); r record; v_n int; pl record; v_out text;
begin
  perform public._daily(v_uid, p_day);
  select * into r from rooms where id = p_room for update;
  if r.id is null or r.host <> v_uid then raise exception 'not_host'; end if;
  if r.status <> 'lobby' then return public.room_state(p_room); end if;
  if r.themes is null then perform public._room_lineup(p_room); select * into r from rooms where id = p_room; end if;
  update room_players set in_round = false, finished = false, progress = 0, payout = 0, totals = null where room_id = p_room;
  update room_players rp set in_round = true from profiles p
    where rp.room_id = p_room and p.id = rp.user_id and p.balance >= r.entry;
  select count(*) into v_n from room_players where room_id = p_room and in_round;
  if v_n < 2 then raise exception 'need_two_players'; end if;
  update profiles p set balance = balance - r.entry, spent = spent + r.entry, played = played + array_length(r.themes, 1)
    from room_players rp where rp.room_id = p_room and rp.in_round and p.id = rp.user_id;
  for pl in select user_id from room_players where room_id = p_room and in_round loop
    update room_players set totals = (
      select array_agg(public._draw_total(t.price) order by u.ord)
      from unnest(r.themes) with ordinality u(tid, ord) join themes t on t.id = u.tid)
    where room_id = p_room and user_id = pl.user_id;
  end loop;
  select string_agg(username, ', ') into v_out from room_players where room_id = p_room and not in_round;
  if v_out is not null then perform public._sys(p_room, v_out || ' sat this round out (not enough chips).'); end if;
  update rooms set status = 'playing', round = round + 1, pot = r.entry * v_n, started_at = now(), version = version + 1 where id = p_room;
  perform public._sys(p_room, case when r.mode = 'tourney' then 'Tournament' else 'Round' end || ' ' || (r.round + 1) || ' started. Pot: ' || (r.entry * v_n) || ' chips.');
  return public.room_state(p_room);
end $$;

create or replace function public.finish_room_ticket(p_room uuid, p_round int, p_index int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid(); r record;
begin
  select * into r from rooms where id = p_room for update;
  if r.id is not null and r.status = 'playing' and r.round = p_round then
    update room_players set progress = greatest(progress, least(p_index + 1, array_length(r.themes, 1))),
                            finished = greatest(progress, p_index + 1) >= array_length(r.themes, 1)
      where room_id = p_room and user_id = v_uid and in_round;
    update rooms set version = version + 1 where id = p_room;
    if not exists (select 1 from room_players where room_id = p_room and in_round and not finished) then
      perform public._settle_room(p_room);
    end if;
  end if;
  return public.room_state(p_room);
end $$;

-- Anyone in the room can close a round out after 2 minutes per game, so one slow player can't hold it up.
create or replace function public.settle_room(p_room uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_room_member(p_room) then raise exception 'no_such_room'; end if;
  if exists (select 1 from rooms where id = p_room and status = 'playing'
             and started_at < now() - interval '2 minutes' * greatest(1, coalesce(array_length(themes, 1), 1))) then
    perform public._settle_room(p_room);
  end if;
  return public.room_state(p_room);
end $$;

create or replace function public.invite_to_room(p_room uuid, p_friend uuid) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid(); r record; v_me text;
begin
  select * into r from rooms where id = p_room and status in ('lobby', 'playing');
  if r.id is null or not public.is_room_member(p_room) then raise exception 'no_such_room'; end if;
  if not exists (select 1 from friends where user_id = v_uid and friend_id = p_friend) then raise exception 'not_friends'; end if;
  select username into v_me from profiles where id = v_uid;
  insert into events (user_id, target, kind, data) values (v_uid, p_friend, 'room_invite', jsonb_build_object('username', v_me, 'code', r.code, 'theme', r.theme, 'price', r.entry));
  return true;
end $$;

-- ---------- Public rooms ----------
create or replace function public.set_room_public(p_room uuid, p_public boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid(); r record;
begin
  select * into r from rooms where id = p_room;
  if r.id is null or r.host <> v_uid then raise exception 'not_host'; end if;
  if r.is_public is distinct from p_public then
    update rooms set is_public = coalesce(p_public, false), version = version + 1 where id = p_room;
    perform public._sys(p_room, 'The room is now ' || case when p_public then 'public. Anyone can join from the room list.' else 'private. Only people with the code can join.' end);
  end if;
  return public.room_state(p_room);
end $$;

create or replace function public.public_rooms() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(x order by x.lobby desc, x.players desc, x.created_at desc), '[]'::jsonb) from (
    select r.code, r.status, r.mode, r.tier, r.theme, r.entry, r.round, r.created_at, r.status = 'lobby' as lobby,
           (select username from profiles where id = r.host) as host,
           (select count(*) from room_players where room_id = r.id) as players,
           exists (select 1 from room_players where room_id = r.id and user_id = public._uid()) as mine
    from rooms r
    where r.is_public and r.status in ('lobby', 'playing') and not (public._uid() = any(r.banned))
      and (select count(*) from room_players where room_id = r.id) between 1 and 7
    order by r.created_at desc limit 40) x;
$$;

create or replace function public.quick_join() returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid(); v_code text;
begin
  select r.code into v_code from rooms r
  where r.is_public and r.status in ('lobby', 'playing') and not (v_uid = any(r.banned))
    and not exists (select 1 from room_players where room_id = r.id and user_id = v_uid)
    and (select count(*) from room_players where room_id = r.id) between 1 and 7
  order by (r.status = 'lobby') desc, (select count(*) from room_players where room_id = r.id) desc, r.created_at desc
  limit 1;
  if v_code is null then raise exception 'no_public_rooms'; end if;
  return public.join_room(v_code);
end $$;

-- Host removes someone. They can't come back to this room.
create or replace function public.kick_player(p_room uuid, p_user uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid(); r record; v_name text;
begin
  select * into r from rooms where id = p_room;
  if r.id is null or r.host <> v_uid then raise exception 'not_host'; end if;
  if p_user = v_uid then raise exception 'thats_you'; end if;
  select username into v_name from room_players where room_id = p_room and user_id = p_user;
  if v_name is null then return public.room_state(p_room); end if;
  update rooms set banned = array_append(banned, p_user) where id = p_room;
  perform public._sys(p_room, v_name || ' was removed by the host.');
  perform public._leave(p_user, p_room, true);
  return public.room_state(p_room);
end $$;

-- ---------- Room chat ----------
create or replace function public.send_message(p_room uuid, p_body text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid(); v_body text := btrim(coalesce(p_body, '')); v_name text; v_row room_messages;
begin
  if not public.is_room_member(p_room) then raise exception 'no_such_room'; end if;
  if length(v_body) = 0 then raise exception 'empty_message'; end if;
  if length(v_body) > 300 then v_body := left(v_body, 300); end if;
  if exists (select 1 from room_messages where room_id = p_room and user_id = v_uid and created_at > now() - interval '600 milliseconds') then
    raise exception 'slow_down';
  end if;
  select username into v_name from profiles where id = v_uid;
  insert into room_messages (room_id, user_id, username, body) values (p_room, v_uid, v_name, v_body) returning * into v_row;
  return to_jsonb(v_row);
end $$;

create or replace function public.room_messages(p_room uuid, p_after bigint) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_room_member(p_room) then return '[]'::jsonb; end if;
  return coalesce((select jsonb_agg(to_jsonb(m) order by m.id) from (
    select id, user_id, username, body, kind, created_at from room_messages
    where room_id = p_room and id > coalesce(p_after, 0) order by id desc limit 80) m), '[]'::jsonb);
end $$;

-- Tournaments waiting to start use the fixed entry for their level too.
update public.rooms set entry = case tier when 'high' then 120 when 'mid' then 50 else 20 end,
                        price = case tier when 'high' then 120 when 'mid' then 50 else 20 end
  where mode = 'tourney' and status = 'lobby';

-- ---------- Who can call what ----------
revoke execute on all functions in schema public from public, anon;
grant execute on function public.username_available(text) to anon, authenticated;
grant execute on function
  public.me(date), public.buy_ticket(text, date), public.claim_ticket(bigint), public.open_chest(date),
  public.leaderboard(text), public.social_state(), public.request_friend(text), public.respond_friend(uuid, boolean),
  public.remove_friend(uuid), public.send_chips(uuid, int), public.feed(),
  public.room_state(uuid), public.my_room(), public.create_room(text, date, boolean), public.join_room(text),
  public.set_room_public(uuid, boolean), public.public_rooms(), public.quick_join(), public.kick_player(uuid, uuid),
  public.leave_room(uuid), public.invite_to_room(uuid, uuid), public.set_room_game(uuid, text, text, text),
  public.start_round(uuid, date), public.finish_room_ticket(uuid, int, int), public.settle_room(uuid),
  public.send_message(uuid, text), public.room_messages(uuid, bigint), public.is_room_member(uuid)
to authenticated;
revoke execute on function public._daily(uuid, date), public._me(uuid), public._make_friends(uuid, uuid),
  public._leave(uuid, uuid, boolean), public._leave_all(uuid), public._busy(uuid), public._settle_room(uuid),
  public._room_lineup(uuid), public._sys(uuid, text) from authenticated;
-- Old room function from the first version
drop function if exists public.start_room(uuid);

-- ---------- Live updates ----------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.events; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.rooms;  exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.room_messages; exception when duplicate_object then null; end;
  end if;
end $$;
