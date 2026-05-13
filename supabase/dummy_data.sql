-- ============================================================
-- Dummy Data untuk Testing Payment
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Tambah meja dummy dengan tarif Rp 1.000/jam
insert into meja (status, tarif) values ('Tersedia', 1000);

-- 2. Catat ID meja yang baru dibuat (cek dengan: select * from meja order by id desc limit 1)

-- 3. Buat pemesanan dummy dengan total Rp 1.000
--    Ganti 'YOUR-USER-UUID' dengan UUID kamu dari:
--    Supabase Dashboard → Authentication → Users → salin UUID-nya

insert into pemesanan (
  user_id,
  meja_id,
  durasi,
  waktu_mulai,
  waktu_selesai,
  status_pembayaran,
  total_tagihan
)
values (
  'YOUR-USER-UUID',                          -- <-- ganti ini
  (select id from meja order by id desc limit 1),
  60,
  now(),
  now() + interval '1 hour',
  'Pending',
  1000
);

-- Verifikasi
select
  p.id,
  p.total_tagihan,
  p.status_pembayaran,
  m.tarif,
  p.waktu_mulai
from pemesanan p
join meja m on m.id = p.meja_id
order by p.id desc
limit 5;
