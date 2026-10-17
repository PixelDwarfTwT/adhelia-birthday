import { afterEach, describe, expect, it } from "vitest";
import { assetPath } from "./asset-path";

const originalBasePath = process.env.NEXT_PUBLIC_BASE_PATH;

afterEach(() => {
  if (originalBasePath === undefined) {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
  } else {
    process.env.NEXT_PUBLIC_BASE_PATH = originalBasePath;
  }
});

describe("assetPath", () => {
  it("adds the GitHub Pages project path to public assets", () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/adhelia-birthday";

    expect(assetPath("/assets/metal.mp3")).toBe("/adhelia-birthday/assets/metal.mp3");
  });

  it("keeps root-relative paths during local development", () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;

    expect(assetPath("/assets/photo.jpg")).toBe("/assets/photo.jpg");
  });
});
