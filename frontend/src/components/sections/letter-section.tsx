"use client";

import { useEffect, useRef, useState } from "react";
import { defaultBirthdayCopy } from "@/data/content";
import type { BirthdayCopy } from "@/data/types";
import { assetPath } from "@/lib/asset-path";

export function LetterSection({ copy = defaultBirthdayCopy }: { copy?: BirthdayCopy }) {
  const [letterOpen, setLetterOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const openingTimeoutRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const introMotionRef = useRef<HTMLDivElement>(null);
  const closedMotionRef = useRef<HTMLDivElement>(null);
  const paperMotionRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const introMotion = introMotionRef.current;
    const closedMotion = closedMotionRef.current;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches;

    if (!root || !introMotion || !closedMotion || reducedMotion || coarsePointer || typeof window.requestAnimationFrame !== "function") return;

    const activeRoot = root;
    const activeIntroMotion = introMotion;
    const activeClosedMotion = closedMotion;
    const activePaperMotion = paperMotionRef.current;
    const activePaper = paperRef.current;
    const target = { x: 0, y: 0 };
    const position = { x: 0, y: 0 };
    const velocity = { x: 0, y: 0 };
    let wheelVelocity = 0;
    let frameId = 0;
    let previous = performance.now();
    const startedAt = previous;

    function clamp(value: number, min: number, max: number) {
      return Math.max(min, Math.min(max, value));
    }

    function updateTarget(event: PointerEvent) {
      const bounds = activeRoot.getBoundingClientRect();
      target.x = clamp((event.clientX - bounds.left) / bounds.width - 0.5, -0.5, 0.5);
      target.y = clamp((event.clientY - bounds.top) / bounds.height - 0.5, -0.5, 0.5);
    }

    function resetTarget() {
      target.x = 0;
      target.y = 0;
    }

    function kickFromWheel(event: WheelEvent) {
      const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      wheelVelocity += clamp((delta / 100) * 1.5, -6, 6);
    }

    function tick(now: number) {
      const dt = Math.min((now - previous) / 1000, 1 / 30);
      previous = now;
      const elapsed = (now - startedAt) / 1000;

      velocity.x += (target.x - position.x) * 70 * dt;
      velocity.y += (target.y - position.y) * 70 * dt;
      velocity.x *= Math.pow(0.86, dt * 60);
      velocity.y *= Math.pow(0.86, dt * 60);
      position.x += velocity.x * dt;
      position.y += velocity.y * dt;
      wheelVelocity *= Math.pow(0.84, dt * 60);

      const bob = Math.sin(elapsed * 0.65) * 1.3;
      const lean = position.x * 2.2 + velocity.x * 0.55 + wheelVelocity * 0.25;
      activeIntroMotion.style.transform = `translate3d(${-position.x * 14}px, ${-position.y * 7 + bob}px, 0) rotate(${lean * -0.4}deg)`;
      activeClosedMotion.style.transform = `translate3d(${position.x * 30}px, ${position.y * 15 + bob}px, 0) rotate(${lean}deg) rotateY(${position.x * 6}deg)`;
      if (activePaperMotion) {
        activePaperMotion.style.transform = `translate3d(${position.x * 12}px, ${position.y * 5}px, 0) rotate(${position.x * -0.6}deg)`;
      }
      if (activePaper) {
        activePaper.style.setProperty("--paper-sheen-x", `${50 + position.x * 18}%`);
      }

      frameId = window.requestAnimationFrame(tick);
    }

    activeIntroMotion.style.willChange = "transform";
    activeClosedMotion.style.willChange = "transform";
    activeRoot.addEventListener("pointermove", updateTarget);
    activeRoot.addEventListener("pointerleave", resetTarget);
    activeRoot.addEventListener("wheel", kickFromWheel, { passive: true });
    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      activeRoot.removeEventListener("pointermove", updateTarget);
      activeRoot.removeEventListener("pointerleave", resetTarget);
      activeRoot.removeEventListener("wheel", kickFromWheel);
      activeIntroMotion.style.willChange = "auto";
      activeClosedMotion.style.willChange = "auto";
      activeIntroMotion.style.transform = "";
      activeClosedMotion.style.transform = "";
      if (activePaperMotion) activePaperMotion.style.transform = "";
      if (activePaper) activePaper.style.removeProperty("--paper-sheen-x");
    };
  }, [letterOpen]);

  useEffect(() => {
    return () => {
      if (openingTimeoutRef.current !== null) window.clearTimeout(openingTimeoutRef.current);
    };
  }, []);

  function openLetter() {
    setLetterOpen(true);
    setIsOpening(true);
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setIsOpening(false);
      return;
    }

    if (openingTimeoutRef.current !== null) window.clearTimeout(openingTimeoutRef.current);
    openingTimeoutRef.current = window.setTimeout(() => setIsOpening(false), 700);
  }

  function closeLetter() {
    setLetterOpen(false);
    setIsOpening(false);
  }

  return (
    <section
      className={`story-page letter-section${letterOpen ? " letter-section--open" : ""}${isOpening ? " letter-section--opening" : ""}`}
      aria-labelledby="letter-title"
      tabIndex={-1}
      ref={rootRef}
    >
      <div aria-hidden="true" className="letter-section__florals">
        {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map((corner) => (
          <span
            className={`letter-section__floral letter-section__floral--${corner}`}
            key={corner}
            style={{ backgroundImage: `url("${assetPath("/assets/hydrangea-carnation-corner.webp")}")` }}
          />
        ))}
      </div>
      <div className="letter-section__intro-motion" ref={introMotionRef}>
        <div className="letter-section__intro">
          <h2 id="letter-title">{copy.letterTitle}</h2>
        </div>
      </div>

      {(!letterOpen || isOpening) && (
        <div className="letter-section__closed-motion" ref={closedMotionRef}>
          <div className={`letter-section__closed${isOpening ? " letter-section__closed--opening" : ""}`}>
            <div className="letter-envelope" aria-hidden="true">
              <i aria-hidden="true" />
            </div>
            {!isOpening && (
              <button
                aria-expanded={letterOpen}
                className="button button--outline letter-reveal__button"
                onClick={openLetter}
                type="button"
              >
                Buka surat
              </button>
            )}
          </div>
        </div>
      )}

      {letterOpen && (
        <div className="letter-paper-motion" ref={paperMotionRef}>
          <article className="letter-paper letter-paper--opening" aria-label={`Surat ulang tahun untuk ${copy.recipientName}`} ref={paperRef}>
            <span aria-hidden="true" className="letter-paper__tape" />
            <p className="letter-paper__greeting">{copy.letter.greeting}</p>
            {copy.letter.paragraphs.length > 0 ? (
              copy.letter.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)
            ) : (
              <div className="letter-paper__empty">
                <p>Surat ini sedang menunggu kata-kata yang ingin kamu sampaikan.</p>
                <small>Isi suratnya bisa ditambahkan kapan saja.</small>
              </div>
            )}
            <button className="letter-paper__close" onClick={closeLetter} type="button">Lipat kembali</button>
          </article>
        </div>
      )}
    </section>
  );
}
