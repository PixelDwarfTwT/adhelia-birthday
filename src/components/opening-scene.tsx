"use client";

import { useState, type KeyboardEvent } from "react";
import { birthdayContent } from "@/data/content";

interface OpeningSceneProps {
  onOpen(): void;
}

export function OpeningScene({ onOpen }: OpeningSceneProps) {
  const [isOpening, setIsOpening] = useState(false);

  function open() {
    if (isOpening) return;
    setIsOpening(true);
    window.setTimeout(onOpen, 420);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  }

  return (
    <main className="opening-screen" aria-labelledby="opening-title">
      <div className="opening-screen__glow" aria-hidden="true" />
      <p className="eyebrow">A note from the night sky</p>
      <h1 id="opening-title">{birthdayContent.openingCopy}</h1>
      <p className="opening-screen__note">A little keepsake, tucked between the stars.</p>
      <div className={`envelope ${isOpening ? "envelope--opening" : ""}`} aria-hidden="true">
        <div className="envelope__letter"><span>For Adhelia</span><i>✦</i></div>
        <div className="envelope__back" />
        <div className="envelope__flap" />
        <div className="envelope__seal">✦</div>
      </div>
      <button
        className="button button--primary opening-screen__button"
        type="button"
        onClick={open}
        onKeyDown={handleKeyDown}
        disabled={isOpening}
      >
        {isOpening ? "Opening your scrapbook..." : "Buka scrapbook"}
      </button>
      <p className="opening-screen__hint">Tap, or press Enter, to untie the ribbon.</p>
    </main>
  );
}
