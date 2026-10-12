import type { ExperienceProgress } from "@/data/types";

const PROGRESS_KEY = "adhelia-birthday-progress";

export const EMPTY_PROGRESS: ExperienceProgress = {
  stickerIds: [],
  constellationComplete: false,
};

export function readProgress(storage: Storage): ExperienceProgress {
  try {
    const saved = storage.getItem(PROGRESS_KEY);
    if (!saved) return { ...EMPTY_PROGRESS, stickerIds: [] };

    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object") return { ...EMPTY_PROGRESS, stickerIds: [] };

    const value = parsed as Partial<ExperienceProgress>;
    return {
      stickerIds: Array.isArray(value.stickerIds)
        ? [...new Set(value.stickerIds.filter((id): id is string => typeof id === "string" && id.length > 0))]
        : [],
      constellationComplete: value.constellationComplete === true,
    };
  } catch {
    return { ...EMPTY_PROGRESS, stickerIds: [] };
  }
}

export function writeProgress(storage: Storage, progress: ExperienceProgress): void {
  try {
    storage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Losing session storage must not interrupt the birthday experience.
  }
}
