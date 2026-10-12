"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { birthdayContent } from "@/data/content";
import { hasLocalAccess, rememberLocalAccess } from "@/lib/access-code";
import { EMPTY_PROGRESS, readProgress, writeProgress } from "@/lib/progress";
import type { ExperienceProgress } from "@/data/types";
import { AudioPlayer, type AudioPlayerHandle } from "./audio-player";
import { ChapterNavigation, type Chapter } from "./chapter-navigation";
import { OpeningScene } from "./opening-scene";
import { PasscodeGate } from "./passcode-gate";
import { FavoritesSection } from "./sections/favorites-section";
import { LetterSection } from "./sections/letter-section";
import { MemoriesSection } from "./sections/memories-section";
import { PlayfulSection } from "./sections/playful-section";

const chapters: Chapter[] = [
  { id: "chapter-1", label: "Rasa ingin tahu" },
  { id: "chapter-2", label: "Playfulness" },
  { id: "chapter-3", label: "Hal-hal favorit" },
  { id: "chapter-4", label: "Kenangan" },
  { id: "chapter-5", label: "Surat" },
  { id: "chapter-6", label: "Konstelasi" },
];

const ACCESS_EVENT = "adhelia-access-change";
const PROGRESS_EVENT = "adhelia-progress-change";
const PROGRESS_KEY = "adhelia-birthday-progress";

function subscribeToAccess(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(ACCESS_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(ACCESS_EVENT, onChange);
  };
}

function getAccessSnapshot() {
  try {
    return hasLocalAccess(window.localStorage);
  } catch {
    return false;
  }
}

function subscribeToProgress(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(PROGRESS_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(PROGRESS_EVENT, onChange);
  };
}

function getProgressSnapshot() {
  try {
    return window.sessionStorage.getItem(PROGRESS_KEY);
  } catch {
    return null;
  }
}

export function ExperienceShell() {
  const storedAccess = useSyncExternalStore(subscribeToAccess, getAccessSnapshot, () => false);
  const [sessionAccess, setSessionAccess] = useState(false);
  const hasAccess = storedAccess || sessionAccess;
  const [experienceStarted, setExperienceStarted] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(chapters[0].id);
  const progressSnapshot = useSyncExternalStore(subscribeToProgress, getProgressSnapshot, () => null);
  const progress = useMemo(() => {
    if (!progressSnapshot) return { ...EMPTY_PROGRESS, stickerIds: [] };
    const storage = { getItem: (key: string) => key === PROGRESS_KEY ? progressSnapshot : null } as Storage;
    return readProgress(storage);
  }, [progressSnapshot]);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const audioPlayerRef = useRef<AudioPlayerHandle>(null);
  const handleVideoActiveChange = useCallback((active: boolean) => {
    audioPlayerRef.current?.setDucked(active);
  }, []);

  function saveProgress(nextProgress: ExperienceProgress) {
    try {
      writeProgress(window.sessionStorage, nextProgress);
      window.dispatchEvent(new Event(PROGRESS_EVENT));
    } catch {
      // Session storage is optional; losing it must not interrupt the journey.
    }
  }

  useEffect(() => {
    if (experienceStarted) titleRef.current?.focus();
  }, [experienceStarted]);

  function unlock() {
    setSessionAccess(true);
    try {
      rememberLocalAccess(window.localStorage);
      window.dispatchEvent(new Event(ACCESS_EVENT));
    } catch {
      // Keep this page view unlocked even if the browser blocks local storage.
    }
  }

  function navigateTo(chapterId: string) {
    setCurrentChapter(chapterId);
    const target = document.getElementById(chapterId);
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    target?.scrollIntoView?.({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }

  function collectSticker(stickerId: string) {
    if (progress.stickerIds.includes(stickerId)) return;
    saveProgress({
      ...progress,
      stickerIds: [...progress.stickerIds, stickerId],
    });
  }

  if (!hasAccess) return <PasscodeGate onUnlock={unlock} />;

  return (
    <>
      <AudioPlayer ref={audioPlayerRef} track={birthdayContent.audio.primary} />
      {!experienceStarted ? (
        <OpeningScene onOpen={() => {
          void audioPlayerRef.current?.startFromGesture();
          window.setTimeout(() => setExperienceStarted(true), 420);
        }} />
      ) : (
        <main className="scrapbook" aria-labelledby="scrapbook-title" data-progress-stickers={progress.stickerIds.length} data-constellation-complete={progress.constellationComplete}>
          <header className="scrapbook__header">
            <p className="eyebrow">The Magical Scrapbook in the Stars</p>
            <h1 id="scrapbook-title" ref={titleRef} tabIndex={-1}>For {birthdayContent.recipientName}</h1>
            <p>{birthdayContent.introduction}</p>
          </header>
          <ChapterNavigation chapters={chapters} currentChapter={currentChapter} onNavigate={navigateTo} />
          <div className="chapter-stack">
            <section className="chapter-section" id="chapter-1" aria-labelledby="chapter-1-title">
              <p className="chapter-section__number">Chapter 01 · Curiosity</p>
              <h2 id="chapter-1-title">A little story written in blue</h2>
              <p>{birthdayContent.openingCopy}</p>
            </section>
            <PlayfulSection collectedStickerIds={progress.stickerIds} onCollectSticker={collectSticker} />
            <FavoritesSection />
            <MemoriesSection onVideoActiveChange={handleVideoActiveChange} />
            <LetterSection />
            {chapters.slice(5).map((chapter, index) => (
              <section className="chapter-section" id={chapter.id} key={chapter.id} aria-labelledby={`${chapter.id}-title`}>
                <p className="chapter-section__number">Chapter {String(index + 2).padStart(2, "0")}</p>
                <h2 id={`${chapter.id}-title`}>{chapter.label}</h2>
                <p className="placeholder-note">A little corner of Adhelia&apos;s birthday scrapbook.</p>
              </section>
            ))}
          </div>
          <footer className="scrapbook__footer">Made with care, one little star at a time.</footer>
        </main>
      )}
    </>
  );
}

