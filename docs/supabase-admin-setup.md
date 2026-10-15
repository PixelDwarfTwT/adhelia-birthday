# Menyiapkan panel admin Supabase

Panel admin dapat berjalan lokal tanpa Supabase, tetapi penyimpanan dan login membutuhkan project Supabase.

## 1. Isi variabel lokal

Salin `.env.example` menjadi `.env.local`, lalu isi dari **Project Settings → API** di Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

Publishable key memang digunakan oleh browser; jangan menaruh `service_role` atau secret key pada variabel `NEXT_PUBLIC_*`.

## 2. Buat tabel dan kebijakan

Buka **SQL Editor** di project Supabase, lalu jalankan isi file:

`supabase/migrations/20261015000000_create_birthday_content.sql`

Migration memberi akses baca kolom konten terbit kepada pengunjung anonim, membatasi draft ke sesi admin, dan mengaktifkan RLS.
Jika project memakai allowlist Data API, pastikan schema `public` juga diaktifkan pada **Project Settings → API**; SQL migration sudah memberi grant peran yang diperlukan.

## 3. Buat akun admin

Buat pengguna email/kata sandi di **Authentication → Users**. Setelah itu, jalankan query berikut di SQL Editor dan ganti email contoh dengan email akun tersebut:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'admin@example.com';
```

Pastikan query mengubah satu baris. Keluar dari sesi lama lalu masuk lagi agar JWT menerima klaim admin yang baru. Role dibaca dari `app_metadata`, bukan `user_metadata` yang bisa diubah pengguna.

## 4. Jalankan panel

```powershell
cd adhelia-birthday
npm run dev
```

Buka `http://localhost:3000/admin/login`. Jika konfigurasi benar, masuk dan edit teks. **Simpan draft** menyimpan perubahan tanpa mengubah halaman publik; **Terbitkan perubahan** memperbarui buku.

Jika belum ada versi terbit, halaman publik menggunakan konten lokal dari `src/data/content.ts`. Setelah publikasi pertama, situs mengambil salinan terbit dari Supabase dan tetap memakai fallback lokal bila koneksi gagal.
