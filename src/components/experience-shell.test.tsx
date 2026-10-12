import { webcrypto } from "node:crypto";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExperienceShell } from "./experience-shell";

describe("birthday access and opening journey", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.stubGlobal("crypto", webcrypto as unknown as Crypto);
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
});
