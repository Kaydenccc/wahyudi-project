# Panduan Deployment B-Club Badminton

Panduan lengkap untuk melakukan deployment aplikasi B-Club Badminton dari awal (setup VPS) hingga website online dengan SSL.

---

## Daftar Isi

1. [Kebutuhan Sistem](#1-kebutuhan-sistem)
2. [Membeli VPS Hosting](#2-membeli-vps-hosting)
3. [Membeli Domain](#3-membeli-domain)
4. [Setup Server VPS](#4-setup-server-vps)
5. [Upload Project ke GitHub](#5-upload-project-ke-github)
6. [Deploy Project ke VPS](#6-deploy-project-ke-vps)
7. [Konfigurasi Nginx](#7-konfigurasi-nginx)
8. [Menghubungkan Domain ke VPS](#8-menghubungkan-domain-ke-vps)
9. [Memasang SSL (HTTPS)](#9-memasang-ssl-https)
10. [Maintenance & Update](#10-maintenance--update)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Kebutuhan Sistem

### Spesifikasi VPS Minimum

| Komponen | Minimum | Rekomendasi |
|----------|---------|-------------|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 2 GB | 4 GB |
| Storage | 20 GB SSD | 40 GB SSD |
| OS | Ubuntu 22.04/24.04 LTS | Ubuntu 24.04 LTS |
| Bandwidth | 1 TB | Unlimited |

### Software yang Dibutuhkan

| Software | Versi | Fungsi |
|----------|-------|--------|
| Node.js | v22.x LTS | Runtime JavaScript |
| MongoDB | 8.0 | Database |
| Nginx | 1.24+ | Reverse proxy & static files |
| PM2 | 6.x | Process manager (auto-restart) |
| Git | 2.x | Version control |
| Certbot | Latest | SSL certificate (Let's Encrypt) |

### Estimasi Biaya

| Item | Biaya |
|------|-------|
| VPS Hosting (Hostinger KVM 1) | ~Rp 55.000/bulan |
| Domain (.my.id) | ~Rp 10.000/tahun |
| SSL (Let's Encrypt) | Gratis |
| MongoDB (lokal di VPS) | Gratis |
| **Total awal** | **~Rp 65.000** |
| **Total per bulan** | **~Rp 55.000/bulan** |

---

## 2. Membeli VPS Hosting

### Platform yang Direkomendasikan

- **Hostinger** (Rekomendasi untuk pemula) — https://www.hostinger.co.id
- **DigitalOcean** — https://www.digitalocean.com
- **Hetzner** (Termurah) — https://www.hetzner.com

### Langkah di Hostinger

1. Buka https://www.hostinger.co.id/vps-hosting
2. Pilih paket **KVM 1** (2 vCPU, 2 GB RAM, 50 GB SSD)
3. Pilih lokasi server: **Singapore** (terdekat untuk Indonesia)
4. Pilih OS: **Ubuntu 24.04 LTS**
5. Buat **SSH Key** untuk login aman:

   **Generate SSH Key di laptop (CMD/PowerShell):**
   ```bash
   ssh-keygen -t rsa -b 4096
   ```
   Tekan Enter untuk semua pertanyaan (gunakan default).

   **Lihat public key:**
   ```bash
   type %USERPROFILE%\.ssh\id_rsa.pub
   ```

   Copy hasilnya dan paste di form SSH Key Hostinger.

6. Selesaikan pembayaran
7. Catat **IP Address** VPS yang diberikan

### Login ke VPS via SSH

```bash
ssh root@IP_ADDRESS_VPS
```

Contoh:
```bash
ssh root@148.230.103.107
```

---

## 3. Membeli Domain

### Platform Domain yang Direkomendasikan

- **DomaiNesia** — https://www.domainesia.com (domain .my.id murah)
- **Niagahoster** — https://www.niagahoster.co.id
- **Namecheap** — https://www.namecheap.com

### Langkah di DomaiNesia

1. Buka https://www.domainesia.com
2. Cari nama domain yang diinginkan (contoh: `sitigaberlian.my.id`)
3. Pilih ekstensi **.my.id** (hanya ~Rp 10.000/tahun)
4. Selesaikan pembayaran
5. **PENTING**: Verifikasi email domain yang dikirim ke email kamu (wajib dalam 3x24 jam)

---

## 4. Setup Server VPS

Login ke VPS via SSH, lalu jalankan perintah-perintah berikut.

### 4.1 Update Sistem

```bash
apt update && apt upgrade -y
```

### 4.2 Install Node.js 22 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
```

Verifikasi:
```bash
node -v    # Harus v22.x.x
npm -v     # Harus 11.x.x
```

### 4.3 Install MongoDB 8.0

> **PENTING**: MongoDB 7.0 TIDAK mendukung Ubuntu 24.04. Gunakan MongoDB 8.0.

```bash
# Install dependensi
apt install -y gnupg curl

# Tambah GPG key MongoDB 8.0
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg

# Tambah repository (Ubuntu 24.04 Noble)
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] http://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-8.0.list

# Install MongoDB
apt update
apt install -y mongodb-org

# Start & enable MongoDB
systemctl start mongod
systemctl enable mongod
```

> Jika menggunakan **Ubuntu 22.04 (Jammy)**, ganti `noble` dengan `jammy` pada repository.

Verifikasi:
```bash
mongosh --eval "db.version()"    # Harus 8.0.x
```

### 4.4 Install Nginx

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

Verifikasi:
```bash
nginx -v    # Harus nginx/1.24.x
```

### 4.5 Install PM2

```bash
npm install -g pm2
```

Verifikasi:
```bash
pm2 -v    # Harus 6.x.x
```

### 4.6 Install Git

```bash
apt install -y git
```

### 4.7 Verifikasi Semua Tool

```bash
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"
echo "MongoDB: $(mongosh --quiet --eval 'db.version()')"
echo "Nginx: $(nginx -v 2>&1)"
echo "PM2: $(pm2 -v)"
echo "Git: $(git --version)"
```

Pastikan semua menampilkan versi yang benar.

---

## 5. Upload Project ke GitHub

### 5.1 Pastikan .gitignore Sudah Benar

File `.gitignore` harus mengandung:
```
node_modules
.next/
.env*
```

> **PENTING**: Jangan pernah push file `.env.local` ke GitHub!

### 5.2 Buat Repository di GitHub

1. Buka https://github.com/new
2. Repository name: nama project
3. Visibility: **Private**
4. Jangan centang apapun
5. Klik **Create repository**

### 5.3 Push Project

```bash
cd path/ke/project

# Konfigurasi git (sekali saja)
git config --global user.name "Nama Kamu"
git config --global user.email "email-github@gmail.com"

# Inisialisasi & push
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main
```

> Jika diminta password, gunakan **Personal Access Token** (bukan password GitHub):
> 1. Buka https://github.com/settings/tokens
> 2. Generate new token (classic)
> 3. Centang **repo**
> 4. Copy token, gunakan sebagai password

---

## 6. Deploy Project ke VPS

### 6.1 Clone Project dari GitHub

```bash
cd /var/www
git clone https://github.com/USERNAME/REPO-NAME.git bclub
cd /var/www/bclub
```

### 6.2 Buat File Environment Production

```bash
cat > .env.local << EOF
MONGODB_URI=mongodb://localhost:27017/bclub
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF
```

Verifikasi:
```bash
cat .env.local
```

> **PENTING**: Pastikan `JWT_SECRET` adalah string acak yang kuat (minimal 32 karakter). Perintah di atas otomatis generate random string.

### 6.3 Install Dependencies

```bash
npm install
```

### 6.4 Build Project

```bash
npm run build
```

Pastikan build selesai tanpa error.

### 6.5 Seed Database (Data Awal)

```bash
npm run seed
```

### 6.6 Jalankan dengan PM2

```bash
# Start aplikasi menggunakan standalone output Next.js
pm2 start node --name "bclub" -- .next/standalone/server.js

# Simpan konfigurasi PM2 (agar persist setelah reboot)
pm2 save

# Setup auto-start saat VPS reboot
pm2 startup
```

Verifikasi:
```bash
pm2 status
```

Harus menampilkan app `bclub` dengan status `online`.

### 6.7 Test Akses via IP

Buka browser: `http://IP_ADDRESS_VPS`

Contoh: `http://148.230.103.107`

---

## 7. Konfigurasi Nginx

### 7.1 Buat Konfigurasi Nginx

```bash
cat > /etc/nginx/sites-available/bclub << 'EOF'
server {
    listen 80;
    server_name NAMA_DOMAIN www.NAMA_DOMAIN;

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

    location /_next/static {
        alias /var/www/bclub/.next/static;
        expires 365d;
        access_log off;
    }
}
EOF
```

> Ganti `NAMA_DOMAIN` dengan domain kamu (contoh: `sitigaberlian.my.id`).

### 7.2 Aktifkan Konfigurasi

```bash
# Buat symlink
ln -sf /etc/nginx/sites-available/bclub /etc/nginx/sites-enabled/

# Hapus konfigurasi default
rm -f /etc/nginx/sites-enabled/default

# Test konfigurasi
nginx -t

# Restart Nginx
systemctl restart nginx
```

`nginx -t` harus menampilkan `syntax is ok` dan `test is successful`.

---

## 8. Menghubungkan Domain ke VPS

### 8.1 Atur DNS di Registrar Domain

Masuk ke panel domain (contoh: DomaiNesia) dan tambahkan DNS record:

| Tipe | Host Name | Address/Value |
|------|-----------|---------------|
| A | `@` | `IP_ADDRESS_VPS` |
| A | `www` | `IP_ADDRESS_VPS` |

> Jika Host Name kosong tidak bisa, coba isi dengan `@`.

### 8.2 Tunggu Propagasi DNS

DNS membutuhkan waktu **5 menit — 24 jam** untuk propagasi. Cek di VPS:

```bash
dig +short NAMA_DOMAIN
```

Jika hasilnya menampilkan IP VPS kamu, berarti DNS sudah aktif.

### 8.3 Test Akses via Domain

Buka browser: `http://NAMA_DOMAIN`

---

## 9. Memasang SSL (HTTPS)

### 9.1 Install Certbot

```bash
apt install certbot python3-certbot-nginx -y
```

### 9.2 Generate & Deploy SSL

```bash
certbot --nginx -d NAMA_DOMAIN -d www.NAMA_DOMAIN
```

Ikuti prompt:
1. **Email** → masukkan email kamu
2. **Agree to terms** → ketik `Y`
3. **Share email** → ketik `N`

### 9.3 Verifikasi SSL

Buka browser: `https://NAMA_DOMAIN`

Harus menampilkan ikon gembok (secure).

### 9.4 Auto-Renew SSL

Certbot otomatis setup auto-renew. Untuk memastikan:

```bash
certbot renew --dry-run
```

Harus menampilkan `Congratulations, all simulated renewals succeeded`.

> SSL Let's Encrypt berlaku 90 hari dan akan di-renew otomatis.

---

## 10. Maintenance & Update

### 10.1 Update Kode dari GitHub

Setiap kali ada perubahan kode di GitHub:

```bash
cd /var/www/bclub
git pull
npm install
npm run build
pm2 restart bclub
```

### 10.2 Monitoring

```bash
# Cek status aplikasi
pm2 status

# Lihat log aplikasi (realtime)
pm2 logs bclub

# Lihat log error saja
pm2 logs bclub --err

# Monitor CPU & Memory
pm2 monit
```

### 10.3 Restart Aplikasi

```bash
# Restart aplikasi
pm2 restart bclub

# Stop aplikasi
pm2 stop bclub

# Start ulang
pm2 start bclub
```

### 10.4 Update Sistem Server

Lakukan secara berkala (minimal 1x sebulan):

```bash
apt update && apt upgrade -y
```

### 10.5 Backup Database

```bash
# Backup
mongodump --db bclub --out /root/backup/$(date +%Y%m%d)

# Restore (jika diperlukan)
mongorestore --db bclub /root/backup/TANGGAL/bclub/
```

### 10.6 Cek Disk Usage

```bash
df -h
```

---

## 11. Troubleshooting

### Aplikasi Tidak Bisa Diakses

```bash
# Cek apakah PM2 berjalan
pm2 status

# Cek apakah port 3000 aktif
curl http://localhost:3000

# Cek log error
pm2 logs bclub --err --lines 50

# Restart aplikasi
pm2 restart bclub
```

### Nginx Error

```bash
# Test konfigurasi
nginx -t

# Cek log Nginx
tail -20 /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

### MongoDB Tidak Berjalan

```bash
# Cek status
systemctl status mongod

# Start ulang
systemctl restart mongod

# Cek log
tail -20 /var/log/mongodb/mongod.log
```

### SSL Gagal Renew

```bash
# Cek status certbot
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

# Cari file besar
du -sh /var/www/bclub/node_modules
du -sh /var/log/*

# Bersihkan log PM2
pm2 flush

# Bersihkan journal log
journalctl --vacuum-time=7d
```

### Build Gagal (Out of Memory)

Jika `npm run build` gagal karena kehabisan RAM:

```bash
# Buat swap file 2GB
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Tambahkan ke fstab agar permanen
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Coba build ulang
cd /var/www/bclub && npm run build
```

---

## Ringkasan Arsitektur

```
Internet
    │
    ▼
[ Domain: sitigaberlian.my.id ]
    │
    ▼ (DNS A Record)
[ VPS: 148.230.103.107 ]
    │
    ▼ (Port 80/443)
[ Nginx - Reverse Proxy + SSL ]
    │
    ▼ (Port 3000)
[ PM2 → Next.js Standalone Server ]
    │
    ▼
[ MongoDB 8.0 (localhost:27017) ]
```

---

## Checklist Deployment

- [ ] VPS aktif dan bisa diakses via SSH
- [ ] Node.js, MongoDB, Nginx, PM2, Git terinstall
- [ ] Project di-push ke GitHub (private repo)
- [ ] Project di-clone ke VPS di `/var/www/bclub`
- [ ] File `.env.local` dibuat dengan JWT_SECRET yang kuat
- [ ] `npm install` berhasil
- [ ] `npm run build` berhasil tanpa error
- [ ] `npm run seed` berhasil (data awal masuk)
- [ ] PM2 menjalankan aplikasi (status: online)
- [ ] Nginx dikonfigurasi sebagai reverse proxy
- [ ] DNS domain mengarah ke IP VPS
- [ ] SSL terpasang (HTTPS aktif)
- [ ] Website bisa diakses via `https://NAMA_DOMAIN`
- [ ] PM2 auto-start saat reboot (`pm2 save && pm2 startup`)
