# Panduan Deployment PB. TIGA BERLIAN

Panduan lengkap dan detail untuk melakukan deployment aplikasi PB. TIGA BERLIAN ke VPS (Virtual Private Server) dari nol hingga website online dengan domain dan SSL.

**Teknologi yang digunakan:**
- **Frontend & Backend:** Next.js 16 (App Router, Standalone Output)
- **Database:** MongoDB 8.0
- **Reverse Proxy:** Nginx
- **Process Manager:** PM2
- **SSL:** Let's Encrypt (Certbot)

---

## Daftar Isi

1. [Kebutuhan Sistem](#1-kebutuhan-sistem)
2. [Membeli VPS Hosting](#2-membeli-vps-hosting)
3. [Membeli Domain](#3-membeli-domain)
4. [Koneksi SSH ke VPS](#4-koneksi-ssh-ke-vps)
5. [Setup Server VPS](#5-setup-server-vps)
6. [Upload Project ke GitHub](#6-upload-project-ke-github)
7. [Deploy Project ke VPS](#7-deploy-project-ke-vps)
8. [Konfigurasi PM2 (Process Manager)](#8-konfigurasi-pm2-process-manager)
9. [Konfigurasi Nginx (Reverse Proxy)](#9-konfigurasi-nginx-reverse-proxy)
10. [Menghubungkan Domain ke VPS](#10-menghubungkan-domain-ke-vps)
11. [Memasang SSL / HTTPS](#11-memasang-ssl--https)
12. [Firewall (Keamanan Server)](#12-firewall-keamanan-server)
13. [Maintenance & Update](#13-maintenance--update)
14. [Troubleshooting](#14-troubleshooting)
15. [Akun Login Default](#15-akun-login-default)

---

## 1. Kebutuhan Sistem

### 1.1 Spesifikasi VPS

| Komponen   | Minimum       | Rekomendasi     |
| ---------- | ------------- | --------------- |
| CPU        | 1 vCPU        | 2 vCPU          |
| RAM        | 2 GB          | 4 GB            |
| Storage    | 20 GB SSD     | 40 GB SSD       |
| OS         | Ubuntu 22.04  | Ubuntu 24.04 LTS|
| Bandwidth  | 1 TB          | Unlimited       |

### 1.2 Software yang Dibutuhkan

| Software | Versi   | Fungsi                                |
| -------- | ------- | ------------------------------------- |
| Node.js  | v22 LTS | Runtime JavaScript untuk Next.js      |
| MongoDB  | 8.0     | Database NoSQL                        |
| Nginx    | 1.24+   | Reverse proxy, SSL termination        |
| PM2      | 6.x     | Process manager, auto-restart         |
| Git      | 2.x     | Clone project dari GitHub             |
| Certbot  | Latest  | SSL certificate gratis (Let's Encrypt)|

### 1.3 Estimasi Biaya

| Item                            | Biaya                |
| ------------------------------- | -------------------- |
| VPS Hosting (Hostinger KVM 1)   | ~Rp 55.000/bulan     |
| Domain (.my.id via DomaiNesia)  | ~Rp 10.000/tahun     |
| SSL (Let's Encrypt)             | Gratis               |
| MongoDB (lokal di VPS)          | Gratis               |
| **Total awal**                  | **~Rp 65.000**       |
| **Total per bulan selanjutnya** | **~Rp 55.000/bulan** |

---

## 2. Membeli VPS Hosting

### 2.1 Platform yang Direkomendasikan

| Platform      | Kelebihan                        | Link                              |
| ------------- | -------------------------------- | --------------------------------- |
| **Hostinger** | Murah, panel mudah, lokasi SG    | https://www.hostinger.co.id       |
| DigitalOcean  | Stabil, dokumentasi bagus        | https://www.digitalocean.com      |
| Hetzner       | Paling murah untuk spesifikasi   | https://www.hetzner.com           |

### 2.2 Langkah Membeli di Hostinger

1. Buka https://www.hostinger.co.id/vps-hosting
2. Pilih paket **KVM 1** (2 vCPU, 2 GB RAM, 50 GB SSD)
3. Pilih lokasi server: **Singapore** (terdekat untuk Indonesia)
4. Pilih OS: **Ubuntu 24.04 64bit**
5. Di halaman **Fitur Tambahan**:
   - Centang **Pendeteksi Malware** (gratis, untuk keamanan)
   - **JANGAN** centang Docker Manager (tidak diperlukan)
6. Buat **SSH Key** (lihat langkah di bawah)
7. Selesaikan pembayaran
8. **Catat IP Address VPS** yang diberikan di dashboard Hostinger

### 2.3 Membuat SSH Key

SSH Key digunakan untuk login ke VPS secara aman tanpa password.

**Di Windows (CMD atau PowerShell):**

```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096
```

Tekan **Enter** untuk semua pertanyaan (gunakan lokasi dan passphrase default).

**Melihat public key yang sudah di-generate:**

```bash
# CMD
type %USERPROFILE%\.ssh\id_rsa.pub

# PowerShell
Get-Content ~/.ssh/id_rsa.pub
```

**Di macOS/Linux:**

```bash
ssh-keygen -t rsa -b 4096
cat ~/.ssh/id_rsa.pub
```

Copy **seluruh isi** output (dimulai dari `ssh-rsa ...`) dan paste di form SSH Key Hostinger.

---

## 3. Membeli Domain

### 3.1 Platform Domain

| Platform       | Domain .my.id   | Link                         |
| -------------- | ---------------- | ---------------------------- |
| **DomaiNesia** | ~Rp 10.000/tahun | https://www.domainesia.com   |
| Niagahoster    | ~Rp 11.000/tahun | https://www.niagahoster.co.id|

### 3.2 Langkah di DomaiNesia

1. Buka https://www.domainesia.com
2. Cari nama domain yang diinginkan (contoh: `sitigaberlian.my.id`)
3. Pilih ekstensi **.my.id** (paling murah)
4. Selesaikan pembayaran
5. **WAJIB: Verifikasi email domain** — buka email dan klik link verifikasi dari DomaiNesia/PANDI
   - Harus diselesaikan dalam **3x24 jam**, jika tidak domain akan ditangguhkan
   - Jika tidak menemukan email, klik "Kirim ulang email" di panel DomaiNesia

---

## 4. Koneksi SSH ke VPS

### 4.1 Login ke VPS

**Di Windows (CMD/PowerShell) atau macOS/Linux Terminal:**

```bash
ssh root@IP_ADDRESS_VPS
```

Contoh:
```bash
ssh root@148.230.103.107
```

Jika pertama kali login, ketik `yes` saat diminta konfirmasi fingerprint.

### 4.2 Tips SSH

- Jika koneksi terputus, cukup jalankan `ssh root@IP_ADDRESS_VPS` lagi
- Untuk keluar dari VPS, ketik `exit`
- Jika SSH key sudah terpasang, tidak perlu memasukkan password

---

## 5. Setup Server VPS

Semua perintah di section ini dijalankan **di dalam VPS** (setelah SSH login).

### 5.1 Update Sistem

```bash
apt update && apt upgrade -y
```

### 5.2 Install Node.js 22 LTS

```bash
# Tambah repository NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

# Install Node.js
apt install -y nodejs
```

**Verifikasi:**
```bash
node -v    # Output: v22.x.x
npm -v     # Output: 11.x.x
```

### 5.3 Install MongoDB 8.0

> **PENTING:** MongoDB 7.0 **TIDAK** mendukung Ubuntu 24.04 (Noble).
> Gunakan MongoDB 8.0 yang sudah support Ubuntu 24.04.

```bash
# Install dependensi
apt install -y gnupg curl

# Tambah GPG key MongoDB 8.0
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
  gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg

# Tambah repository MongoDB 8.0 untuk Ubuntu 24.04 (Noble)
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] \
  http://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | \
  tee /etc/apt/sources.list.d/mongodb-org-8.0.list

# Install MongoDB
apt update
apt install -y mongodb-org

# Start MongoDB dan set auto-start saat boot
systemctl start mongod
systemctl enable mongod
```

> Jika menggunakan **Ubuntu 22.04 (Jammy)**, ganti `noble` dengan `jammy` pada perintah repository di atas.

**Verifikasi:**
```bash
mongosh --eval "db.version()"    # Output: 8.0.x
systemctl status mongod           # Harus "active (running)"
```

### 5.4 Install Nginx

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

**Verifikasi:**
```bash
nginx -v    # Output: nginx/1.24.x
```

### 5.5 Install PM2

```bash
npm install -g pm2
```

**Verifikasi:**
```bash
pm2 -v    # Output: 6.x.x
```

### 5.6 Install Git

```bash
apt install -y git
```

### 5.7 Verifikasi Semua Tool

Jalankan perintah ini untuk memastikan semua software terinstall dengan benar:

```bash
echo "============================="
echo "  Verifikasi Server Setup"
echo "============================="
echo "Node.js : $(node -v)"
echo "npm     : $(npm -v)"
echo "MongoDB : $(mongosh --quiet --eval 'db.version()')"
echo "Nginx   : $(nginx -v 2>&1)"
echo "PM2     : $(pm2 -v)"
echo "Git     : $(git --version)"
echo "============================="
```

Pastikan semua menampilkan versi yang benar sebelum lanjut ke langkah berikutnya.

---

## 6. Upload Project ke GitHub

Section ini dijalankan **di laptop/komputer lokal** (bukan VPS).

### 6.1 Pastikan .gitignore Sudah Benar

Pastikan file `.gitignore` di root project mengandung minimal:

```
node_modules
.next/
.env*
```

> **PENTING:** Jangan pernah push file `.env.local` ke GitHub! File ini berisi secret key.

### 6.2 Buat Repository di GitHub

1. Buka https://github.com/new
2. **Repository name:** nama project (contoh: `wahyu-project`)
3. **Visibility:** pilih **Private** (supaya kode tidak publik)
4. **JANGAN** centang apapun (no README, no .gitignore, no license)
5. Klik **Create repository**

### 6.3 Konfigurasi Git (Sekali Saja)

```bash
git config --global user.name "Nama Kamu"
git config --global user.email "email-github-kamu@gmail.com"
```

> Gunakan email yang sama dengan akun GitHub kamu.

### 6.4 Push Project ke GitHub

```bash
cd "D:\SEKOLAH\wahyu-project"

# Inisialisasi git
git init

# Tambahkan semua file
git add .

# Commit
git commit -m "Initial commit - PB. TIGA BERLIAN"

# Set branch utama
git branch -M main

# Tambahkan remote repository
git remote add origin https://github.com/USERNAME/REPO-NAME.git

# Push ke GitHub
git push -u origin main
```

> Ganti `USERNAME` dengan username GitHub kamu dan `REPO-NAME` dengan nama repository.

### 6.5 Jika Diminta Password (Personal Access Token)

GitHub tidak menerima password biasa. Kamu perlu **Personal Access Token**:

1. Buka https://github.com/settings/tokens
2. Klik **Generate new token (classic)**
3. Beri nama token (contoh: "VPS Deploy")
4. Centang scope **repo** (full control of private repositories)
5. Klik **Generate token**
6. **Copy token** — ini hanya muncul sekali!
7. Gunakan token ini sebagai password saat diminta oleh git

---

## 7. Deploy Project ke VPS

Kembali ke **VPS via SSH** untuk langkah-langkah berikut.

### 7.1 Clone Project dari GitHub

```bash
cd /var/www
git clone https://github.com/USERNAME/REPO-NAME.git bclub
```

> Jika repository **Private**, masukkan username GitHub dan Personal Access Token sebagai password.

```bash
cd /var/www/bclub
```

### 7.2 Buat File Environment Production

```bash
cat > /var/www/bclub/.env.local << EOF
MONGODB_URI=mongodb://localhost:27017/bclub
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF
```

**Verifikasi isi file:**
```bash
cat /var/www/bclub/.env.local
```

Output harus menampilkan 3 variabel:
- `MONGODB_URI` — koneksi ke MongoDB lokal
- `JWT_SECRET` — string acak (otomatis di-generate)
- `NODE_ENV` — production

> **PENTING:** Catat nilai `JWT_SECRET` yang di-generate. Nilai ini dibutuhkan untuk konfigurasi PM2 di langkah berikutnya.

### 7.3 Install Dependencies

```bash
cd /var/www/bclub
npm install
```

Tunggu hingga selesai. Jika ada warning bisa diabaikan, yang penting tidak ada error.

### 7.4 Build Project

```bash
npm run build
```

Proses build memakan waktu 1-3 menit. Pastikan output akhir menampilkan:
```
✓ Generating static pages
✓ Collecting build traces
✓ Finalizing page optimization
```

> Jika build gagal karena **kehabisan RAM**, lihat section [Troubleshooting - Build Gagal](#build-gagal-out-of-memory).

### 7.5 Copy Static Files untuk Standalone

Next.js standalone output **tidak** menyertakan folder `public` dan `.next/static` secara otomatis. Kamu perlu meng-copy-nya:

```bash
# Copy folder public ke standalone
cp -r /var/www/bclub/public /var/www/bclub/.next/standalone/public

# Copy folder static ke standalone
cp -r /var/www/bclub/.next/static /var/www/bclub/.next/standalone/.next/static
```

> **PENTING:** Langkah ini **WAJIB** dilakukan setiap kali build ulang. Tanpa ini, gambar, ikon, dan CSS tidak akan dimuat.

### 7.6 Seed Database (Data Awal)

```bash
cd /var/www/bclub
npm run seed
```

Output yang diharapkan:
```
Connecting to MongoDB...
Connected!
Clearing existing data...
Seeding athletes...
  Created 15 athletes
...
SEED COMPLETED SUCCESSFULLY!
```

Di akhir seed akan ditampilkan daftar akun login (lihat [Section 15](#15-akun-login-default)).

---

## 8. Konfigurasi PM2 (Process Manager)

### 8.1 Mengapa Perlu Ecosystem File?

Next.js standalone server (`server.js`) **TIDAK** membaca file `.env.local` secara otomatis. Environment variables harus diset langsung melalui PM2 ecosystem file.

### 8.2 Buat Ecosystem File

Pertama, lihat nilai `JWT_SECRET` yang sudah di-generate:

```bash
cat /var/www/bclub/.env.local
```

Catat nilai `JWT_SECRET` (contoh: `4AqbTCh50l/HI3cayMrHpEqxnWdvqHCnV0MHlkKMCpI=`).

Lalu buat ecosystem file:

```bash
cat > /var/www/bclub/ecosystem.config.js << 'ECOSYSTEMEOF'
module.exports = {
  apps: [{
    name: "bclub",
    script: ".next/standalone/server.js",
    cwd: "/var/www/bclub",
    env: {
      NODE_ENV: "production",
      MONGODB_URI: "mongodb://localhost:27017/bclub",
      JWT_SECRET: "GANTI_DENGAN_JWT_SECRET_KAMU"
    }
  }]
};
ECOSYSTEMEOF
```

**Edit file dan ganti JWT_SECRET:**

```bash
nano /var/www/bclub/ecosystem.config.js
```

Ganti `GANTI_DENGAN_JWT_SECRET_KAMU` dengan nilai JWT_SECRET yang sebenarnya. Tekan `Ctrl+O` untuk save, `Ctrl+X` untuk keluar.

### 8.3 Jalankan Aplikasi

```bash
cd /var/www/bclub

# Start aplikasi dengan ecosystem file
pm2 start ecosystem.config.js

# Simpan konfigurasi PM2 (agar auto-start setelah reboot)
pm2 save

# Setup auto-start saat VPS reboot
pm2 startup
```

> Jika `pm2 startup` menampilkan perintah yang harus dijalankan, copy-paste dan jalankan perintah tersebut.

### 8.4 Verifikasi

```bash
# Cek status — harus menampilkan "online"
pm2 status

# Cek log — pastikan tidak ada error
pm2 logs bclub --lines 20

# Test akses lokal
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# Output harus: 200 atau 307 (redirect)
```

### 8.5 Perintah PM2 yang Sering Digunakan

| Perintah              | Fungsi                            |
| --------------------- | --------------------------------- |
| `pm2 status`          | Lihat status semua aplikasi       |
| `pm2 logs bclub`      | Lihat log realtime                |
| `pm2 logs bclub --err`| Lihat log error saja              |
| `pm2 restart bclub`   | Restart aplikasi                  |
| `pm2 stop bclub`      | Stop aplikasi                     |
| `pm2 delete bclub`    | Hapus aplikasi dari PM2           |
| `pm2 monit`           | Monitor CPU & RAM realtime        |
| `pm2 flush`           | Bersihkan semua log               |

---

## 9. Konfigurasi Nginx (Reverse Proxy)

Nginx berfungsi sebagai reverse proxy — menerima request dari internet (port 80/443) dan meneruskannya ke Next.js (port 3000).

### 9.1 Buat Konfigurasi Nginx

```bash
cat > /etc/nginx/sites-available/bclub << 'EOF'
server {
    listen 80;
    server_name NAMA_DOMAIN www.NAMA_DOMAIN;

    # Batas ukuran upload (untuk foto atlet dll)
    client_max_body_size 10M;

    # Reverse proxy ke Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve static files langsung dari Nginx (lebih cepat)
    location /_next/static {
        alias /var/www/bclub/.next/standalone/.next/static;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    location /public {
        alias /var/www/bclub/.next/standalone/public;
        expires 30d;
        access_log off;
    }
}
EOF
```

> **GANTI** `NAMA_DOMAIN` dengan domain kamu (contoh: `sitigaberlian.my.id`).
> Jika belum punya domain, gunakan IP address VPS sementara.

### 9.2 Aktifkan Konfigurasi

```bash
# Buat symlink ke sites-enabled
ln -sf /etc/nginx/sites-available/bclub /etc/nginx/sites-enabled/

# Hapus konfigurasi default Nginx
rm -f /etc/nginx/sites-enabled/default

# Test konfigurasi — harus menampilkan "syntax is ok"
nginx -t

# Restart Nginx
systemctl restart nginx
```

### 9.3 Test Akses via IP

Buka browser: `http://IP_ADDRESS_VPS`

Contoh: `http://148.230.103.107`

Jika landing page PB. TIGA BERLIAN muncul (hero section dengan logo klub), Nginx sudah bekerja dengan benar.

---

## 10. Menghubungkan Domain ke VPS

### 10.1 Atur DNS Record di DomaiNesia

1. Login ke https://my.domainesia.com
2. Klik domain kamu
3. Buka menu **DNS Management**
4. Tambahkan 2 record berikut:

| Tipe | Host Name | Address          |
| ---- | --------- | ---------------- |
| A    | `@`       | `IP_ADDRESS_VPS` |
| A    | `www`     | `IP_ADDRESS_VPS` |

> **Tips:** Jika Host Name kosong menghasilkan error, coba isi dengan `@`.

5. Klik **Save Changes**

### 10.2 Tunggu Propagasi DNS

DNS membutuhkan waktu **5 menit sampai maksimal 24 jam** untuk propagasi ke seluruh dunia.

**Cek apakah DNS sudah aktif (jalankan di VPS):**

```bash
# Install dig jika belum ada
apt install -y dnsutils

# Cek DNS
dig +short NAMA_DOMAIN
```

Jika output menampilkan IP VPS kamu (contoh: `148.230.103.107`), berarti DNS sudah aktif.

**Cek dari laptop:**

```bash
# Windows CMD
nslookup NAMA_DOMAIN

# macOS/Linux
dig +short NAMA_DOMAIN
```

### 10.3 Update Nginx dengan Domain

Jika sebelumnya kamu menggunakan IP address di konfigurasi Nginx, update sekarang:

```bash
nano /etc/nginx/sites-available/bclub
```

Pastikan baris `server_name` sudah berisi domain:
```
server_name sitigaberlian.my.id www.sitigaberlian.my.id;
```

Lalu restart Nginx:
```bash
nginx -t
systemctl restart nginx
```

### 10.4 Test Akses via Domain

Buka browser: `http://NAMA_DOMAIN`

Contoh: `http://sitigaberlian.my.id`

### 10.5 Halaman Publik yang Tersedia

Setelah deployment, halaman berikut bisa diakses **tanpa login**:

| Halaman | URL | Deskripsi |
|---------|-----|-----------|
| Landing Page | `/` | Hero, statistik, atlet unggulan |
| Profil Klub | `/klub` | Profil klub, statistik, prestasi terbaru |
| Daftar Atlet | `/atlet` | Daftar semua atlet aktif (search & filter) |
| Detail Atlet | `/atlet/[id]` | Profil atlet + prestasi (data kontak disensor) |

> **Catatan:** Data sensitif (telepon, email, alamat) otomatis disensor di halaman publik.

---

## 11. Memasang SSL / HTTPS

SSL membuat website diakses via `https://` dengan ikon gembok, menandakan koneksi terenkripsi.

### 11.1 Install Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 11.2 Generate & Deploy SSL

```bash
certbot --nginx -d NAMA_DOMAIN -d www.NAMA_DOMAIN
```

Contoh:
```bash
certbot --nginx -d sitigaberlian.my.id -d www.sitigaberlian.my.id
```

**Ikuti prompt yang muncul:**
1. **Enter email address** → masukkan email kamu (untuk notifikasi expiry)
2. **Agree to the terms of service** → ketik `Y`
3. **Share your email** → ketik `N` (opsional)

Certbot akan otomatis:
- Generate sertifikat SSL
- Update konfigurasi Nginx untuk HTTPS
- Redirect HTTP ke HTTPS

### 11.3 Verifikasi SSL

Buka browser: `https://NAMA_DOMAIN`

Harus menampilkan **ikon gembok** di address bar (secure).

### 11.4 Auto-Renew SSL

Certbot otomatis membuat jadwal renew. Untuk memastikan auto-renew berfungsi:

```bash
certbot renew --dry-run
```

Harus menampilkan: `Congratulations, all simulated renewals succeeded`.

> SSL Let's Encrypt berlaku **90 hari** dan akan di-renew otomatis oleh certbot timer.

**Cek timer certbot:**
```bash
systemctl list-timers | grep certbot
```

---

## 12. Firewall (Keamanan Server)

Aktifkan UFW (Uncomplicated Firewall) untuk membatasi akses ke VPS.

```bash
# Izinkan SSH (WAJIB — jangan sampai terkunci!)
ufw allow OpenSSH

# Izinkan HTTP & HTTPS untuk Nginx
ufw allow 'Nginx Full'

# Aktifkan firewall
ufw enable
```

Ketik `y` saat diminta konfirmasi.

**Verifikasi:**
```bash
ufw status
```

Output yang diharapkan:
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
```

> **PERINGATAN:** Pastikan `OpenSSH` sudah di-allow **SEBELUM** menjalankan `ufw enable`. Jika tidak, kamu bisa terkunci dari VPS.

---

## 13. Maintenance & Update

### 13.1 Update Kode dari GitHub

Setiap kali ada perubahan kode di laptop dan sudah di-push ke GitHub:

**Di laptop:**
```bash
cd "D:\SEKOLAH\wahyu-project"
git add .
git commit -m "deskripsi perubahan"
git push
```

**Di VPS (SSH):**
```bash
cd /var/www/bclub
git pull
npm install
npm run build

# Copy ulang static files (WAJIB setelah build)
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

# Restart aplikasi
pm2 restart bclub
```

### 13.2 Monitoring Aplikasi

```bash
# Cek status aplikasi
pm2 status

# Lihat log realtime (Ctrl+C untuk keluar)
pm2 logs bclub

# Lihat 50 baris log error terakhir
pm2 logs bclub --err --lines 50

# Monitor CPU & Memory secara realtime
pm2 monit
```

### 13.3 Restart Aplikasi

```bash
pm2 restart bclub    # Restart
pm2 stop bclub       # Stop
pm2 start bclub      # Start ulang
pm2 reload bclub     # Reload tanpa downtime (zero-downtime)
```

### 13.4 Update Sistem Server

Lakukan secara berkala (minimal 1x sebulan):

```bash
apt update && apt upgrade -y
```

Setelah upgrade, restart services jika diperlukan:
```bash
systemctl restart mongod
pm2 restart bclub
systemctl restart nginx
```

### 13.5 Backup Database

**Backup manual:**
```bash
# Buat folder backup
mkdir -p /root/backup

# Backup database
mongodump --db bclub --out /root/backup/$(date +%Y%m%d)
```

**Restore dari backup:**
```bash
mongorestore --db bclub --drop /root/backup/TANGGAL/bclub/
```

> Ganti `TANGGAL` dengan nama folder backup (contoh: `20260226`).

**Backup otomatis (harian via crontab):**
```bash
# Buka crontab editor
crontab -e

# Tambahkan baris ini di akhir file (backup setiap jam 2 pagi):
0 2 * * * mongodump --db bclub --out /root/backup/$(date +\%Y\%m\%d) && find /root/backup -mtime +7 -exec rm -rf {} + 2>/dev/null
```

> Backup otomatis setiap hari jam 02:00, dan hapus backup yang lebih dari 7 hari.

### 13.6 Cek Disk Usage

```bash
# Lihat penggunaan disk
df -h

# Lihat ukuran folder project
du -sh /var/www/bclub

# Lihat ukuran database
mongosh bclub --eval "db.stats().dataSize / 1024 / 1024 + ' MB'"
```

---

## 14. Troubleshooting

### Aplikasi Tidak Bisa Diakses

```bash
# 1. Cek apakah PM2 berjalan
pm2 status

# 2. Cek apakah port 3000 aktif
curl http://localhost:3000

# 3. Cek log error
pm2 logs bclub --err --lines 50

# 4. Restart aplikasi
pm2 restart bclub
```

### Error: MONGODB_URI Environment Variable

```
Error: Please define the MONGODB_URI environment variable in .env.local
```

**Penyebab:** Next.js standalone tidak membaca `.env.local` secara otomatis.

**Solusi:** Pastikan environment variables diset melalui `ecosystem.config.js` (lihat [Section 8](#8-konfigurasi-pm2-process-manager)).

```bash
# Verifikasi ecosystem file punya env vars
cat /var/www/bclub/ecosystem.config.js

# Restart dengan ecosystem file
pm2 delete bclub
pm2 start /var/www/bclub/ecosystem.config.js
pm2 save
```

### Gambar/CSS Tidak Muncul

**Penyebab:** Folder `public` dan `.next/static` belum di-copy ke standalone.

**Solusi:**
```bash
cd /var/www/bclub
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
pm2 restart bclub
```

### Nginx Error

```bash
# Test konfigurasi
nginx -t

# Cek log error Nginx
tail -30 /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

### MongoDB Tidak Berjalan

```bash
# Cek status
systemctl status mongod

# Start ulang
systemctl restart mongod

# Cek log MongoDB
tail -30 /var/log/mongodb/mongod.log
```

### SSL Gagal Renew

```bash
# Cek status sertifikat
certbot certificates

# Renew manual
certbot renew

# Restart Nginx setelah renew
systemctl restart nginx
```

### Disk Penuh

```bash
# Cek penggunaan disk
df -h

# Cari folder besar
du -sh /var/www/bclub/node_modules
du -sh /var/log/*

# Bersihkan log PM2
pm2 flush

# Bersihkan journal log (simpan 7 hari terakhir)
journalctl --vacuum-time=7d

# Hapus backup lama
find /root/backup -mtime +7 -exec rm -rf {} +
```

### Build Gagal (Out of Memory)

Jika `npm run build` gagal karena kehabisan RAM (biasanya di VPS 1-2 GB):

```bash
# Buat swap file 2GB
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Tambahkan ke fstab agar permanen (survive reboot)
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Verifikasi swap aktif
free -h

# Coba build ulang
cd /var/www/bclub && npm run build
```

### Port 3000 Sudah Digunakan

```bash
# Cari proses yang menggunakan port 3000
lsof -i :3000

# Kill proses tersebut
kill -9 PID_DARI_OUTPUT

# Start ulang PM2
pm2 restart bclub
```

---

## 15. Akun Login Default

Setelah menjalankan `npm run seed`, akun-akun berikut tersedia:

| Email               | Password   | Role        |
| ------------------- | ---------- | ----------- |
| admin@bclub.id      | admin123   | Admin       |
| peter@bclub.id      | coach123   | Pelatih     |
| liliyana@bclub.id   | coach123   | Pelatih     |
| marcus@bclub.id     | atlet123   | Atlet       |
| kevin@bclub.id      | atlet123   | Atlet       |
| gregoria@bclub.id   | atlet123   | Atlet       |
| ketua@bclub.id      | ketua123   | Ketua Klub  |

> **PENTING untuk Production:** Segera ganti password akun admin setelah deployment melalui halaman Pengaturan.

---

## Ringkasan Arsitektur Sistem

```
                    Internet (User Browser)
                           │
                           ▼
              ┌─────────────────────────┐
              │  Domain: example.my.id  │
              │  (DNS A Record → VPS IP)│
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │   VPS (Ubuntu 24.04)    │
              │   IP: xxx.xxx.xxx.xxx   │
              │                         │
              │  ┌───────────────────┐  │
              │  │   Nginx (:80/443) │  │
              │  │   Reverse Proxy   │  │
              │  │   + SSL (HTTPS)   │  │
              │  └────────┬──────────┘  │
              │           │             │
              │           ▼             │
              │  ┌───────────────────┐  │
              │  │   PM2 → Node.js  │  │
              │  │   Next.js (:3000)│  │
              │  │   Standalone     │  │
              │  └────────┬──────────┘  │
              │           │             │
              │           ▼             │
              │  ┌───────────────────┐  │
              │  │  MongoDB 8.0     │  │
              │  │  (:27017)        │  │
              │  └───────────────────┘  │
              └─────────────────────────┘
```

**Alur Request:**
1. User buka `https://example.my.id` di browser
2. DNS mengarahkan ke IP VPS
3. Nginx menerima request di port 80/443 (dengan SSL)
4. Nginx meneruskan request ke Next.js di port 3000
5. Next.js memproses request dan query ke MongoDB
6. Response dikirim kembali ke user melalui jalur yang sama

---

## Checklist Deployment

Gunakan checklist ini untuk memastikan semua langkah sudah dilakukan:

- [ ] VPS aktif dan bisa diakses via SSH
- [ ] Sistem di-update (`apt update && apt upgrade -y`)
- [ ] Node.js v22 terinstall (`node -v`)
- [ ] MongoDB 8.0 terinstall dan running (`systemctl status mongod`)
- [ ] Nginx terinstall dan running (`systemctl status nginx`)
- [ ] PM2 terinstall (`pm2 -v`)
- [ ] Git terinstall (`git --version`)
- [ ] Project di-push ke GitHub (private repo)
- [ ] Project di-clone ke VPS di `/var/www/bclub`
- [ ] File `.env.local` dibuat dengan JWT_SECRET yang kuat
- [ ] `npm install` berhasil tanpa error
- [ ] `npm run build` berhasil tanpa error
- [ ] Static files di-copy ke standalone (`public` dan `.next/static`)
- [ ] `npm run seed` berhasil (data awal masuk ke database)
- [ ] `ecosystem.config.js` dibuat dengan environment variables
- [ ] PM2 menjalankan aplikasi (status: online)
- [ ] PM2 auto-start dikonfigurasi (`pm2 save && pm2 startup`)
- [ ] Nginx dikonfigurasi sebagai reverse proxy
- [ ] DNS domain mengarah ke IP VPS (A record)
- [ ] Email domain terverifikasi
- [ ] SSL terpasang via Certbot (HTTPS aktif, ikon gembok)
- [ ] SSL auto-renew berfungsi (`certbot renew --dry-run`)
- [ ] Firewall UFW aktif (SSH, HTTP, HTTPS allowed)
- [ ] Website bisa diakses via `https://NAMA_DOMAIN`
- [ ] Login berhasil dengan akun seed (`admin@bclub.id`)
- [ ] Password admin diganti untuk production
