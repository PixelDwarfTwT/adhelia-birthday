"use client";

import { useState } from "react";
import { birthdayContent } from "@/data/content";

interface OpeningSceneProps {
  onOpen(): void;
}

const balloons = ["sky", "lavender", "blue", "gold", "pink"] as const;

export function OpeningScene({ onOpen }: OpeningSceneProps) {
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
    <main className="opening-screen" aria-labelledby="opening-title">
      <div className="opening-screen__glow" aria-hidden="true" />
      <div className="opening-screen__stars" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span><span>·</span></div>
      <p className="eyebrow">Ada hadiah kecil untukmu</p>
      <h1 id="opening-title">{birthdayContent.openingCopy},<br /><em>{birthdayContent.recipientName}!</em></h1>
      <p className="opening-screen__note">{birthdayContent.introduction}</p>

      <div className="birthday-balloons" role="group" aria-label="Balon ulang tahun. Sentuh untuk meletuskannya.">
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
        {poppedBalloons.length === 0 ? "Sentuh balonnya kalau mau ✨" : poppedBalloons.length === balloons.length ? "Yeay, pestanya dimulai! ✨" : `${poppedBalloons.length} balon sudah meletus!`}
      </p>

      <div className={`envelope ${isOpening ? "envelope--opening" : ""}`} aria-hidden="true">
        <div className="envelope__letter"><span>Untuk {birthdayContent.recipientName}</span><i>✦</i></div>
        <div className="envelope__back" />
        <div className="envelope__flap" />
        <div className="envelope__seal">✦</div>
      </div>
      <button
        className="button button--primary opening-screen__button"
        type="button"
        onClick={open}
        disabled={isOpening}
      >
        {isOpening ? "Menyiapkan perayaan..." : "Buka hadiah ulang tahun"}
      </button>
      <p className="opening-screen__hint">Musik baru dimulai setelah tombol ini disentuh.</p>
    </main>
  );
}
