# Diagram PB. TIGA BERLIAN

## Cara Terbaik Membuat Diagram

### Opsi 1: Draw.io (Rekomendasi)
1. Buka https://app.diagrams.net
2. Pilih "Create New Diagram"
3. Pilih template "UML Use Case"
4. Gunakan daftar use case di bawah sebagai referensi untuk menggambar

### Opsi 2: ChatGPT
Copy seluruh isi bagian "Daftar Use Case" di bawah, lalu paste ke ChatGPT dan minta:
> "Buatkan use case diagram dalam bentuk gambar berdasarkan data ini"

### Opsi 3: Canva
Buka https://www.canva.com dan cari template "Use Case Diagram", lalu isi manual.

---

## Daftar Aktor (Role)

| No | Aktor | Deskripsi |
|----|-------|-----------|
| 1 | **Admin** | Mengelola seluruh sistem termasuk pengguna |
| 2 | **Pelatih** | Mengelola data operasional latihan dan atlet |
| 3 | **Ketua Klub** | Mengawasi klub, melihat laporan, kelola pengaturan |
| 4 | **Atlet** | Melihat dashboard, performa pribadi, kelola prestasi sendiri |
| 5 | **Pengunjung** | Melihat landing page, profil klub, daftar atlet, login/register |

---

## Daftar Use Case Lengkap

  ### UC-00: Halaman Publik (Tanpa Login)

  | Kode | Use Case | Pengunjung | Admin | Pelatih | Ketua Klub | Atlet |
  |------|----------|:---:|:---:|:---:|:---:|:---:|
  | UC-00.1 | Lihat Landing Page | v | v | v | v | v |
  | UC-00.2 | Lihat Profil Klub (statistik, atlet unggulan, prestasi) | v | v | v | v | v |
  | UC-00.3 | Lihat Daftar Atlet (search & filter) | v | v | v | v | v |
  | UC-00.4 | Lihat Detail Atlet (profil, prestasi, performa) | v | v | v | v | v |

  > **Catatan:** Data kontak (telepon, email, alamat) disensor pada halaman publik untuk melindungi privasi atlet.

  ### UC-01: Autentikasi

  | Kode | Use Case | Pengunjung | Admin | Pelatih | Ketua Klub | Atlet |
  |------|----------|:---:|:---:|:---:|:---:|:---:|
  | UC-01.1 | Login | v | - | - | - | - |
  | UC-01.2 | Register (sebagai Atlet, Pelatih, atau Ketua Klub) | v | - | - | - | - |
  | UC-01.3 | Logout | - | v | v | v | v |
  | UC-01.4 | Edit Profil Sendiri | - | v | v | v | v |
  | UC-01.5 | Ganti Password (memerlukan password lama) | - | v | v | v | v |

### UC-02: Dashboard

| Kode | Use Case | Admin | Pelatih | Ketua Klub | Atlet |
|------|----------|:---:|:---:|:---:|:---:|
| UC-02.1 | Lihat Dashboard Statistik Klub | v | v | v | - |
| UC-02.2 | Lihat Dashboard Personal (Performa Sendiri) | - | - | - | v |
| UC-02.3 | Lihat Grafik Tren Performa Bulanan | v | v | v | - |
| UC-02.4 | Lihat Grafik Kehadiran Mingguan | v | v | v | - |
| UC-02.5 | Akses Quick Actions | v | v | - | - |

### UC-03: Manajemen Data Atlet

| Kode | Use Case | Admin | Pelatih | Ketua Klub | Atlet |
|------|----------|:---:|:---:|:---:|:---:|
| UC-03.1 | Lihat Daftar Atlet (Filter & Search) | v | v | v | - |
| UC-03.2 | Lihat Detail Atlet | v | v | v | - |
| UC-03.3 | Tambah Atlet Baru | v | v | - | - |
| UC-03.4 | Edit Data Atlet | v | v | - | - |
| UC-03.5 | Hapus Atlet | v | v | - | - |
| UC-03.6 | Upload Foto Atlet | v | v | - | - |
| UC-03.7 | Kelola Cedera Atlet (CRUD) | v | v | - | - |

**Kategori Atlet:** Pra Usia Dini, Usia Dini, Anak-anak, Pemula, Remaja, Taruna, Dewasa

### UC-04: Program Latihan

| Kode | Use Case | Admin | Pelatih | Ketua Klub | Atlet |
|------|----------|:---:|:---:|:---:|:---:|
| UC-04.1 | Lihat Daftar Program Latihan | v | v | - | - |
| UC-04.2 | Lihat Detail Program | v | v | - | - |
| UC-04.3 | Buat Program Latihan Baru | v | v | - | - |
| UC-04.4 | Edit Program Latihan | v | v | - | - |
| UC-04.5 | Hapus Program Latihan | v | v | - | - |

**Jenis Program:** Teknik, Fisik, Taktik

### UC-05: Jadwal Latihan

| Kode | Use Case | Admin | Pelatih | Ketua Klub | Atlet |
|------|----------|:---:|:---:|:---:|:---:|
| UC-05.1 | Lihat Jadwal (Kalender & List) | v | v | - | - |
| UC-05.2 | Buat Jadwal Latihan Baru | v | v | - | - |
| UC-05.3 | Edit Jadwal Latihan | v | v | - | - |
| UC-05.4 | Hapus Jadwal Latihan | v | v | - | - |

**Status Jadwal:** Terjadwal, Berlangsung, Selesai, Dibatalkan (otomatis berubah berdasarkan waktu)

### UC-06: Absensi

| Kode | Use Case | Admin | Pelatih | Ketua Klub | Atlet |
|------|----------|:---:|:---:|:---:|:---:|
| UC-06.1 | Lihat Riwayat Absensi | v | v | - | - |
| UC-06.2 | Input Absensi per Sesi Latihan | v | v | - | - |

**Status Absensi:** Hadir, Izin, Tidak Hadir

### UC-07: Monitoring Performa

| Kode | Use Case | Admin | Pelatih | Ketua Klub | Atlet |
|------|----------|:---:|:---:|:---:|:---:|
| UC-07.1 | Lihat Performa Semua Atlet | v | v | v | - |
| UC-07.2 | Lihat Detail Performa Atlet | v | v | v | v* |
| UC-07.3 | Input Nilai Performa | v | v | - | - |
| UC-07.4 | Buat Catatan Pelatih | v | v | - | - |
| UC-07.5 | Edit Catatan Pelatih | v | v | - | - |
| UC-07.6 | Hapus Catatan Pelatih | v | v | - | - |

*Atlet hanya bisa melihat performa diri sendiri

**Penilaian Otomatis:**
- Progres Baik = skor naik >10% DAN kehadiran ≥60%
- Perlu Evaluasi = kehadiran <60% ATAU skor rata-rata <60
- Stabil = kondisi lainnya

### UC-07B: Prestasi Atlet

| Kode | Use Case | Admin | Pelatih | Ketua Klub | Atlet |
|------|----------|:---:|:---:|:---:|:---:|
| UC-07B.1 | Lihat Daftar Prestasi (Filter & Search) | v | v | v | v* |
| UC-07B.2 | Tambah Prestasi Baru | v | v | - | v* |
| UC-07B.3 | Edit Prestasi | v | v | - | v** |
| UC-07B.4 | Hapus Prestasi | v | v | - | v** |

*Atlet hanya bisa melihat dan menambah prestasi untuk diri sendiri
**Atlet hanya bisa mengedit/menghapus prestasi yang dibuat oleh dirinya sendiri

**Kategori Prestasi:** Turnamen, Kejuaraan, Peringkat, Lainnya
**Level:** Daerah, Nasional, Internasional
**Hasil:** Juara 1, Juara 2, Juara 3, Partisipasi, Lainnya

### UC-08: Laporan

| Kode | Use Case | Admin | Pelatih | Ketua Klub | Atlet |
|------|----------|:---:|:---:|:---:|:---:|
| UC-08.1 | Lihat Rekap Latihan Bulanan | v | v | v | - |
| UC-08.2 | Lihat Rekap Performa Atlet | v | v | v | - |
| UC-08.3 | Lihat Rekap Kehadiran | v | v | v | - |
| UC-08.4 | Ekspor Laporan ke PDF | v | v | v | - |

**Filter Laporan:** Bulan, Tahun, Kategori Atlet, Jenis Latihan

### UC-09: Pengaturan

| Kode | Use Case | Admin | Pelatih | Ketua Klub | Atlet |
|------|----------|:---:|:---:|:---:|:---:|
| UC-09.1 | Lihat & Edit Pengaturan Klub | v | - | v | - |
| UC-09.2 | Upload Logo Klub | v | - | v | - |
| UC-09.3 | Upload Favicon | v | - | v | - |
| UC-09.4 | Lihat Daftar Pengguna | v | - | - | - |
| UC-09.5 | Tambah Pengguna Baru | v | - | - | - |
| UC-09.6 | Edit Role/Status Pengguna | v | - | - | - |
| UC-09.7 | Hapus Pengguna | v | - | - | - |

**Role Pengguna:** Admin, Pelatih, Atlet, Ketua Klub
**Status Pengguna:** Aktif, Non-Aktif

---

## Ringkasan CRUD per Modul

| Modul | Create | Read | Update | Delete |
|-------|--------|------|--------|--------|
| **Data Atlet** | Admin, Pelatih | Admin, Pelatih, Ketua Klub | Admin, Pelatih | Admin, Pelatih |
| **Program Latihan** | Admin, Pelatih | Admin, Pelatih | Admin, Pelatih | Admin, Pelatih |
| **Jadwal Latihan** | Admin, Pelatih | Admin, Pelatih | Admin, Pelatih | Admin, Pelatih |
| **Absensi** | Admin, Pelatih | Admin, Pelatih | Admin, Pelatih | - |
| **Performa** | Admin, Pelatih | Semua Role | - | - |
| **Catatan Pelatih** | Admin, Pelatih | Semua Role | Admin, Pelatih | Admin, Pelatih |
| **Prestasi** | Admin, Pelatih, Atlet* | Semua Role | Admin, Pelatih, Atlet** | Admin, Pelatih, Atlet** |
| **Laporan** | - | Admin, Pelatih, Ketua Klub | - | - |
| **Pengguna** | Admin | Admin | Admin | Admin |
| **Pengaturan Klub** | - | Admin, Ketua Klub | Admin, Ketua Klub | - |
| **Profil Sendiri** | - | Semua Role | Semua Role | - |
| **Halaman Publik** | - | Semua (tanpa login) | - | - |

*Atlet hanya bisa membuat prestasi untuk diri sendiri
**Atlet hanya bisa mengedit/menghapus prestasi yang dibuat sendiri

---

## Entity Relationship Diagram (ERD)

### Entitas & Atribut

#### User
- _id (PK)
- name: String
- email: String (unique)
- password: String (bcrypt hash)
- phone: String
- role: [Admin | Pelatih | Atlet | Ketua Klub]
- status: [Aktif | Non-Aktif]
- athleteId: FK → Athlete (hanya untuk role Atlet)
- createdAt, updatedAt

#### Athlete
- _id (PK)
- customId: String (unique, format: BC-YYYY-XXX)
- name: String
- dateOfBirth: Date
- gender: [Laki-laki | Perempuan]
- category: [Pra Usia Dini | Usia Dini | Anak-anak | Pemula | Remaja | Taruna | Dewasa]
- position: [Tunggal | Ganda | Keduanya]
- status: [Aktif | Pemulihan | Non-Aktif | Pro Roster]
- height: Number (cm)
- weight: Number (kg)
- phone: String
- address: String
- joinDate: Date
- photo: String (file path)
- injuries[]: Embedded → {type, date, status, severity}
- recentPerformance[]: Embedded → {date, score, type}

#### TrainingProgram
- _id (PK)
- name: String
- type: [Teknik | Fisik | Taktik]
- description: String
- objective: String
- target: String
- duration: Number (menit)
- drills[]: [{name, description}]
- assignedAthletes[]: FK → Athlete

#### TrainingSchedule
- _id (PK)
- program: FK → TrainingProgram
- date: Date
- day: String
- startTime: String (HH:mm)
- endTime: String (HH:mm)
- venue: String
- coach: String
- athletes[]: FK → Athlete
- status: [Terjadwal | Berlangsung | Selesai | Dibatalkan]
- notes: String

#### Attendance
- _id (PK)
- date: Date
- schedule: FK → TrainingSchedule
- athlete: FK → Athlete
- status: [Hadir | Izin | Tidak Hadir]
- markedBy: String

#### PerformanceRecord
- _id (PK)
- athlete: FK → Athlete
- date: Date
- score: Number (0-100)
- type: [Training | Post-Match]
- stats: {smashSpeed, footworkRating, winProbability, netAccuracy}
- recovery: {overall, sleepScore, hrvStatus}
- trend: [up | down | neutral]
- change: String

#### CoachNote
- _id (PK)
- athlete: FK → Athlete
- date: Date
- type: [POST-MATCH | TRAINING]
- content: String
- coach: String

#### Achievement
- _id (PK)
- athlete: FK → Athlete
- title: String
- description: String
- date: Date
- category: [Turnamen | Kejuaraan | Peringkat | Lainnya]
- level: [Daerah | Nasional | Internasional]
- result: [Juara 1 | Juara 2 | Juara 3 | Partisipasi | Lainnya]
- photo: String (file path)
- createdBy: FK → User
- createdAt, updatedAt

#### ClubSettings
- _id (PK)
- clubName: String
- phone: String
- address: String
- email: String
- website: String
- logo: String (file path)
- favicon: String (file path)

### Relasi Antar Entitas

```
User             1 ──── 1 Athlete (via athleteId, untuk role Atlet)
TrainingProgram  1 ──── * TrainingSchedule
TrainingSchedule * ──── * Athlete (many-to-many)
TrainingSchedule 1 ──── * Attendance
Athlete          1 ──── * Attendance
Athlete          1 ──── * PerformanceRecord
Athlete          1 ──── * CoachNote
Athlete          1 ──── * Achievement
Athlete          1 ──── * Injury (embedded)
Achievement      * ──── 1 User (createdBy)
```

---

## Activity Diagram - Alur Proses

### Alur Login
```
[Mulai]
  → User buka halaman login
  → Input email dan password
  → Klik "Masuk"
  → [Validasi: email & password terisi?]
      ├─ Tidak → Tampilkan error → [Selesai]
      └─ Ya → Kirim request ke server
          → [Cek: user ditemukan?]
              ├─ Tidak → Tampilkan "Email atau password salah" → [Selesai]
              └─ Ya → [Cek: status Aktif?]
                  ├─ Tidak → Tampilkan "Akun tidak aktif" → [Selesai]
                  └─ Ya → Verifikasi password (bcrypt)
                      → [Cek: password valid?]
                          ├─ Tidak → Tampilkan "Email atau password salah" → [Selesai]
                          └─ Ya → Buat JWT token (7 hari)
                              → Set session cookie
                              → Redirect ke dashboard
                              → [Cek: role = Atlet?]
                                  ├─ Ya → Dashboard Personal
                                  └─ Tidak → Dashboard Statistik Klub
[Selesai]
```

### Alur Input Absensi
```
[Mulai]
  → Pelatih/Admin buka halaman Absensi
  → Sistem tampilkan jadwal hari ini
  → [Ada jadwal hari ini?]
      ├─ Tidak → Tampilkan "Tidak ada sesi latihan hari ini" → [Selesai]
      └─ Ya → Pilih sesi latihan
          → Sistem tampilkan daftar atlet dalam sesi
          → Untuk setiap atlet: pilih status (Hadir/Izin/Tidak Hadir)
          → Klik "Submit Absensi"
          → Validasi data (Zod + ObjectId)
          → [Data valid?]
              ├─ Tidak → Tampilkan error → [Selesai]
              └─ Ya → Simpan ke database (bulk upsert)
                  → Tampilkan "Absensi berhasil disimpan"
[Selesai]
```

### Alur Tambah Atlet
```
[Mulai]
  → Admin/Pelatih buka Data Atlet
  → Klik "Tambah Atlet Baru"
  → Isi form: Nama, Tanggal Lahir, Kelamin, Kategori, Posisi,
    Tinggi, Berat, Telepon, Alamat, Tanggal Bergabung
  → (Opsional) Upload foto atlet
  → Klik "Simpan"
  → Validasi data (Zod schema)
  → [Data valid?]
      ├─ Tidak → Tampilkan error per field → [Selesai]
      └─ Ya → Generate Custom ID (BC-YYYY-XXX)
          → Simpan ke MongoDB
          → Redirect ke halaman Detail Atlet
          → Tampilkan "Atlet berhasil ditambahkan"
[Selesai]
```

### Alur Generate Laporan PDF
```
[Mulai]
  → Admin/Pelatih/Ketua Klub buka halaman Laporan
  → Pilih jenis laporan:
      ├─ Rekap Latihan Bulanan
      ├─ Rekap Performa Atlet
      └─ Rekap Kehadiran
  → Pilih filter (Bulan, Tahun, Kategori, Jenis Latihan)
  → Sistem query data dari database
  → Tampilkan preview laporan (tabel + statistik)
  → Klik "Ekspor PDF"
  → Sistem generate PDF (jsPDF + autoTable)
  → Download file PDF
[Selesai]
```

---

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────┐
│                   CLIENT                         │
│  Browser (Chrome/Firefox/Safari)                │
│  ┌────────────────────────────────────────────┐ │
│  │  Next.js Frontend (React 19)               │ │
│  │  - Pages (App Router)                      │ │
│  │  - Components (shadcn/ui)                  │ │
│  │  - SWR (Data Fetching & Caching)           │ │
│  │  - Tailwind CSS 4 (Styling)                │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────┘
                      │ HTTPS (Port 443)
                      ▼
┌─────────────────────────────────────────────────┐
│                   SERVER (VPS)                   │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  Nginx (Reverse Proxy + SSL)               │ │
│  │  - SSL termination (Let's Encrypt)         │ │
│  │  - Static file serving                     │ │
│  │  - HTTP → HTTPS redirect                   │ │
│  └────────────────────┬───────────────────────┘ │
│                       │ Port 3000                │
│  ┌────────────────────▼───────────────────────┐ │
│  │  PM2 → Next.js Standalone Server           │ │
│  │  - API Routes (REST)                       │ │
│  │  - Server-Side Rendering                   │ │
│  │  - JWT Authentication (jose)               │ │
│  │  - Zod Validation                          │ │
│  │  - bcrypt Password Hashing                 │ │
│  └────────────────────┬───────────────────────┘ │
│                       │ Port 27017               │
│  ┌────────────────────▼───────────────────────┐ │
│  │  MongoDB 8.0                               │ │
│  │  - Database: bclub                         │ │
│  │  - Collections: users, athletes, programs, │ │
│  │    schedules, attendances, performances,   │ │
│  │    coachnotes, clubsettings                │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```
