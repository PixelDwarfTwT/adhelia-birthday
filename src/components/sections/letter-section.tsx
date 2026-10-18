"use client";

import { useState } from "react";
import { defaultBirthdayCopy } from "@/data/content";
import type { BirthdayCopy } from "@/data/types";

export function LetterSection({ copy = defaultBirthdayCopy }: { copy?: BirthdayCopy }) {
  const { letter } = copy;
  const [letterOpen, setLetterOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  function openLetter() {
    setLetterOpen(true);
    setIsOpening(true);
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => setIsOpening(false), reducedMotion ? 0 : 700);
  }

  return (
    <section className={`story-page letter-section${letterOpen ? " letter-section--open" : ""}${isOpening ? " letter-section--opening" : ""}`} aria-labelledby="letter-title" tabIndex={-1}>
      <div className="letter-section__intro">
        <p className="page-kicker">Sebuah catatan kecil</p>
        <h2 id="letter-title">{copy.letterTitle}</h2>
      </div>
      {(!letterOpen || isOpening) && (
        <div className={`letter-section__closed${isOpening ? " letter-section__closed--opening" : ""}`}>
          <div className="letter-envelope" aria-hidden="true">
            <span>Untuk {copy.recipientName}</span>
            <i>✦</i>
          </div>
          {!isOpening && (
            <button
              aria-expanded={false}
              className="button button--outline letter-reveal__button"
              onClick={openLetter}
              type="button"
            >
              Buka surat
            </button>
          )}
        </div>
      )}
      {letterOpen && (
        <article className="letter-paper letter-paper--opening" aria-label={`Surat ulang tahun untuk ${copy.recipientName}`}>
          <span aria-hidden="true" className="letter-paper__tape" />
          <p className="letter-paper__greeting">{letter.greeting}</p>
          {letter.paragraphs.length > 0 ? (
            letter.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)
          ) : (
            <div className="letter-paper__empty">
              <p>Pesan pribadimu akan ditulis di sini.</p>
              <small>Tulis isi surat lewat panel admin saat sudah siap.</small>
            </div>
          )}
          <p className="letter-paper__signoff">{letter.signOff}</p>
          <button className="letter-paper__close" onClick={() => setLetterOpen(false)} type="button">Lipat kembali</button>
        </article>
      )}
    </section>
  );
}
