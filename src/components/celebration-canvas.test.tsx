import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CelebrationCanvas } from "./celebration-canvas";

describe("CelebrationCanvas reduced motion", () => {
  it("reducedMotionRemovesDecorativeMovement", () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext");
    render(<CelebrationCanvas active reducedMotion />);

    expect(getContext).not.toHaveBeenCalled();
  });
});
