import { beforeEach, describe, expect, it, vi } from "vitest";
import { hasLocalAccess, rememberLocalAccess } from "../access-code";
import { readProgress, writeProgress } from "../progress";

function makeStorage(): Storage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
    key: (index) => [...values.keys()][index] ?? null,
    get length() { return values.size; },
  };
}

describe("browser state helpers", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = makeStorage();
  });

  it("readsAndWritesLocalAccess", () => {
    expect(hasLocalAccess(storage)).toBe(false);
    rememberLocalAccess(storage);
    expect(hasLocalAccess(storage)).toBe(true);
  });

  it("readsAndWritesSessionProgress", () => {
    const progress = { stickerIds: ["star", "tiny-win"], constellationComplete: true };
    writeProgress(storage, progress);
    expect(readProgress(storage)).toEqual(progress);
  });

  it("returnsDefaultProgressForInvalidStorageData", () => {
    storage.setItem("adhelia-birthday-progress", "not json");
    expect(readProgress(storage)).toEqual({ stickerIds: [], constellationComplete: false });
  });

  it("doesNotThrowOrGrantAccessWhenStorageFails", () => {
    const unavailable = {
      getItem: vi.fn(() => { throw new Error("blocked"); }),
      setItem: vi.fn(() => { throw new Error("blocked"); }),
    } as unknown as Storage;

    expect(hasLocalAccess(unavailable)).toBe(false);
    expect(() => rememberLocalAccess(unavailable)).not.toThrow();
    expect(readProgress(unavailable)).toEqual({ stickerIds: [], constellationComplete: false });
    expect(() => writeProgress(unavailable, { stickerIds: [], constellationComplete: false })).not.toThrow();
  });
});
