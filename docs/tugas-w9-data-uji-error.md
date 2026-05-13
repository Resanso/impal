# Ragam Uji Data Masukan ERROR – Form IMK
## Aplikasi 8BPOS (Sistem Billing Biliar)

**Tugas Kelompok – Week #9**
**Mata Kuliah:** Interaksi Manusia-Komputer (IMK)

---

## Form 1 – Login & Registrasi

**Tujuan Form:** Autentikasi pengguna agar bisa mengakses sistem booking biliar.

**Field yang tersedia:**
- Email
- Password

### Tabel Data Uji ERROR

| No | Field | Data Uji (TIDAK BENAR) | Kondisi Error | Pesan Error yang Diharapkan |
|----|-------|------------------------|---------------|-----------------------------|
| 1 | Email | *(dikosongkan)* | Field wajib diisi | "Email tidak boleh kosong" |
| 2 | Email | `usercontoh.com` | Format email salah (tidak ada `@`) | "Format email tidak valid" |
| 3 | Email | `user@` | Format email tidak lengkap | "Format email tidak valid" |
| 4 | Email | `tidakada@email.com` | Email belum terdaftar di sistem | "Email atau password salah" |
| 5 | Password | *(dikosongkan)* | Field wajib diisi | "Password tidak boleh kosong" |
| 6 | Password | `abc` | Password kurang dari 6 karakter | "Password minimal 6 karakter" |
| 7 | Password | `salahpass123` | Password tidak sesuai dengan email | "Email atau password salah" |
| 8 | Email + Password | *(keduanya kosong)* | Semua field kosong | "Email tidak boleh kosong" |

### Kasus Khusus – Form Registrasi

| No | Field | Data Uji (TIDAK BENAR) | Kondisi Error | Pesan Error yang Diharapkan |
|----|-------|------------------------|---------------|-----------------------------|
| 9  | Email | `user@gmail.com` | Email sudah pernah didaftarkan | "Email sudah digunakan, silakan login" |
| 10 | Password | `12345` | Password terlalu pendek | "Password minimal 6 karakter" |

---

## Form 2 – Booking Meja (Pilih Jadwal)

**Tujuan Form:** User memilih tanggal, waktu mulai, dan durasi sewa meja biliar.

**Field yang tersedia:**
- Tanggal
- Waktu Mulai
- Durasi (pilihan: 30, 60, 90, 120, 180 menit)

### Tabel Data Uji ERROR

| No | Field | Data Uji (TIDAK BENAR) | Kondisi Error | Pesan Error yang Diharapkan |
|----|-------|------------------------|---------------|-----------------------------|
| 1 | Tanggal | *(dikosongkan)* | Field wajib diisi | "Tanggal harus dipilih" |
| 2 | Tanggal | `2024-01-01` | Tanggal sudah lampau (masa lalu) | "Tanggal tidak boleh di masa lalu" |
| 3 | Tanggal | `2026-02-30` | Tanggal tidak valid (Februari tidak memiliki 30 hari) | Browser/input memblokir input tidak valid |
| 4 | Waktu Mulai | `25:00` | Jam di luar rentang valid (00:00–23:59) | Browser/input memblokir input tidak valid |
| 5 | Waktu Mulai | *(dikosongkan)* | Field wajib diisi | "Waktu mulai harus diisi" |
| 6 | Waktu Mulai | `23:30` + Durasi 120 menit | Waktu selesai melewati tengah malam (01:30) | "Waktu selesai tidak boleh melewati 24:00" |
| 7 | Durasi | *(tidak dipilih)* | Belum ada durasi yang dipilih | "Durasi harus dipilih" |
| 8 | Semua Field | Tanggal valid, waktu valid, durasi valid | Semua meja terpakai di slot waktu tersebut | "Tidak ada meja tersedia untuk jadwal ini" |

---

## Form 3 – Pembayaran (Data Pemesan)

**Tujuan Form:** User melengkapi data diri sebelum diarahkan ke halaman pembayaran Mayar.

**Field yang tersedia:**
- Nama Lengkap
- No. WhatsApp

### Tabel Data Uji ERROR

| No | Field | Data Uji (TIDAK BENAR) | Kondisi Error | Pesan Error yang Diharapkan |
|----|-------|------------------------|---------------|-----------------------------|
| 1 | Nama Lengkap | *(dikosongkan)* | Field wajib diisi | "Nama tidak boleh kosong" |
| 2 | Nama Lengkap | `A` | Nama terlalu pendek, tidak representatif | "Nama minimal 2 karakter" |
| 3 | Nama Lengkap | `1234567890` | Nama mengandung angka saja | "Nama hanya boleh berisi huruf" |
| 4 | Nama Lengkap | `@#$%^&*()` | Nama mengandung karakter simbol | "Nama mengandung karakter tidak valid" |
| 5 | No. WhatsApp | *(dikosongkan)* | Field wajib diisi | "No. WhatsApp tidak boleh kosong" |
| 6 | No. WhatsApp | `0812` | Nomor terlalu pendek (kurang dari 10 digit) | "No. WhatsApp tidak valid (min. 10 digit)" |
| 7 | No. WhatsApp | `abcdefghij` | Nomor mengandung huruf | "No. WhatsApp hanya boleh berisi angka" |
| 8 | No. WhatsApp | `+62 812 XXXX XXXX` | Format tidak konsisten / ada spasi dan huruf | "Format nomor tidak valid" |
| 9 | No. WhatsApp | `99999999999` | Nomor tidak berawalan 08 atau +62 | "Masukkan nomor WhatsApp Indonesia yang valid" |
| 10 | Nama + WhatsApp | *(keduanya kosong)* | Semua field kosong, form di-submit | "Nama tidak boleh kosong" |

---

## Ringkasan Jumlah Data Uji

| Form | Jumlah Data Uji Error |
|------|-----------------------|
| Form 1 – Login & Registrasi | 10 kasus |
| Form 2 – Booking Meja (Pilih Jadwal) | 8 kasus |
| Form 3 – Pembayaran (Data Pemesan) | 10 kasus |
| **Total** | **28 kasus** |

---

## Catatan Metodologi

Data uji error di atas mencakup 4 kategori kesalahan input sesuai prinsip IMK:

1. **Field Kosong** – Input tidak diisi sama sekali (No. 1, 5 di setiap form)
2. **Format Salah** – Input diisi tetapi formatnya tidak sesuai (email tanpa `@`, nomor berisi huruf)
3. **Nilai Tidak Logis** – Input secara teknis valid tetapi tidak masuk akal (tanggal lampau, jam > 24:00)
4. **Konflik Data** – Input valid secara format tetapi bertabrakan dengan data sistem (email sudah terdaftar, semua meja terpakai)
