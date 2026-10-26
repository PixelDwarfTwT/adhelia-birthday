"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { birthdayContent } from "@/data/content";
import { verifyPasscode } from "@/lib/access-code";
import { FloralCorners } from "./floral-corners";

interface PasscodeGateProps {
  onUnlock(): void;
}

export function PasscodeGate({ onUnlock }: PasscodeGateProps) {
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const cardMotionRef = useRef<HTMLDivElement>(null);
  const shakeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const card = cardMotionRef.current;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches;

    if (!root || !card || reducedMotion || coarsePointer || typeof window.requestAnimationFrame !== "function") return;

    const activeRoot = root;
    const activeCard = card;
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

      velocity.x += (target.x - position.x) * 68 * dt;
      velocity.y += (target.y - position.y) * 68 * dt;
      velocity.x *= Math.pow(0.86, dt * 60);
      velocity.y *= Math.pow(0.86, dt * 60);
      position.x += velocity.x * dt;
      position.y += velocity.y * dt;
      wheelVelocity *= Math.pow(0.84, dt * 60);

      const bob = Math.sin(elapsed * 0.75) * 1.4;
      const rotate = position.x * 2.6 + velocity.x * 0.9 + wheelVelocity * 0.35;
      activeCard.style.transform =
        `translate3d(${position.x * 18}px, ${position.y * 10 + bob}px, 0) ` +
        `rotateY(${position.x * 5.5}deg) rotateX(${position.y * -3.5}deg) rotateZ(${rotate}deg)`;

      frameId = window.requestAnimationFrame(tick);
    }

    activeCard.style.willChange = "transform";
    activeRoot.addEventListener("pointermove", updateTarget);
    activeRoot.addEventListener("pointerleave", resetTarget);
    activeRoot.addEventListener("wheel", kickFromWheel, { passive: true });
    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      activeRoot.removeEventListener("pointermove", updateTarget);
      activeRoot.removeEventListener("pointerleave", resetTarget);
      activeRoot.removeEventListener("wheel", kickFromWheel);
      activeCard.style.willChange = "auto";
      activeCard.style.transform = "";
    };
  }, []);

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current !== null) window.clearTimeout(shakeTimeoutRef.current);
    };
  }, []);

  function triggerErrorShake() {
    setIsShaking(false);
    window.requestAnimationFrame(() => setIsShaking(true));
    if (shakeTimeoutRef.current !== null) window.clearTimeout(shakeTimeoutRef.current);
    shakeTimeoutRef.current = window.setTimeout(() => setIsShaking(false), 430);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsChecking(true);

    try {
      const subtle = typeof globalThis.crypto === "undefined" ? undefined : globalThis.crypto.subtle;
      const normalizedAnswer = answer.trim().toLocaleLowerCase("id-ID");
      const passcodeCandidate = normalizedAnswer === "sembilan belas" ? "19" : normalizedAnswer;
      const matches = await verifyPasscode(passcodeCandidate, birthdayContent.passcodeHash, subtle);
      if (!matches) {
        setMessage(subtle ? "Belum tepat. Coba masukkan umur Adhelia sekarang." : "Gerbang kecil ini tidak dapat memeriksa passcode di browser ini. Coba buka dengan browser yang mendukung Web Crypto.");
        triggerErrorShake();
        return;
      }

      onUnlock();
    } catch {
      setMessage("Gerbang kecil ini tidak dapat memeriksa passcode sekarang. Silakan coba lagi.");
      triggerErrorShake();
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <main className="gate-screen" aria-labelledby="gate-title" ref={rootRef}>
      <FloralCorners variant="gate" />
      <div className="gate-stars" aria-hidden="true">
        <span>&#x2726;</span><span>&#x2727;</span><span>&#x2726;</span><span>&#x2727;</span>
      </div>
      <div className="gate-card__motion" ref={cardMotionRef}>
        <section className={`gate-card${isShaking ? " gate-card--error" : ""}`}>
          <p className="eyebrow">Kejutan ulang tahun kecil</p>
          <span className="gate-card__seal" aria-hidden="true">&#x2726;</span>
          <h1 id="gate-title">{birthdayContent.passcodePrompt}</h1>
          <form className="gate-form" onSubmit={handleSubmit}>
            <label htmlFor="passcode-answer">Jawaban</label>
            <input
              autoComplete="off"
              autoCapitalize="none"
              id="passcode-answer"
              name="answer"
              value={answer}
              onChange={(event) => setAnswer(event.currentTarget.value)}
              aria-describedby={message ? "gate-message" : undefined}
              required
            />
            <button className="button button--primary" disabled={isChecking} type="submit">
              {isChecking ? "Membuka..." : "Buka amplop"}
            </button>
          </form>
          {message && <p className="gate-message" id="gate-message" role="alert">{message}</p>}
          <p className="gate-card__footnote">Satu kunci kecil untuk kejutan kecil.</p>
        </section>
      </div>
    </main>
  );
}
