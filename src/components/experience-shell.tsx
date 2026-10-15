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

const pages = ["Kue", "Surat"] as const;

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
  const titleRef = useRef<HTMLHeadingElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<AudioPlayerHandle>(null);

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
    } else {
      window.setTimeout(() => setExperienceStarted(true), 420);
    }
  }

  function moveToPage(nextIndex: number) {
    const safeIndex = (nextIndex + pages.length) % pages.length;
    if (safeIndex === pageIndex) return;
    setPageDirection(safeIndex > pageIndex ? "next" : "previous");
    setPageIndex(safeIndex);
  }

  function renderPage() {
    return pageIndex === 0 ? <CakeSection copy={copy} /> : <LetterSection copy={copy} />;
  }

  if (!hasAccess) return <PasscodeGate onUnlock={unlock} />;

  return (
    <>
      <AudioPlayer ref={audioPlayerRef} track={birthdayContent.audio.primary} />
      {!experienceStarted ? (
        <OpeningScene copy={copy} onOpen={openExperience} />
      ) : (
        <main className="scrapbook scrapbook--paged" aria-labelledby="scrapbook-title">
          <header className="scrapbook__topbar">
            <h1 className="book-brand" id="scrapbook-title" ref={titleRef} tabIndex={-1}>
              <span>Happy Birthday {copy.recipientName}</span>
            </h1>
          </header>
          <div className="page-stage">
            <div
              aria-label={`${pages[pageIndex]}, halaman ${pageIndex + 1} dari ${pages.length}`}
              className={`page-scene page-scene--${pageDirection}`}
              key={pageIndex}
              ref={pageRef}
              tabIndex={-1}
            >
              {renderPage()}
            </div>
          </div>
          <nav className="page-controls" aria-label="Navigasi halaman">
            <button
              aria-label={pageIndex === 0 ? "Kembali ke sampul" : "Halaman sebelumnya"}
              className="page-controls__button page-controls__button--back"
              onClick={() => pageIndex === 0 ? setExperienceStarted(false) : moveToPage(pageIndex - 1)}
              type="button"
            >
              <ArrowLeft aria-hidden="true" />
              <span>{pageIndex === 0 ? "Sampul" : "Kembali"}</span>
            </button>
            <p aria-live="polite" className="page-controls__status">
              <strong>{pages[pageIndex]}</strong>
              <span>{String(pageIndex + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}</span>
            </p>
            <button
              aria-label={pageIndex === pages.length - 1 ? "Ulangi dari halaman kue" : "Halaman berikutnya"}
              className="page-controls__button page-controls__button--next"
              onClick={() => moveToPage(pageIndex + 1)}
              type="button"
            >
              <span>{pageIndex === pages.length - 1 ? "Ulangi" : "Lanjut"}</span>
              <ArrowRight aria-hidden="true" />
            </button>
          </nav>
        </main>
      )}
    </>
  );
}
