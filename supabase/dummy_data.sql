-- ============================================================
-- Dummy Data untuk Testing Booking 6 Jam + Countdown
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Ganti 'YOUR-USER-UUID' dengan UUID user yang akan dipakai login.
-- Booking dibuat dengan status 'Lunas' agar countdown langsung tampil di UI.

with meja_baru as (
  insert into meja (status, tarif)
  values ('Tersedia', 1000)
  returning id, tarif
)
insert into pemesanan (
  user_id,
  meja_id,
  durasi,
  waktu_mulai,
  waktu_selesai,
  status_pembayaran,
  total_tagihan
)
select
  'YOUR-USER-UUID',             -- <-- ganti ini
  id,
  360,
  now(),
  now() + interval '6 hours',
  'Lunas',
  tarif * 6
from meja_baru;

-- Verifikasi booking aktif 6 jam
select
  p.id,
  p.user_id,
  p.meja_id,
  p.durasi,
  p.waktu_mulai,
  p.waktu_selesai,
  p.status_pembayaran,
  p.total_tagihan,
  m.tarif
from pemesanan p
join meja m on m.id = p.meja_id
order by p.id desc
limit 5;
