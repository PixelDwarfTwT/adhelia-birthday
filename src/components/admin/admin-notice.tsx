import Link from "next/link";

interface AdminNoticeProps {
  title: string;
  children: React.ReactNode;
}

export function AdminNotice({ title, children }: AdminNoticeProps) {
  return (
    <main className="admin-screen">
      <section className="admin-notice" aria-labelledby="admin-notice-title">
        <p className="eyebrow">Buku ulang tahun Adhelia</p>
        <h1 id="admin-notice-title">{title}</h1>
        <div className="admin-notice__body">{children}</div>
      </section>
    </main>
  );
}

export function AdminBrand() {
  return (
    <Link className="admin-brand" href="/" aria-label="Kembali ke buku ulang tahun">
      <span className="admin-brand__mark" aria-hidden="true">✦</span>
      <span><strong>Adhelia</strong><small>BUKU ULANG TAHUN</small></span>
    </Link>
  );
}
