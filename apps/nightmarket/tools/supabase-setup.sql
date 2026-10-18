-- 台灣夜市地圖：網友投稿資料庫設定
-- 用法：在 Supabase 專案的 SQL Editor 貼上整份、按 Run。可以重複執行。
--
-- 規則：
--   * 任何人都能投稿，但投稿一律是「待審核」(pending)。
--   * 網站只讀得到「審核通過」(approved) 的投稿，而且讀不到投稿者的 IP 雜湊。
--   * 審核：到 Table Editor 打開 nm_submissions，把 status 改成 approved（或 rejected）。
--   * 同一個網路位址每小時最多投稿 5 篇，全站每小時最多 200 篇，防止灌水。
--   * 照片放在公開的 nm-photos 空間，每張最多 5MB，只收 JPEG / PNG / WebP。

create extension if not exists pgcrypto;

create table if not exists public.nm_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  market text not null check (market ~ '^[a-z0-9-]{2,30}$'),
  stall text not null check (char_length(stall) between 1 and 40),
  foods text[] not null default '{}' check (coalesce(array_length(foods, 1), 0) <= 6),
  price text check (char_length(price) <= 30),
  where_hint text check (char_length(where_hint) <= 60),
  lat double precision check (lat between 21.8 and 25.4),
  lng double precision check (lng between 119.3 and 122.1),
  review text check (char_length(review) <= 600),
  rating smallint check (rating between 1 and 5),
  photos text[] not null default '{}' check (coalesce(array_length(photos, 1), 0) <= 4),
  nickname text not null check (char_length(nickname) between 1 and 30),
  consent boolean not null check (consent),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  ip_hash text
);
create index if not exists nm_submissions_market on public.nm_submissions (market, status);
create index if not exists nm_submissions_ip on public.nm_submissions (ip_hash, created_at);

alter table public.nm_submissions enable row level security;

-- 欄位權限：訪客只能寫入和讀取這些欄位（讀不到 ip_hash）
revoke all on public.nm_submissions from anon, authenticated;
grant insert (market, stall, foods, price, where_hint, lat, lng, review, rating, photos, nickname, consent)
  on public.nm_submissions to anon, authenticated;
grant select (id, created_at, market, stall, foods, price, where_hint, lat, lng, review, rating, photos, nickname, status)
  on public.nm_submissions to anon, authenticated;

drop policy if exists "nm insert pending" on public.nm_submissions;
create policy "nm insert pending" on public.nm_submissions
  for insert to anon, authenticated with check (status = 'pending');

drop policy if exists "nm read approved" on public.nm_submissions;
create policy "nm read approved" on public.nm_submissions
  for select to anon, authenticated using (status = 'approved');

-- 防灌水：記下網路位址的雜湊，超過次數就拒絕
create or replace function public.nm_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  hdr json := nullif(current_setting('request.headers', true), '')::json;
  ip text := coalesce(split_part(hdr ->> 'x-forwarded-for', ',', 1), '');
begin
  new.status := 'pending';
  new.ip_hash := encode(digest(ip || 'nightmarket', 'sha256'), 'hex');
  if (select count(*) from nm_submissions where ip_hash = new.ip_hash and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'too many submissions, try again later';
  end if;
  if (select count(*) from nm_submissions where created_at > now() - interval '1 hour') >= 200 then
    raise exception 'submissions are paused, try again later';
  end if;
  return new;
end $$;

drop trigger if exists nm_before_insert on public.nm_submissions;
create trigger nm_before_insert before insert on public.nm_submissions
  for each row execute function public.nm_before_insert();

-- 照片空間
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('nm-photos', 'nm-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "nm photo upload" on storage.objects;
create policy "nm photo upload" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'nm-photos' and (storage.foldername(name))[1] = 'u');
