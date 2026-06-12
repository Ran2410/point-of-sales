# 🛒 POS Platform — Multi-Tenant Point of Sales

A web-based **Point of Sales platform** built with multi-tenant architecture. Each store (tenant) has fully isolated data, supports multi-branch operations, and a structured role hierarchy. Designed as a learning project and portfolio piece demonstrating production-grade patterns.

---

## 🎯 Why This Project

Most POS apps are single-tenant. This one is **multi-tenant from the ground up** — meaning a single deployment can serve multiple stores with complete data isolation. That's the same architectural pattern used by SaaS products like Shopify, Toast, and Square.

Built to demonstrate:
- **Backend architecture** (multi-tenant middleware, RBAC, transaction integrity)
- **Database design** (relational modeling, soft deletes, audit logs)
- **Security** (JWT + refresh, rate limiting, tenant isolation)
- **Frontend craft** (React 18, Tailwind v4, real-world UX patterns)
- **Real-world integration** (thermal receipt printing, barcode, payment methods)

---

## ✨ Features

### 🏢 Multi-Tenant Architecture
- Every store is a tenant with **fully isolated data**
- Owner cannot access other stores' data
- Admin platform can manage all stores
- Tenant isolation enforced at the **middleware level** — not just query filters

### 👥 Role Hierarchy
| Role | Scope |
|------|-------|
| **Admin** | Manage all stores & users on the platform |
| **Owner** | Manage own store, branches, products, reports |
| **Branch Owner** | Manage cashiers, stock, branch reports |
| **Cashier** | Process transactions at POS |

### 🏪 Store & Branch Management
- Self-register new store (with admin approval)
- Multi-branch per store
- User management per branch

### 📦 Products & Inventory
- Product categories
- Products with auto-generated **EAN-13 barcode**
- Stock per branch (separated)
- Audit log for every stock change (stock movements)
- Manual stock adjustment

### 💳 POS & Transactions
- Responsive cashier interface
- Cart with **real-time stock validation**
- Payment methods: **Cash, QRIS, Transfer, Card**
- Automatic change calculation
- **80mm thermal receipt** ready (with barcode)
- Void transaction with automatic stock reversal

### 📊 Reports
- Transaction reports with date & branch filters
- Product & stock reports
- Export to **Excel (.xlsx)** and **PDF**
- Real-time dashboard (revenue, transactions, low stock)

### 🔐 Security
- JWT Authentication + Refresh Token (7-day validity)
- Token blacklist (Redis / in-memory fallback)
- Rate limiting (login: 10×/15 min, API: 200×/min)
- HTTP security headers (Helmet)
- **Tenant isolation** — every query filtered by `store_id` from JWT
- Soft delete on all models

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 18)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Admin   │ │  Owner   │ │  Branch  │ │ Cashier  │       │
│  │  Panel   │ │  Panel   │ │  Panel   │ │   POS    │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
│       └──────────┴─────┬───────┴────────────┘              │
│                        │  REST API                          │
└────────────────────────┼────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────┐
│                    Backend (Express)                        │
│                        │                                    │
│   ┌────────────────────┴────────────────────┐              │
│   │  Middleware Chain                       │              │
│   │  • authenticate (JWT verify)            │              │
│   │  • tenantIsolation (inject store_id)    │              │
│   │  • rateLimit (DDoS protection)          │              │
│   │  • validate (request validation)        │              │
│   └────────────────────┬────────────────────┘              │
│                        │                                    │
│   ┌────────────────────┴────────────────────┐              │
│   │  Services (Business Logic)              │              │
│   │  • auth, store, branch, product         │              │
│   │  • transaction (with stock ops)         │              │
│   │  • dashboard, profile, admin            │              │
│   └────────────────────┬────────────────────┘              │
│                        │                                    │
│   ┌────────────────────┴────────────────────┐              │
│   │  Models (Sequelize ORM)                 │              │
│   │  • Store, Branch, User                  │              │
│   │  • Product, Category, StockMovement     │              │
│   │  • Transaction, TransactionItem         │              │
│   └────────────────────┬────────────────────┘              │
└────────────────────────┼────────────────────────────────────┘
                         │
                  ┌──────┴──────┐
                  │  PostgreSQL │
                  └─────────────┘
```

### Key Architectural Decisions

**1. Multi-tenant via `store_id` everywhere, not schema-per-tenant**
- Simpler operations, easier backups, lower cost
- Trade-off: must enforce isolation carefully at query level (handled by `tenantIsolation` middleware)

**2. Stock changes as immutable audit log**
- Every stock change creates a `StockMovement` record
- Enables full traceability ("why did stock drop on March 5?")
- Critical for inventory accuracy in real POS

**3. Soft delete everywhere**
- `deletedAt` column on all models
- Data can be recovered; audit trail preserved
- Avoids accidental data loss from UI mistakes

**4. Single source of truth for receipts**
- `<Receipt>` component is shared between POS flow and Transaction History
- Adding a field once updates both flows

---

## 🛠️ Tech Stack

### Backend
| Layer | Tech |
|-------|------|
| Runtime | Node.js (ES Modules) |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Sequelize |
| Auth | JWT + Refresh Token |
| Security | Helmet, CORS, express-rate-limit |
| Dev tools | nodemon |

### Frontend
| Layer | Tech |
|-------|------|
| Framework | React 18 (Vite) |
| Styling | TailwindCSS v4 + shadcn-style components |
| HTTP | Axios |
| State | React Context (Auth) + Local state |
| Barcode | JsBarcode |
| Icons | Lucide-style inline SVG |
| Toast | Sonner |

---

## 📂 Project Structure

```
point-of-sales/
├── backend/
│   ├── server.js              # Express app entry
│   ├── config/                # DB config
│   ├── controllers/           # Request handlers
│   ├── services/              # Business logic
│   ├── models/                # Sequelize models + relations
│   ├── routes/                # API route definitions
│   ├── middlewares/           # auth, tenantIsolation, rateLimit
│   ├── utils/                 # Helpers (AppError, stockHelper, etc.)
│   ├── seeders/               # DB seed scripts
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── main.jsx           # React entry
    │   ├── App.jsx            # Router
    │   ├── pages/
    │   │   ├── auth/          # Login, Register
    │   │   ├── admin/         # Admin panel
    │   │   ├── owner/         # Owner dashboard
    │   │   ├── branch/        # Branch manager
    │   │   └── cashier/       # POS, Transaction History
    │   ├── components/        # Shared (Receipt, AppLayout, etc.)
    │   ├── context/           # AuthContext
    │   ├── lib/               # API clients
    │   └── index.css          # Tailwind + print styles
    └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env       # Configure DB & JWT secrets
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all   # Optional: seed sample data
npm start                  # Runs on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env       # Set VITE_API_URL
npm run dev                # Runs on http://localhost:5173
```

### Default Seed Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@platform.com` | `admin123` |
| Owner | `owner@toko1.com` | `owner123` |
| Cashier | `cashier@toko1.com` | `cashier123` |

---

## 🧪 Key Flows to Test

1. **Multi-tenant isolation** — Login as Owner Toko A, try to access Toko B's data via API → blocked
2. **Stock integrity** — Make a transaction, then void it → stock restored
3. **Thermal print** — Print a receipt → 80mm width, barcode included
4. **Role separation** — Login as Cashier, try to access `/admin` routes → blocked
5. **Real-time stock** — Two cashiers selling same product → second sees updated stock

---

## 📈 What I Learned

This project taught me (or reinforced):

- **Middleware composition** — building a clean auth → isolation → validation chain
- **Multi-tenant data modeling** — the cost of getting `store_id` wrong is catastrophic
- **Transaction boundaries** — stock + transaction must commit together or not at all
- **Print as a first-class feature** — not a "nice to have" for POS
- **Single source of truth** — sharing components prevents drift between flows
- **CSS print isolation** — `@media print` is its own weird world

---

## 🔮 Future Improvements

- [ ] Direct ESC/POS thermal printer integration (currently browser print only)
- [ ] Subscription/billing system (Midtrans integration) → true SaaS
- [ ] Real-time dashboard updates (WebSocket)
- [ ] Redis caching for frequently accessed data
- [ ] Comprehensive API tests (Jest + Supertest)
- [ ] Docker Compose for one-command setup
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Audit log for admin actions

---

## 📄 License

MIT — feel free to learn from this code.

---

**Built as a portfolio project to demonstrate production-grade patterns in a real-world domain.**
