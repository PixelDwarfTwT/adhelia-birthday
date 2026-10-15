"use client";

import { useState } from "react";
import { birthdayContent } from "@/data/content";
import type { FavoriteThing } from "@/data/types";

const categorySymbols: Record<string, string> = {
  Warna: "◉",
  Musik: "♫",
  Game: "✧",
  Makanan: "♡",
  Karakter: "✦",
  Hobi: "☼",
};

export function FavoritesSection() {
  const [selected, setSelected] = useState<FavoriteThing | null>(null);
  const [giftOpen, setGiftOpen] = useState(false);

  function selectFavorite(favorite: FavoriteThing) {
    setSelected((current) => current?.id === favorite.id ? null : favorite);
  }

  return (
    <section className="chapter-section favorites-section" id="chapter-3" aria-labelledby="chapter-3-title" tabIndex={-1}>
      <p className="chapter-section__number">Bab 03 · Kado kecil</p>
      <h2 id="chapter-3-title">Ada sesuatu di dalam kotak ini</h2>
      <p>Buka kadonya, lalu lihat hal-hal kecil yang ikut merayakan {birthdayContent.recipientName} hari ini.</p>
      <div className={`gift-reveal${giftOpen ? " gift-reveal--open" : ""}`}>
        <div className="birthday-gift" aria-hidden="true">
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
          {giftOpen ? "Tutup kadonya" : "Buka kadonya!"}
        </button>
      </div>
      {giftOpen && (
        <div className="gift-reveal__contents" aria-label="Isi kado: hal-hal favorit">
          <p className="gift-reveal__caption">Taraa! Ini beberapa hal yang bikin halaman ini terasa seperti milikmu ✨</p>
          <div className="favorite-grid">
            {birthdayContent.favoriteThings.map((favorite) => (
              <button
                aria-expanded={selected?.id === favorite.id}
                aria-label={`${favorite.category}: ${favorite.label}`}
                aria-pressed={selected?.id === favorite.id}
                className={`favorite-tile ${selected?.id === favorite.id ? "favorite-tile--selected" : ""}`}
                key={favorite.id}
                onClick={() => selectFavorite(favorite)}
                type="button"
              >
                <span aria-hidden="true" className={`favorite-tile__symbol favorite-tile__symbol--${favorite.id}`}>
                  {categorySymbols[favorite.category] ?? "✦"}
                </span>
                <span className="favorite-tile__category">{favorite.category}</span>
                <strong>{favorite.label}</strong>
                {favorite.placeholder && <span className="favorite-tile__placeholder">Belum diisi</span>}
              </button>
            ))}
          </div>
          {selected && (
            <aside className="favorite-detail" aria-label="Favorite detail" aria-live="polite">
              <p className="eyebrow">{selected.category}</p>
              <h3>{selected.label}</h3>
              <p>{selected.detail}</p>
              {selected.placeholder && <p className="placeholder-label">Placeholder · ubah di src/data/content.ts</p>}
            </aside>
          )}
        </div>
      )}
    </section>
  );
}
