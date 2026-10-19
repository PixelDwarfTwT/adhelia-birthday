"use client";

import { useEffect, useRef, useState } from "react";
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
  const rootRef = useRef<HTMLElement>(null);
  const copyMotionRef = useRef<HTMLDivElement>(null);
  const balloonsMotionRef = useRef<HTMLDivElement>(null);
  const envelopeMotionRef = useRef<HTMLDivElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const copyMotion = copyMotionRef.current;
    const balloonsMotion = balloonsMotionRef.current;
    const envelopeMotion = envelopeMotionRef.current;
    const wash = washRef.current;
    const stars = starsRef.current;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches;

    if (
      !root ||
      !copyMotion ||
      !balloonsMotion ||
      !envelopeMotion ||
      !wash ||
      !stars ||
      reducedMotion ||
      coarsePointer ||
      typeof window.requestAnimationFrame !== "function"
    ) return;

    const activeRoot = root;
    const activeCopyMotion = copyMotion;
    const activeBalloonsMotion = balloonsMotion;
    const activeEnvelopeMotion = envelopeMotion;
    const activeWash = wash;
    const activeStars = stars;

    const target = { x: 0, y: 0 };
    const position = { x: 0, y: 0 };
    const velocity = { x: 0, y: 0 };
    const jitter = { x: 0, y: 0, rotate: 0, next: 0 };
    const poseYaw = [-15, -7, 0, 7, 15];
    let wheelVelocity = 0;
    let frameId = 0;
    let previous = performance.now();
    const startedAt = previous;

    activeCopyMotion.style.willChange = "transform";
    activeBalloonsMotion.style.willChange = "transform";
    activeEnvelopeMotion.style.willChange = "transform";
    activeWash.style.willChange = "transform";
    activeStars.style.willChange = "transform";

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
      wheelVelocity += clamp((delta / 100) * 2.4, -9, 9);
    }

    function tick(now: number) {
      const dt = Math.min((now - previous) / 1000, 1 / 30);
      previous = now;
      const elapsed = (now - startedAt) / 1000;

      velocity.x += (target.x - position.x) * 82 * dt;
      velocity.y += (target.y - position.y) * 82 * dt;
      velocity.x *= Math.pow(0.86, dt * 60);
      velocity.y *= Math.pow(0.86, dt * 60);
      position.x += velocity.x * dt;
      position.y += velocity.y * dt;
      wheelVelocity *= Math.pow(0.84, dt * 60);

      if (now >= jitter.next) {
        jitter.x = (Math.random() - 0.5) * 3.6;
        jitter.y = (Math.random() - 0.5) * 3.6;
        jitter.rotate = (Math.random() - 0.5) * 1.6;
        jitter.next = now + 1000 / 11;
      }

      const poseIndex = Math.round((position.x + 0.5) * (poseYaw.length - 1));
      const bob = Math.sin(elapsed * 0.9) * 3;
      const yaw = poseYaw[poseIndex] + velocity.x * 1.1 + wheelVelocity * 0.8 + jitter.rotate;
      const driftX = position.x * 26;
      const driftY = position.y * 18 + bob;

      activeEnvelopeMotion.style.transform =
        `perspective(850px) translate3d(${driftX + jitter.x}px, ${driftY + jitter.y}px, 0) ` +
        `rotateY(${yaw}deg) rotateZ(${position.x * 3 - velocity.y * 1.4}deg) ` +
        `scale(${1 + Math.abs(position.x) * 0.035})`;
      activeCopyMotion.style.transform = `translate3d(${-position.x * 22}px, ${-position.y * 8}px, 0) rotate(${position.x * -1.8}deg)`;
      activeBalloonsMotion.style.transform = `translate3d(${position.x * 42}px, ${position.y * 18}px, 0) rotate(${position.x * 2.2}deg)`;
      activeWash.style.transform = `translate3d(${-position.x * 90}px, ${-position.y * 38}px, 0) scale(${1 + Math.abs(position.x) * 0.04})`;
      activeStars.style.transform = `translate3d(${-position.x * 18}px, ${-position.y * 12}px, 0)`;

      frameId = window.requestAnimationFrame(tick);
    }

    activeRoot.addEventListener("pointermove", updateTarget);
    activeRoot.addEventListener("pointerleave", resetTarget);
    activeRoot.addEventListener("wheel", kickFromWheel, { passive: true });
    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      activeRoot.removeEventListener("pointermove", updateTarget);
      activeRoot.removeEventListener("pointerleave", resetTarget);
      activeRoot.removeEventListener("wheel", kickFromWheel);
      activeCopyMotion.style.willChange = "auto";
      activeBalloonsMotion.style.willChange = "auto";
      activeEnvelopeMotion.style.willChange = "auto";
      activeWash.style.willChange = "auto";
      activeStars.style.willChange = "auto";
    };
  }, []);

  function open() {
    if (isOpening) return;
    setIsOpening(true);
    onOpen();
  }

  function popBalloon(color: string) {
    setPoppedBalloons((popped) => popped.includes(color) ? popped : [...popped, color]);
  }

  return (
    <main className={`opening-screen${isOpening ? " opening-screen--closing" : ""}`} aria-labelledby="opening-title" ref={rootRef}>
      <div className="opening-screen__wash" aria-hidden="true" ref={washRef} />
      <div className="opening-screen__stars" aria-hidden="true" ref={starsRef}><span>*</span><span>+</span><span>*</span></div>

      <div className="opening-screen__copy">
        <div className="opening-screen__copy-motion" ref={copyMotionRef}>
          <p className="eyebrow">Ada sesuatu untukmu</p>
          <h1 id="opening-title">{copy.openingCopy}, <em>{copy.recipientName}.</em></h1>
          <p className="opening-screen__note">{copy.introduction}</p>
          <span className="opening-screen__scribble" aria-hidden="true">buka perlahan</span>
        </div>
      </div>

      <div className="opening-screen__stage">
        <span className="opening-screen__stage-label">surat kecil</span>
        <div className="opening-screen__balloons-enter">
          <div className="birthday-balloons" ref={balloonsMotionRef} role="group" aria-label="Balon kecil. Sentuh untuk meletuskannya.">
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
        </div>
        <p className="opening-screen__balloon-hint" aria-live="polite">
          {poppedBalloons.length === 0 ? "Ada tiga balon kecil di sini." : "Sedikit pesta sebelum suratnya dibuka."}
        </p>

        <div className="opening-screen__envelope-enter">
          <div className="opening-screen__envelope-motion" ref={envelopeMotionRef}>
            <div className={`envelope ${isOpening ? "envelope--opening" : ""}`} aria-hidden="true">
              <div className="envelope__letter"><span>Untuk {copy.recipientName}</span><i aria-hidden="true" /></div>
              <div className="envelope__back" />
              <div className="envelope__flap" />
              <div className="envelope__seal"><span aria-hidden="true" /></div>
            </div>
          </div>
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
