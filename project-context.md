# SYSTEM CONTEXT & PROJECT GUIDELINES: 8BPOS

## 1. Project Overview

- [cite_start]**Project Name**: Sistem Billing Biliar 8BPOS (8 Ball Point of Sale)[cite: 3].
- [cite_start]**Description**: Aplikasi 8BPOS adalah sistem _Point of Sale_ dan manajemen _billing_ khusus untuk usaha biliar[cite: 52].
- [cite_start]**Core Problem Solved**: Lingkup masalah mencakup manajemen sesi sewa meja (_check-in/check-out_), perhitungan tarif otomatis, pemesanan makanan/minuman (F&B), serta pelaporan transaksi keuangan[cite: 53].
- [cite_start]**Architecture Pattern**: _Client-Server_ dengan pola MVC (_Model-View-Controller_)[cite: 69].

## 2. Database Models (Entities)

Berikut adalah struktur entitas data yang harus direpresentasikan di database:

- [cite_start]**User**: Menyimpan data pengguna[cite: 84]. [cite_start]Atribut: `userID` (int), `username` (string), `password` (string)[cite: 780].
- [cite_start]**Admin**: Menyimpan data staf/admin[cite: 421]. [cite_start]Atribut: `adminID` (int), `nama` (string)[cite: 780].
- [cite_start]**Meja**: Menyimpan data meja biliar[cite: 443]. [cite_start]Atribut: `mejaID` (int), `status` (string), `tarif` (double)[cite: 780].
- [cite_start]**Pemesanan**: Entitas utama transaksi[cite: 269]. [cite_start]Atribut: `pemesananID` (int), `statusPembayaran` (string), `totalTagihan` (double)[cite: 780].
- [cite_start]**MenuFnB**: Katalog makanan/minuman[cite: 262]. [cite_start]Atribut: `menuID` (int), `stok` (int)[cite: 780].
- [cite_start]**DetailBooking**: Komposisi dari Pemesanan[cite: 780]. [cite_start]Atribut: `durasi` (int), `waktuMulai` (dateTime)[cite: 780].
- [cite_start]**ItemPenjualan**: Komposisi dari Pemesanan untuk F&B[cite: 780]. [cite_start]Atribut: `qty` (int), `subTotal` (double)[cite: 780].

## 3. Controllers & Business Logic

Logika bisnis dibagi menjadi beberapa _controller_ utama:

- **AuthController**:
  - [cite_start]Tanggung jawab: Menangani sesi pengguna dan autentikasi[cite: 108, 109].
  - [cite_start]Method: `login(username, password)`, `register(userData)`, `logout()`[cite: 773].
- **BookingController**:
  - [cite_start]Tanggung jawab: Menangani pencarian meja dan proses _booking_[cite: 189, 267].
  - [cite_start]Method: `cariMeja(waktu, tanggal)`, `createBooking(userID, mejaID)`, `addMenuToBooking(pemesananID, menuID, qty)`, `cekKetersediaanMeja(mejaID)`[cite: 773].
- **AdminMejaController**:
  - [cite_start]Tanggung jawab: Mengelola _master data_ meja dari sisi Admin[cite: 498].
  - [cite_start]Method: `addMeja(dataMeja)`, `updateMeja(mejaID, data)`, `deleteMeja(mejaID)`, `forceStopSesi(mejaID)`[cite: 773].
- **PaymentController**:
  - [cite_start]Tanggung jawab: Finalisasi transaksi dan _gateway_ pembayaran[cite: 706].
  - [cite_start]Method: `processPayment(pemesananID, metode, jumlah)`, `verifyPayment(pemesananID, adminID, status)`, `generateStruk(pemesananID)`[cite: 773].

## 4. Key Use Cases & Workflows

[cite_start]AI harus memperhatikan 7 aliran _Use Case_ utama saat membangun fitur[cite: 83]:

1.  [cite_start]**Registrasi Akun**: _User_ membuat akun baru untuk mengakses aplikasi[cite: 83].
2.  [cite_start]**Mencari Meja**: _User_ mencari ketersediaan meja berdasarkan lokasi, waktu, dan durasi[cite: 83].
3.  [cite_start]**Booking Meja**: _User_ memilih meja dan melakukan pemesanan (termasuk menu F&B)[cite: 83].
4.  [cite_start]**Melihat Riwayat Booking**: _User_ melihat daftar riwayat _booking_ (status aktif, selesai, atau batal)[cite: 83].
5.  [cite_start]**Mengelola Meja (Admin)**: Admin menambah, mengedit, menghapus, atau mengubah status meja[cite: 83].
6.  [cite_start]**Mengelola Booking (Admin)**: Admin memantau pesanan masuk, melakukan konfirmasi, atau _reschedule_[cite: 83].
7.  [cite_start]**Pembayaran**: Proses finalisasi pembayaran transaksi sewa dan F&B[cite: 83].

## 5. Crucial Algorithm: `hitungTotalBiaya`

Saat menghitung total tagihan pada fitur _Booking_ atau Pembayaran, AI harus mengimplementasikan algoritma berikut secara ketat:

1.  [cite_start]Hitung `durasi_jam` = `durasi_menit` / 60[cite: 796].
2.  [cite_start]Hitung `biaya_sewa` = `durasi_jam` \* `tarif_per_jam`[cite: 797].
3.  [cite_start]Inisialisasi `total_fnb` = 0[cite: 798].
4.  [cite_start]_Looping_ pada setiap _item_ pesanan makanan/minuman: `subtotal` = `qty` \* `hargaSatuan`[cite: 800]. [cite_start]Lalu, tambahkan ke `total_fnb` dengan cara `total_fnb` = `total_fnb` + `subtotal`[cite: 801].
5.  [cite_start]`total_biaya` = `biaya_sewa` + `total_fnb`[cite: 802].
