<div align="center">

<img src="https://via.placeholder.com/600x200.png?text=Aplikasi+Manajemen+ISP" alt="Project Banner" width="600"/>

<h1>Aplikasi Manajemen ISP Terpadu</h1>

<p>
Solusi web lengkap untuk manajemen ISP (Billing & E-Ticketing). Mengotomatiskan penagihan, mengelola komplain, dan memvalidasi pekerjaan teknisi dengan bukti lokasi GPS secara real-time.
</p>

<p>
<a href="https://github.com/NAMA_USER_ANDA/NAMA_REPO_ANDA/issues">
<img src="https://img.shields.io/github/issues/NAMA_USER_ANDA/NAMA_REPO_ANDA.svg" alt="Issues">
</a>
<a href="LICENSE">
<img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="Lisensi MIT">
</a>
</p>
</div>

📖 Daftar Isi
Tentang Proyek Ini

✨ Fitur Utama

📸 Tampilan Aplikasi

🛠️ Teknologi yang Digunakan

🚀 Panduan Instalasi

🧑‍💻 Cara Menggunakan Aplikasi

📂 Struktur Proyek

📄 Lisensi

📖 Tentang Proyek Ini
Proyek ini adalah solusi manajemen terpusat yang dirancang khusus untuk penyedia layanan internet (ISP). Tujuannya adalah untuk mengotomatiskan proses bisnis, meningkatkan efisiensi operasional, dan memberikan pelayanan pelanggan yang superior melalui platform digital yang modern dan mudah diakses oleh Admin, Teknisi, maupun Pelanggan.

✨ Fitur Utama
📊 Dashboard Multi-Peran: Tampilan informasi yang relevan dan disesuaikan untuk setiap jenis pengguna.

💳 Manajemen Billing & Pembayaran: Sistem otomatis untuk membuat tagihan bulanan dan memfasilitasi pembayaran.

🎫 Sistem E-Ticketing dengan Lacak Antrian: Pelanggan dapat membuat tiket komplain dan memantau posisi antrian perbaikan secara transparan.

📍 Validasi Pekerjaan Teknisi dengan GPS: Teknisi wajib mengunggah foto bukti pekerjaan yang divalidasi dengan lokasi GPS untuk akuntabilitas.

👤 Manajemen Pengguna & Paket: Admin dapat mengelola data pelanggan, teknisi, dan paket langganan secara penuh (CRUD).

📡 Monitoring Jaringan Sederhana: Fitur bagi admin untuk menandai status node jaringan (Online, Gangguan, Offline).

📸 Tampilan Aplikasi
Berikut adalah beberapa cuplikan tampilan dari aplikasi ini.

Dashboard Admin	Antrian Tiket Pelanggan	Upload Bukti Teknisi

Ekspor ke Spreadsheet
(Ganti URL placeholder di atas dengan link ke screenshot aplikasi Anda)

🛠️ Teknologi yang Digunakan
Bagian	Teknologi
Frontend	React.js, Vite, MUI (Material-UI), Socket.io-client
Backend	Node.js, Express.js, Mongoose, JWT, Socket.io
Database	MongoDB (bisa menggunakan Atlas atau instalasi lokal)

Ekspor ke Spreadsheet
🚀 Panduan Instalasi
1. Prasyarat
Pastikan Anda sudah memiliki: Node.js (v16+), NPM/Yarn, dan MongoDB.

2. Kloning Repositori
Bash

git clone https://github.com/NAMA_USER_ANDA/NAMA_REPO_ANDA.git
cd NAMA_REPO_ANDA
3. Setup Backend & Frontend
Ikuti langkah-langkah di bawah ini untuk kedua folder (server dan client):

Bash

# Masuk ke direktori (contoh: cd server)
npm install
Di dalam folder server, buat file .env dan isi konfigurasinya:

Cuplikan kode

MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/isp_db
JWT_SECRET=INI_ADALAH_KUNCI_RAHASIA_YANG_SANGAT_AMAN
PORT=3001
4. Menjalankan Aplikasi
Buka dua terminal terpisah.

Di terminal 1 (dalam folder server): npm run dev

Di terminal 2 (dalam folder client): npm run dev

Aplikasi akan berjalan di http://localhost:5173.

🧑‍💻 Cara Menggunakan Aplikasi
Berikut adalah alur kerja umum untuk setiap peran pengguna.

Alur Kerja Administrator
Login menggunakan akun:

Email: admin@example.com

Password: password123

Setup Awal:

Buka menu Manajemen Paket untuk menambahkan paket-paket internet yang akan ditawarkan.

Buka menu Manajemen Pengguna untuk mendaftarkan akun baru bagi para teknisi.

Operasional Harian:

Di Dashboard, Anda akan melihat tiket "Instalasi Baru" dari pelanggan yang baru mendaftar dan tiket "Komplain".

Klik sebuah tiket, lalu gunakan tombol "Tugaskan Teknisi" untuk memberikan pekerjaan kepada teknisi yang tersedia.

Monitoring:

Gunakan menu Laporan untuk melihat data pembayaran, jumlah tiket, dan kinerja teknisi.

Alur Kerja Pelanggan
Registrasi: Calon pelanggan membuka halaman registrasi, mengisi formulir lengkap, dan memilih paket internet yang tersedia. Setelah itu, akun akan dibuat dan tiket "Instalasi Baru" akan otomatis dibuat untuk Admin.

Membayar Tagihan:

Setelah akun aktif, pelanggan Login.

Di dashboard, akan muncul tagihan bulanan. Klik "Bayar Sekarang" untuk memproses pembayaran.

Membuat Komplain:

Jika ada gangguan, pelanggan masuk ke menu "Buat Komplain".

Isi formulir mengenai masalah yang dialami, lalu kirim.

Melacak Komplain:

Pelanggan dapat melihat status tiket dan posisi antrian mereka di menu "Riwayat Tiket".

Alur Kerja Teknisi
Login menggunakan akun yang telah dibuatkan oleh Admin.

Melihat Tugas: Di dashboard, akan muncul daftar tiket (instalasi atau perbaikan) yang telah ditugaskan kepadanya.

Menjalankan Tugas:

Klik tiket untuk melihat detail pelanggan, alamat, dan deskripsi pekerjaan.

Setelah menuju lokasi dan menyelesaikan pekerjaan, buka kembali tiket di aplikasi.

Melaporkan Pekerjaan (Fitur Kunci):

Klik tombol "Selesaikan Pekerjaan" pada detail tiket.

Pilih opsi "Upload Bukti Foto". Aplikasi akan meminta izin untuk mengakses lokasi GPS.

Ambil foto perangkat yang terpasang atau bukti perbaikan. Foto akan diunggah bersama dengan data koordinat lokasi Anda saat itu.

Setelah bukti terkirim, status tiket akan berubah menjadi "Selesai".

📂 Struktur Proyek
Proyek ini menggunakan arsitektur monorepo dengan folder terpisah untuk client dan server agar pengembangan terorganisir dengan baik dan mudah dikelola.

Bash

.
├── client/         # Kode sumber Frontend (React)
│   └── src/
│       ├── api/          # Logika pemanggilan API (axios/fetch)
│       ├── assets/       # Gambar, font, dan file CSS global
│       ├── components/   # Komponen UI (common, layout)
│       ├── context/      # Manajemen state global (React Context)
│       ├── hooks/        # Custom React Hooks
│       ├── pages/        # Komponen untuk setiap halaman/rute
│       └── utils/        # Fungsi bantuan & konstanta
│
└── server/         # Kode sumber Backend (Node.js)
    └── src/
        ├── config/       # Konfigurasi aplikasi (koneksi DB)
        ├── controllers/  # Logika bisnis untuk setiap endpoint
        ├── middleware/   # Fungsi penengah (otentikasi, error handling)
        ├── models/       # Skema database Mongoose
        ├── routes/       # Definisi endpoint API
        └── utils/        # Fungsi bantuan backend
    ├── .env          # File variabel lingkungan (dikecualikan dari Git)
    └── server.js     # Titik masuk server Node.js
📄 Lisensi
Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file LICENSE untuk detail lebih lanjut.
