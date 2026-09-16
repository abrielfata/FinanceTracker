# 📋 Dokumen Skenario Pengujian (Test Cases) - FiTrack (Finance Tracker)
**Versi:** 1.0  
**Referensi:** `PRD.md` (Versi 2.0 - Emerald Editorial)  
**QA Specialist & PRD Guardian:** Hermes QA Engine  

---

## 📑 Ringkasan Modul Pengujian
1. [Modul 1: Autentikasi & Otorisasi (Auth)](#1-modul-autentikasi--otorisasi-auth)
2. [Modul 2: Manajemen Transaksi](#2-modul-manajemen-transaksi)
3. [Modul 3: Manajemen Budget](#3-modul-manajemen-budget)
4. [Modul 4: Manajemen Tagihan (Bills)](#4-modul-manajemen-tagihan-bills)
5. [Modul 5: Dashboard & Visualisasi](#5-modul-dashboard--visualisasi)
6. [Modul 6: UI/UX & System Resilience Compliance](#6-modul-uiux--system-resilience-compliance)

---

## 1. Modul Autentikasi & Otorisasi (Auth)

| ID Test | Nama Skenario | Langkah Pengujian | Hasil Ekspektasi (PRD) | Status |
|---|---|---|---|---|
| **AUTH-HP-001** | Registrasi Akun Baru (Happy Path) | 1. Buka halaman `/register`<br>2. Isi Nama, Email valid, dan Password kuat<br>3. Klik tombol "Daftar" | User berhasil terdaftar, diarahkan ke halaman login atau dashboard, muncul `toast.success` | `[x] PASS` |
| **AUTH-HP-002** | Login Pengguna Valid (Happy Path) | 1. Buka halaman `/login`<br>2. Masukkan Email & Password yang benar<br>3. Klik "Masuk" | Backend mengembalikan `accessToken` (in-memory Zustand) & set `refreshToken` di `httpOnly cookie`. User diarahkan ke `/dashboard`, muncul `toast.success` | `[x] PASS` |
| **AUTH-HP-003** | Silent Refresh Token Otomatis | 1. Login ke aplikasi<br>2. Tunggu token 15 menit kedaluwarsa atau muat ulang browser | `App.tsx` / Axios Interceptor memanggil `/api/auth/refresh` secara otomatis dan transparan tanpa logout paksa | `[ ] Belum Diuji` |
| **AUTH-HP-004** | Logout dengan Dialog Konfirmasi | 1. Klik menu "Logout" di Sidebar / Pengaturan<br>2. Konfirmasi pada modal `ConfirmDialog` | Cookie `refreshToken` dibersihkan, state auth direset, user diredirect ke `/login`, muncul `toast.success` | `[x] PASS` |
| **AUTH-NEG-001** | Registrasi dengan Form Kosong | 1. Buka `/register`<br>2. Klik tombol "Daftar" tanpa mengisi input | Muncul pesan error validasi Zod pada field Nama, Email, dan Password. Form tidak ter-submit | `[x] PASS` |
| **AUTH-NEG-002** | Registrasi dengan Format Email Invalid | 1. Buka `/register`<br>2. Masukkan email tidak valid (contoh: `fata@invalid`)<br>3. Klik "Daftar" | Muncul pesan error validasi email Zod; request ditolak | `[ ] Belum Diuji` |
| **AUTH-NEG-003** | Registrasi dengan Email Terduplikasi | 1. Buka `/register`<br>2. Masukkan email yang sudah terdaftar<br>3. Klik "Daftar" | Backend mengembalikan error `AppError` 400/409, muncul `toast.error` ("Email sudah digunakan") | `[ ] Belum Diuji` |
| **AUTH-NEG-004** | Login dengan Password Salah | 1. Buka `/login`<br>2. Masukkan email benar dan password salah<br>3. Klik "Masuk" | Muncul `toast.error` ("Email atau password salah"), status HTTP 401 | `[ ] FAIL` |
| **AUTH-NEG-005** | Login Rate Limiting (Brute Force Protection) | 1. Lakukan percobaan login gagal sebanyak >10 kali dalam 15 menit | Request diblokir oleh `express-rate-limit` dengan status HTTP 429 ("Terlalu banyak percobaan login"), muncul `toast.error` | `[x] PASS` |
| **AUTH-NEG-006** | Akses Protected Route Tanpa Login | 1. Buka langsung URL `/dashboard` atau `/transaksi` saat status belum login | Komponen `ProtectedRoute` memblokir akses dan mengalihkan user ke `/login` | `[ ] Belum Diuji` |
| **AUTH-NEG-007** | Refresh Token Kedaluwarsa / Rusak | 1. Hapus atau modifikasi nilai cookie `refreshToken`<br>2. Akses aplikasi | Request refresh gagal, user diredirect ke `/login` tanpa loop tak hingga | `[ ] Belum Diuji` |

---

## 2. Modul Manajemen Transaksi

| ID Test | Nama Skenario | Langkah Pengujian | Hasil Ekspektasi (PRD) | Status |
|---|---|---|---|---|
| **TRX-HP-001** | Tambah Transaksi Pemasukan (Happy Path) | 1. Buka halaman `/transaksi`<br>2. Klik tombol "Tambah Transaksi"<br>3. Pilih Jenis: "Pemasukan", isi nominal, kategori, tanggal, deskripsi<br>4. Klik "Simpan" | Transaksi tersimpan di DB, modal tertutup, data muncul di tabel teratas, muncul `toast.success` | `[x] PASS` |
| **TRX-HP-002** | Tambah Transaksi Pengeluaran (Happy Path) | 1. Buka modal tambah transaksi<br>2. Pilih Jenis: "Pengeluaran", isi nominal, kategori valid, tanggal<br>3. Klik "Simpan" | Transaksi pengeluaran tersimpan, saldo berkurang, muncul `toast.success` | `[ ] Belum Diuji` |
| **TRX-HP-003** | Edit Transaksi yang Ada | 1. Klik tombol edit pada salah satu transaksi<br>2. Ubah nominal atau kategori<br>3. Klik "Perbarui" | Data transaksi terupdate di DB dan tabel transaksi, muncul `toast.success` | `[x] PASS` |
| **TRX-HP-004** | Hapus Transaksi dengan Konfirmasi | 1. Klik tombol hapus pada salah satu transaksi<br>2. Modal `ConfirmDialog` muncul<br>3. Klik "Konfirmasi Hapus" | Data terhapus dari DB dan daftar transaksi langsung terupdate, muncul `toast.success` | `[x] PASS` |
| **TRX-HP-005** | Filter dan Search Transaksi | 1. Pilih jenis transaksi via `DropdownFilter`<br>2. Ketik kata kunci pada search bar | Daftar transaksi terfilter secara reaktif sesuai jenis dan teks pencarian | `[ ] Belum Diuji` |
| **TRX-HP-006** | Pagination / "Muat Lebih Banyak" | 1. Masuk ke halaman transaksi dengan >10 item<br>2. Klik tombol "Muat Lebih Banyak" | Data transaksi berikutnya di-fetch via query `page` & `limit` dan ditambahkan ke list tanpa refresh | `[ ] Belum Diuji` |
| **TRX-HP-007** | Ekspor Data ke Excel (.xlsx) | 1. Buka halaman `/transaksi`<br>2. Klik tombol "Ekspor Excel" | Berkas `.xlsx` terunduh dengan format header rapi, currency Rupiah, dan tanggal terformat via `ExcelJS` | `[ ] Belum Diuji` |
| **TRX-NEG-001** | Tambah Transaksi dengan Nominal 0 atau Negatif | 1. Buka form tambah transaksi<br>2. Masukkan nominal `0` atau minus `-50000`<br>3. Klik "Simpan" | Form dicegat validasi Zod / backend `AppError` ("Nominal harus lebih dari 0") | `[x] PASS` |
| **TRX-NEG-002** | Tambah Transaksi tanpa Memilih Kategori | 1. Kosongkan pilihan kategori<br>2. Submit form | Validasi Zod menampilkan error "Kategori wajib dipilih" | `[ ] Belum Diuji` |
| **TRX-NEG-003** | Batalkan Dialog Hapus Transaksi | 1. Klik hapus pada transaksi<br>2. Klik tombol "Batal" pada `ConfirmDialog` | Modal tertutup, data transaksi tetap utuh dan tidak terhapus | `[x] PASS` |
| **TRX-EDGE-001** | Nominal Transaksi Sangat Besar (BigInt Handling) | 1. Tambah transaksi dengan nominal Rp 1.000.000.000.000 (1 Triliun)<br>2. Simpan transaksi | Tipe data `bigint` di DB dan `formatRupiah` di UI menangani angka besar tanpa presisi hilang/overflow | `[ ] Belum Diuji` |

---

## 3. Modul Manajemen Budget

| ID Test | Nama Skenario | Langkah Pengujian | Hasil Ekspektasi (PRD) | Status |
|---|---|---|---|---|
| **BDG-HP-001** | Set Budget Kategori Baru (Happy Path) | 1. Buka halaman `/budget`<br>2. Klik "Atur Budget"<br>3. Pilih kategori, nominal, bulan, tahun<br>4. Klik "Simpan" | Budget tersimpan, progress bar penggunaan budget tampil dengan rasio yang sesuai, `toast.success` | `[ ] Belum Diuji` |
| **BDG-HP-002** | Edit Batas Nominal Budget | 1. Klik edit pada kartu budget kategori tertentu<br>2. Naikkan nominal budget<br>3. Klik "Perbarui" | Nominal budget diperbarui, persentase progress bar langsung menyesuaikan, muncul `toast.success` | `[ ] Belum Diuji` |
| **BDG-HP-003** | Hapus Budget Kategori | 1. Klik hapus pada budget<br>2. Konfirmasi pada `ConfirmDialog` | Budget terhapus, kartu budget hilang dari daftar, muncul `toast.success` | `[ ] Belum Diuji` |
| **BDG-HP-004** | Filter Budget Berdasarkan Bulan & Tahun | 1. Ganti periode via `MonthSelector` | Daftar budget menampilkan data sesuai bulan & tahun yang dipilih | `[ ] Belum Diuji` |
| **BDG-NEG-001** | Duplikasi Budget Kategori pada Bulan yang Sama | 1. Tambah budget untuk kategori "Makanan" di bulan berjalan<br>2. Coba tambahkan budget baru untuk kategori "Makanan" di bulan yang sama | Ditolak oleh constraint UNIQUE `(user_id, kategori, bulan, tahun)` dengan pesan error yang jelas | `[ ] Belum Diuji` |
| **BDG-NEG-002** | Input Budget dengan Nominal Kosong / Invalid | 1. Masukkan nominal `0` atau huruf<br>2. Klik "Simpan" | Form dicegat validasi Zod dengan pesan kesalahan | `[ ] Belum Diuji` |
| **BDG-EDGE-001** | Peringatan Over-Budget (>100%) | 1. Catat transaksi pengeluaran melebihi batas budget kategori<br>2. Buka halaman `/budget` dan periksa notifikasi | Progress bar berubah warna menjadi indikator bahaya (merah) dan notifikasi peringatan muncul di `NotificationDropdown` | `[ ] Belum Diuji` |

---

## 4. Modul Manajemen Tagihan (Bills)

| ID Test | Nama Skenario | Langkah Pengujian | Hasil Ekspektasi (PRD) | Status |
|---|---|---|---|---|
| **TAG-HP-001** | Tambah Template Tagihan Rutin (Happy Path) | 1. Buka halaman `/tagihan`<br>2. Klik "Tambah Tagihan"<br>3. Masukkan Nama, Nominal, Jatuh Tempo (1-31), Kategori, `is_berulang: true`<br>4. Klik "Simpan" | Template tagihan tersimpan di tabel `tagihan` dan status bulan aktif dibuat di `tagihan_bulan`, `toast.success` | `[ ] Belum Diuji` |
| **TAG-HP-002** | Tandai Tagihan Lunas | 1. Pada kartu tagihan bulan berjalan, klik tombol "Tandai Lunas" | Status di `tagihan_bulan` berubah menjadi `lunas`, field `tanggal_bayar` terisi timestamp sekarang, muncul `toast.success` | `[ ] Belum Diuji` |
| **TAG-HP-003** | Batalkan Status Lunas (Revert ke Belum Lunas) | 1. Pada tagihan yang sudah lunas, ubah status kembali menjadi "Belum Lunas" | Status berubah menjadi `belum_lunas`, `tanggal_bayar` diset `null`, `toast.success` | `[ ] Belum Diuji` |
| **TAG-HP-004** | Hapus Tagihan dengan Cascade | 1. Klik hapus tagihan<br>2. Konfirmasi pada `ConfirmDialog` | Template tagihan dan seluruh relasi `tagihan_bulan` terhapus (cascade delete), `toast.success` | `[ ] Belum Diuji` |
| **TAG-NEG-001** | Input Jatuh Tempo di Luar Rentang 1–31 | 1. Masukkan tanggal jatuh tempo `0` atau `32`<br>2. Klik "Simpan" | Form dicegat validasi Zod ("Tanggal jatuh tempo harus antara 1-31") | `[ ] Belum Diuji` |
| **TAG-NEG-002** | Tambah Tagihan dengan Field Nama Kosong | 1. Kosongkan nama tagihan<br>2. Submit form | Validasi Zod mencegah submit ("Nama tagihan wajib diisi") | `[ ] Belum Diuji` |
| **TAG-EDGE-001** | Deteksi Otomatis Status Tagihan Terlambat | 1. Tagihan belum lunas melewati tanggal jatuh tempo di bulan berjalan | Sistem menandai status menjadi `terlambat` dan menampilkan badge peringatan | `[ ] Belum Diuji` |

---

## 5. Modul Dashboard & Visualisasi

| ID Test | Nama Skenario | Langkah Pengujian | Hasil Ekspektasi (PRD) | Status |
|---|---|---|---|---|
| **DSH-HP-001** | Kalkulasi Akurat Ringkasan Saldo (KPI Card) | 1. Buka halaman `/dashboard`<br>2. Periksa Total Pemasukan, Total Pengeluaran, dan Saldo Bersih | Nilai matematis sesuai: `Saldo = Total Pemasukan - Total Pengeluaran` untuk bulan & tahun yang aktif | `[ ] Belum Diuji` |
| **DSH-HP-002** | Render Grafik Tren Keuangan 6 Bulan | 1. Buka dashboard<br>2. Periksa komponen grafik Recharts | Bar Chart menampilkan perbandingan pemasukan vs pengeluaran 6 bulan terakhir dengan rendering rapi | `[ ] Belum Diuji` |
| **DSH-HP-003** | Widget Tagihan Terdekat & Notifikasi | 1. Buka dashboard dengan tagihan jatuh tempo terdekat | Tagihan paling mendekati jatuh tempo tampil pada widget dashboard dengan indikator hari | `[ ] Belum Diuji` |
| **DSH-HP-004** | Ganti Periode Bulan & Tahun Dashboard | 1. Pilih bulan & tahun lain via `MonthSelector` | Parameter `bulan` dan `tahun` dikirim sebagai `number` ke API, seluruh widget dashboard reload data yang sesuai | `[ ] Belum Diuji` |
| **DSH-EDGE-001** | Empty State Dashboard Pengguna Baru | 1. Login menggunakan akun baru tanpa data transaksi/budget/tagihan | Dashboard menampilkan state kosong yang rapi tanpa error crash/grafik rusak | `[ ] Belum Diuji` |

---

## 6. Modul UI/UX & System Resilience Compliance

| ID Test | Nama Skenario | Langkah Pengujian | Hasil Ekspektasi (PRD) | Status |
|---|---|---|---|---|
| **UI-CMP-001** | Implementasi Skeleton Loading | 1. Buka halaman Dashboard/Transaksi saat jaringan lambat (Throttle 3G) | Komponen `<Skeleton />` (pulse animation) tampil selama `isLoading = true`, tidak ada blank screen | `[ ] Belum Diuji` |
| **UI-CMP-002** | Desain Sistem Tema Emerald Editorial | 1. Inspeksi seluruh komponen UI, warna, dan token | Menggunakan token Tailwind semantik (Emerald palette), typography editorial yang konsisten | `[ ] Belum Diuji` |
| **UI-CMP-003** | Kepatuhan Border Radius (Anti-Sharp Corners) | 1. Periksa modal, card, button, dan container | Semua elemen container menggunakan `rounded-xl` atau `rounded-3xl`, tidak ada sharp edge | `[ ] Belum Diuji` |
| **UI-CMP-004** | Wajib Dialog Konfirmasi pada Aksi Destruktif | 1. Lakukan aksi Hapus Transaksi, Hapus Budget, Hapus Tagihan, dan Logout | Seluruh aksi destruktif menampilkan modal `<ConfirmDialog />` sebelum eksekusi | `[ ] Belum Diuji` |
| **UI-CMP-005** | Standarisasi Notifikasi Toast | 1. Lakukan operasi CRUD sukses dan skenario error | Muncul `toast.success` untuk aksi berhasil dan `toast.error` untuk kegagalan via `react-hot-toast` | `[ ] Belum Diuji` |
| **UI-CMP-006** | Responsivitas Tampilan Mobile & Desktop | 1. Buka aplikasi di viewport Mobile (375px), Tablet (768px), dan Desktop (1440px) | Layout AppLayout, Sidebar (collapsible/drawer), dan tabel/kartu menyesuaikan tanpa overflow horizontal | `[ ] Belum Diuji` |
| **UI-CMP-007** | Penanganan Koneksi Terputus / Server Down | 1. Matikan backend/database<br>2. Lakukan request di frontend | Axios interceptor menangkap error jaringan, menampilkan `toast.error` yang informatif, UI tidak crash | `[ ] Belum Diuji` |

---

## 📊 Matriks Ringkasan Status Uji
- **Total Test Cases:** 38
- **PASS:** 10
- **FAIL:** 1
- **Belum Diuji:** 27
- **Coverage:** Auth (11), Transaksi (11), Budget (7), Tagihan (7), Dashboard (5), UI/UX Compliance (7)
