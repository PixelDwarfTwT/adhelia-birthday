"use client";

import { useState } from "react";
import { birthdayContent } from "@/data/content";

export function LetterSection() {
  const { letter } = birthdayContent;
  const [letterOpen, setLetterOpen] = useState(false);

  return (
    <section className="story-page letter-section" aria-labelledby="letter-title" tabIndex={-1}>
      <div className="letter-section__intro">
        <h2 id="letter-title">Sepucuk surat untukmu.</h2>
      </div>
      {!letterOpen ? (
        <div className="letter-section__closed">
          <div className="letter-envelope" aria-hidden="true">
            <span>Untuk {birthdayContent.recipientName}</span>
            <i>✦</i>
          </div>
          <button
            aria-expanded={false}
            className="button button--outline letter-reveal__button"
            onClick={() => setLetterOpen(true)}
            type="button"
          >
            Buka surat
          </button>
        </div>
      ) : (
        <article className="letter-paper" aria-label={`Surat ulang tahun untuk ${birthdayContent.recipientName}`}>
          <span aria-hidden="true" className="letter-paper__tape" />
          <p className="letter-paper__greeting">{letter.greeting}</p>
          {letter.paragraphs.length > 0 ? (
            letter.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)
          ) : (
            <div className="letter-paper__empty">
              <p>Pesan pribadimu akan ditulis di sini.</p>
              <small>Isi <code>letter.paragraphs</code> di <code>src/data/content.ts</code>.</small>
            </div>
          )}
          <p className="letter-paper__signoff">{letter.signOff}</p>
          <button className="letter-paper__close" onClick={() => setLetterOpen(false)} type="button">Lipat kembali</button>
        </article>
      )}
    </section>
  );
}
