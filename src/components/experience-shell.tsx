"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { birthdayContent, defaultBirthdayCopy } from "@/data/content";
import type { BirthdayCopy } from "@/data/types";
import { hasLocalAccess, rememberLocalAccess } from "@/lib/access-code";
import { parseBirthdayCopy } from "@/lib/birthday-copy";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AudioPlayer, type AudioPlayerHandle } from "./audio-player";
import { OpeningScene } from "./opening-scene";
import { PasscodeGate } from "./passcode-gate";
import { CakeSection } from "./sections/cake-section";
import { LetterSection } from "./sections/letter-section";

const pages = [
  { label: "Kue", eyebrow: "Momen pertama" },
  { label: "Surat", eyebrow: "Untuk dibaca perlahan" },
] as const;

function subscribeToAccess(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("adhelia-access-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("adhelia-access-change", onChange);
  };
}

function getAccessSnapshot() {
  try {
    return hasLocalAccess(window.localStorage);
  } catch {
    return false;
  }
}

export function ExperienceShell() {
  const storedAccess = useSyncExternalStore(subscribeToAccess, getAccessSnapshot, () => false);
  const [sessionAccess, setSessionAccess] = useState(false);
  const hasAccess = storedAccess || sessionAccess;
  const [experienceStarted, setExperienceStarted] = useState(false);
  const [copy, setCopy] = useState<BirthdayCopy>(defaultBirthdayCopy);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageDirection, setPageDirection] = useState<"next" | "previous">("next");
  const [isTurningPage, setIsTurningPage] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<AudioPlayerHandle>(null);
  const turnTimeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      turnTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  useEffect(() => {
    if (experienceStarted) titleRef.current?.focus();
  }, [experienceStarted]);

  useEffect(() => {
    if (experienceStarted && pageIndex > 0) pageRef.current?.focus({ preventScroll: true });
  }, [experienceStarted, pageIndex]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("birthday_content")
          .select("content")
          .eq("id", "published")
          .maybeSingle();
        if (!active || error || !data) return;
        const publishedCopy = parseBirthdayCopy(data.content);
        if (publishedCopy) setCopy(publishedCopy);
      } catch {
        // The locally bundled copy remains available when Supabase is unreachable.
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  function unlock() {
    setSessionAccess(true);
    try {
      rememberLocalAccess(window.localStorage);
      window.dispatchEvent(new Event("adhelia-access-change"));
    } catch {
      // Keep this page view unlocked if the browser blocks local storage.
    }
  }

  function openExperience() {
    void audioPlayerRef.current?.startFromGesture();
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setExperienceStarted(true);
      return;
    }

    window.setTimeout(() => setExperienceStarted(true), 680);
  }

  function moveToPage(nextIndex: number) {
    const safeIndex = (nextIndex + pages.length) % pages.length;
    if (safeIndex === pageIndex) return;

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setPageDirection(safeIndex > pageIndex ? "next" : "previous");
    if (reducedMotion) {
      setPageIndex(safeIndex);
      return;
    }

    setIsTurningPage(true);
    turnTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    turnTimeoutsRef.current = [
      window.setTimeout(() => setPageIndex(safeIndex), 300),
      window.setTimeout(() => setIsTurningPage(false), 650),
    ];
  }

  function renderPage() {
    return pageIndex === 0 ? <CakeSection copy={copy} /> : <LetterSection copy={copy} />;
  }

  if (!hasAccess) return <PasscodeGate onUnlock={unlock} />;

  const page = pages[pageIndex];
  const isLetterPage = pageIndex === pages.length - 1;

  return (
    <>
      <AudioPlayer ref={audioPlayerRef} track={birthdayContent.audio.primary} />
      {!experienceStarted ? (
        <OpeningScene copy={copy} onOpen={openExperience} />
      ) : (
        <main className="scrapbook scrapbook--paged" aria-labelledby="scrapbook-title">
          <header className="scrapbook__topbar">
            <div className="scrapbook__title-group">
              <p className="scrapbook__eyebrow">A small birthday book</p>
              <h1 className="book-brand" id="scrapbook-title" ref={titleRef} tabIndex={-1}>
                <span>For {copy.recipientName}</span>
              </h1>
            </div>
            <p className="scrapbook__page-mark" aria-label={`Halaman ${pageIndex + 1} dari ${pages.length}`}>
              <span>{String(pageIndex + 1).padStart(2, "0")}</span>
              <i aria-hidden="true">/</i>
              <span>{String(pages.length).padStart(2, "0")}</span>
            </p>
          </header>

          <div className="page-stage">
            <div
              aria-label={`${page.label}, halaman ${pageIndex + 1} dari ${pages.length}`}
              className={`page-scene page-scene--${pageDirection}${isTurningPage ? " page-scene--turning" : ""}`}
              ref={pageRef}
              tabIndex={-1}
            >
              {renderPage()}
            </div>
          </div>

          <nav className="page-controls" aria-label="Navigasi hadiah ulang tahun">
            <button
              aria-label={pageIndex === 0 ? "Kembali ke amplop" : "Kembali ke halaman kue"}
              className="page-controls__button page-controls__button--back"
              onClick={() => pageIndex === 0 ? setExperienceStarted(false) : moveToPage(pageIndex - 1)}
              type="button"
            >
              <ArrowLeft aria-hidden="true" />
              <span>{pageIndex === 0 ? "Amplop" : "Kembali"}</span>
            </button>
            <p aria-live="polite" className="page-controls__status">
              <span>{page.eyebrow}</span>
              <strong>{page.label}</strong>
            </p>
            <button
              aria-label={isLetterPage ? "Buka kembali halaman kue" : "Lanjut ke halaman surat"}
              className="page-controls__button page-controls__button--next"
              onClick={() => moveToPage(pageIndex + 1)}
              type="button"
            >
              <span>{isLetterPage ? "Ulangi" : "Baca surat"}</span>
              <ArrowRight aria-hidden="true" />
            </button>
          </nav>
        </main>
      )}
    </>
  );
}
