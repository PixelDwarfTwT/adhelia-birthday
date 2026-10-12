# Spesifikasi Desain — Pengalaman Ulang Tahun Adhelia

Tanggal: 2026-10-13

## Tujuan dan batas emosi

Kembangkan sample `adhelia-birthday` menjadi hadiah digital bertajuk “The Magical Scrapbook in the Stars”. Pengalaman harus terasa hangat, personal, playful, dan bertema biru, tanpa meminta balasan atau menciptakan rasa bersalah. Pertahankan foto dan musik yang sudah tersedia serta motif amplop/hadiah dari halaman saat ini.

Jangan mengarang fakta, kenangan, lelucon dalam, atau isi surat pribadi tentang Adhelia. Copy yang diberikan dalam PRD/design dan sample boleh dipakai. Semua informasi personal yang belum diberikan menjadi placeholder yang jelas dan bisa diedit terpusat.

## Kondisi awal

- Proyek saat ini berupa `index.html` statis tanpa `package.json`, framework, atau struktur aplikasi.
- Aset yang tersedia: `photo.jpg`, `metal.mp3` (saat ini direferensikan oleh halaman), dan `happy.mp3`.
- Tidak ditemukan video atau teks kenangan/surat pribadi.
- Halaman saat ini menggunakan hadiah emoji, foto, satu paragraf ulang tahun, musik, confetti, dan hati terapung. Ini menjadi sample visual dan sumber aset, bukan batas pengalaman baru.

## Pendekatan

Bangun aplikasi Next.js App Router + TypeScript + Tailwind di folder `adhelia-birthday`, mengikuti rekomendasi PRD. Pecah halaman menjadi komponen pembuka, navigasi, pemutar audio, enam bagian cerita, modal, serta utilitas privasi dan efek. Pisahkan seluruh copy dan daftar data di `src/data/content.ts`; simpan media publik di `public/assets/` dan petakan di `public/assets/manifest.json`.

Gunakan Framer Motion untuk transisi UI yang ringan, SVG untuk konstelasi dan ilustrasi vektor, serta Canvas 2D hanya untuk partikel perayaan final. Batasi Canvas maksimal 60 partikel di ponsel. Gunakan elemen audio HTML native untuk menghindari dependensi audio yang tidak diperlukan; jangan meminta/memutar berkas lagu sebelum tindakan eksplisit pada amplop. Setelah dibuka, tampilkan pemutar mengambang dengan play/pause, mute, dan progres. Jika klip video ditambahkan kemudian, turunkan musik latar ke 15% selama video diputar dan pulihkan volumenya setelah modal ditutup.

## Alur enam bab

### 1. Rasa ingin tahu — amplop

Latar biru lembut berbintang, amplop/hadiah bersegel pita biru, copy “A special delivery for Adhelia...”, dan kontrol tombol untuk membuka. Gerakan membuka pita bertransisi ke scrapbook. Tindakan ini merupakan interaksi pertama yang dapat memulai audio; tangani kegagalan audio dengan pesan ramah dan kontrol yang tetap dapat digunakan.

### 2. Playfulness — pencapaian dan stiker

Kartu pencapaian/statistik dapat dibalik atau dibuka dengan sentuhan maupun keyboard. Sediakan stiker yang dapat dikumpulkan dan umpan balik kecil. Jangan isi statistik atau anekdot tanpa sumber; gunakan placeholder yang jelas dari file konten.

### 3. Apresiasi — hal-hal favorit

Tampilkan minat/kategori sebagai ubin atau chip interaktif yang membuka catatan. Warna biru boleh disebut sebagai fakta dari spesifikasi. Detail makanan, musik, permainan, karakter, dan hobi lain tetap menjadi placeholder sampai disediakan.

### 4. Kenangan — arsip polaroid

Gunakan foto yang tersedia dalam bingkai polaroid. Kartu dapat dipilih, digeser/di-swipe, dan dibuka di modal untuk melihat catatan penuh; interaksi penting juga tersedia lewat tombol keyboard. Tambahkan kartu placeholder untuk kenangan yang belum ditulis. Tidak ada video saat ini: jangan tampilkan klip rekaan; siapkan slot media dan fallback ilustrasi ramah jika video kelak ditambahkan atau gagal dimuat.

### 5. Pesan personal — surat

Gunakan kertas warm cream bertekstur lembut, tipografi serif, dan aksen tulisan tangan. Surat menggunakan kolom di `src/data/content.ts`; jangan tulis isi final personal tanpa teks dari pengguna. Placeholder harus jelas bagi pengelola dan UI tetap memiliki fallback yang tidak tampak seperti error teknis.

### 6. Perayaan — konstelasi

Transisi ke langit indigo. Pengguna menghubungkan tujuh titik bintang secara berurutan; progres selalu terlihat dan interaksi mudah dilakukan pada layar sentuh, keyboard, atau tombol aksesibel. Tiap koneksi mengungkap huruf hingga terbaca “ADHELIA”. Saat selesai, jalankan partikel emas dan lentera, lalu tampilkan pesan final “May your year ahead be as bright and beautiful as you are.” serta ucapan ulang tahun. Simpan progres sesi agar state tidak hilang saat navigasi.

## Navigasi, data, dan media

- Gunakan indikator bab yang ringkas dan dapat diketuk untuk menuju tiap bagian tanpa bergantung pada hover.
- Simpan nama, copy, pencapaian, favorit, kenangan, surat, pesan akhir, serta daftar aset di satu modul konten bertipe kuat.
- Pindahkan aset yang digunakan ke `public/assets/`; pertahankan nama file yang ada. Gunakan `metal.mp3` sebagai soundtrack awal karena itulah yang digunakan sample sekarang. Biarkan `happy.mp3` tersedia sebagai alternatif yang dapat dipilih dari konfigurasi konten.
- Buat manifest JSON untuk foto dan audio yang tersedia, serta slot video kosong yang tidak meminta jaringan sampai ada berkas.
- Gunakan deskripsi alt yang sesuai dengan isi visual foto, bukan dugaan tentang cerita di balik foto.

## Privasi

- Tampilkan gerbang passcode sebelum konten utama. Gunakan pertanyaan warna favorit dengan jawaban awal `blue`, sesuai keterangan pada PRD/design; simpan hash SHA-256 yang dibandingkan di browser, bukan kata sandi mentah.
- Ingat status buka melalui `localStorage`; simpan stiker/konstelasi melalui `sessionStorage`.
- Ini hanya penghalang privasi/convenience sisi-klien: berkas dan hash dapat diperiksa atau dilewati melalui browser. Jangan menyebutnya keamanan kuat.
- Tambahkan `noindex, nofollow` dan `robots.txt` dengan `Disallow: /`. Tidak ada analitik, tracker, atau pengumpulan data pribadi.

## Tampilan, aksesibilitas, dan performa

- Ikuti token design.md: biru powder `#E0F2FE`, navy `#0F172A`, azure `#0284C7`, sky `#38BDF8`, cream `#FFFDFA`, lavender `#F3E8FF`, gold `#FDE047`, dan teks `#1E293B`.
- Gunakan Cormorant Garamond untuk judul, Plus Jakarta Sans untuk UI, dan Caveat untuk aksen tulisan tangan; muat font secara lokal melalui mekanisme font Next.
- Desain mobile-first: lebar isi sekitar 480px di ponsel, 600px di tablet, dan maksimal 960–1020px di desktop; sasaran sentuh minimal 48px.
- Pakai semantik HTML, label untuk kontrol ikon, alt text, fokus keyboard terlihat, kontras teks yang baik, dan dukungan `prefers-reduced-motion`.
- Gerakan terutama memakai transform/opacity. Tunda pemuatan audio hingga interaksi. Kurangi atau hentikan partikel saat reduced motion aktif dan batasi aktivitas di perangkat kecil.
- Gunakan keadaan loading bertema situs dengan copy “Crafting Adhelia's birthday world...” dan fallback ramah untuk aset yang gagal, bukan layar kosong atau pesan teknis generik.
- Jika gambar gagal, tampilkan kartu fallback. Jika audio tidak tersedia/ditolak, tampilkan pesan ramah dan biarkan pengalaman lain berfungsi.

## Verifikasi penerimaan

- Seluruh enam bab dapat dicapai melalui alur dan navigasi.
- Gerbang passcode, pembukaan amplop, audio setelah tap, play/pause/mute/progres, kartu flip, interaksi favorit, modal/geser foto, pengumpulan stiker, dan penyelesaian konstelasi berfungsi.
- Adegan final menunjukkan “ADHELIA”, partikel/lentera, dan pesan ulang tahun.
- Tampilan menyesuaikan lebar 320px hingga desktop; navigasi dan kontrol dapat dioperasikan dengan sentuhan dan keyboard.
- Tidak ada data pribadi rekaan, permintaan analitik, atau indeks mesin pencari.
- Jalankan pemeriksaan build/TypeScript dan telusuri alur interaksi saat implementasi selesai. Uji langsung di iOS Safari/Android Chrome tetap memerlukan perangkat tersebut.

## Keputusan dan batas yang tersisa

- Jawaban passcode awal `blue` diturunkan dari spesifikasi warna favorit; hash akan dibuat untuk jawaban tersebut. Pengelola dapat menggantinya di satu konfigurasi konten.
- `metal.mp3` dipilih karena dipakai sample saat ini; `happy.mp3` tetap tersedia sebagai opsi.
- Video, anekdot, detail favorit selain warna, surat pribadi, dan nama pengirim belum disediakan. Semuanya memerlukan konten dari pengguna sebelum menjadi fakta personal di halaman.
