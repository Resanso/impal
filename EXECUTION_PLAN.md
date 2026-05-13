# Execution Plan: 2 Fitur Utama 8BPOS

> **Stack**: Next.js App Router · Supabase · TypeScript  
> **Pattern**: Server Actions (tidak ada tRPC untuk fitur baru)  
> **Tanggal**: 2026-05-13

---

## Fitur 1: Booking Meja (End-to-End)

**Scope**: UC2 (Cari Meja) + UC3 (Booking + F&B)  
**Status saat ini**: `createBooking` action sudah ada, `cariMeja` masih return `null`, halaman `/booking` belum ada.

---

### Phase 1.1 — Database Schema (Supabase)

Buat tabel-tabel berikut di Supabase dashboard (SQL Editor):

```sql
-- Tabel meja
create table meja (
  id          serial primary key,
  status      text not null default 'Tersedia', -- 'Tersedia' | 'Terpakai' | 'Maintenance'
  tarif       numeric(10,2) not null            -- tarif per jam
);

-- Tabel menu_fnb
create table menu_fnb (
  id          serial primary key,
  nama        text not null,
  harga       numeric(10,2) not null,
  stok        int not null default 0,
  kategori    text not null                     -- 'Makanan' | 'Minuman'
);

-- Tabel pemesanan (entitas utama transaksi)
create table pemesanan (
  id                  serial primary key,
  user_id             uuid references auth.users(id),
  meja_id             int references meja(id),
  durasi              int not null,             -- dalam menit
  waktu_mulai         timestamptz not null default now(),
  status_pembayaran   text not null default 'Pending', -- 'Pending' | 'Lunas' | 'Batal'
  total_tagihan       numeric(10,2) default 0,
  created_at          timestamptz default now()
);

-- Tabel pemesanan_detail (ItemPenjualan F&B)
create table pemesanan_detail (
  id              serial primary key,
  pemesanan_id    int references pemesanan(id) on delete cascade,
  menu_fnb_id     int references menu_fnb(id),
  kuantitas       int not null,
  sub_total       numeric(10,2) not null
);
```

**Checklist**:
- [ ] Buat tabel `meja`
- [ ] Buat tabel `menu_fnb`
- [ ] Buat tabel `pemesanan`
- [ ] Buat tabel `pemesanan_detail`
- [ ] Seed data: minimal 5 meja + 10 menu F&B
- [ ] Enable RLS, buat policy: user hanya bisa lihat/insert `pemesanan` milik sendiri

---

### Phase 1.2 — Server Actions

**File**: `src/app/booking/actions.ts`

#### 1. `cariMeja(tanggal, waktuMulai, durasi)`
- Query tabel `meja` where `status = 'Tersedia'`
- Filter meja yang **tidak** punya `pemesanan` aktif yang overlap dengan rentang waktu request
- Return `Meja[]`

#### 2. `getMenuFnB()`
- Query semua menu dari tabel `menu_fnb` where `stok > 0`
- Return `MenuFnB[]`

#### 3. `createBooking(userID, mejaID, durasi, items[])` — **sudah ada, perlu diupdate**
- Jalankan algoritma `hitungTotalBiaya`:
  ```
  biaya_sewa   = (durasi / 60) * tarif_per_jam
  total_fnb    = sum(qty * harga per item)
  total_biaya  = biaya_sewa + total_fnb
  ```
- Insert ke `pemesanan` dengan `total_tagihan` hasil kalkulasi
- Insert ke `pemesanan_detail` untuk setiap item F&B (sertakan `sub_total`)
- Update `meja.status` → `'Terpakai'`
- Update `menu_fnb.stok` (kurangi qty untuk setiap item dipesan)
- Return `{ success, pemesananID }`

**Checklist**:
- [ ] Implementasi `cariMeja` (query + filter overlap)
- [ ] Implementasi `getMenuFnB`
- [ ] Update `createBooking`: tambah kalkulasi `hitungTotalBiaya` + update stok + update status meja

---

### Phase 1.3 — UI Pages

#### `src/app/booking/page.tsx` — Halaman Utama Booking
Flow multi-step (bisa pakai state lokal, tidak perlu library eksternal):

```
Step 1: Pilih Tanggal & Durasi
  └─> cariMeja() → tampilkan daftar meja tersedia (card grid)

Step 2: Pilih Meja
  └─> user klik meja → lanjut ke step 3

Step 3: Pilih Menu F&B (opsional)
  └─> getMenuFnB() → tampilkan katalog, user tambah qty

Step 4: Ringkasan & Konfirmasi
  └─> tampilkan kalkulasi total (biaya sewa + F&B)
  └─> tombol "Konfirmasi Booking" → panggil createBooking()

Step 5: Sukses / Error state
  └─> redirect ke /booking/[id] jika berhasil
```

#### `src/app/booking/[id]/page.tsx` — Detail Booking
- Tampilkan ringkasan booking: meja, durasi, waktu mulai, daftar item F&B, total tagihan
- Status badge: `Pending` / `Lunas` / `Batal`
- Tombol "Bayar Sekarang" → link ke `/payment/[id]`

**Checklist**:
- [ ] `src/app/booking/page.tsx` (multi-step form)
- [ ] `src/app/booking/[id]/page.tsx` (detail booking)
- [ ] Komponen `MejaCard` (tampilkan status + tarif)
- [ ] Komponen `MenuFnBCard` (tampilkan nama, harga, qty selector)
- [ ] Komponen `RingkasanBooking` (breakdown biaya sewa + F&B + total)

---

## Fitur 2: Pembayaran

**Scope**: UC7 (Pembayaran) — finalisasi transaksi, konfirmasi admin, struk  
**Status saat ini**: `PaymentController` hanya ada di spec, belum ada kode sama sekali.

---

### Phase 2.1 — Database Schema

```sql
-- Tabel payment (log transaksi pembayaran)
create table payment (
  id              serial primary key,
  pemesanan_id    int references pemesanan(id),
  metode          text not null,               -- 'Tunai' | 'Transfer' | 'QRIS'
  jumlah_bayar    numeric(10,2) not null,
  kembalian       numeric(10,2) default 0,
  verified_by     uuid references auth.users(id), -- adminID
  verified_at     timestamptz,
  created_at      timestamptz default now()
);
```

**Checklist**:
- [ ] Buat tabel `payment`
- [ ] Tambah kolom `admin_id` ke tabel `pemesanan` (untuk assign admin yang verifikasi)

---

### Phase 2.2 — Server Actions

**File**: `src/app/payment/actions.ts`

#### 1. `getBookingForPayment(pemesananID)`
- Query `pemesanan` join `meja`, `pemesanan_detail` join `menu_fnb`
- Return data lengkap untuk ditampilkan di halaman pembayaran
- Guard: hanya bisa diakses oleh user pemilik booking atau admin

#### 2. `processPayment(pemesananID, metode, jumlahBayar)`
- Validasi: `jumlahBayar >= total_tagihan`
- Hitung `kembalian = jumlahBayar - total_tagihan`
- Insert ke tabel `payment`
- Update `pemesanan.status_pembayaran` → `'Menunggu Verifikasi'`
- Return `{ success, kembalian, paymentID }`

#### 3. `verifyPayment(pemesananID, adminID, status)` — **Admin only**
- Validasi bahwa requester adalah admin (cek role di Supabase auth metadata)
- Jika `status = 'approve'`:
  - Update `pemesanan.status_pembayaran` → `'Lunas'`
  - Update `meja.status` → `'Tersedia'`
  - Set `payment.verified_by` dan `payment.verified_at`
- Jika `status = 'reject'`:
  - Update `pemesanan.status_pembayaran` → `'Batal'`
  - Rollback stok menu F&B
  - Update `meja.status` → `'Tersedia'`

#### 4. `generateStruk(pemesananID)`
- Query semua data transaksi (pemesanan + detail + payment)
- Return objek terstruktur untuk di-render sebagai struk
- (Opsional tahap lanjut: generate PDF via `jsPDF` atau `react-pdf`)

**Checklist**:
- [ ] `getBookingForPayment`
- [ ] `processPayment` (dengan validasi kembalian)
- [ ] `verifyPayment` (admin only, dengan guard role)
- [ ] `generateStruk` (return data terstruktur)

---

### Phase 2.3 — UI Pages

#### `src/app/payment/[id]/page.tsx` — Halaman Pembayaran (User)
```
Tampilkan:
  - Ringkasan booking (meja, durasi, waktu)
  - Breakdown biaya (sewa + F&B)
  - Total tagihan (highlight)

Form pembayaran:
  - Dropdown metode: Tunai / Transfer / QRIS
  - Input jumlah bayar (jika Tunai, auto-hitung kembalian)
  - Tombol "Proses Pembayaran" → processPayment()

State setelah submit:
  - Loading state saat server action berjalan
  - Success: tampilkan kembalian + instruksi tunggu verifikasi admin
  - Error: tampilkan pesan error
```

#### `src/app/admin/payment/page.tsx` — Halaman Verifikasi (Admin)
```
Tabel daftar pemesanan dengan status 'Menunggu Verifikasi':
  - Kolom: ID, Nama User, Meja, Total, Metode, Waktu
  - Tombol per row: "Approve" | "Reject" → verifyPayment()

Filter: All | Pending | Lunas | Batal
```

#### `src/app/payment/[id]/struk/page.tsx` — Halaman Struk
```
Layout struk (print-friendly):
  - Header: Logo 8BPOS + tanggal/waktu
  - Detail meja + durasi + tarif
  - Daftar item F&B + subtotal
  - Total tagihan + metode bayar + kembalian
  - Footer: "Terima kasih" + ID transaksi

Tombol: "Print" (window.print()) | "Kembali ke Home"
```

**Checklist**:
- [ ] `src/app/payment/[id]/page.tsx` (form pembayaran user)
- [ ] `src/app/admin/payment/page.tsx` (dashboard verifikasi admin)
- [ ] `src/app/payment/[id]/struk/page.tsx` (struk transaksi)
- [ ] Komponen `RingkasanTagihan` (reusable, dipakai di booking + payment)
- [ ] Guard middleware untuk route `/admin/*` (cek role admin)

---

## Urutan Eksekusi Rekomendasi

```
Week 1 — Foundation
  [x] Auth (login/logout/signup) ← sudah selesai
  [ ] Database schema: semua tabel (Phase 1.1 + 2.1)
  [ ] Seed data meja + menu F&B

Week 2 — Booking Flow
  [ ] Server actions cariMeja + getMenuFnB (Phase 1.2)
  [ ] Update createBooking dengan hitungTotalBiaya (Phase 1.2)
  [ ] UI halaman booking multi-step (Phase 1.3)
  [ ] UI detail booking /booking/[id] (Phase 1.3)

Week 3 — Payment Flow
  [ ] Server actions payment (Phase 2.2)
  [ ] UI halaman payment user (Phase 2.3)
  [ ] UI halaman struk (Phase 2.3)
  [ ] UI admin verifikasi payment (Phase 2.3)
  [ ] Guard middleware admin route
```

---

## Catatan Teknis Penting

| Hal | Keputusan |
|-----|-----------|
| Kalkulasi biaya | Selalu pakai algoritma `hitungTotalBiaya` dari `project-context.md` |
| Auth admin | Gunakan Supabase `user_metadata.role = 'admin'` untuk guard |
| State multi-step booking | `useState` di Client Component, tidak perlu URL params |
| Overlap detection meja | Query dengan `NOT EXISTS` pada rentang waktu di `pemesanan` |
| Kembalian uang | Hitung di server action, bukan di client |
| RLS Supabase | Setiap tabel harus ada policy, jangan disable RLS |
