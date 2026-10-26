"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { assetPath } from "@/lib/asset-path";
import { defaultBirthdayCopy } from "@/data/content";
import type { BirthdayCopy } from "@/data/types";
import { FloralCorners } from "../floral-corners";

export function CakeSection({ copy = defaultBirthdayCopy }: { copy?: BirthdayCopy }) {
  const [candlesOut, setCandlesOut] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const copyMotionRef = useRef<HTMLDivElement>(null);
  const cakeMotionRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const copyMotion = copyMotionRef.current;
    const cakeMotion = cakeMotionRef.current;
    const halo = haloRef.current;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches;

    if (!root || !copyMotion || !cakeMotion || !halo || reducedMotion || coarsePointer || typeof window.requestAnimationFrame !== "function") return;

    const activeRoot = root;
    const activeCopyMotion = copyMotion;
    const activeCakeMotion = cakeMotion;
    const activeHalo = halo;
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
      wheelVelocity += clamp((delta / 100) * 1.8, -7, 7);
    }

    function tick(now: number) {
      const dt = Math.min((now - previous) / 1000, 1 / 30);
      previous = now;
      const elapsed = (now - startedAt) / 1000;

      velocity.x += (target.x - position.x) * 72 * dt;
      velocity.y += (target.y - position.y) * 72 * dt;
      velocity.x *= Math.pow(0.85, dt * 60);
      velocity.y *= Math.pow(0.85, dt * 60);
      position.x += velocity.x * dt;
      position.y += velocity.y * dt;
      wheelVelocity *= Math.pow(0.83, dt * 60);

      const centered = position.x;
      const bob = Math.sin(elapsed * 0.82) * 2.5;
      const lean = centered * 3.5 + velocity.x * 0.7 + wheelVelocity * 0.35;
      activeCakeMotion.style.transform =
        `translate3d(${centered * 24}px, ${position.y * 16 + bob}px, 0) ` +
        `rotateY(${centered * 7.5}deg) rotateZ(${lean}deg) scale(${1 + Math.abs(centered) * 0.025})`;
      activeCopyMotion.style.transform = `translate3d(${-centered * 18}px, ${-position.y * 8}px, 0) rotate(${centered * -1.5}deg)`;
      activeHalo.style.transform = `translate3d(${-centered * 56}px, ${-position.y * 22 + Math.sin(elapsed * 0.55) * 6}px, 0) scale(${1 + Math.abs(centered) * 0.05})`;

      frameId = window.requestAnimationFrame(tick);
    }

    activeCopyMotion.style.willChange = "transform";
    activeCakeMotion.style.willChange = "transform";
    activeHalo.style.willChange = "transform";
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
      activeCakeMotion.style.willChange = "auto";
      activeHalo.style.willChange = "auto";
      activeCopyMotion.style.transform = "";
      activeCakeMotion.style.transform = "";
      activeHalo.style.transform = "";
    };
  }, []);

  return (
    <section className={`story-page cake-section${candlesOut ? " cake-section--wished" : ""}`} aria-labelledby="cake-title" tabIndex={-1} ref={rootRef}>
      <FloralCorners variant="story" />
      <div className="cake-section__halo" aria-hidden="true" ref={haloRef} />
      <div className="cake-section__copy-motion" ref={copyMotionRef}>
        <div className="cake-section__copy">
          <h2 id="cake-title">{copy.cakeTitle}</h2>
          <p>{copy.cakeInstruction}</p>
          <button
            className="button button--primary cake-section__button"
            onClick={() => setCandlesOut((out) => !out)}
            type="button"
          >
            {candlesOut ? "Nyalakan lagi" : "Tiup lilin"}
          </button>
          <p className={`cake-section__wish${candlesOut ? " cake-section__wish--visible" : ""}`} role="status" aria-live="polite">
            {candlesOut ? "Permohonannya sudah meluncur. Semoga terkabul." : ""}
          </p>
        </div>
      </div>

      <div className="birthday-cake-motion" ref={cakeMotionRef}>
        <figure className={`birthday-cake${candlesOut ? " birthday-cake--wished" : ""}`}>
          <Image
            alt="Ilustrasi kue ulang tahun dua tingkat dengan tiga lilin."
            className="birthday-cake__art"
            fill
            priority
            sizes="(max-width: 700px) 76vw, 42vw"
            src={assetPath("/assets/cake-illustration.png")}
          />
          <span className="birthday-cake__flame birthday-cake__flame--one" aria-hidden="true" />
          <span className="birthday-cake__flame birthday-cake__flame--two" aria-hidden="true" />
          <span className="birthday-cake__flame birthday-cake__flame--three" aria-hidden="true" />
        </figure>
      </div>
    </section>
  );
}
