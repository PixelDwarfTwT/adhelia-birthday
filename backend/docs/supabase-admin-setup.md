# Menyiapkan panel admin Supabase

Panel admin menggunakan Supabase Auth dan Row Level Security (RLS). GitHub Pages hanya menjalankan ekspor statis, jadi autentikasi dan penyimpanan data berlangsung dari browser dengan publishable key.

## 1. Isi variabel lokal

Salin `frontend/.env.example` menjadi `frontend/.env.local` dari root repositori:

Copy-Item frontend/.env.example frontend/.env.local

Nilai pada .env.example sudah menunjuk ke proyek Adhelia dan memakai publishable key yang memang boleh digunakan browser. Jangan menaruh service_role atau secret key pada variabel NEXT_PUBLIC_*.

## 2. Skema dan akses

Tabel birthday_content menyimpan salinan draft dan terbit. Migration `backend/supabase/migrations/20261015151715_create_birthday_content.sql` sudah diterapkan pada proyek Adhelia.

Pengunjung anonim hanya dapat membaca salinan terbit. Draft, simpan, dan publikasi dibatasi oleh RLS melalui keanggotaan di public.admin_users. Proyek ini sudah memiliki satu keanggotaan admin.

Untuk menambahkan admin lain, buat akunnya di Authentication > Users, salin UUID akun tersebut, lalu jalankan query berikut di SQL Editor:

insert into public.admin_users (user_id)
values ('<UUID-akun-auth>')
on conflict (user_id) do nothing;

Keanggotaan admin diperiksa oleh public.is_admin(). Jangan memakai user_metadata sebagai otorisasi.

## 3. Jalankan panel lokal

Masuk ke folder `frontend`, lalu jalankan `npm run dev`.

Buka http://localhost:3000/admin/login. Simpan draft menyimpan perubahan tanpa mengubah halaman publik; Terbitkan perubahan memperbarui buku.

Jika belum ada versi terbit, halaman publik memakai salinan lokal dari `frontend/src/data/content.ts`. Jika Supabase tidak dapat dijangkau, halaman tetap menampilkan salinan lokal.

## 4. GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` membangun dan menerbitkan ekspor statis dari folder `frontend`. URL proyek dan publishable key diambil dari `frontend/.env.example` saat build. Kunci tersebut memang publik dan akses database tetap dibatasi RLS; secret/service-role key tidak digunakan. Panel admin memakai Supabase Auth di browser karena GitHub Pages tidak menjalankan server Next.js.

URL situs: https://PixelDwarfTwT.github.io/adhelia-birthday/.
