import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlayfulSection } from "./playful-section";

describe("playful chapter", () => {
  it("flipsAchievementByButtonAndKeyboard", () => {
    render(<PlayfulSection collectedStickerIds={[]} onCollectSticker={vi.fn()} />);
    const card = screen.getByRole("button", { name: "Flip card: A little space to brag" });
    card.focus();
    fireEvent.keyDown(card, { key: "Enter", code: "Enter" });

    expect(card).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("[Add a real Adhelia achievement or funny stat here.]" )).toBeInTheDocument();
  });

  it("collectsStickerOnce", () => {
    const onCollectSticker = vi.fn();
    render(<PlayfulSection collectedStickerIds={[]} onCollectSticker={onCollectSticker} />);
    const collect = screen.getByRole("button", { name: "Collect sticker: sparkle" });
    fireEvent.click(collect);
    fireEvent.click(collect);

    expect(onCollectSticker).toHaveBeenCalledTimes(1);
    expect(onCollectSticker).toHaveBeenCalledWith("sparkle");
  });

  it("rendersClearlyMarkedMissingContent", () => {
    render(<PlayfulSection collectedStickerIds={[]} onCollectSticker={vi.fn()} />);

    expect(screen.getAllByText(/placeholder/i).length).toBeGreaterThan(0);
    expect(screen.getByText("[Add a funny stat]")).toBeInTheDocument();
  });

  it("revealsSurpriseOnTap", () => {
    render(<PlayfulSection collectedStickerIds={[]} onCollectSticker={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Find a tiny surprise" }));
    expect(screen.getByRole("status")).toHaveTextContent("You found a little extra sparkle, just because.");
  });
});
