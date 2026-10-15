import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminEditor } from "@/components/admin/admin-editor";
import { AdminNotice } from "@/components/admin/admin-notice";
import { defaultBirthdayCopy } from "@/data/content";
import { parseBirthdayCopy } from "@/lib/birthday-copy";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!getSupabasePublicConfig()) {
    return (
      <AdminNotice title="Hubungkan Supabase dulu">
        <p>Panel admin membutuhkan URL proyek dan publishable key.</p>
        <p>Ikuti langkah konfigurasi di <code>docs/supabase-admin-setup.md</code>, lalu muat ulang halaman ini.</p>
        <Link href="/">Kembali ke buku ulang tahun</Link>
      </AdminNotice>
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login");

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (claimsError || !claims) redirect("/admin/login");

  const appMetadata = claims.app_metadata as Record<string, unknown> | undefined;
  if (appMetadata?.role !== "admin") {
    return (
      <AdminNotice title="Akun ini belum menjadi admin">
        <p>Panel hanya dapat dibuka oleh akun dengan klaim <code>app_metadata.role = admin</code>.</p>
        <p>Perbarui klaim akun di Supabase, lalu keluar dan masuk kembali agar sesi memuat klaim terbaru.</p>
        <Link href="/admin/login">Kembali ke login</Link>
      </AdminNotice>
    );
  }

  const { data: records, error: loadError } = await supabase
    .from("birthday_content")
    .select("id, content, published_at, updated_at")
    .in("id", ["draft", "published"]);

  const draftRecord = records?.find((item) => item.id === "draft") ?? null;
  const publishedRecord = records?.find((item) => item.id === "published") ?? null;
  const storedDraft = draftRecord ? parseBirthdayCopy(draftRecord.content) : null;
  const publishedCopy = publishedRecord ? parseBirthdayCopy(publishedRecord.content) : null;

  return (
    <AdminEditor
      initialCopy={storedDraft ?? publishedCopy ?? defaultBirthdayCopy}
      initialPublishedRecord={publishedRecord}
      loadError={loadError?.message ?? null}
    />
  );
}
