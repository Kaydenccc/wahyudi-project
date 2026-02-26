# Diagram B-Club Badminton

Kode diagram di bawah bisa di-render menggunakan tool online:
- **PlantUML:** https://www.plantuml.com/plantuml/uml
- **Mermaid:** https://mermaid.live

---

## 1. Use Case Diagram (PlantUML)

Copy-paste kode di bawah ke https://www.plantuml.com/plantuml/uml lalu klik **Submit**.

```plantuml
@startuml
!theme cerulean
skinparam actorStyle awesome
skinparam packageStyle rectangle
skinparam usecase {
  BackgroundColor<<admin>> #E8F5E9
  BackgroundColor<<pelatih>> #E3F2FD
  BackgroundColor<<ketua>> #FFF3E0
  BackgroundColor<<atlet>> #FCE4EC
  BackgroundColor<<publik>> #F3E5F5
  BackgroundColor<<semua>> #ECEFF1
}

title Use Case Diagram - B-Club Badminton\nSistem Pembinaan Atlet Bulutangkis

actor "Admin" as admin #green
actor "Pelatih" as pelatih #blue
actor "Ketua Klub" as ketua #orange
actor "Atlet" as atlet #pink
actor "Pengunjung" as publik #purple

rectangle "Sistem B-Club Badminton" {

  ' === AUTENTIKASI ===
  package "Autentikasi" {
    usecase "Login" as UC_LOGIN <<publik>>
    usecase "Register\n(sebagai Atlet)" as UC_REGISTER <<publik>>
    usecase "Logout" as UC_LOGOUT <<semua>>
    usecase "Edit Profil Sendiri" as UC_EDIT_PROFILE <<semua>>
  }

  ' === DASHBOARD ===
  package "Dashboard" {
    usecase "Lihat Dashboard\n(Statistik Klub)" as UC_DASHBOARD <<semua>>
    usecase "Lihat Dashboard\nPersonal (Performa Sendiri)" as UC_DASHBOARD_ATLET <<atlet>>
    usecase "Lihat Quick Actions" as UC_QUICK_ACTIONS <<admin>>
  }

  ' === DATA ATLET ===
  package "Manajemen Data Atlet" {
    usecase "Lihat Daftar Atlet" as UC_LIST_ATHLETE <<semua>>
    usecase "Lihat Detail Atlet" as UC_VIEW_ATHLETE <<semua>>
    usecase "Tambah Atlet Baru" as UC_ADD_ATHLETE <<pelatih>>
    usecase "Edit Data Atlet" as UC_EDIT_ATHLETE <<pelatih>>
    usecase "Hapus Atlet" as UC_DELETE_ATHLETE <<pelatih>>
    usecase "Upload Foto Atlet" as UC_UPLOAD_PHOTO <<pelatih>>
    usecase "Kelola Cedera Atlet" as UC_MANAGE_INJURY <<pelatih>>
  }

  ' === PROGRAM LATIHAN ===
  package "Program Latihan" {
    usecase "Lihat Program Latihan" as UC_LIST_PROGRAM <<semua>>
    usecase "Lihat Detail Program" as UC_VIEW_PROGRAM <<semua>>
    usecase "Buat Program Latihan" as UC_ADD_PROGRAM <<pelatih>>
    usecase "Edit Program Latihan" as UC_EDIT_PROGRAM <<pelatih>>
    usecase "Hapus Program Latihan" as UC_DELETE_PROGRAM <<pelatih>>
  }

  ' === JADWAL LATIHAN ===
  package "Jadwal Latihan" {
    usecase "Lihat Jadwal\n(Kalender/List)" as UC_LIST_SCHEDULE <<semua>>
    usecase "Buat Jadwal Latihan" as UC_ADD_SCHEDULE <<pelatih>>
    usecase "Edit Jadwal Latihan" as UC_EDIT_SCHEDULE <<pelatih>>
    usecase "Hapus Jadwal Latihan" as UC_DELETE_SCHEDULE <<pelatih>>
  }

  ' === ABSENSI ===
  package "Absensi" {
    usecase "Lihat Riwayat Absensi" as UC_LIST_ATTENDANCE <<semua>>
    usecase "Input Absensi\n(Hadir/Izin/Tidak Hadir)" as UC_MARK_ATTENDANCE <<pelatih>>
  }

  ' === MONITORING PERFORMA ===
  package "Monitoring Performa" {
    usecase "Lihat Performa\nSemua Atlet" as UC_LIST_PERF <<semua>>
    usecase "Lihat Detail Performa\nAtlet" as UC_VIEW_PERF <<semua>>
    usecase "Input Nilai Performa" as UC_ADD_PERF <<pelatih>>
    usecase "Buat Catatan Pelatih" as UC_ADD_NOTE <<pelatih>>
    usecase "Edit Catatan Pelatih" as UC_EDIT_NOTE <<pelatih>>
    usecase "Hapus Catatan Pelatih" as UC_DELETE_NOTE <<pelatih>>
  }

  ' === LAPORAN ===
  package "Laporan" {
    usecase "Lihat Rekap\nLatihan Bulanan" as UC_REPORT_MONTHLY <<ketua>>
    usecase "Lihat Rekap\nPerforma Atlet" as UC_REPORT_PERF <<ketua>>
    usecase "Lihat Rekap\nKehadiran" as UC_REPORT_ATTENDANCE <<ketua>>
    usecase "Ekspor Laporan PDF" as UC_EXPORT_PDF <<ketua>>
  }

  ' === PENGATURAN ===
  package "Pengaturan" {
    usecase "Kelola Pengaturan Klub\n(Nama, Alamat, Logo)" as UC_CLUB_SETTINGS <<ketua>>
    usecase "Kelola Pengguna\n(CRUD User)" as UC_USER_MGMT <<admin>>
    usecase "Tambah User Baru" as UC_ADD_USER <<admin>>
    usecase "Ubah Role/Status User" as UC_EDIT_USER <<admin>>
    usecase "Hapus User" as UC_DELETE_USER <<admin>>
  }
}

' === RELASI PENGUNJUNG ===
publik --> UC_LOGIN
publik --> UC_REGISTER

' === RELASI ADMIN (semua fitur) ===
admin --> UC_LOGOUT
admin --> UC_EDIT_PROFILE
admin --> UC_DASHBOARD
admin --> UC_QUICK_ACTIONS
admin --> UC_LIST_ATHLETE
admin --> UC_VIEW_ATHLETE
admin --> UC_ADD_ATHLETE
admin --> UC_EDIT_ATHLETE
admin --> UC_DELETE_ATHLETE
admin --> UC_UPLOAD_PHOTO
admin --> UC_MANAGE_INJURY
admin --> UC_LIST_PROGRAM
admin --> UC_VIEW_PROGRAM
admin --> UC_ADD_PROGRAM
admin --> UC_EDIT_PROGRAM
admin --> UC_DELETE_PROGRAM
admin --> UC_LIST_SCHEDULE
admin --> UC_ADD_SCHEDULE
admin --> UC_EDIT_SCHEDULE
admin --> UC_DELETE_SCHEDULE
admin --> UC_LIST_ATTENDANCE
admin --> UC_MARK_ATTENDANCE
admin --> UC_LIST_PERF
admin --> UC_VIEW_PERF
admin --> UC_ADD_PERF
admin --> UC_ADD_NOTE
admin --> UC_EDIT_NOTE
admin --> UC_DELETE_NOTE
admin --> UC_REPORT_MONTHLY
admin --> UC_REPORT_PERF
admin --> UC_REPORT_ATTENDANCE
admin --> UC_EXPORT_PDF
admin --> UC_CLUB_SETTINGS
admin --> UC_USER_MGMT
admin --> UC_ADD_USER
admin --> UC_EDIT_USER
admin --> UC_DELETE_USER

' === RELASI PELATIH ===
pelatih --> UC_LOGOUT
pelatih --> UC_EDIT_PROFILE
pelatih --> UC_DASHBOARD
pelatih --> UC_LIST_ATHLETE
pelatih --> UC_VIEW_ATHLETE
pelatih --> UC_ADD_ATHLETE
pelatih --> UC_EDIT_ATHLETE
pelatih --> UC_DELETE_ATHLETE
pelatih --> UC_UPLOAD_PHOTO
pelatih --> UC_MANAGE_INJURY
pelatih --> UC_LIST_PROGRAM
pelatih --> UC_VIEW_PROGRAM
pelatih --> UC_ADD_PROGRAM
pelatih --> UC_EDIT_PROGRAM
pelatih --> UC_DELETE_PROGRAM
pelatih --> UC_LIST_SCHEDULE
pelatih --> UC_ADD_SCHEDULE
pelatih --> UC_EDIT_SCHEDULE
pelatih --> UC_DELETE_SCHEDULE
pelatih --> UC_LIST_ATTENDANCE
pelatih --> UC_MARK_ATTENDANCE
pelatih --> UC_LIST_PERF
pelatih --> UC_VIEW_PERF
pelatih --> UC_ADD_PERF
pelatih --> UC_ADD_NOTE
pelatih --> UC_EDIT_NOTE
pelatih --> UC_DELETE_NOTE
pelatih --> UC_REPORT_MONTHLY
pelatih --> UC_REPORT_PERF
pelatih --> UC_REPORT_ATTENDANCE
pelatih --> UC_EXPORT_PDF

' === RELASI KETUA KLUB ===
ketua --> UC_LOGOUT
ketua --> UC_EDIT_PROFILE
ketua --> UC_DASHBOARD
ketua --> UC_LIST_ATHLETE
ketua --> UC_VIEW_ATHLETE
ketua --> UC_LIST_PERF
ketua --> UC_VIEW_PERF
ketua --> UC_REPORT_MONTHLY
ketua --> UC_REPORT_PERF
ketua --> UC_REPORT_ATTENDANCE
ketua --> UC_EXPORT_PDF
ketua --> UC_CLUB_SETTINGS

' === RELASI ATLET ===
atlet --> UC_LOGOUT
atlet --> UC_EDIT_PROFILE
atlet --> UC_DASHBOARD_ATLET
atlet --> UC_LIST_PERF
atlet --> UC_VIEW_PERF

@enduml
```

---

## 2. Activity Diagram - Proses Login (PlantUML)

```plantuml
@startuml
!theme cerulean
title Activity Diagram - Proses Login

start

:User membuka halaman login;

:Memasukkan email dan password;

:Klik tombol "Masuk";

if (Email dan password terisi?) then (tidak)
  :Tampilkan error\n"Email dan password wajib diisi";
  stop
else (ya)
endif

:Kirim request ke /api/auth/login;

:Server mencari user berdasarkan email;

if (User ditemukan?) then (tidak)
  :Tampilkan error\n"Email atau password salah";
  stop
else (ya)
endif

if (Status user Aktif?) then (tidak)
  :Tampilkan error\n"Akun tidak aktif";
  stop
else (ya)
endif

:Verifikasi password dengan bcrypt;

if (Password valid?) then (tidak)
  :Tampilkan error\n"Email atau password salah";
  stop
else (ya)
endif

:Buat JWT token (berlaku 7 hari);

:Set session cookie (httpOnly, secure);

:Redirect ke /dashboard;

if (Role = Atlet?) then (ya)
  :Tampilkan Dashboard Personal\n(performa sendiri);
else (tidak)
  :Tampilkan Dashboard Umum\n(statistik klub);
endif

stop

@enduml
```

---

## 3. Activity Diagram - Input Absensi (PlantUML)

```plantuml
@startuml
!theme cerulean
title Activity Diagram - Input Absensi

start

:Pelatih/Admin membuka\nhalaman Absensi;

:Sistem menampilkan jadwal\nlatihan hari ini;

if (Ada jadwal hari ini?) then (tidak)
  :Tampilkan pesan\n"Tidak ada sesi latihan hari ini";
  stop
else (ya)
endif

:Pilih sesi latihan;

:Sistem menampilkan daftar atlet\nyang terdaftar di sesi tersebut;

repeat
  :Pilih status untuk tiap atlet\n(Hadir / Izin / Tidak Hadir);
repeat while (Masih ada atlet yang belum diisi?) is (ya)
-> tidak;

:Klik "Submit Absensi";

:Sistem validasi data\n(Zod + ObjectId check);

if (Data valid?) then (tidak)
  :Tampilkan error validasi;
  stop
else (ya)
endif

:Simpan absensi ke database\n(bulkWrite - upsert);

:Tampilkan notifikasi\n"Absensi berhasil disimpan";

stop

@enduml
```

---

## 4. Activity Diagram - Tambah Atlet (PlantUML)

```plantuml
@startuml
!theme cerulean
title Activity Diagram - Tambah Atlet Baru

start

:Admin/Pelatih membuka\nhalaman Data Atlet;

:Klik tombol "Tambah Atlet Baru";

:Sistem menampilkan form\npendaftaran atlet;

:Isi data atlet:
- Nama Lengkap
- Tanggal Lahir
- Jenis Kelamin
- Kategori (Pra Usia Dini s/d Dewasa)
- Posisi (Tunggal/Ganda/Keduanya)
- Tinggi & Berat Badan
- No. Telepon
- Alamat
- Tanggal Bergabung;

if (Upload foto?) then (ya)
  :Upload foto atlet\n(PNG/JPG, maks 5MB);
  :Sistem simpan foto\nke folder public/uploads;
else (tidak)
endif

:Klik tombol "Simpan";

:Sistem validasi data\n(Zod schema);

if (Data valid?) then (tidak)
  :Tampilkan error pada\nfield yang salah;
  stop
else (ya)
endif

:Generate Custom ID\n(BC-YYYY-XXX);

:Simpan data atlet ke MongoDB;

:Redirect ke halaman\nDetail Atlet;

:Tampilkan notifikasi\n"Atlet berhasil ditambahkan";

stop

@enduml
```

---

## 5. Class Diagram / ERD (PlantUML)

```plantuml
@startuml
!theme cerulean
skinparam classAttributeIconSize 0
title Entity Relationship Diagram - B-Club Badminton

entity "User" as user {
  * _id : ObjectId <<PK>>
  --
  name : String
  email : String <<unique>>
  password : String (bcrypt)
  phone : String
  role : enum [Admin, Pelatih, Atlet, Ketua Klub]
  status : enum [Aktif, Non-Aktif]
  createdAt : Date
  updatedAt : Date
}

entity "Athlete" as athlete {
  * _id : ObjectId <<PK>>
  --
  customId : String <<unique>> (BC-YYYY-XXX)
  name : String
  dateOfBirth : Date
  gender : enum [Laki-laki, Perempuan]
  category : enum [Pra Usia Dini, Usia Dini,
    Anak-anak, Pemula, Remaja, Taruna, Dewasa]
  position : enum [Tunggal, Ganda, Keduanya]
  status : enum [Aktif, Pemulihan, Non-Aktif, Pro Roster]
  height : Number (cm)
  weight : Number (kg)
  phone : String
  address : String
  joinDate : Date
  photo : String (file path)
  injuries[] : Embedded
  recentPerformance[] : Embedded
}

entity "Injury (Embedded)" as injury {
  type : String
  date : Date
  status : enum [Sembuh, Dalam Pemulihan]
  severity : enum [Ringan, Sedang, Berat]
}

entity "TrainingProgram" as program {
  * _id : ObjectId <<PK>>
  --
  name : String
  type : enum [Teknik, Fisik, Taktik]
  description : String
  objective : String
  target : String
  duration : Number (menit)
  drills[] : [{name, description}]
  assignedAthletes[] : ObjectId <<FK Athlete>>
}

entity "TrainingSchedule" as schedule {
  * _id : ObjectId <<PK>>
  --
  program : ObjectId <<FK TrainingProgram>>
  date : Date
  day : String
  startTime : String (HH:mm)
  endTime : String (HH:mm)
  venue : String
  coach : String
  athletes[] : ObjectId <<FK Athlete>>
  status : enum [Terjadwal, Berlangsung, Selesai, Dibatalkan]
  notes : String
}

entity "Attendance" as attendance {
  * _id : ObjectId <<PK>>
  --
  date : Date
  schedule : ObjectId <<FK TrainingSchedule>>
  athlete : ObjectId <<FK Athlete>>
  status : enum [Hadir, Izin, Tidak Hadir]
  markedBy : String
}

entity "PerformanceRecord" as performance {
  * _id : ObjectId <<PK>>
  --
  athlete : ObjectId <<FK Athlete>>
  date : Date
  score : Number (0-100)
  type : enum [Training, Post-Match]
  stats.smashSpeed : Number
  stats.footworkRating : Number
  stats.winProbability : Number
  stats.netAccuracy : Number
  recovery.overall : Number
  recovery.sleepScore : Number
  recovery.hrvStatus : String
  trend : enum [up, down, neutral]
  change : String
}

entity "CoachNote" as coachnote {
  * _id : ObjectId <<PK>>
  --
  athlete : ObjectId <<FK Athlete>>
  date : Date
  type : enum [POST-MATCH, TRAINING]
  content : String
  coach : String
}

entity "ClubSettings" as settings {
  * _id : ObjectId <<PK>>
  --
  clubName : String
  phone : String
  address : String
  email : String
  website : String
  logo : String (file path)
  favicon : String (file path)
}

' === RELASI ===
athlete ||--o{ injury : has
program ||--o{ schedule : has
schedule }o--|| program : belongs to
schedule }o--o{ athlete : includes
attendance }o--|| schedule : for
attendance }o--|| athlete : records
performance }o--|| athlete : evaluates
coachnote }o--|| athlete : about

@enduml
```

---

## 6. Use Case Diagram Sederhana (Mermaid)

Untuk render cepat, paste ke https://mermaid.live

```mermaid
graph TB
    subgraph "Pengunjung"
        A1[Login]
        A2[Register]
    end

    subgraph "Admin"
        B1[Dashboard + Statistik]
        B2[CRUD Data Atlet]
        B3[CRUD Program Latihan]
        B4[CRUD Jadwal Latihan]
        B5[Input Absensi]
        B6[Input Performa]
        B7[Catatan Pelatih]
        B8[Lihat & Ekspor Laporan PDF]
        B9[Kelola Pengaturan Klub]
        B10[Kelola Pengguna - CRUD User]
    end

    subgraph "Pelatih"
        C1[Dashboard + Statistik]
        C2[CRUD Data Atlet]
        C3[CRUD Program Latihan]
        C4[CRUD Jadwal Latihan]
        C5[Input Absensi]
        C6[Input Performa]
        C7[Catatan Pelatih]
        C8[Lihat & Ekspor Laporan PDF]
    end

    subgraph "Ketua Klub"
        D1[Dashboard + Statistik]
        D2[Lihat Data Atlet]
        D3[Lihat Performa]
        D4[Lihat & Ekspor Laporan PDF]
        D5[Kelola Pengaturan Klub]
    end

    subgraph "Atlet"
        E1[Dashboard Personal]
        E2[Lihat Performa Sendiri]
    end
```

---

## 7. CRUD Matrix per Role

| Modul | Admin | Pelatih | Ketua Klub | Atlet |
|-------|-------|---------|------------|-------|
| **Data Atlet** | CRUD | CRUD | Read | - |
| **Program Latihan** | CRUD | CRUD | - | - |
| **Jadwal Latihan** | CRUD | CRUD | - | - |
| **Absensi** | Create, Read | Create, Read | - | - |
| **Performa** | Create, Read | Create, Read | Read | Read (sendiri) |
| **Catatan Pelatih** | CRUD | CRUD | - | - |
| **Laporan** | Read, Export PDF | Read, Export PDF | Read, Export PDF | - |
| **Pengguna** | CRUD | - | Read | - |
| **Pengaturan Klub** | Read, Update | - | Read, Update | - |
| **Profil Sendiri** | Read, Update | Read, Update | Read, Update | Read, Update |

---

## Cara Render Diagram

### PlantUML (Diagram 1-5)
1. Buka https://www.plantuml.com/plantuml/uml
2. Hapus kode default
3. Paste kode PlantUML di atas
4. Klik **Submit**
5. Klik kanan gambar → **Save image as** untuk download

### Mermaid (Diagram 6)
1. Buka https://mermaid.live
2. Hapus kode default di editor kiri
3. Paste kode Mermaid di atas
4. Diagram otomatis muncul di kanan
5. Klik ikon download (PNG/SVG)

### Alternatif: ChatGPT / AI Image
Kamu juga bisa copy tabel CRUD Matrix atau deskripsi role di atas, lalu paste ke ChatGPT dan minta:
> "Buatkan use case diagram berdasarkan data ini dalam bentuk gambar"
