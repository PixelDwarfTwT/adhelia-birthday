import { describe, expect, it } from "vitest";
import { getParticleLimit } from "../particle-settings";

describe("getParticleLimit", () => {
  it("capsMobileParticlesAtSixty", () => {
    expect(getParticleLimit(390, false)).toBeLessThanOrEqual(60);
  });

  it("returnsZeroParticlesForReducedMotion", () => {
    expect(getParticleLimit(1440, true)).toBe(0);
  });
});
