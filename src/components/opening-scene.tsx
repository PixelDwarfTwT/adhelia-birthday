"use client";

import { useState } from "react";
import { defaultBirthdayCopy } from "@/data/content";
import type { BirthdayCopy } from "@/data/types";

interface OpeningSceneProps {
  onOpen(): void;
  copy?: BirthdayCopy;
}

const balloons = ["sky", "blue", "gold"] as const;

export function OpeningScene({ onOpen, copy = defaultBirthdayCopy }: OpeningSceneProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [poppedBalloons, setPoppedBalloons] = useState<string[]>([]);

  function open() {
    if (isOpening) return;
    setIsOpening(true);
    onOpen();
  }

  function popBalloon(color: string) {
    setPoppedBalloons((popped) => popped.includes(color) ? popped : [...popped, color]);
  }

  return (
    <main className={`opening-screen${isOpening ? " opening-screen--closing" : ""}`} aria-labelledby="opening-title">
      <div className="opening-screen__wash" aria-hidden="true" />
      <div className="opening-screen__stars" aria-hidden="true"><span>*</span><span>+</span><span>*</span></div>

      <div className="opening-screen__copy">
        <p className="eyebrow">Ada sesuatu untukmu</p>
        <h1 id="opening-title">{copy.openingCopy}, <em>{copy.recipientName}.</em></h1>
        <p className="opening-screen__note">{copy.introduction}</p>
        <span className="opening-screen__scribble" aria-hidden="true">buka perlahan</span>
      </div>

      <div className="opening-screen__stage">
        <span className="opening-screen__stage-label">surat kecil</span>
        <div className="birthday-balloons" role="group" aria-label="Balon kecil. Sentuh untuk meletuskannya.">
          {balloons.map((color, index) => (
            <button
              aria-label={poppedBalloons.includes(color) ? `Balon ${index + 1} sudah meletus` : `Letuskan balon ${index + 1}`}
              className={`birthday-balloon birthday-balloon--${color}${poppedBalloons.includes(color) ? " birthday-balloon--popped" : ""}`}
              disabled={poppedBalloons.includes(color)}
              key={color}
              onClick={() => popBalloon(color)}
              type="button"
            >
              <span aria-hidden="true" />
            </button>
          ))}
        </div>
        <p className="opening-screen__balloon-hint" aria-live="polite">
          {poppedBalloons.length === 0 ? "Ada tiga balon kecil di sini." : "Sedikit pesta sebelum suratnya dibuka."}
        </p>

        <div className={`envelope ${isOpening ? "envelope--opening" : ""}`} aria-hidden="true">
          <div className="envelope__letter"><span>Untuk {copy.recipientName}</span><i aria-hidden="true" /></div>
          <div className="envelope__back" />
          <div className="envelope__flap" />
          <div className="envelope__seal"><span aria-hidden="true" /></div>
        </div>
        <button
          className="button button--primary opening-screen__button"
          type="button"
          onClick={open}
          disabled={isOpening}
        >
          {isOpening ? "Membuka surat..." : "Buka amplop"}
        </button>
        <p className="opening-screen__hint">Musik dimulai setelah amplop dibuka.</p>
      </div>
    </main>
  );
}
