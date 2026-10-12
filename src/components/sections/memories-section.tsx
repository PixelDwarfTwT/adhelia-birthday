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
      aria-label={`Memory ${index + 1} of ${count}`}
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
          aria-label={`Open memory: ${memory.caption}`}
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
        <button aria-label={`Open memory: ${memory.caption}`} className="memory-card__image-button" onClick={(event) => onOpen(memory, event.currentTarget)} type="button">
          <div className="memory-fallback memory-card__fallback">
            <span aria-hidden="true">✦</span>
            <p>A wonderful memory is hiding somewhere...</p>
          </div>
          <span className="memory-card__caption">{memory.caption}</span>
        </button>
      )}
      {memory.videoSrc && !previewFailed && (
        <video
          aria-label={`Muted preview: ${memory.caption}`}
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
      {memory.videoSrc && previewFailed && <p className="memory-card__video-error">A wonderful memory is hiding somewhere...</p>}
      {memory.placeholder && <p className="placeholder-label">Memory note placeholder · add real copy in src/data/content.ts</p>}
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
      <section className="chapter-section memories-section" id="chapter-4" aria-labelledby="chapter-4-title">
        <p className="chapter-section__number">Chapter 04 · Memories</p>
        <h2 id="chapter-4-title">Little moments, kept close</h2>
        <p>Swipe or drag through this small stack, then open a card to read its note.</p>
        <div className="memory-viewer">
          <MemoryCard
            count={memories.length}
            index={activeIndex}
            key={activeMemory.id}
            memory={activeMemory}
            onOpen={openMemory}
            onSwipe={move}
          />
          <div className="memory-controls">
            <button aria-label="Previous memory" className="memory-controls__button" onClick={() => move("previous")} type="button">
              <ArrowLeft aria-hidden="true" /> <span>Previous</span>
            </button>
            <p aria-live="polite" className="memory-controls__count">Memory {activeIndex + 1} of {memories.length}</p>
            <button aria-label="Next memory" className="memory-controls__button" onClick={() => move("next")} type="button">
              <span>Next</span> <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
      {selectedMemory && (
        <MemoryModal memory={selectedMemory} onClose={closeMemory} onVideoActiveChange={onVideoActiveChange} />
      )}
    </>
  );
}
