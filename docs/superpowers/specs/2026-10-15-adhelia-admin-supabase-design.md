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
2. `/admin` memanggil RPC `public.is_admin()` dan hanya menampilkan editor bagi pengguna yang terdaftar di `public.admin_users`.
3. Editor memulai dari draft tersimpan, atau menyalin nilai awal lokal jika belum ada baris.
4. **Simpan draft** mengubah baris draft saja. Pengunjung tetap membaca konten terbit sebelumnya.
5. **Terbitkan** menyimpan draft lalu memperbarui baris publik. Jika langkah kedua gagal, UI menyatakan draft tersimpan tetapi publikasi gagal; halaman publik tetap membaca versi lama.
6. Tombol keluar mengakhiri sesi Supabase.

## Arsitektur

- Situs diekspor statis ke GitHub Pages, jadi tidak ada server Next.js atau `src/proxy.ts`. Autentikasi berjalan di browser memakai `@supabase/ssr` dan publishable key.
- Tabel `public.birthday_content` menyimpan paling banyak dua baris: `draft` dan `published`, masing-masing dengan salinan teks dan timestamp.
- RLS mengizinkan `anon` serta pengguna terautentikasi membaca hanya baris `published`. Pengguna terautentikasi yang terdaftar di `public.admin_users` juga dapat membaca dan mengubah baris `draft`. Tidak ada `service_role` di aplikasi.
- Berikan grant kolom eksplisit untuk peran `anon`, dan grant tabel untuk `authenticated`; RLS menyembunyikan baris draft dari pengunjung biasa yang sedang login.
- Pengalaman publik mencoba mengambil konten terbit, memvalidasi bentuk datanya, lalu memakai fallback lokal jika konfigurasi, jaringan, atau bentuk data tidak valid.
- Simpan URL proyek dan publishable key sebagai `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Contoh env hanya memuat nama variabel dan placeholder.
- Sediakan migrasi SQL yang membuat `public.admin_users`, mengaktifkan RLS, dan menambahkan trigger `updated_at`; tambahkan petunjuk menambahkan anggota admin lewat Supabase SQL Editor.

## Desain panel

Pertahankan identitas scrapbook biru dan kertas krem situs. Panel responsif satu kolom di ponsel, berkelompok berdasarkan sampul, kue, dan surat. Semua field punya label; status simpan, galat jaringan, konfigurasi belum tersedia, sesi berakhir, dan status terbit tampil sebagai teks yang dapat dibaca pembaca layar. Tombol disediakan untuk simpan draft, terbitkan, dan keluar.

## Keamanan dan privasi

- `robots.txt` tetap melarang crawler dan metadata tetap `noindex,nofollow`.
- Karena situs statis, halaman admin hanya menjadi gerbang UX di browser. Kebijakan RLS dan fungsi `public.is_admin()` menjadi batas keamanan utama untuk baca/tulis.
- Klaim `user_metadata` tidak dipakai untuk otorisasi. Tidak ada pendaftaran publik, analytics, atau pengumpulan data baru.
- Draft berada di baris terpisah dan tidak dapat dibaca oleh `anon` atau pengguna non-admin; skema tidak menaruh kolom draft pada baris publik.
- Kode akses lokal dan hash-nya tidak disalin ke tabel Supabase.

## Batasan operasional

URL proyek dan publishable key Supabase tersedia di `frontend/.env.example`. Migrasi harus diterapkan ke proyek tersebut dan akun admin ditambahkan ke `public.admin_users` sebelum panel dapat dipakai. Jangan menaruh service-role atau secret key di variabel `NEXT_PUBLIC_*`.

## Kriteria penerimaan

- Aplikasi tetap dapat dibuka tanpa variabel Supabase.
- Halaman admin memiliki login, pengecekan role, edit field yang tercantum, simpan draft, terbitkan, dan keluar.
- Konten publik hanya berganti setelah publikasi sukses; draft tidak tersedia untuk anon.
- Halaman cake, pembuka, dan surat menggunakan konten publik terbit dengan fallback lokal.
- Migration mengaktifkan RLS, grants, kebijakan operasi admin lengkap, dan kebijakan baca publik terbatas pada baris publik.
- TypeScript, lint, dan build lolos tanpa mengandalkan kredensial live.
