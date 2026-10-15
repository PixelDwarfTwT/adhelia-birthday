"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type { BirthdayCopy } from "@/data/types";
import { normalizeBirthdayCopy } from "@/lib/birthday-copy";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database, Json } from "@/lib/supabase/database.types";
import { AdminBrand } from "./admin-notice";

type BirthdayRecord = Database["public"]["Tables"]["birthday_content"]["Row"];

interface AdminEditorProps {
  initialCopy: BirthdayCopy;
  initialPublishedRecord: BirthdayRecord | null;
  loadError: string | null;
}

type CopyField = Exclude<keyof BirthdayCopy, "letter">;

export function AdminEditor({ initialCopy, initialPublishedRecord, loadError }: AdminEditorProps) {
  const router = useRouter();
  const [copy, setCopy] = useState<BirthdayCopy>(initialCopy);
  const [paragraphText, setParagraphText] = useState(initialCopy.letter.paragraphs.join("\n\n"));
  const [publishedRecord, setPublishedRecord] = useState<BirthdayRecord | null>(initialPublishedRecord);
  const [busy, setBusy] = useState<"draft" | "publish" | "logout" | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(
    loadError ? { text: "Konten tersimpan belum dapat dimuat. Periksa akses database sebelum menyimpan.", error: true } : null,
  );

  function updateField(field: CopyField, value: string) {
    setCopy((current) => ({ ...current, [field]: value }));
  }

  function updateLetter(field: keyof BirthdayCopy["letter"], value: string) {
    setCopy((current) => ({ ...current, letter: { ...current.letter, [field]: value } }));
  }

  function updateText(field: CopyField) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateField(field, event.target.value);
  }

  async function save(mode: "draft" | "publish") {
    setFeedback(null);
    const nextCopy = normalizeBirthdayCopy(copy, paragraphText);
    const requiredFields = [
      nextCopy.recipientName,
      nextCopy.openingCopy,
      nextCopy.introduction,
      nextCopy.cakeTitle,
      nextCopy.cakeInstruction,
      nextCopy.letterTitle,
      nextCopy.letter.greeting,
      nextCopy.letter.signOff,
    ];
    if (requiredFields.some((field) => !field)) {
      setFeedback({ text: "Lengkapi semua kolom bertanda wajib sebelum menyimpan.", error: true });
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setFeedback({ text: "Koneksi Supabase belum tersedia. Draft tetap tersimpan di form ini.", error: true });
      return;
    }

    setBusy(mode);
    const now = new Date().toISOString();
    const nextJson = nextCopy as unknown as Json;
    try {
      const draftResult = await supabase
        .from("birthday_content")
        .upsert(
          {
            id: "draft",
            content: nextJson,
            published_at: null,
            updated_at: now,
          },
          { onConflict: "id" },
        )
        .select("id, content, published_at, updated_at")
        .single();

      if (draftResult.error) {
        const expired = draftResult.error.code === "401" || /jwt|token|auth/i.test(draftResult.error.message);
        setFeedback({
          text: expired
            ? "Sesi admin mungkin sudah berakhir. Masuk kembali lalu ulangi."
            : "Perubahan belum tersimpan. Periksa koneksi dan kebijakan akses Supabase, lalu coba lagi.",
          error: true,
        });
        return;
      }

      setCopy(nextCopy);
      setParagraphText(nextCopy.letter.paragraphs.join("\n\n"));

      if (mode === "draft") {
        setFeedback({ text: "Draft tersimpan. Pengunjung masih melihat versi yang sudah terbit.", error: false });
        return;
      }

      const publishedResult = await supabase
        .from("birthday_content")
        .upsert(
          { id: "published", content: nextJson, published_at: now, updated_at: now },
          { onConflict: "id" },
        )
        .select("id, content, published_at, updated_at")
        .single();

      if (publishedResult.error) {
        setFeedback({ text: "Draft tersimpan, tetapi publikasi belum berhasil. Buku masih menampilkan versi terbit sebelumnya.", error: true });
        return;
      }

      setPublishedRecord(publishedResult.data);
      setFeedback({
        text: "Teks terbaru sudah terbit di buku ulang tahun.",
        error: false,
      });
    } catch {
      setFeedback({ text: "Supabase tidak dapat dijangkau. Periksa koneksi internet lalu coba lagi.", error: true });
    } finally {
      setBusy(null);
    }
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    setBusy("logout");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setFeedback({ text: "Sesi belum dapat diakhiri. Coba kembali.", error: true });
        return;
      }
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setFeedback({ text: "Supabase tidak dapat dijangkau untuk mengakhiri sesi.", error: true });
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="admin-screen">
      <header className="admin-topbar">
        <AdminBrand />
        <div className="admin-topbar__actions">
          <a className="admin-back-link" href="/" target="_blank" rel="noreferrer">Pratinjau buku</a>
          <button className="admin-quiet-button" disabled={busy !== null} onClick={signOut} type="button">
            {busy === "logout" ? "Keluar…" : "Keluar"}
          </button>
        </div>
      </header>

      <div className="admin-content">
        <header className="admin-heading">
          <p className="eyebrow">Meja kecil di balik buku</p>
          <h1>Edit ucapan ulang tahun</h1>
          <p>Ubah kata-katanya di sini. Simpan draft untuk nanti, atau terbitkan agar langsung terlihat di buku.</p>
        </header>

        <div className="admin-publish-state" aria-live="polite">
          <span className={`admin-publish-state__dot${publishedRecord?.published_at ? " admin-publish-state__dot--live" : ""}`} aria-hidden="true" />
          <span>
            {publishedRecord?.published_at
              ? `Versi terbit: ${new Date(publishedRecord.published_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}`
              : "Belum ada versi yang diterbitkan. Situs masih memakai teks bawaan."}
          </span>
        </div>

        {feedback ? (
          <p className={`admin-feedback${feedback.error ? " admin-feedback--error" : " admin-feedback--success"}`} role={feedback.error ? "alert" : "status"}>
            {feedback.text}
          </p>
        ) : null}

        <form className="admin-editor" onSubmit={(event) => { event.preventDefault(); void save("draft"); }}>
          <section className="admin-card" aria-labelledby="admin-cover-title">
            <div className="admin-card__heading">
              <span className="admin-card__number" aria-hidden="true">01</span>
              <div><p className="eyebrow">Sampul</p><h2 id="admin-cover-title">Sambutan pertama</h2></div>
            </div>
            <div className="admin-fields admin-fields--two">
              <label className="admin-field"><span>Nama penerima <b aria-hidden="true">*</b></span><input maxLength={80} required value={copy.recipientName} onChange={updateText("recipientName")} /></label>
              <label className="admin-field"><span>Headline <b aria-hidden="true">*</b></span><input maxLength={100} required value={copy.openingCopy} onChange={updateText("openingCopy")} /></label>
              <label className="admin-field admin-field--wide"><span>Kalimat pembuka <b aria-hidden="true">*</b></span><textarea maxLength={500} required rows={3} value={copy.introduction} onChange={updateText("introduction")} /></label>
            </div>
          </section>

          <section className="admin-card" aria-labelledby="admin-cake-title">
            <div className="admin-card__heading">
              <span className="admin-card__number" aria-hidden="true">02</span>
              <div><p className="eyebrow">Halaman kue</p><h2 id="admin-cake-title">Momen meniup lilin</h2></div>
            </div>
            <div className="admin-fields">
              <label className="admin-field"><span>Judul halaman <b aria-hidden="true">*</b></span><input maxLength={100} required value={copy.cakeTitle} onChange={updateText("cakeTitle")} /></label>
              <label className="admin-field"><span>Instruksi <b aria-hidden="true">*</b></span><textarea maxLength={300} required rows={2} value={copy.cakeInstruction} onChange={updateText("cakeInstruction")} /></label>
            </div>
          </section>

          <section className="admin-card" aria-labelledby="admin-letter-title">
            <div className="admin-card__heading">
              <span className="admin-card__number" aria-hidden="true">03</span>
              <div><p className="eyebrow">Halaman surat</p><h2 id="admin-letter-title">Catatan dari hati</h2></div>
            </div>
            <div className="admin-fields">
              <label className="admin-field"><span>Judul halaman <b aria-hidden="true">*</b></span><input maxLength={100} required value={copy.letterTitle} onChange={updateText("letterTitle")} /></label>
              <label className="admin-field"><span>Sapaan <b aria-hidden="true">*</b></span><input maxLength={100} required value={copy.letter.greeting} onChange={(event) => updateLetter("greeting", event.target.value)} /></label>
              <label className="admin-field"><span>Isi surat</span><textarea maxLength={5000} rows={9} placeholder="Tulis paragraf surat. Pisahkan setiap paragraf dengan satu baris kosong." value={paragraphText} onChange={(event) => setParagraphText(event.target.value)} /></label>
              <p className="admin-field__hint">Pisahkan paragraf dengan satu baris kosong. Draf bawaan masih kosong dan tidak berisi cerita rekaan.</p>
              <label className="admin-field"><span>Tanda tangan <b aria-hidden="true">*</b></span><input maxLength={100} required value={copy.letter.signOff} onChange={(event) => updateLetter("signOff", event.target.value)} /></label>
            </div>
          </section>

          <footer className="admin-actions">
            <p>Perubahan tersimpan sebagai draft sampai tombol terbitkan digunakan.</p>
            <div>
              <button className="button button--outline" disabled={busy !== null} onClick={() => void save("draft")} type="button">
                {busy === "draft" ? "Menyimpan…" : "Simpan draft"}
              </button>
              <button className="button button--primary" disabled={busy !== null} onClick={() => void save("publish")} type="button">
                {busy === "publish" ? "Menerbitkan…" : "Terbitkan perubahan"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </main>
  );
}
