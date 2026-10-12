"use client";

import { useState } from "react";
import { birthdayContent } from "@/data/content";
import type { FavoriteThing } from "@/data/types";

const categorySymbols: Record<string, string> = {
  Color: "◉",
  Music: "♫",
  Games: "✧",
  Food: "♡",
  Characters: "✦",
  Hobbies: "☼",
};

export function FavoritesSection() {
  const [selected, setSelected] = useState<FavoriteThing | null>(null);

  function selectFavorite(favorite: FavoriteThing) {
    setSelected((current) => current?.id === favorite.id ? null : favorite);
  }

  return (
    <section className="chapter-section favorites-section" id="chapter-3" aria-labelledby="chapter-3-title">
      <p className="chapter-section__number">Chapter 03 · Appreciation</p>
      <h2 id="chapter-3-title">A constellation of little favorites</h2>
      <p>Tap a little star to open its pocket of color, music, and things worth celebrating.</p>
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
            {favorite.placeholder && <span className="favorite-tile__placeholder">Placeholder</span>}
          </button>
        ))}
      </div>
      {selected && (
        <aside className="favorite-detail" aria-label="Favorite detail" aria-live="polite">
          <p className="eyebrow">{selected.category}</p>
          <h3>{selected.label}</h3>
          <p>{selected.detail}</p>
          {selected.placeholder && <p className="placeholder-label">Placeholder · update this in src/data/content.ts</p>}
        </aside>
      )}
    </section>
  );
}
