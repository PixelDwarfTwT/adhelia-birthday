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
    <section className="chapter-section playful-section" id="chapter-2" aria-labelledby="chapter-2-title">
      <p className="chapter-section__number">Chapter 02 · Playfulness</p>
      <h2 id="chapter-2-title">A page for little victories</h2>
      <p>Turn a card over to see its note, and collect a tiny sticker for the scrapbook.</p>
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
          <span aria-hidden="true">✧</span> Find a tiny surprise
        </button>
        {surpriseVisible && <p className="surprise-note__message" role="status">You found a little extra sparkle, just because.</p>}
      </div>
    </section>
  );
}
