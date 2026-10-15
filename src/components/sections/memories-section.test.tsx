import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MemoryItem } from "@/data/types";
import { MemoriesSection } from "./memories-section";
import { MemoryModal } from "../memory-modal";

const photoMemory: MemoryItem = {
  id: "birthday-photo",
  caption: "A birthday moment",
  alt: "Adhelia holding a small cake topped with lit candles.",
  note: "[Add the story behind this photo.]",
  placeholder: true,
  imageSrc: "/assets/photo.jpg",
};

const nextMemory: MemoryItem = {
  id: "memory-placeholder",
  caption: "A memory to add",
  alt: "An illustrated placeholder card for a birthday memory.",
  note: "[Add a real memory or a favorite quote here.]",
  placeholder: true,
};

const videoMemory: MemoryItem = {
  id: "video-memory",
  caption: "A little moving memory",
  alt: "A placeholder frame for an optional memory video.",
  note: "[Add a caption for this video.]",
  placeholder: true,
  videoSrc: "/assets/future-memory.mp4",
  videoPoster: "/assets/photo.jpg",
};

describe("memory chapter", () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("opensMemoryModalAndClosesWithEscape", () => {
    render(<MemoriesSection memories={[photoMemory]} onVideoActiveChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Buka kenangan: A birthday moment" }));
    expect(screen.getByRole("dialog", { name: "A birthday moment" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keepsKeyboardFocusInsideMemoryModal", () => {
    render(<MemoryModal memory={photoMemory} onClose={vi.fn()} onVideoActiveChange={vi.fn()} />);
    const closeButton = screen.getByRole("button", { name: "Tutup kenangan" });
    const zoomButton = screen.getByRole("button", { name: "Perbesar foto" });

    expect(document.activeElement).toBe(closeButton);
    fireEvent.keyDown(closeButton, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(zoomButton);

    fireEvent.keyDown(zoomButton, { key: "Tab" });
    expect(document.activeElement).toBe(closeButton);
  });

  it("opensPhotoPreviewOnDoubleTap", () => {
    render(<MemoriesSection memories={[photoMemory]} onVideoActiveChange={vi.fn()} />);
    fireEvent.doubleClick(screen.getByRole("button", { name: "Buka kenangan: A birthday moment" }));

    expect(screen.getByRole("dialog", { name: "A birthday moment" })).toBeInTheDocument();
  });

  it("movesMemoryWithTouchControls", () => {
    render(<MemoriesSection memories={[photoMemory, nextMemory]} onVideoActiveChange={vi.fn()} />);
    const card = screen.getByRole("group", { name: "Foto 1 dari 2" });
    fireEvent.touchStart(card, { touches: [{ clientX: 250 }] });
    fireEvent.touchEnd(card, { changedTouches: [{ clientX: 80 }] });

    expect(screen.getByText("A memory to add")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Foto 2 dari 2" })).toBeInTheDocument();
  });

  it("showsFriendlyImageFallback", () => {
    render(<MemoriesSection memories={[photoMemory]} onVideoActiveChange={vi.fn()} />);
    fireEvent.error(screen.getByAltText(photoMemory.alt));

    expect(screen.getByText("Kenangan manisnya sedang bersembunyi sebentar…")).toBeInTheDocument();
  });

  it("imageFailureDoesNotBlankThePage", () => {
    render(<MemoriesSection memories={[photoMemory, nextMemory]} onVideoActiveChange={vi.fn()} />);
    fireEvent.error(screen.getByAltText(photoMemory.alt));

    expect(screen.getByRole("button", { name: "Buka kenangan: A birthday moment" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Foto berikutnya" })).toBeInTheDocument();
  });

  it("startsOptionalMutedVideoOnlyWhileVisible", () => {
    let revealVideo: (() => void) | undefined;
    class TestIntersectionObserver {
      constructor(private callback: IntersectionObserverCallback) {}
      observe(target: Element) {
        revealVideo = () => this.callback(
          [{ target, isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      }
      disconnect() {}
      unobserve() {}
      takeRecords() { return []; }
    }
    vi.stubGlobal("IntersectionObserver", TestIntersectionObserver);
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    render(<MemoriesSection memories={[videoMemory]} onVideoActiveChange={vi.fn()} />);
    const video = document.querySelector("video")!;

    expect(video.muted).toBe(true);
    expect(play).not.toHaveBeenCalled();
    revealVideo?.();
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("playsOptionalVideoInlineAndDucksMusic", () => {
    const onVideoActiveChange = vi.fn();
    render(<MemoryModal memory={videoMemory} onClose={vi.fn()} onVideoActiveChange={onVideoActiveChange} />);
    const video = screen.getByLabelText("Video kenangan: A little moving memory") as HTMLVideoElement;
    expect(video.playsInline).toBe(true);
    fireEvent.play(video);
    expect(onVideoActiveChange).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByRole("button", { name: "Tutup kenangan" }));
    expect(onVideoActiveChange).toHaveBeenLastCalledWith(false);
  });
});
