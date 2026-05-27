# 🛒 POS SaaS — Point of Sales Multi-Tenant

Aplikasi Point of Sales berbasis web dengan arsitektur SaaS multi-tenant. Setiap toko memiliki data yang terisolasi, mendukung multi-cabang, dan manajemen role yang terstruktur.

---

## ✨ Fitur Utama

### 🏢 Multi-Tenant SaaS
- Setiap toko (tenant) memiliki data yang sepenuhnya terisolasi
- Owner tidak bisa mengakses data toko lain
- Admin platform dapat mengelola semua toko

### 👥 Role & Hierarki
| Role | Akses |
|------|-------|
| **Admin** | Kelola semua toko & pengguna di platform |
| **Owner** | Kelola toko, cabang, produk, laporan |
| **Branch Owner** | Kelola kasir, stok, laporan cabang |
| **Cashier** | Proses transaksi di kasir |

### 🏪 Manajemen Toko & Cabang
- Registrasi toko baru (self-register + approval admin)
- Multi-cabang per toko
- Manajemen pengguna per cabang

### 📦 Produk & Inventori
- Kategori produk
- Produk dengan barcode EAN-13 (auto-generate)
- Stok per cabang (terpisah)
- Audit log setiap perubahan stok (stock movements)
- Adjustment stok manual

### 💳 Kasir & Transaksi
- Interface kasir yang responsif
- Keranjang belanja dengan validasi stok real-time
- Metode pembayaran: Tunai, QRIS, Transfer, Kartu
- Hitung kembalian otomatis
- Struk digital
- Void transaksi (dengan pengembalian stok otomatis)

### 📊 Laporan
- Laporan transaksi dengan filter tanggal & cabang
- Laporan produk & stok
- Export **Excel (.xlsx)** dan **PDF**
- Dashboard real-time (pendapatan, transaksi, stok menipis)

### 🔐 Keamanan
- JWT Authentication + Refresh Token (7 hari)
- Token blacklist (Redis / in-memory fallback)
- Rate limiting (login: 10x/15 menit, API: 200x/menit)
- HTTP security headers (Helmet)
- Tenant isolation — semua query difilter `store_id` dari JWT
- Soft delete pada semua model

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js**
- **PostgreSQL** + **Sequelize ORM**
- **JWT** (access token 8 jam + refresh token 7 hari)
- **Redis** (token blacklist, opsional)
- **Multer** (upload gambar produk)
- **Helmet** + **express-rate-limit**

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS v4**
- **React Router DOM v7**
- **Axios** (dengan auto-refresh token interceptor)
- **Sonner** (toast notifications)
- **react-loading-skeleton**
- **JsBarcode** (render barcode EAN-13)
- **xlsx** + **jsPDF** (export laporan)

---

## 📁 Struktur Proyek

```
├── backend/
│   ├── configs/          # Database & Redis config
│   ├── controllers/      # Request handlers
│   ├── middlewares/      # Auth, authorize, validators, upload
│   ├── models/           # Sequelize models
│   ├── routes/           # Express routes
│   ├── seeders/          # Data awal (admin + toko contoh)
│   ├── services/         # Business logic
│   ├── utils/            # Helper functions
│   └── uploads/          # Gambar produk (tidak di-commit)
│
└── frontend/
    └── src/
        ├── components/   # UI components (Sidebar, Modal, dll)
        ├── context/      # AuthContext
        ├── lib/          # API clients
        ├── pages/        # Halaman per role
        │   ├── admin/
        │   ├── owner/
        │   ├── branch/
        │   └── cashier/
        └── utils/        # Barcode generator, export report
```

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js >= 18
- PostgreSQL >= 14
- Redis (opsional, fallback ke in-memory)

### 1. Clone Repository

```bash
git clone https://github.com/username/pos-saas.git
cd pos-saas
```

### 2. Setup Backend

```bash
cd backend
npm install

# Salin file environment
cp .env.example .env

# Edit .env dengan konfigurasi database kamu
# Lalu jalankan server
npm start
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Akses Aplikasi

| URL | Keterangan |
|-----|------------|
| `http://localhost:5173` | Frontend |
| `http://localhost:5000/api` | Backend API |

---

## ⚙️ Konfigurasi Environment

Salin `backend/.env.example` ke `backend/.env` dan isi nilainya:

```env
PORT=5000

# Database PostgreSQL
DB_NAME=app_pos
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=8h

# Frontend URL (CORS)
CLIENT_URL=http://localhost:5173

# Redis (opsional)
REDIS_URL=redis://127.0.0.1:6379
```

---

## 👤 Akun Default (Seeder)

Setelah server pertama kali dijalankan, seeder otomatis membuat:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@pos.com` | `admin123` |
| Owner (contoh) | `owner@tokominereal.com` | `owner123` |

> ⚠️ Ganti password default setelah pertama kali login.

---

## 📡 API Endpoints

| Prefix | Keterangan |
|--------|------------|
| `POST /api/auth/register` | Daftar toko baru |
| `POST /api/auth/login` | Login |
| `POST /api/auth/refresh-token` | Refresh access token |
| `GET /api/admin/*` | Admin panel (role: admin) |
| `GET /api/branches` | Manajemen cabang |
| `GET /api/users` | Manajemen pengguna |
| `GET /api/categories` | Kategori produk |
| `GET /api/products` | Produk & stok |
| `GET /api/transactions` | Transaksi |
| `GET /api/dashboard/*` | Data dashboard |
| `GET /api/profile` | Profil pengguna |

---

## 🗄️ Database Schema

Model utama:
- `stores` — Toko (tenant)
- `branches` — Cabang per toko
- `users` — Pengguna (admin/owner/branch_owner/cashier)
- `categories` — Kategori produk
- `products` — Produk (soft delete)
- `product_stocks` — Stok per produk per cabang
- `stock_movements` — Audit log perubahan stok
- `transactions` — Header transaksi
- `transaction_items` — Item per transaksi

---

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi.
