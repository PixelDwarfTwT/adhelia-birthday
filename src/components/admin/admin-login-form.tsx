"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminBrand } from "./admin-notice";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface AdminLoginFormProps {
  configured: boolean;
}

export function AdminLoginForm({ configured }: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Koneksi Supabase belum disiapkan. Periksa file .env.local.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setMessage("Email atau kata sandi belum cocok. Periksa lagi lalu coba kembali.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setMessage("Supabase tidak dapat dijangkau. Periksa koneksi internet lalu coba kembali.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-screen admin-screen--login">
      <header className="admin-topbar"><AdminBrand /><Link className="admin-back-link" href="/">Lihat buku</Link></header>
      <section className="admin-login" aria-labelledby="admin-login-title">
        <div className="admin-login__seal" aria-hidden="true">✦</div>
        <p className="eyebrow">Ruang pembuat</p>
        <h1 id="admin-login-title">Masuk ke panel</h1>
        <p className="admin-login__intro">Perbarui kata-kata di dalam buku, lalu terbitkan saat sudah siap.</p>
        {!configured ? (
          <p className="admin-feedback admin-feedback--error" role="status">
            Supabase belum tersambung. Tambahkan variabel pada <code>.env.local</code> sesuai petunjuk setup.
          </p>
        ) : (
          <form className="admin-form" onSubmit={signIn}>
            <label className="admin-field">
              <span>Email admin</span>
              <input autoComplete="username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="admin-field">
              <span>Kata sandi</span>
              <input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            {message ? <p className="admin-feedback admin-feedback--error" role="alert">{message}</p> : null}
            <button className="button button--primary admin-submit" disabled={submitting} type="submit">
              {submitting ? "Memeriksa akses…" : "Masuk ke panel"}
            </button>
          </form>
        )}
        <p className="admin-login__footnote">Panel ini hanya untuk akun admin yang sudah disiapkan di Supabase.</p>
      </section>
    </main>
  );
}
