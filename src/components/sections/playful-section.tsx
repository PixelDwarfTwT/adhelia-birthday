"use client";

import { useState } from "react";
import { birthdayContent } from "@/data/content";
import { KeepsakeCard } from "@/components/ui/keepsake-card";

interface PlayfulSectionProps {
  collectedStickerIds: string[];
  onCollectSticker(stickerId: string): void;
}

export function PlayfulSection({ collectedStickerIds, onCollectSticker }: PlayfulSectionProps) {
  const [surpriseVisible, setSurpriseVisible] = useState(false);

  return (
    <section className="chapter-section playful-section" id="chapter-2" aria-labelledby="chapter-2-title" tabIndex={-1}>
      <p className="chapter-section__number">Bab 02 · Momen seru</p>
      <h2 id="chapter-2-title">Hal-hal kecil yang patut dirayakan</h2>
      <p>Balik kartunya untuk membaca catatan, lalu kumpulkan stiker kecil untuk scrapbook.</p>
      <div className="playful-grid">
        {birthdayContent.achievements.map((item) => (
          <KeepsakeCard
            collected={collectedStickerIds.includes(item.stickerId)}
            item={item}
            key={item.id}
            onCollect={onCollectSticker}
          />
        ))}
      </div>
      <div className="surprise-note">
        <button className="button button--soft" onClick={() => setSurpriseVisible(true)} type="button">
          <span aria-hidden="true">✧</span> Cari kejutan kecil
        </button>
        {surpriseVisible && <p className="surprise-note__message" role="status">Kamu menemukan sedikit kilau tambahan, khusus untukmu ✨</p>}
      </div>
    </section>
  );
}
