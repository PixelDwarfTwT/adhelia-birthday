import { webcrypto } from "node:crypto";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExperienceShell } from "./experience-shell";

describe("birthday access and opening journey", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.stubGlobal("crypto", webcrypto as unknown as Crypto);
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("keepsMainContentHiddenUntilPasscodeMatches", async () => {
    render(<ExperienceShell />);

    expect(await screen.findByText("Apa warna favorit Adhelia?")).toBeInTheDocument();
    expect(screen.queryByText("A special delivery for Adhelia...")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Jawaban"), { target: { value: "violet" } });
    fireEvent.click(screen.getByRole("button", { name: "Buka amplop" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/belum tepat/i);
    expect(screen.queryByText("A special delivery for Adhelia...")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Jawaban"), { target: { value: "blue" } });
    fireEvent.click(screen.getByRole("button", { name: "Buka amplop" }));
    expect(await screen.findByRole("heading", { name: "A special delivery for Adhelia..." })).toBeInTheDocument();
    expect(window.localStorage.getItem("adhelia-birthday-access")).toBe("unlocked");
  });

  it("showsFriendlyCryptoFailure", async () => {
    vi.stubGlobal("crypto", undefined);
    render(<ExperienceShell />);

    await screen.findByText("Apa warna favorit Adhelia?");
    fireEvent.change(screen.getByLabelText("Jawaban"), { target: { value: "blue" } });
    fireEvent.click(screen.getByRole("button", { name: "Buka amplop" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/tidak dapat memeriksa/i);
    expect(screen.queryByRole("button", { name: "Buka scrapbook" })).not.toBeInTheDocument();
  });

  it("opensEnvelopeFromKeyboardOrTap", async () => {
    window.localStorage.setItem("adhelia-birthday-access", "unlocked");
    render(<ExperienceShell />);

    const openButton = await screen.findByRole("button", { name: "Buka scrapbook" });
    openButton.focus();
    expect(document.activeElement).toBe(openButton);
    fireEvent.keyDown(openButton, { key: "Enter", code: "Enter" });

    expect(await screen.findByRole("heading", { name: "For Adhelia" })).toBeInTheDocument();
  });

  it("chapterNavigationScrollsToSelectedSection", async () => {
    window.localStorage.setItem("adhelia-birthday-access", "unlocked");
    const scrollIntoView = vi.fn();
    render(<ExperienceShell />);

    fireEvent.click(await screen.findByRole("button", { name: "Buka scrapbook" }));
    await screen.findByRole("navigation", { name: "Navigasi bab" });
    const target = document.getElementById("chapter-3");
    expect(target).not.toBeNull();
    Object.defineProperty(target, "scrollIntoView", { configurable: true, value: scrollIntoView });
    fireEvent.click(screen.getByRole("button", { name: "Bab 3: Hal-hal favorit" }));

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "Bab 3: Hal-hal favorit" })).toHaveAttribute("aria-current", "location");
  });

  it("restoresCompletedConstellationFromSession", async () => {
    window.localStorage.setItem("adhelia-birthday-access", "unlocked");
    window.sessionStorage.setItem("adhelia-birthday-progress", JSON.stringify({ stickerIds: ["sparkle"], constellationComplete: true }));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    render(<ExperienceShell />);

    fireEvent.click(await screen.findByRole("button", { name: "Buka scrapbook" }));

    expect(await screen.findByText("ADHELIA")).toBeInTheDocument();
    expect(screen.getByText("May your year ahead be as bright and beautiful as you are.")).toBeInTheDocument();
  });

  it("allSixChaptersHaveKeyboardReachableNavigation", async () => {
    window.localStorage.setItem("adhelia-birthday-access", "unlocked");
    render(<ExperienceShell />);
    const openingButton = await screen.findByRole("button", { name: "Buka scrapbook" });
    openingButton.focus();
    expect(document.activeElement).toBe(openingButton);
    fireEvent.click(openingButton);
    await screen.findByRole("navigation", { name: "Navigasi bab" });

    const labels = [
      "Bab 1: Rasa ingin tahu",
      "Bab 2: Playfulness",
      "Bab 3: Hal-hal favorit",
      "Bab 4: Kenangan",
      "Bab 5: Surat",
      "Bab 6: Konstelasi",
    ];
    expect(document.querySelectorAll("#chapter-1, #chapter-2, #chapter-3, #chapter-4, #chapter-5, #chapter-6")).toHaveLength(6);
    for (const label of labels) {
      const button = screen.getByRole("button", { name: label });
      expect(button.tagName).toBe("BUTTON");
      button.focus();
      expect(document.activeElement).toBe(button);
    }
  });

  it("audioFailureDoesNotBlankThePage", async () => {
    window.localStorage.setItem("adhelia-birthday-access", "unlocked");
    vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValueOnce(new Error("audio unavailable"));
    render(<ExperienceShell />);
    fireEvent.click(await screen.findByRole("button", { name: "Buka scrapbook" }));

    expect(await screen.findByRole("heading", { name: "For Adhelia" })).toBeInTheDocument();
    expect(await screen.findByRole("alert")).toHaveTextContent(/music note got lost/i);
    expect(document.getElementById("chapter-6")).toBeInTheDocument();
  });

  it("progressSurvivesSectionNavigation", async () => {
    window.localStorage.setItem("adhelia-birthday-access", "unlocked");
    render(<ExperienceShell />);
    fireEvent.click(await screen.findByRole("button", { name: "Buka scrapbook" }));
    await screen.findByRole("navigation", { name: "Navigasi bab" });
    fireEvent.click(screen.getByRole("button", { name: "Collect sticker: sparkle" }));

    expect(document.querySelector(".scrapbook")).toHaveAttribute("data-progress-stickers", "1");
    fireEvent.click(screen.getByRole("button", { name: "Bab 3: Hal-hal favorit" }));
    fireEvent.click(screen.getByRole("button", { name: "Bab 2: Playfulness" }));

    expect(document.querySelector(".scrapbook")).toHaveAttribute("data-progress-stickers", "1");
    expect(JSON.parse(window.sessionStorage.getItem("adhelia-birthday-progress") ?? "{}").stickerIds).toEqual(["sparkle"]);
  });
});
