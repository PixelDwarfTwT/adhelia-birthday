"use client";

import Image from "next/image";
import { useState } from "react";
import { assetPath } from "@/lib/asset-path";
import { defaultBirthdayCopy } from "@/data/content";
import type { BirthdayCopy } from "@/data/types";

export function CakeSection({ copy = defaultBirthdayCopy }: { copy?: BirthdayCopy }) {
  const [candlesOut, setCandlesOut] = useState(false);

  return (
    <section className={`story-page cake-section${candlesOut ? " cake-section--wished" : ""}`} aria-labelledby="cake-title" tabIndex={-1}>
      <div className="cake-section__copy">
        <p className="page-kicker">Sebelum membaca suratnya</p>
        <h2 id="cake-title">{copy.cakeTitle}</h2>
        <p>{copy.cakeInstruction}</p>
        <button
          className="button button--primary cake-section__button"
          onClick={() => setCandlesOut((out) => !out)}
          type="button"
        >
          {candlesOut ? "Nyalakan lagi" : "Tiup lilin"}
        </button>
        <p className={`cake-section__wish${candlesOut ? " cake-section__wish--visible" : ""}`} role="status" aria-live="polite">
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
          src={assetPath("/assets/cake-illustration.png")}
        />
        <span className="birthday-cake__flame birthday-cake__flame--one" aria-hidden="true" />
        <span className="birthday-cake__flame birthday-cake__flame--two" aria-hidden="true" />
        <span className="birthday-cake__flame birthday-cake__flame--three" aria-hidden="true" />
      </figure>
    </section>
  );
}
