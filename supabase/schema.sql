-- ============================================================
-- 8BPOS Database Schema
-- Jalankan di Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 0. Tabel profiles (untuk mensinkronkan metadata user & role dari Supabase Auth)
create table if not exists public.profiles (
  id         uuid references auth.users(id) on delete cascade primary key,
  email      text not null,
  role       text not null default 'user',  -- 'user' | 'admin'
  created_at timestamptz default now()
);

-- 1. Tabel meja
create table if not exists meja (
  id     serial primary key,
  status text not null default 'Tersedia',  -- 'Tersedia' | 'Terpakai' | 'Maintenance'
  tarif  numeric(10,2) not null             -- tarif per jam (Rp)
);

-- 2. Tabel menu_fnb
create table if not exists menu_fnb (
  id       serial primary key,
  nama     text not null,
  harga    numeric(10,2) not null,
  stok     int not null default 0,
  kategori text not null  -- 'Makanan' | 'Minuman'
);

-- 3. Tabel pemesanan (transaksi utama)
create table if not exists pemesanan (
  id                serial primary key,
  user_id           uuid references auth.users(id),
  meja_id           int references meja(id),
  durasi            int not null,          -- dalam menit
  waktu_mulai       timestamptz not null,
  waktu_selesai     timestamptz not null,
  status_pembayaran text not null default 'Pending',  -- 'Pending' | 'Lunas' | 'Batal'
  total_tagihan     numeric(10,2) default 0,
  created_at        timestamptz default now()
);

-- 4. Tabel pemesanan_detail (ItemPenjualan F&B)
create table if not exists pemesanan_detail (
  id           serial primary key,
  pemesanan_id int references pemesanan(id) on delete cascade,
  menu_fnb_id  int references menu_fnb(id),
  kuantitas    int not null,
  sub_total    numeric(10,2) not null
);

-- ============================================================
-- Row Level Security & Policies
-- ============================================================

alter table meja enable row level security;
alter table menu_fnb enable row level security;
alter table pemesanan enable row level security;
alter table pemesanan_detail enable row level security;

-- meja: semua orang bisa baca, admin bisa insert/update/delete, user bisa update status saat booking
create policy "meja_select" on meja for select using (true);
create policy "meja_insert" on meja for insert with check (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'user') = 'admin');
create policy "meja_update" on meja for update using (
  (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'user') = 'admin') OR (status = 'Tersedia' OR status = 'Terpakai')
);
create policy "meja_delete" on meja for delete using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'user') = 'admin');

-- menu_fnb: semua orang bisa baca, admin bisa insert/update/delete
create policy "menu_fnb_select" on menu_fnb for select using (true);
create policy "menu_fnb_insert" on menu_fnb for insert with check (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'user') = 'admin');
create policy "menu_fnb_update" on menu_fnb for update using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'user') = 'admin');
create policy "menu_fnb_delete" on menu_fnb for delete using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'user') = 'admin');

-- pemesanan: user hanya bisa akses miliknya sendiri, admin bisa akses semuanya
create policy "pemesanan_select" on pemesanan for select using (
  (auth.uid() = user_id) OR (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'user') = 'admin')
);
create policy "pemesanan_insert" on pemesanan for insert with check (
  (auth.uid() = user_id) OR (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'user') = 'admin')
);
create policy "pemesanan_update" on pemesanan for update using (
  (auth.uid() = user_id) OR (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'user') = 'admin')
);
create policy "pemesanan_delete" on pemesanan for delete using (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'user') = 'admin'
);

-- pemesanan_detail: user bisa akses jika dia pemilik pemesanannya, admin bisa akses semuanya
create policy "pemesanan_detail_select" on pemesanan_detail for select using (
  exists (
    select 1 from pemesanan p 
    where p.id = pemesanan_id 
    and (p.user_id = auth.uid() or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'user') = 'admin')
  )
);
create policy "pemesanan_detail_insert" on pemesanan_detail for insert with check (
  exists (
    select 1 from pemesanan p 
    where p.id = pemesanan_id 
    and (p.user_id = auth.uid() or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'user') = 'admin')
  )
);
create policy "pemesanan_detail_update" on pemesanan_detail for update using (
  exists (
    select 1 from pemesanan p 
    where p.id = pemesanan_id 
    and (p.user_id = auth.uid() or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'user') = 'admin')
  )
);
create policy "pemesanan_detail_delete" on pemesanan_detail for delete using (
  exists (
    select 1 from pemesanan p 
    where p.id = pemesanan_id 
    and (p.user_id = auth.uid() or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'user') = 'admin')
  )
);

-- RLS untuk tabel profiles
alter table profiles enable row level security;

create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (true);
create policy "profiles_update" on profiles for update using (auth.uid() = id);
create policy "profiles_delete" on profiles for delete using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'user') = 'admin');

-- Trigger untuk sinkronisasi otomatis dari auth.users ke public.profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger jika sudah ada sebelumnya
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Migrasikan data user yang sudah ada sebelumnya (jika ada) ke tabel profiles
insert into public.profiles (id, email, role)
select id, email, coalesce(raw_user_meta_data->>'role', 'user')
from auth.users
on conflict (id) do nothing;

-- ============================================================
-- Seed Data
-- ============================================================

insert into meja (status, tarif) values
  ('Tersedia', 30000),
  ('Tersedia', 30000),
  ('Tersedia', 35000),
  ('Tersedia', 35000),
  ('Tersedia', 40000),
  ('Tersedia', 40000);

insert into menu_fnb (nama, harga, stok, kategori) values
  ('Nasi Goreng', 20000, 50, 'Makanan'),
  ('Mie Goreng', 18000, 50, 'Makanan'),
  ('Kentang Goreng', 15000, 30, 'Makanan'),
  ('Nugget', 15000, 30, 'Makanan'),
  ('Pisang Goreng', 10000, 40, 'Makanan'),
  ('Es Teh Manis', 5000, 100, 'Minuman'),
  ('Es Jeruk', 7000, 100, 'Minuman'),
  ('Air Mineral', 5000, 100, 'Minuman'),
  ('Kopi Hitam', 8000, 50, 'Minuman'),
  ('Jus Alpukat', 15000, 30, 'Minuman');
