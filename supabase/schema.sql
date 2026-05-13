-- ============================================================
-- 8BPOS Database Schema
-- Jalankan di Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

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
-- Row Level Security
-- ============================================================

alter table meja enable row level security;
alter table menu_fnb enable row level security;
alter table pemesanan enable row level security;
alter table pemesanan_detail enable row level security;

-- meja: semua orang bisa baca, user terautentikasi bisa update status
create policy "meja_select" on meja for select using (true);
create policy "meja_update" on meja for update to authenticated using (true);

-- menu_fnb: semua orang bisa baca
create policy "menu_fnb_select" on menu_fnb for select using (true);
create policy "menu_fnb_update" on menu_fnb for update to authenticated using (true);

-- pemesanan: user hanya bisa akses miliknya sendiri
create policy "pemesanan_select" on pemesanan for select using (auth.uid() = user_id);
create policy "pemesanan_insert" on pemesanan for insert with check (auth.uid() = user_id);

-- pemesanan_detail: user bisa akses jika dia pemilik pemesanannya
create policy "pemesanan_detail_select" on pemesanan_detail for select using (
  exists (select 1 from pemesanan p where p.id = pemesanan_id and p.user_id = auth.uid())
);
create policy "pemesanan_detail_insert" on pemesanan_detail for insert with check (
  exists (select 1 from pemesanan p where p.id = pemesanan_id and p.user_id = auth.uid())
);

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
