# Panel Admin Adhelia dengan Supabase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambahkan panel admin terautentikasi untuk mengedit dan menerbitkan teks buku ulang tahun melalui Supabase.

**Architecture:** Supabase Auth dengan cookie SSR mengamankan `/admin`; klaim `app_metadata.role` dan RLS membatasi perubahan ke admin. Baris draft dan publik dipisah di Postgres agar RLS menyembunyikan draft juga dari pengunjung yang login, sedangkan situs publik mengambil salinan terbit dan tetap punya fallback lokal.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, `@supabase/ssr`, `@supabase/supabase-js`, PostgreSQL RLS.

**Spec:** `docs/superpowers/specs/2026-10-15-adhelia-admin-supabase-design.md`

## Peta berkas

- `src/data/types.ts`, `src/data/content.ts`: tipe dan salinan awal yang dapat diedit.
- `src/lib/birthday-copy.ts`: proyeksi, parser/validator, dan normalisasi salinan.
- `src/lib/supabase/{config,client,server}.ts`, `src/proxy.ts`: klien Supabase dan pembaruan sesi Next.
- `src/app/admin/{page,login/page}.tsx`, `src/components/admin/*`: route berizin, login, form, status, simpan, terbitkan, keluar.
- `src/components/experience-shell.tsx`, `src/components/opening-scene.tsx`, `src/components/sections/{cake-section,letter-section}.tsx`: konsumsi salinan terbit dengan fallback lokal.
- `src/app/globals.css`: gaya panel scrapbook responsif.
- `supabase/migrations/*_create_birthday_content.sql`: tabel, grants, RLS.
- `.env.example`, `docs/supabase-admin-setup.md`: konfigurasi lokal dan bootstrap admin.

## Task 1 — Data salinan dan integrasi pengalaman publik

- [x] Tambahkan tipe `BirthdayCopy`, `cakeTitle`, `cakeInstruction`, dan `letterTitle` ke konten awal; buat fungsi untuk menghasilkan bentuk editor tanpa hash kode atau data internal.
- [x] Tambahkan validator runtime bagi konten yang dibaca dari Supabase.
- [x] Jadikan pembuka, kue, surat, serta judul buku menerima salinan melalui props.
- [x] Muat salinan publik terbit di `ExperienceShell`, dan pertahankan default lokal bila Supabase tidak tersedia atau query gagal.

## Task 2 — Koneksi Supabase dan skema aman

- [x] Pasang versi paket Supabase yang dipatok dan perbarui lockfile.
- [x] Tambahkan klien browser/server SSR dan `src/proxy.ts` untuk refresh cookie Next 16.
- [x] Tambahkan migration SQL dua baris, grants minimum, RLS, policy baca publik untuk versi terbit, serta policy admin `SELECT`/`INSERT`/`UPDATE` memakai `app_metadata.role`.
- [x] Tambahkan `.env.example` tanpa nilai rahasia.

## Task 3 — Login dan panel editor

- [x] Buat halaman login email/kata sandi tanpa pendaftaran publik, termasuk keadaan env belum tersedia dan pesan kegagalan.
- [x] Lindungi halaman editor dengan `getClaims()` tervalidasi dan klaim role admin.
- [x] Buat form responsif untuk seluruh field salinan yang ditentukan, dengan paragraf surat yang dipisahkan baris kosong.
- [x] Implementasikan simpan draft, terbitkan, status/waktu publikasi, penanganan error, dan keluar.
- [x] Tambahkan gaya dan fokus aksesibel agar panel sejalan dengan scrapbook.

## Task 4 — Setup, verifikasi, dan simpan perubahan

- [x] Tulis petunjuk buat project/env, jalankan migrasi, buat akun Auth, dan tetapkan `app_metadata.role = admin` tanpa memakai key rahasia di browser.
- [x] Jalankan lint, typecheck, dan build; tinjau diff migration/RLS serta pastikan mode tanpa env tidak crash.
- [x] Catat bahwa perubahan lokal sudah lolos lint, typecheck, dan build; koneksi live menunggu URL/key proyek, migration diterapkan, dan role admin disiapkan.
