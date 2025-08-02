Aplikasi Manajemen ISP (Billing & E-Ticketing)
Aplikasi web terintegrasi untuk manajemen penyedia layanan internet (ISP) skala kecil hingga menengah. Dilengkapi dengan sistem billing, pembayaran, e-ticketing untuk komplain, hingga manajemen teknisi lapangan dengan validasi GPS.

Daftar Isi
Tentang Proyek Ini

Fitur Utama

Teknologi yang Digunakan

Panduan Instalasi

Cara Penggunaan

Struktur Proyek

Lisensi

Tentang Proyek Ini
Manajemen operasional ISP seringkali melibatkan banyak proses manual yang rentan terhadap kesalahan, mulai dari penagihan, pencatatan pembayaran, hingga penanganan keluhan pelanggan. Proyek ini dibangun sebagai solusi terpusat untuk mengatasi tantangan tersebut.

Aplikasi ini menyediakan tiga portal utama untuk tiga peran berbeda:

Portal Administrator: Untuk mengelola seluruh aspek bisnis, dari data pelanggan, paket langganan, penugasan teknisi, hingga memantau laporan keuangan.

Portal Teknisi: Memudahkan teknisi untuk melihat tugas, mengakses data pelanggan, dan melaporkan bukti pekerjaan secara akuntabel melalui foto dengan stempel lokasi GPS.

Portal Pelanggan: Memberikan kemudahan bagi pelanggan untuk mendaftar, membayar tagihan, mengajukan komplain, dan melacak status perbaikan secara transparan.

Tujuannya adalah menciptakan ekosistem yang efisien, transparan, dan mudah digunakan bagi semua pihak yang terlibat.

Fitur Utama
Dashboard Multi-peran: Tampilan dashboard yang disesuaikan untuk Admin, Teknisi, dan Pelanggan.

Manajemen Billing Otomatis: Generate tagihan bulanan untuk semua pelanggan aktif.

Sistem E-Ticketing: Pelanggan dapat membuat tiket komplain dan melacak posisi antrian secara real-time.

Manajemen Tugas Teknisi: Admin dapat menugaskan tiket (instalasi/komplain) kepada teknisi.

Bukti Pekerjaan dengan Validasi GPS: Teknisi wajib mengunggah foto bukti pekerjaan yang secara otomatis disertai data lokasi (latitude & longitude).

Portal Layanan Mandiri Pelanggan: Pelanggan bisa membayar tagihan, melihat riwayat, dan mengelola akunnya.

Manajemen Pengguna & Paket: CRUD (Create, Read, Update, Delete) untuk data pelanggan, teknisi, dan paket langganan oleh Admin.

Teknologi yang Digunakan
Frontend: React.js (Vite) + MUI (Material-UI)

Backend: Node.js + Express.js

Database: MongoDB (dengan Mongoose)

Autentikasi: JSON Web Token (JWT)

Real-time Communication: Socket.IO

Panduan Instalasi
Untuk menjalankan proyek ini di komputer lokal Anda, ikuti langkah-langkah berikut.

Prasyarat
Pastikan Anda sudah menginstal:

Node.js (versi 16 atau lebih baru)

npm atau yarn

MongoDB (bisa diinstal lokal atau menggunakan layanan cloud seperti MongoDB Atlas)

Langkah-langkah Instalasi
Clone repositori ini:

Bash

git clone https://github.com/NAMA_USER_ANDA/NAMA_REPO_ANDA.git
cd NAMA_REPO_ANDA
Setup Backend (Server):

Bash

cd server
npm install
Buat file .env di dalam folder server dan isi dengan konfigurasi berikut:

Cuplikan kode

MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/nama_database
JWT_SECRET=rahasia_super_aman_untuk_jwt
PORT=3001
Setup Frontend (Client):

Bash

cd ../client
npm install
Menjalankan Aplikasi:

Jalankan server backend (dari dalam folder server):

Bash

npm run dev
Jalankan client frontend (dari dalam folder client di terminal terpisah):

Bash

npm run dev
Buka browser Anda dan akses http://localhost:5173.

Cara Penggunaan
Setelah aplikasi berjalan, Anda dapat menggunakan akun default untuk login dan menguji berbagai peran:

Admin:

Email: admin@example.com

Password: password123

Teknisi:

Email: teknisi@example.com

Password: password123

Pelanggan:

Anda dapat mendaftarkan akun pelanggan baru melalui halaman registrasi.

Struktur Proyek
/
├── client/         # Folder Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── server/         # Folder Backend (Node.js)
    ├── controllers/
    ├── models/
    ├── routes/
    ├── .env
    ├── server.js
    └── package.json
Lisensi
Proyek ini didistribusikan di bawah Lisensi MIT. Lihat file LICENSE untuk informasi lebih lanjut.
