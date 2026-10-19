"use client";

import { useEffect, useRef, useState } from "react";
import { defaultBirthdayCopy } from "@/data/content";
import type { BirthdayCopy } from "@/data/types";

export function LetterSection({ copy = defaultBirthdayCopy }: { copy?: BirthdayCopy }) {
  const [letterOpen, setLetterOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const openingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (openingTimeoutRef.current !== null) window.clearTimeout(openingTimeoutRef.current);
    };
  }, []);

  function openLetter() {
    setLetterOpen(true);
    setIsOpening(true);
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setIsOpening(false);
      return;
    }

    if (openingTimeoutRef.current !== null) window.clearTimeout(openingTimeoutRef.current);
    openingTimeoutRef.current = window.setTimeout(() => setIsOpening(false), 700);
  }

  function closeLetter() {
    setLetterOpen(false);
    setIsOpening(false);
  }

  return (
    <section
      className={`story-page letter-section${letterOpen ? " letter-section--open" : ""}${isOpening ? " letter-section--opening" : ""}`}
      aria-labelledby="letter-title"
      tabIndex={-1}
    >
      <div className="letter-section__intro">
        <p className="page-kicker">Sebuah catatan kecil</p>
        <h2 id="letter-title">{copy.letterTitle}</h2>
        <p className="letter-section__intro-note">Buka saat kamu ingin membacanya perlahan.</p>
      </div>

      {(!letterOpen || isOpening) && (
        <div className={`letter-section__closed${isOpening ? " letter-section__closed--opening" : ""}`}>
          <div className="letter-envelope" aria-hidden="true">
            <span>Untuk {copy.recipientName}</span>
            <i aria-hidden="true" />
          </div>
          {!isOpening && (
            <button
              aria-expanded={letterOpen}
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
          <p className="letter-paper__greeting">{copy.letter.greeting}</p>
          {copy.letter.paragraphs.length > 0 ? (
            copy.letter.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)
          ) : (
            <div className="letter-paper__empty">
              <p>Surat ini sedang menunggu kata-kata yang ingin kamu sampaikan.</p>
              <small>Isi suratnya bisa ditambahkan kapan saja.</small>
            </div>
          )}
          <button className="letter-paper__close" onClick={closeLetter} type="button">Lipat kembali</button>
        </article>
      )}
    </section>
  );
}
