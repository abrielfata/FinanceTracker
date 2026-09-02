# 📘 Product Requirements Document (PRD) & Architecture Guide
**Aplikasi: FiTrack (Finance Tracker)**
**Versi Dokumen:** 2.0 — Disesuaikan dengan sistem aktual

> Dokumen ini adalah **Single Source of Truth** untuk pemeliharaan dan pengembangan FiTrack.
> AI atau Developer yang akan melanjutkan proyek ini **wajib membaca dokumen ini terlebih dahulu** sebelum menyentuh kode apapun.

---

## 1. 🎯 Deskripsi Produk
FiTrack adalah aplikasi **pencatatan keuangan pribadi** (*Personal Finance Tracker*) yang dirancang dengan tampilan premium bergaya "Emerald Editorial". Pengguna dapat mencatat transaksi harian, mengatur budget bulanan per kategori, melacak tagihan rutin, serta memantau tren keuangan 6 bulan terakhir semuanya dalam satu dashboard yang terintegrasi.

---

## 2. 🛠️ Tech Stack Aktual

| Layer | Teknologi |
|---|---|
| **Frontend Framework** | React 18 + Vite + TypeScript |
| **Styling** | Tailwind CSS v3 (dengan sistem token warna di `tailwind.config.js`) |
| **State Management** | Zustand (`useAuthStore`) |
| **HTTP Client** | Axios (dengan Interceptor otomatis untuk token refresh) |
| **Routing** | React Router DOM v7 |
| **Grafik** | Recharts (Bar Chart tren bulanan) |
| **Form Handling** | React Hook Form + Zod (validasi) |
| **Ekspor Data** | ExcelJS + file-saver (`.xlsx` berformat rapi) |
| **Notifikasi UI** | react-hot-toast |
| **Backend Runtime** | Node.js + Express.js + TypeScript (dijalankan via `tsx watch`) |
| **ORM** | **Drizzle ORM** (`drizzle-orm/pg-core`) |
| **Database** | **Neon PostgreSQL** (cloud-hosted, *serverless*) |
| **Auth** | JWT (accessToken 15 menit) + httpOnly Cookie (refreshToken 7 hari) |
| **Keamanan** | `helmet`, `cors`, `express-rate-limit` (Login/Register) |
| **Koneksi DB** | `@neondatabase/serverless` |

---

## 3. 📂 Struktur Direktori Aktual

```
Finance Tracker/
├── PRD.md                        ← Dokumen ini
├── backend/
│   ├── package.json              ← Scripts: db:push, db:migrate, db:generate
│   ├── drizzle.config.ts         ← Konfigurasi Drizzle Kit (koneksi ke Neon)
│   └── src/
│       ├── index.ts              ← Entry point: setup Express, middleware, routes
│       ├── db/
│       │   ├── index.ts          ← Koneksi Neon (drizzle + neon())
│       │   └── schema.ts         ← ⚠️ SEMUA TABEL DIDEFINISIKAN DI SINI
│       ├── routes/               ← Controller HTTP (thin layer, lempar ke service)
│       │   ├── auth.ts           ← Login, Register, Logout, Profile, Password
│       │   ├── transaksi.ts      ← CRUD Transaksi (+ pagination)
│       │   ├── budget.ts         ← CRUD Budget
│       │   ├── tagihan.ts        ← CRUD Tagihan + status per bulan
│       │   ├── dashboard.ts      ← Agregat summary + tren 6 bulan
│       │   └── notifications.ts  ← Notifikasi real-time (tagihan & budget)
│       ├── services/             ← Logika bisnis utama (dipisah dari route)
│       │   ├── auth.service.ts
│       │   ├── transaksi.service.ts
│       │   ├── budget.service.ts
│       │   ├── tagihan.service.ts
│       │   ├── dashboard.service.ts
│       │   └── notification.service.ts
│       ├── middleware/
│       │   ├── auth.ts           ← Validasi Bearer accessToken dari header
│       │   └── errorHandler.ts   ← Global error handler (AppError vs 500)
│       └── utils/
│           └── errors.ts         ← Kelas AppError (custom error dengan statusCode)
└── frontend/
    └── src/
        ├── App.tsx               ← Inisialisasi app: silent token refresh + routing
        ├── index.css             ← Variabel CSS global (warna tema Emerald)
        ├── main.tsx              ← ReactDOM.render
        ├── lib/
        │   └── axios.ts          ← ⚠️ Axios instance + Interceptor (auto token refresh)
        ├── store/
        │   └── useAuthStore.ts   ← Zustand: user, accessToken, isAuthenticated
        ├── utils/
        │   └── helpers.ts        ← formatRupiah, formatTanggal, KATEGORI_ICON, exportToExcel
        ├── pages/
        │   ├── Dashboard.tsx     ← Ringkasan saldo, budget, tagihan terdekat + grafik tren
        │   ├── Transaksi.tsx     ← CRUD transaksi, filter, sort, search, pagination
        │   ├── Budget.tsx        ← CRUD budget bulanan per kategori
        │   ├── Tagihan.tsx       ← CRUD tagihan rutin + ubah status lunas/belum
        │   ├── Pengaturan.tsx    ← Ubah profil, ubah password, logout
        │   ├── Login.tsx         ← Halaman login
        │   └── Register.tsx      ← Halaman register
        └── components/
            ├── layout/
            │   ├── AppLayout.tsx          ← Wrapper: Sidebar + konten utama
            │   ├── Sidebar.tsx            ← Navigasi kiri (Dashboard, Transaksi, Budget, Tagihan, Pengaturan)
            │   ├── Header.tsx             ← Header halaman + tombol notifikasi
            │   ├── NotificationDropdown.tsx ← Dropdown notifikasi real-time
            │   └── ProtectedRoute.tsx     ← Guard: redirect ke /login jika belum auth
            ├── ui/
            │   ├── Modal.tsx              ← Modal reusable
            │   ├── ConfirmDialog.tsx      ← Dialog konfirmasi hapus/logout
            │   ├── MonthSelector.tsx      ← Dropdown pilih bulan & tahun
            │   ├── DropdownFilter.tsx     ← Dropdown filter jenis transaksi
            │   └── Skeleton.tsx           ← Komponen skeleton loading (pulse animation)
            ├── budget/
            │   └── BudgetForm.tsx         ← Form tambah/edit budget
            ├── tagihan/
            │   └── TagihanForm.tsx        ← Form tambah/edit tagihan
            └── transaksi/
                └── TransaksiForm.tsx      ← Form tambah/edit transaksi
```

---

## 4. 🗄️ Skema Database Aktual (Drizzle + Neon PostgreSQL)

### Tabel: `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `nama` | text | Nama pengguna |
| `email` | text (unique) | Email login |
| `password_hash` | text | Hash bcrypt |
| `created_at` | timestamp | Waktu registrasi |

### Tabel: `transaksi`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK → users) | Cascade delete |
| `jenis` | text | `pemasukan` atau `pengeluaran` |
| `nominal` | bigint | Nilai dalam Rupiah |
| `kategori` | text | Lihat daftar kategori di `helpers.ts` |
| `deskripsi` | text (nullable) | |
| `tanggal` | date | Default: CURRENT_DATE |
| `created_at` | timestamp | |

### Tabel: `budget`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK → users) | Cascade delete |
| `kategori` | text | |
| `nominal` | bigint | Batas budget |
| `bulan` | integer | 1–12 |
| `tahun` | integer | |
| `created_at` | timestamp | |
| **UNIQUE** | `(user_id, kategori, bulan, tahun)` | Satu kategori per bulan |

### Tabel: `tagihan`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID (PK) | Template tagihan rutin |
| `user_id` | UUID (FK → users) | |
| `nama` | text | Nama tagihan |
| `nominal` | bigint | |
| `tanggal_jatuh_tempo` | integer | Tanggal (1–31) |
| `kategori` | text | Default: `Lainnya` |
| `catatan` | text (nullable) | |
| `is_berulang` | boolean | Default: true |
| `created_at` | timestamp | |

### Tabel: `tagihan_bulan`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID (PK) | Status per bulan |
| `tagihan_id` | UUID (FK → tagihan) | Cascade delete |
| `user_id` | UUID (FK → users) | |
| `bulan` | integer | 1–12 |
| `tahun` | integer | |
| `status` | text | `belum_lunas` / `lunas` / `terlambat` |
| `tanggal_bayar` | timestamp (nullable) | Diisi saat lunas |
| `created_at` | timestamp | |
| **UNIQUE** | `(tagihan_id, bulan, tahun)` | Satu status per tagihan per bulan |

---

## 5. 🔐 Sistem Autentikasi

Autentikasi menggunakan **mekanisme ganda** (Dual Token):

1. **`accessToken`** (JWT, umur 15 menit): Dikembalikan di body JSON setelah login, disimpan *in-memory* di `useAuthStore` (Zustand). Dikirim via `Authorization: Bearer <token>` di setiap request.
2. **`refreshToken`** (JWT, umur 7 hari): Disimpan di `httpOnly cookie` oleh server. Tidak bisa diakses JavaScript di browser (aman dari XSS).

**Alur Silent Refresh (saat buka aplikasi):**
- `App.tsx` memanggil `/api/auth/refresh` menggunakan cookie yang ada.
- Jika berhasil → dapatkan `accessToken` baru → lanjut ke dashboard.
- Jika gagal (cookie tidak ada/kadaluarsa) → redirect ke `/login`.

**Axios Interceptor (`src/lib/axios.ts`):**
- Otomatis sisipkan `accessToken` ke setiap request.
- Jika server membalas `401` → interceptor panggil `/auth/refresh` secara otomatis → ulangi request awal → **transparan bagi pengguna**.

---

## 6. 🚀 Alur Kerja & Panduan Pengembangan

### 6.1 Prinsip Clean Code

1. **DRY (Don't Repeat Yourself)** — Ekstraksi logika berulang ke `helpers.ts` atau komponen baru.
2. **Single Responsibility** — Pisahkan *route* (HTTP handling) dari *service* (logika bisnis). Route hanya memanggil service.
3. **Penamaan Semantik**:
   - Komponen React → `PascalCase` (`BudgetForm.tsx`)
   - Fungsi/variabel → `camelCase` (`fetchTransaksi`, `isLoading`)
   - Dilarang singkatan ambigu (`ldng`, `usr`)
4. **Strict TypeScript** — Dilarang menggunakan `any` atau `// @ts-ignore`. Selalu buat `interface` atau `type` untuk setiap *payload* dan *response* API.
5. **Separation of Concerns** — Logika kalkulasi berat ke `useMemo` atau service; jangan campur aduk dengan JSX.
6. **Warna via Token** — Gunakan kelas Tailwind semantik (`text-primary`, `bg-surface-container`). Dilarang hardcode HEX di JSX jika sudah ada token.

### 6.2 Cara Modifikasi Database
1. Edit `backend/src/db/schema.ts`.
2. Jalankan `npm run db:push` di folder `backend`.
3. Restart server backend.

### 6.3 Cara Tambah Fitur Baru (Pola Standar)
1. Buat/update tabel di `schema.ts` → jalankan `db:push`.
2. Buat service baru di `backend/src/services/`.
3. Buat route baru di `backend/src/routes/`, import service.
4. Daftarkan route di `backend/src/index.ts`.
5. Di frontend, buat halaman di `frontend/src/pages/`.
6. Tambah entry di `Sidebar.tsx` dan `App.tsx` (routing).

### 6.4 Panduan UI (Tampilan Wajib)
- **Skeleton Loading**: Selalu pakai `<Skeleton />` saat `isLoading = true`. Jangan pernah biarkan layar kosong.
- **Pagination**: Data banyak (Transaksi) → gunakan `page` + `limit` via query params, tampilkan tombol "Muat Lebih Banyak". Jangan tarik semua sekaligus.
- **Feedback Pengguna**: Selalu `toast.success` / `toast.error` setelah operasi CRUD.
- **Dialog Konfirmasi**: Setiap aksi **hapus** atau **logout** wajib menggunakan `<ConfirmDialog />`.
- **Border Radius**: Gunakan `rounded-xl` atau `rounded-3xl` — TIDAK BOLEH sharp corner.

### 6.5 Troubleshooting Umum
| Masalah | Solusi |
|---|---|
| Loop redirect ke `/login` | Cek apakah httpOnly cookie `refreshToken` ada dan belum expired |
| Data dashboard kosong | Pastikan param `bulan` dan `tahun` dikirim sebagai `number`, bukan `string` |
| Error 429 saat login | Rate limit aktif (10 req/15 menit). Tunggu atau ubah limit di `routes/auth.ts` saat dev |
| Drizzle query error | Pastikan `npm run db:push` sudah dijalankan setelah perubahan schema |
| Frontend tidak bisa hit API | Periksa `VITE_API_URL` di `.env` frontend dan `FRONTEND_URL` di `.env` backend |

---

## 7. 🤖 Panduan Khusus untuk AI Assistant

Halo AI di masa depan! Sebelum kamu mengerjakan apapun, perhatikan poin-poin wajib ini:

1. **Jangan ganti ORM** — Kita pakai **Drizzle ORM** + **Neon PostgreSQL**. Jangan pakai Prisma, raw SQL, atau ORM lain.
2. **Jangan ubah pola Auth** — Sistem Dual Token (JWT + httpOnly cookie) + Axios Interceptor harus dipertahankan.
3. **Jangan buat UI jelek** — Setiap komponen baru wajib mengikuti sistem token warna di `index.css`, menggunakan `rounded-xl/3xl`, dan memiliki `<Skeleton />` saat loading.
4. **Ikuti pola Route → Service** — Jangan tulis logika bisnis di dalam file route. Selalu pisahkan ke `services/`.
5. **Gunakan `AppError`** — Untuk error yang dikirim ke client, lempar `throw new AppError('pesan', statusCode)` dari service, bukan `res.status().json()` manual.
