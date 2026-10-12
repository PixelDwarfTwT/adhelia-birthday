"use client";

import { useState, type KeyboardEvent } from "react";
import type { AchievementItem } from "@/data/types";

interface KeepsakeCardProps {
  item: AchievementItem;
  collected: boolean;
  onCollect(stickerId: string): void;
}

export function KeepsakeCard({ item, collected, onCollect }: KeepsakeCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [collectedHere, setCollectedHere] = useState(false);
  const hasCollected = collected || collectedHere;

  function flip() {
    setFlipped((current) => !current);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      flip();
    }
  }

  function collect() {
    if (hasCollected) return;
    setCollectedHere(true);
    onCollect(item.stickerId);
  }

  return (
    <article className={`keepsake-card ${flipped ? "keepsake-card--flipped" : ""}`}>
      <span aria-hidden="true" className="keepsake-card__tape" />
      <p className="keepsake-card__label">A little achievement</p>
      <h3>{item.title}</h3>
      <button
        aria-label={`Flip card: ${item.title}`}
        aria-pressed={flipped}
        className="keepsake-card__face"
        onClick={flip}
        onKeyDown={handleKeyDown}
        type="button"
      >
        <span aria-hidden="true" className="keepsake-card__sparkle">✦</span>
        <span>{flipped ? item.story : item.stat}</span>
        <span className="keepsake-card__hint">{flipped ? "Tap to turn back" : "Tap to turn this card"}</span>
      </button>
      {item.placeholder && <p className="placeholder-label">Placeholder · add real details in src/data/content.ts</p>}
      <button
        aria-label={hasCollected ? `Sticker collected: ${item.stickerId}` : `Collect sticker: ${item.stickerId}`}
        className="keepsake-card__collect"
        disabled={hasCollected}
        onClick={collect}
        type="button"
      >
        <span aria-hidden="true">{hasCollected ? "✦" : "✧"}</span>
        {hasCollected ? "Collected" : "Collect a sticker"}
      </button>
    </article>
  );
}
