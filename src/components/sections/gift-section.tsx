"use client";

import { useState } from "react";
import { birthdayContent } from "@/data/content";

export function GiftSection() {
  const [giftOpen, setGiftOpen] = useState(false);

  return (
    <section className={`story-page gift-section${giftOpen ? " gift-section--open" : ""}`} aria-labelledby="gift-title" tabIndex={-1}>
      <div className="gift-section__copy">
        <p className="page-kicker">Ada sesuatu untukmu</p>
        <h2 id="gift-title">Sebuah kado kecil.</h2>
        <p>Kadonya sederhana. Isinya satu harapan baik untuk tahun barumu.</p>
      </div>
      <div className="gift-section__reveal">
        <div className={`birthday-gift${giftOpen ? " birthday-gift--open" : ""}`} aria-hidden="true">
          <span className="birthday-gift__lid"><i /></span>
          <span className="birthday-gift__box"><i /><b /></span>
          <span className="birthday-gift__shadow" />
        </div>
        <button
          aria-expanded={giftOpen}
          className="button button--primary gift-reveal__button"
          onClick={() => setGiftOpen((open) => !open)}
          type="button"
        >
          {giftOpen ? "Tutup kado" : "Buka kado"}
        </button>
        {giftOpen && (
          <blockquote className="gift-note" aria-live="polite">
            <span className="gift-note__mark" aria-hidden="true">“</span>
            <p>{birthdayContent.giftMessage}</p>
            <span className="gift-note__star" aria-hidden="true">✦</span>
          </blockquote>
        )}
      </div>
    </section>
  );
}
