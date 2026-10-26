"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminEditor } from "@/components/admin/admin-editor";
import { AdminNotice } from "@/components/admin/admin-notice";
import { defaultBirthdayCopy } from "@/data/content";
import type { BirthdayCopy } from "@/data/types";
import { parseBirthdayCopy } from "@/lib/birthday-copy";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type BirthdayRecord = Database["public"]["Tables"]["birthday_content"]["Row"];
  
type AdminPageState =
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "signed-out" }
  | { status: "not-admin" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      initialCopy: BirthdayCopy;
      publishedRecord: BirthdayRecord | null;
      loadError: string | null;
    };

export default function AdminPage() {
  const [state, setState] = useState<AdminPageState>(() =>
    getSupabasePublicConfig() ? { status: "loading" } : { status: "unconfigured" },
  );

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;
    void (async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (!active) return;
        if (userError || !userData.user) {
          setState({ status: "signed-out" });
          return;
        }

        const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
        if (!active) return;
        if (adminError) {
          setState({ status: "error", message: "Status admin belum dapat diperiksa. Periksa koneksi Supabase." });
          return;
        }
        if (!isAdmin) {
          setState({ status: "not-admin" });
          return;
        }

        const { data: records, error: loadError } = await supabase
          .from("birthday_content")
          .select("id, content, published_at, updated_at")
          .in("id", ["draft", "published"]);

        if (!active) return;        
        const draft = records?.find((record) => record.id === "draft") ?? null;
        const published = records?.find((record) => record.id === "published") ?? null;
        const draftCopy = draft ? parseBirthdayCopy(draft.content) : null;
        const publishedCopy = published ? parseBirthdayCopy(published.content) : null;

        setState({
          status: "ready",
          initialCopy: draftCopy ?? publishedCopy ?? defaultBirthdayCopy,
          publishedRecord: published,
          loadError: loadError?.message ?? null,
        });
      } catch {
        if (active) {
          setState({ status: "error", message: "Supabase belum dapat dijangkau. Coba muat ulang halaman." });
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (state.status === "loading") {
    return <AdminNotice title="Membuka meja admin"><p>Memeriksa sesi dan akses bukuâ€¦</p></AdminNotice>;
  }

  if (state.status === "unconfigured") {
    return (
      <AdminNotice title="Supabase belum terhubung">
        <p>Panel membutuhkan URL proyek dan publishable key Supabase.</p>
        <p>Periksa konfigurasi lokal atau build GitHub Pages, lalu muat ulang halaman.</p>
        <Link href="/">Kembali ke buku ulang tahun</Link>
      </AdminNotice>
    );
  }

  if (state.status === "signed-out") {
    return (
      <AdminNotice title="Masuk dulu untuk membuka panel">
        <p>Sesi admin belum aktif. Masuk menggunakan akun yang sudah terdaftar sebagai admin.</p>
        <Link href="/admin/login/">Buka halaman masuk</Link>
      </AdminNotice>
    );
  }

  if (state.status === "not-admin") {
    return (
      <AdminNotice title="Akun ini belum memiliki akses admin">
        <p>Panel hanya terbuka untuk akun yang tercatat di daftar admin proyek Supabase.</p>
        <Link href="/admin/login/">Kembali ke login</Link>
      </AdminNotice>
    );
  }

  if (state.status === "error") {
    return (
      <AdminNotice title="Panel belum dapat dibuka">
        <p role="alert">{state.message}</p>
        <Link href="/admin/login/">Coba masuk kembali</Link>
      </AdminNotice>
    );
  }

  return (
    <AdminEditor
      initialCopy={state.initialCopy}
      initialPublishedRecord={state.publishedRecord}
      loadError={state.loadError}
    />
  );
}
