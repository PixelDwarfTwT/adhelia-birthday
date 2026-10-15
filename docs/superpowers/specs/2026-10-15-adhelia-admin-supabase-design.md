# Panel Admin Adhelia dengan Supabase

## Tujuan

Tambahkan panel `/admin` agar pemilik buku dapat memperbarui teks yang terlihat di pengalaman ulang tahun tanpa mengedit komponen. Login dan penyimpanan memakai Supabase Auth dan Postgres. Jika Supabase belum dikonfigurasi atau belum ada konten terbit, situs publik tetap menggunakan konten lokal.

## Lingkup konten

Panel mengedit salinan untuk halaman yang saat ini benar-benar ditampilkan:

- Nama penerima, headline pembuka, dan pengantar.
- Judul permohonan dan instruksi meniup lilin.
- Judul surat, sapaan, isi surat (paragraf terpisah baris kosong), dan tanda tangan.

Kode akses, hash kode, aset audio, dan struktur interaksi tidak dapat diedit di panel. Isinya tidak dikirim ke tabel publik. Teks surat bawaan tetap berupa placeholder yang ada di proyek; tidak dibuatkan cerita personal baru.

## Alur

1. `/admin/login` menerima email dan kata sandi lewat Supabase Auth. Tidak ada pendaftaran publik.
2. `/admin` memeriksa klaim JWT tervalidasi dan hanya menampilkan editor bagi pengguna dengan `app_metadata.role = admin`.
3. Editor memulai dari draft tersimpan, atau menyalin nilai awal lokal jika belum ada baris.
4. **Simpan draft** mengubah baris draft saja. Pengunjung tetap membaca konten terbit sebelumnya.
5. **Terbitkan** menyimpan draft lalu memperbarui baris publik. Jika langkah kedua gagal, UI menyatakan draft tersimpan tetapi publikasi gagal; halaman publik tetap membaca versi lama.
6. Tombol keluar mengakhiri sesi Supabase.

## Arsitektur

- Gunakan `@supabase/ssr` dengan klien browser dan server. Next.js 16 menggunakan `src/proxy.ts` untuk memperbarui cookie sesi pada rute admin.
- Tabel `public.birthday_content` menyimpan paling banyak dua baris: `draft` dan `published`, masing-masing dengan salinan teks dan timestamp.
- RLS mengizinkan `anon` serta pengguna terautentikasi membaca hanya baris `published`. Pengguna terautentikasi dengan klaim `app_metadata.role = admin` juga dapat membaca dan mengubah baris `draft`. Tidak ada `service_role` di aplikasi.
- Berikan grant kolom eksplisit untuk peran `anon`, dan grant tabel untuk `authenticated`; RLS menyembunyikan baris draft dari pengunjung biasa yang sedang login.
- Pengalaman publik mencoba mengambil konten terbit, memvalidasi bentuk datanya, lalu memakai fallback lokal jika konfigurasi, jaringan, atau bentuk data tidak valid.
- Simpan URL proyek dan publishable key sebagai `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Contoh env hanya memuat nama variabel dan placeholder.
- Sediakan migrasi SQL, petunjuk konfigurasi, dan petunjuk menetapkan `app_metadata.role` lewat Supabase Dashboard/SQL Editor.

## Desain panel

Pertahankan identitas scrapbook biru dan kertas krem situs. Panel responsif satu kolom di ponsel, berkelompok berdasarkan sampul, kue, dan surat. Semua field punya label; status simpan, galat jaringan, konfigurasi belum tersedia, sesi berakhir, dan status terbit tampil sebagai teks yang dapat dibaca pembaca layar. Tombol disediakan untuk simpan draft, terbitkan, dan keluar.

## Keamanan dan privasi

- `robots.txt` tetap melarang crawler dan metadata tetap `noindex,nofollow`.
- Halaman admin dilindungi server-side melalui klaim Supabase yang tervalidasi. Kebijakan RLS menjadi batas keamanan utama untuk baca/tulis.
- Klaim `user_metadata` tidak dipakai untuk otorisasi. Tidak ada pendaftaran publik, analytics, atau pengumpulan data baru.
- Draft berada di baris terpisah dan tidak dapat dibaca oleh `anon` atau pengguna non-admin; skema tidak menaruh kolom draft pada baris publik.
- Kode akses lokal dan hash-nya tidak disalin ke tabel Supabase.

## Batasan operasional

Workspace belum memiliki URL/key proyek Supabase maupun kredensial admin. Kode dan migrasi dapat disiapkan di repo, tetapi koneksi live harus menunggu variabel proyek, penerapan migrasi, dan penetapan role admin di Supabase.

## Kriteria penerimaan

- Aplikasi tetap dapat dibuka tanpa variabel Supabase.
- Halaman admin memiliki login, pengecekan role, edit field yang tercantum, simpan draft, terbitkan, dan keluar.
- Konten publik hanya berganti setelah publikasi sukses; draft tidak tersedia untuk anon.
- Halaman cake, pembuka, dan surat menggunakan konten publik terbit dengan fallback lokal.
- Migration mengaktifkan RLS, grants, kebijakan operasi admin lengkap, dan kebijakan baca publik terbatas pada baris publik.
- TypeScript, lint, dan build lolos tanpa mengandalkan kredensial live.
