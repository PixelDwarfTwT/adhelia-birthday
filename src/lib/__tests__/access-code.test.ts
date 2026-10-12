import { webcrypto } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyPasscode } from "../access-code";

const BLUE_SHA256 = "16477688c0e00699c6cfa4497a3612d7e83c532062b64b250fed8908128ed548";

describe("verifyPasscode", () => {
  it("acceptsBluePasscodeHash", async () => {
    await expect(verifyPasscode("blue", BLUE_SHA256, webcrypto.subtle as unknown as SubtleCrypto)).resolves.toBe(true);
  });

  it("rejectsWrongPasscode", async () => {
    await expect(verifyPasscode("violet", BLUE_SHA256, webcrypto.subtle as unknown as SubtleCrypto)).resolves.toBe(false);
  });

  it("returnsFalseWhenWebCryptoIsUnavailable", async () => {
    await expect(verifyPasscode("blue", BLUE_SHA256, undefined)).resolves.toBe(false);
  });
});
