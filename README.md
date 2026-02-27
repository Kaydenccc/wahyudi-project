# PB. TIGA BERLIAN — Sistem Pembinaan Atlet Bulutangkis

Sistem informasi berbasis web untuk pembinaan dan monitoring performa atlet bulutangkis. Dibangun menggunakan **Next.js 16** (App Router) dengan **MongoDB** sebagai database.

**Live Demo:** [https://sitigaberlian.my.id](https://sitigaberlian.my.id)

---

## Fitur Utama

### Halaman Publik (Tanpa Login)
| Halaman | URL | Deskripsi |
|---------|-----|-----------|
| Landing Page | `/` | Hero section, statistik klub, atlet unggulan, fitur highlights |
| Profil Klub | `/klub` | Profil lengkap klub, statistik, atlet unggulan, prestasi terbaru |
| Daftar Atlet | `/atlet` | Daftar atlet aktif dengan search & filter kategori |
| Detail Atlet | `/atlet/[id]` | Profil atlet, prestasi, performa (data kontak disensor) |

### Dashboard (Login Required)
| Modul | Deskripsi | Akses Role |
|-------|-----------|------------|
| **Dashboard** | Statistik klub, grafik tren performa & kehadiran, quick actions | Semua role |
| **Data Atlet** | CRUD data atlet, upload foto, kelola cedera | Admin, Pelatih, Ketua Klub (read-only) |
| **Program Latihan** | CRUD program latihan (Teknik, Fisik, Taktik) | Admin, Pelatih |
| **Jadwal Latihan** | Kelola jadwal latihan dengan kalender | Admin, Pelatih |
| **Absensi** | Input & riwayat absensi per sesi latihan | Admin, Pelatih |
| **Monitoring Performa** | Evaluasi performa atlet, catatan pelatih | Semua role (Atlet: hanya data sendiri) |
| **Prestasi** | CRUD pencapaian/prestasi atlet | Admin, Pelatih, Atlet (data sendiri), Ketua Klub (read-only) |
| **Laporan** | Rekap latihan, performa, kehadiran + ekspor PDF | Admin, Pelatih, Ketua Klub |
| **Pengaturan** | Pengaturan klub, logo, favicon, manajemen pengguna | Admin, Ketua Klub |
| **Profil** | Edit profil & password sendiri | Semua role |

### Role & Hak Akses
| Role | Deskripsi |
|------|-----------|
| **Admin** | Akses penuh ke seluruh fitur sistem |
| **Pelatih** | Kelola data atlet, program latihan, absensi, performa, prestasi |
| **Ketua Klub** | Lihat data atlet, monitoring performa, prestasi, laporan, pengaturan |
| **Atlet** | Lihat dashboard personal, performa sendiri, kelola prestasi sendiri |

---

## Tech Stack

### Frontend
| Teknologi | Fungsi |
|-----------|--------|
| Next.js 16 (App Router) | Framework fullstack React |
| React 19 | UI component-based |
| TypeScript | Type-safe JavaScript |
| Tailwind CSS 4 | Utility-first CSS |
| shadcn/ui | Component library (Radix UI) |
| SWR | Client-side data fetching & caching |
| Recharts | Grafik & visualisasi data |
| Lucide React | Icon library |
| Sonner | Toast notification |
| jsPDF | Generate laporan PDF |

### Backend
| Teknologi | Fungsi |
|-----------|--------|
| Next.js API Routes | RESTful API endpoints |
| Mongoose | MongoDB ODM |
| jose | JWT authentication |
| bcryptjs | Password hashing |
| Zod 4 | Input validation |

### Database & Infrastructure
| Teknologi | Fungsi |
|-----------|--------|
| MongoDB 8.0 | NoSQL document database |
| Nginx | Reverse proxy & SSL |
| PM2 | Process manager |
| Let's Encrypt | SSL certificate |

---

## Struktur Project

```
src/
├── app/
│   ├── (auth)/              # Halaman login & register
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Halaman dashboard (protected)
│   │   ├── dashboard/
│   │   ├── data-atlet/
│   │   ├── program-latihan/
│   │   ├── absensi/
│   │   ├── monitoring-performa/
│   │   ├── prestasi/
│   │   ├── laporan/
│   │   ├── pengaturan/
│   │   └── profil/
│   ├── (public)/            # Halaman publik (no auth)
│   │   ├── klub/
│   │   └── atlet/
│   ├── api/                 # API routes
│   │   ├── auth/            # Login, register, profile
│   │   ├── athletes/        # CRUD atlet
│   │   ├── programs/        # CRUD program latihan
│   │   ├── schedules/       # CRUD jadwal
│   │   ├── attendance/      # Absensi
│   │   ├── performance/     # Performa & catatan pelatih
│   │   ├── coach-notes/     # Catatan pelatih
│   │   ├── achievements/    # CRUD prestasi
│   │   ├── public/          # API publik (no auth)
│   │   ├── settings/        # Pengaturan klub
│   │   └── users/           # Manajemen pengguna
│   ├── page.tsx             # Landing page
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── shared/              # Komponen reusable (sidebar, header, dll)
│   └── public/              # Komponen halaman publik (navbar, footer)
├── hooks/                   # Custom React hooks (SWR wrappers)
├── lib/                     # Utilities, auth, database, validations
├── models/                  # Mongoose models
└── middleware.ts             # Auth & role-based routing
```

---

## Instalasi & Development

### Prasyarat
- Node.js v22 LTS
- MongoDB 8.0 (lokal atau Atlas)

### Setup

```bash
# Clone repository
git clone https://github.com/USERNAME/wahyu-project.git
cd wahyu-project

# Install dependencies
npm install

# Buat file environment
cp .env.example .env.local
# Edit .env.local:
#   MONGODB_URI=mongodb://localhost:27017/bclub
#   JWT_SECRET=your-secret-key
#   NODE_ENV=development

# Seed data awal
npm run seed

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Akun Default (setelah seed)

| Email | Password | Role |
|-------|----------|------|
| admin@bclub.id | admin123 | Admin |
| peter@bclub.id | coach123 | Pelatih |
| liliyana@bclub.id | coach123 | Pelatih |
| marcus@bclub.id | atlet123 | Atlet |
| kevin@bclub.id | atlet123 | Atlet |
| gregoria@bclub.id | atlet123 | Atlet |
| ketua@bclub.id | ketua123 | Ketua Klub |

---

## Database Models

| Model | Collection | Deskripsi |
|-------|------------|-----------|
| User | users | Akun pengguna (auth) |
| Athlete | athletes | Data atlet bulutangkis |
| TrainingProgram | trainingprograms | Program/materi latihan |
| TrainingSchedule | trainingschedules | Jadwal pelaksanaan latihan |
| Attendance | attendances | Catatan kehadiran |
| PerformanceRecord | performancerecords | Evaluasi performa |
| CoachNote | coachnotes | Catatan pelatih |
| Achievement | achievements | Prestasi/pencapaian atlet |
| ClubSettings | clubsettings | Pengaturan identitas klub |

### Relasi

```
User ──── 1:1 ──── Athlete (via athleteId, untuk role Atlet)
Athlete ──── 1:* ──── PerformanceRecord
Athlete ──── 1:* ──── Attendance
Athlete ──── 1:* ──── CoachNote
Athlete ──── 1:* ──── Achievement
TrainingProgram ──── 1:* ──── TrainingSchedule
TrainingSchedule ──── 1:* ──── Attendance
Achievement.createdBy ──── *:1 ──── User
```

---

## API Routes

### Public (No Auth)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/public/club` | Info klub, statistik, atlet unggulan, prestasi |
| GET | `/api/public/athletes` | Daftar atlet (data kontak disensor) |
| GET | `/api/public/athletes/[id]` | Detail atlet + prestasi + performa |
| GET | `/api/settings/branding` | Logo & favicon klub |

### Auth
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/auth/profile` | Get profil user |
| PUT | `/api/auth/profile` | Update profil user |
| POST | `/api/auth/logout` | Logout |

### Protected (Require Auth)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET/POST | `/api/athletes` | List & create atlet |
| GET/PUT/DELETE | `/api/athletes/[id]` | Detail, update, hapus atlet |
| GET/POST | `/api/programs` | List & create program |
| GET/PUT/DELETE | `/api/programs/[id]` | Detail, update, hapus program |
| GET/POST | `/api/schedules` | List & create jadwal |
| GET/PUT/DELETE | `/api/schedules/[id]` | Detail, update, hapus jadwal |
| GET/POST | `/api/attendance` | List & input absensi |
| GET/POST | `/api/performance` | List & input performa |
| GET | `/api/performance/[athleteId]` | Performa per atlet |
| GET/POST | `/api/coach-notes` | List & create catatan |
| GET/POST | `/api/achievements` | List & create prestasi |
| GET/PUT/DELETE | `/api/achievements/[id]` | Detail, update, hapus prestasi |
| GET/PUT | `/api/settings` | Pengaturan klub |
| GET/PUT/DELETE | `/api/users/[id]` | Manajemen pengguna |

---

## Keamanan

- **Password**: bcryptjs 12 salt rounds
- **Authentication**: JWT via HttpOnly cookie (7 hari)
- **Authorization**: Role-based access control di middleware + API
- **Validation**: Zod schema di setiap endpoint
- **Data Censoring**: API publik menyensor phone/email/address
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, dll
- **HTTPS**: SSL/TLS via Let's Encrypt

---

## Deployment

Lihat [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) untuk panduan lengkap deployment ke VPS.

---

## Dokumentasi Lainnya

- [Desain Sistem](docs/DESAIN-SISTEM.md) — Arsitektur, ERD, flowchart, wireframe
- [Use Case Diagram](docs/USE-CASE-DIAGRAM.md) — Daftar use case per role
- [Deployment Guide](DEPLOYMENT-GUIDE.md) — Panduan deployment VPS dari nol
