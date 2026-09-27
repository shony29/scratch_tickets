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
create or replace function public.room_state(p_room uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := public._uid(); r record;
begin
  select * into r from rooms where id = p_room;
  if r.id is null or not exists (select 1 from room_players where room_id = p_room and user_id = v_uid) then return null; end if;
  return jsonb_build_object(
    'id', r.id, 'code', r.code, 'host', r.host, 'theme', r.theme, 'price', r.price, 'status', r.status,
    'result', r.result, 'version', r.version, 'started_at', r.started_at, 'pot', r.price * (select count(*) from room_players where room_id = p_room),
    'players', (select jsonb_agg(jsonb_build_object(
        'id', rp.user_id, 'username', rp.username, 'finished', rp.finished, 'payout', rp.payout,
        'total', case when rp.user_id = v_uid or rp.finished or r.status = 'done' then rp.total end) order by rp.joined_at)
      from room_players rp where rp.room_id = p_room));
end $$;

create or replace function public.my_room() returns jsonb
language sql stable security definer set search_path = public as $$
  select public.room_state(r.id) from rooms r join room_players rp on rp.room_id = r.id
  where rp.user_id = public._uid() and r.status in ('open', 'playing') order by r.created_at desc limit 1;
$$;

create or replace function public._leave_open_rooms(p_uid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  for r in select ro.* from rooms ro join room_players rp on rp.room_id = ro.id where rp.user_id = p_uid and ro.status = 'open' loop
    if r.host = p_uid then
      update profiles p set balance = balance + r.price from room_players rp where rp.room_id = r.id and p.id = rp.user_id;
      update rooms set status = 'cancelled', version = version + 1 where id = r.id;
    else
      delete from room_players where room_id = r.id and user_id = p_uid;
      update profiles set balance = balance + r.price where id = p_uid;
      update rooms set version = version + 1 where id = r.id;
    end if;
  end loop;
end $$;

create or replace function public.create_room(p_theme text, p_day date) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid(); v_price int; v_code text; v_id uuid; v_name text;
begin
  perform public._daily(v_uid, p_day);
  if exists (select 1 from rooms r join room_players rp on rp.room_id = r.id where rp.user_id = v_uid and r.status = 'playing') then raise exception 'in_a_game'; end if;
  perform public._leave_open_rooms(v_uid);
  select price into v_price from themes where id = p_theme;
  if v_price is null then raise exception 'unknown_ticket'; end if;
  update profiles set balance = balance - v_price where id = v_uid and balance >= v_price returning username into v_name;
  if not found then raise exception 'not_enough_chips'; end if;
  loop
    v_code := (select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '') from generate_series(1, 5));
    exit when not exists (select 1 from rooms where code = v_code);
  end loop;
  insert into rooms (code, host, theme, price) values (v_code, v_uid, p_theme, v_price) returning id into v_id;
  insert into room_players (room_id, user_id, username) values (v_id, v_uid, v_name);
  return public.room_state(v_id);
end $$;

create or replace function public.join_room(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid(); r record; v_name text;
begin
  select * into r from rooms where code = upper(trim(p_code)) and status in ('open', 'playing');
  if r.id is null then raise exception 'no_such_room'; end if;
  if exists (select 1 from room_players where room_id = r.id and user_id = v_uid) then return public.room_state(r.id); end if;
  if r.status <> 'open' then raise exception 'room_started'; end if;
  if (select count(*) from room_players where room_id = r.id) >= 8 then raise exception 'room_full'; end if;
  if exists (select 1 from rooms ro join room_players rp on rp.room_id = ro.id where rp.user_id = v_uid and ro.status = 'playing') then raise exception 'in_a_game'; end if;
  perform public._leave_open_rooms(v_uid);
  update profiles set balance = balance - r.price where id = v_uid and balance >= r.price returning username into v_name;
  if not found then raise exception 'not_enough_chips'; end if;
  insert into room_players (room_id, user_id, username) values (r.id, v_uid, v_name);
  update rooms set version = version + 1 where id = r.id;
  return public.room_state(r.id);
end $$;

create or replace function public.leave_room(p_room uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid();
begin
  if exists (select 1 from rooms where id = p_room and status = 'open') then
    perform public._leave_open_rooms(v_uid);
  end if;
  return public._me(v_uid);
end $$;

create or replace function public.invite_to_room(p_room uuid, p_friend uuid) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid(); r record; v_me text;
begin
  select * into r from rooms where id = p_room and status = 'open';
  if r.id is null or not public.is_room_member(p_room) then raise exception 'no_such_room'; end if;
  if not exists (select 1 from friends where user_id = v_uid and friend_id = p_friend) then raise exception 'not_friends'; end if;
  select username into v_me from profiles where id = v_uid;
  insert into events (user_id, target, kind, data) values (v_uid, p_friend, 'room_invite', jsonb_build_object('username', v_me, 'code', r.code, 'theme', r.theme, 'price', r.price));
  return true;
end $$;

create or replace function public.start_room(p_room uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid(); r record;
begin
  select * into r from rooms where id = p_room for update;
  if r.id is null or r.host <> v_uid then raise exception 'not_host'; end if;
  if r.status <> 'open' then return public.room_state(p_room); end if;
  if (select count(*) from room_players where room_id = p_room) < 2 then raise exception 'need_two_players'; end if;
  update room_players set total = public._draw_total(r.price) where room_id = p_room;
  update rooms set status = 'playing', started_at = now(), version = version + 1 where id = p_room;
  return public.room_state(p_room);
end $$;

-- Highest ticket takes the whole pot (ties share it). If nobody wins anything, everyone gets their chips back.
create or replace function public._settle_room(p_room uuid) returns void
language plpgsql security definer set search_path = public as $$
declare r record; v_n int; v_top int; v_winners int; v_pot int; v_share int; v_rest int; v_first uuid; w record;
begin
  select * into r from rooms where id = p_room for update;
  if r.status <> 'playing' then return; end if;
  select count(*), max(total) into v_n, v_top from room_players where room_id = p_room;
  v_pot := r.price * v_n;
  if coalesce(v_top, 0) = 0 then
    update room_players set payout = r.price where room_id = p_room;
    update profiles p set balance = balance + r.price from room_players rp where rp.room_id = p_room and p.id = rp.user_id;
    update rooms set status = 'done', version = version + 1, result = jsonb_build_object('refund', true, 'pot', v_pot) where id = p_room;
    return;
  end if;
  select count(*) into v_winners from room_players where room_id = p_room and total = v_top;
  v_share := v_pot / v_winners; v_rest := v_pot - v_share * v_winners;
  select user_id into v_first from room_players where room_id = p_room and total = v_top order by joined_at limit 1;
  for w in select user_id, username from room_players where room_id = p_room and total = v_top loop
    update room_players set payout = v_share + case when w.user_id = v_first then v_rest else 0 end where room_id = p_room and user_id = w.user_id;
    update profiles set balance = balance + v_share + case when w.user_id = v_first then v_rest else 0 end,
                        won = won + v_share + case when w.user_id = v_first then v_rest else 0 end
      where id = w.user_id;
    insert into events (user_id, kind, data) values (w.user_id, 'room_win', jsonb_build_object('username', w.username, 'theme', r.theme, 'amount', v_share, 'players', v_n));
  end loop;
  update rooms set status = 'done', version = version + 1, result = jsonb_build_object('refund', false, 'pot', v_pot, 'top', v_top) where id = p_room;
end $$;

create or replace function public.finish_room_ticket(p_room uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := public._uid();
begin
  update room_players set finished = true where room_id = p_room and user_id = v_uid;
  update rooms set version = version + 1 where id = p_room;
  if not exists (select 1 from room_players where room_id = p_room and not finished) then
    perform public._settle_room(p_room);
  end if;
  return public.room_state(p_room);
end $$;

-- Anyone in the room can close it out once 2 minutes have passed, so one slow player can't hold it up.
create or replace function public.settle_room(p_room uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_room_member(p_room) then raise exception 'no_such_room'; end if;
  if exists (select 1 from rooms where id = p_room and status = 'playing' and started_at < now() - interval '2 minutes') then
    perform public._settle_room(p_room);
  end if;
  return public.room_state(p_room);
end $$;

-- ---------- Who can call what ----------
revoke execute on all functions in schema public from public, anon;
grant execute on function public.username_available(text) to anon, authenticated;
grant execute on function
  public.me(date), public.buy_ticket(text, date), public.claim_ticket(bigint), public.open_chest(date),
  public.leaderboard(text), public.social_state(), public.request_friend(text), public.respond_friend(uuid, boolean),
  public.remove_friend(uuid), public.send_chips(uuid, int), public.feed(),
  public.room_state(uuid), public.my_room(), public.create_room(text, date), public.join_room(text),
  public.leave_room(uuid), public.invite_to_room(uuid, uuid), public.start_room(uuid),
  public.finish_room_ticket(uuid), public.settle_room(uuid), public.is_room_member(uuid)
to authenticated;
revoke execute on function public._daily(uuid, date), public._me(uuid), public._make_friends(uuid, uuid),
  public._leave_open_rooms(uuid), public._settle_room(uuid) from authenticated;

-- ---------- Live updates ----------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.events; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.rooms;  exception when duplicate_object then null; end;
  end if;
end $$;
