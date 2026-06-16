# Celeritas

## Deskripsi
Celeritas adalah platform e-commerce buku online dengan fitur pemesanan, pembayaran cash/debit, voucher, rating driver, dan chat real-time antara user dan driver.

## Fitur

### 👤 Autentikasi & Profil
- Registrasi dan Login User
- Manajemen Profil (nama, nomor HP, alamat, foto profil)
- Hapus Akun (soft delete jika memiliki riwayat pesanan)

### 📚 Manajemen Buku (Admin)
- CRUD Buku dengan upload cover (file/URL)
- Soft delete untuk buku yang memiliki riwayat order

### 🛒 Wishlist
- Tambah/hapus buku dari wishlist

### 📦 Pemesanan
- Metode pembayaran: Cash atau Debit
- Metode pengambilan: Ambil sendiri atau Diantar (+20%)
- Voucher (Percent/Fixed)
- Validasi stok buku dan voucher

### 🚚 Driver Dashboard
- Lihat dan ambil order
- Selesaikan order
- Lihat komisi dan rating

### 💬 Chat Real-time
- Chat antara user dan driver (Socket.io)

### ⭐ Rating
- Rating driver 1-5 bintang

### 🎫 Voucher (Admin)
- CRUD Voucher dengan tipe Percent atau Fixed
- Manajemen stok dan batas penggunaan per user

### 🧹 Soft Delete
- **Users**: Soft delete jika memiliki riwayat order
- **Books**: Soft delete jika pernah dipesan/di-wishlist
- **Vouchers**: Dinonaktifkan (`is_active = false`)

## ERD
(di assets)

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Axios
- Socket.io-client
- React Router

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT (Authentication)
- Argon2 (Password Hashing)
- Multer (File Upload)
- Socket.io

## Prasyarat
- Node.js (v16+)
- PostgreSQL (v14+)

