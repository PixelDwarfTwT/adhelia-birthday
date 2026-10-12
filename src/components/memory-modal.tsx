"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { MemoryItem } from "@/data/types";

interface MemoryModalProps {
  memory: MemoryItem;
  onClose(): void;
  onVideoActiveChange(active: boolean): void;
}

export function MemoryModal({ memory, onClose, onVideoActiveChange }: MemoryModalProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTap = useRef(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    closeButtonRef.current?.focus();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusableElements = Array.from(dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.tabIndex >= 0);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
      const focusIsOutside = !dialog.contains(document.activeElement);

      if (event.shiftKey && (document.activeElement === firstElement || focusIsOutside)) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && (document.activeElement === lastElement || focusIsOutside)) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      video?.pause();
      onVideoActiveChange(false);
    };
  }, [onClose, onVideoActiveChange]);

  function toggleZoom() {
    setZoomed((current) => !current);
  }

  function handlePhotoTouchEnd() {
    const now = Date.now();
    if (now - lastTap.current < 340) toggleZoom();
    lastTap.current = now;
  }

  function close() {
    videoRef.current?.pause();
    onVideoActiveChange(false);
    onClose();
  }

  return (
    <div
      className="memory-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section className="memory-modal__panel" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="memory-modal-title">
        <header className="memory-modal__header">
          <div>
            <p className="eyebrow">A little memory note</p>
            <h2 id="memory-modal-title">{memory.caption}</h2>
          </div>
          <button aria-label="Close memory" className="memory-modal__close" onClick={close} ref={closeButtonRef} type="button">
            <X aria-hidden="true" />
          </button>
        </header>
        {memory.imageSrc && !imageFailed && (
          <div className={`memory-modal__photo ${zoomed ? "memory-modal__photo--zoomed" : ""}`} onDoubleClick={toggleZoom} onTouchEnd={handlePhotoTouchEnd}>
            <Image
              alt={memory.alt}
              fill
              priority
              sizes="(max-width: 768px) 92vw, 760px"
              src={memory.imageSrc}
              onError={() => setImageFailed(true)}
            />
            <button className="memory-modal__zoom" onClick={toggleZoom} type="button" aria-label={zoomed ? "Zoom out photo" : "Zoom in photo"}>
              {zoomed ? "Zoom out" : "Double tap to zoom"}
            </button>
          </div>
        )}
        {memory.imageSrc && imageFailed && <MemoryFallback />}
        {memory.videoSrc && !videoFailed && (
          <video
            aria-label={`Memory video: ${memory.caption}`}
            className="memory-modal__video"
            controls
            playsInline
            preload="none"
            poster={memory.videoPoster}
            ref={videoRef}
            src={memory.videoSrc}
            onPlay={() => onVideoActiveChange(true)}
            onPause={() => onVideoActiveChange(false)}
            onEnded={() => onVideoActiveChange(false)}
            onError={() => {
              setVideoFailed(true);
              onVideoActiveChange(false);
            }}
          />
        )}
        {memory.videoSrc && videoFailed && <MemoryFallback />}
        <div className="memory-modal__note">
          {memory.placeholder && <p className="placeholder-label">A note to personalize in src/data/content.ts</p>}
          <p>{memory.note}</p>
        </div>
      </section>
    </div>
  );
}

function MemoryFallback() {
  return (
    <div className="memory-fallback" role="status">
      <span aria-hidden="true">✦</span>
      <p>A wonderful memory is hiding somewhere...</p>
    </div>
  );
}
