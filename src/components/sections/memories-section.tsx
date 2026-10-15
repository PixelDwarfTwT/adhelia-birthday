"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent, type TouchEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { birthdayContent } from "@/data/content";
import type { MemoryItem } from "@/data/types";
import { MemoryModal } from "../memory-modal";

interface MemoriesSectionProps {
  memories?: MemoryItem[];
  onVideoActiveChange(active: boolean): void;
}

interface MemoryCardProps {
  memory: MemoryItem;
  index: number;
  count: number;
  onOpen(memory: MemoryItem, trigger: HTMLElement): void;
  onSwipe(direction: "next" | "previous"): void;
}

function MemoryCard({ memory, index, count, onOpen, onSwipe }: MemoryCardProps) {
  const startX = useRef<number | null>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    const video = previewRef.current;
    if (!video || !memory.videoSrc || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          video.muted = true;
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      }
    }, { threshold: 0.35 });

    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [memory.videoSrc]);

  function finishSwipe(endX: number) {
    if (startX.current === null) return;
    const delta = endX - startX.current;
    if (Math.abs(delta) > 45) onSwipe(delta < 0 ? "next" : "previous");
    startX.current = null;
  }

  function onTouchStart(event: TouchEvent<HTMLElement>) {
    startX.current = event.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: TouchEvent<HTMLElement>) {
    const endX = event.changedTouches[0]?.clientX;
    if (typeof endX === "number") finishSwipe(endX);
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse") startX.current = event.clientX;
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse") finishSwipe(event.clientX);
  }

  return (
    <article
      aria-label={`Foto ${index + 1} dari ${count}`}
      className="memory-card"
      role="group"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <span aria-hidden="true" className="memory-card__tape" />
      {memory.imageSrc && !imageFailed ? (
        <button
          aria-label={`Buka kenangan: ${memory.caption}`}
          className="memory-card__image-button"
          onClick={(event) => onOpen(memory, event.currentTarget)}
          onDoubleClick={(event) => onOpen(memory, event.currentTarget)}
          type="button"
        >
          <div className="memory-card__image">
            <Image
              alt={memory.alt}
              fill
              sizes="(max-width: 768px) 88vw, 560px"
              src={memory.imageSrc}
              onError={() => setImageFailed(true)}
            />
          </div>
          <span className="memory-card__caption">{memory.caption}</span>
        </button>
      ) : (
        <button aria-label={`Buka kenangan: ${memory.caption}`} className="memory-card__image-button" onClick={(event) => onOpen(memory, event.currentTarget)} type="button">
          <div className="memory-fallback memory-card__fallback">
            <span aria-hidden="true">✦</span>
            <p>Kenangan manisnya sedang bersembunyi sebentar…</p>
          </div>
          <span className="memory-card__caption">{memory.caption}</span>
        </button>
      )}
      {memory.videoSrc && !previewFailed && (
        <video
            aria-label={`Pratinjau tanpa suara: ${memory.caption}`}
          className="memory-card__video-preview"
          muted
          playsInline
          poster={memory.videoPoster}
          preload="none"
          ref={previewRef}
          src={memory.videoSrc}
          onError={() => setPreviewFailed(true)}
        />
      )}
      {memory.videoSrc && previewFailed && <p className="memory-card__video-error">Kenangan manisnya sedang bersembunyi sebentar…</p>}
    </article>
  );
}

export function MemoriesSection({ memories = birthdayContent.memories, onVideoActiveChange }: MemoriesSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const activeMemory = memories[activeIndex];

  if (!activeMemory) return null;

  function move(direction: "next" | "previous") {
    setActiveIndex((index) => direction === "next"
      ? (index + 1) % memories.length
      : (index - 1 + memories.length) % memories.length);
  }

  function openMemory(memory: MemoryItem, trigger: HTMLElement) {
    returnFocusRef.current = trigger;
    setSelectedMemory(memory);
  }

  function closeMemory() {
    setSelectedMemory(null);
    onVideoActiveChange(false);
    window.requestAnimationFrame(() => returnFocusRef.current?.focus());
  }

  return (
    <>
      <section className="story-page gallery-section" aria-labelledby="gallery-title" tabIndex={-1}>
        <div className="gallery-section__intro">
          <p className="page-kicker">Satu momen yang nyata</p>
          <h2 id="gallery-title">Hari yang ingin disimpan.</h2>
          <p>Ketuk fotonya untuk melihat lebih dekat.</p>
        </div>
        <div className="memory-viewer">
          <MemoryCard
            count={memories.length}
            index={activeIndex}
            key={activeMemory.id}
            memory={activeMemory}
            onOpen={openMemory}
            onSwipe={move}
          />
          {memories.length > 1 && (
            <div className="memory-controls">
              <button aria-label="Foto sebelumnya" className="memory-controls__button" onClick={() => move("previous")} type="button">
                <ArrowLeft aria-hidden="true" /> <span>Sebelumnya</span>
              </button>
              <p aria-live="polite" className="memory-controls__count">Foto {activeIndex + 1} dari {memories.length}</p>
              <button aria-label="Foto berikutnya" className="memory-controls__button" onClick={() => move("next")} type="button">
                <span>Berikutnya</span> <ArrowRight aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </section>
      {selectedMemory && (
        <MemoryModal memory={selectedMemory} onClose={closeMemory} onVideoActiveChange={onVideoActiveChange} />
      )}
    </>
  );
}
