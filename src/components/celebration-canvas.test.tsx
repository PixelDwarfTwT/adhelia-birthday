import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CelebrationCanvas } from "./celebration-canvas";

describe("CelebrationCanvas reduced motion", () => {
  it("reducedMotionRemovesDecorativeMovement", () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext");
    render(<CelebrationCanvas active reducedMotion />);

    expect(getContext).not.toHaveBeenCalled();
  });

  it("reducesParticlesWhenViewportResizesToMobile", () => {
    const originalWidth = window.innerWidth;
    window.innerWidth = 1024;
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const context = {
      arc: vi.fn(),
      beginPath: vi.fn(),
      clearRect: vi.fn(),
      fill: vi.fn(),
      setTransform: vi.fn(),
      shadowBlur: 0,
      shadowColor: "",
      fillStyle: "",
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);

    try {
      const { unmount } = render(<CelebrationCanvas active reducedMotion={false} />);
      frames.shift()?.(0);
      expect(context.arc).toHaveBeenCalledTimes(140);

      window.innerWidth = 390;
      fireEvent(window, new Event("resize"));
      (context.arc as ReturnType<typeof vi.fn>).mockClear();
      frames.shift()?.(16);
      expect(context.arc).toHaveBeenCalledTimes(60);
      unmount();
    } finally {
      window.innerWidth = originalWidth;
    }
  });
});
