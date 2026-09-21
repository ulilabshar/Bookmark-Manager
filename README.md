# TautanKu — Pengelola Tautan Tersimpan (Modern Bookmark Manager)

Aplikasi web **Pengelola Tautan Tersimpan** (*Bookmark Manager*) yang modern, minimalis, dan estetik bertaraf antarmuka kelas dunia (terinspirasi dari estetika Linear, Raycast, dan Vercel).

---

## ✨ Fitur Unggulan

- **🌙 Mode Gelap & ☀️ Mode Terang**: Pilihan tema Dark/Light dengan tombol pengalih cepat di header. Preferensi tema tersimpan permanen di penyimpanan lokal.
- **🔍 Pencarian Responsif**: Cari tautan seketika berdasarkan judul, URL, deskripsi, atau label (tags) dengan tombol bersihkan `X` otomatis.
- **🗂️ Koleksi & Folder Kustom**: Kelompokkan tautan ke dalam folder (seperti *Pekerjaan*, *Inspirasi & Desain*, *Baca Nanti*, *Alat Pengembang*) lengkap dengan kustomisasi warna dan ikon.
- **🏷️ Manajemen Label (Tags)**: Sistem chip/pill tags interaktif untuk mempermudah pencarian dan filter bertopik.
- **⭐ Bintang & Favorit**: Tandai tautan penting untuk diakses cepat dari tab Favorit.
- **📋 Aksi Melayang pada Kartu**: Muncul saat kursor diarahkan (*hover*): Buka di tab baru, Salin URL ke papan klip (*clipboard*), Edit detail, dan Hapus.
- **📊 Mode Tampilan Fleksibel**: Beralih seketika antara **Tampilan Grid** (kartu visual) dan **Tampilan List** (baris ringkas).
- **💾 Ekspor & Impor Data**: Cadangkan data tautan ke berkas JSON dan pulihkan kapan saja.
- **🔄 Reset Data Demo**: Satu klik untuk mengembalikan contoh tautan dan folder awal.
- **📱 Desain Sangat Responsif**: Optimal untuk perangkat mobile (drawer navigasi geser) hingga layar desktop lebar.

---

## 🛠️ Teknologi yang Digunakan

- **Framework**: [React](https://react.dev/) + [Vite](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animasi**: [Framer Motion](https://www.framer.com/motion/)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://zustand.docs.pmnd.rs/) (dengan middleware `persist` ke `localStorage`)

---

## 🚀 Memulai Proyek

### 1. Klon Repositori
```bash
git clone https://github.com/ulilabshar/Bookmark-Manager.git
cd Bookmark-Manager
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban di `http://localhost:5173`.

### 4. Build untuk Produksi
```bash
npm run build
```

---

## 📄 Lisensi
[MIT License](LICENSE)
