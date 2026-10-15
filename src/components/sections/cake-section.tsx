"use client";

import Image from "next/image";
import { useState } from "react";

export function CakeSection() {
  const [candlesOut, setCandlesOut] = useState(false);

  return (
    <section className="story-page cake-section" aria-labelledby="cake-title" tabIndex={-1}>
      <div className="cake-section__copy">
        <p className="page-kicker">Sebelum membuka halaman lain</p>
        <h2 id="cake-title">Buat satu permohonan kecil.</h2>
        <p>Pejamkan mata sebentar, lalu tiup lilinnya.</p>
        <button
          className="button button--primary cake-section__button"
          onClick={() => setCandlesOut((out) => !out)}
          type="button"
        >
          {candlesOut ? "Nyalakan lilin lagi" : "Tiup lilin"}
        </button>
        <p className="cake-section__wish" role="status" aria-live="polite">
          {candlesOut ? "Permohonannya sudah meluncur. Semoga terkabul." : ""}
        </p>
      </div>

      <figure className={`birthday-cake${candlesOut ? " birthday-cake--wished" : ""}`}>
        <Image
          alt="Ilustrasi kue ulang tahun dua tingkat dengan tiga lilin."
          className="birthday-cake__art"
          fill
          priority
          sizes="(max-width: 700px) 76vw, 42vw"
          src="/assets/cake-illustration.png"
        />
        <span className="birthday-cake__flame birthday-cake__flame--one" aria-hidden="true" />
        <span className="birthday-cake__flame birthday-cake__flame--two" aria-hidden="true" />
        <span className="birthday-cake__flame birthday-cake__flame--three" aria-hidden="true" />
      </figure>
    </section>
  );
}
