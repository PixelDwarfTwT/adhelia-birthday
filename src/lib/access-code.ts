const ACCESS_KEY = "adhelia-birthday-access";

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyPasscode(
  candidate: string,
  expectedHash: string,
  subtle: SubtleCrypto | undefined,
): Promise<boolean> {
  if (!subtle || !expectedHash) return false;

  try {
    const normalizedCandidate = candidate.trim().toLowerCase();
    const digest = await subtle.digest("SHA-256", new TextEncoder().encode(normalizedCandidate));
    return toHex(digest) === expectedHash.trim().toLowerCase();
  } catch {
    return false;
  }
}

export function hasLocalAccess(storage: Storage): boolean {
  try {
    return storage.getItem(ACCESS_KEY) === "unlocked";
  } catch {
    return false;
  }
}

export function rememberLocalAccess(storage: Storage): void {
  try {
    storage.setItem(ACCESS_KEY, "unlocked");
  } catch {
    // The gate remains usable for this page view when browser storage is blocked.
  }
}
