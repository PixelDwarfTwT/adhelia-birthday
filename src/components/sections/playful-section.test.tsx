import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlayfulSection } from "./playful-section";

describe("playful chapter", () => {
  it("flipsAchievementByButtonAndKeyboard", () => {
    render(<PlayfulSection collectedStickerIds={[]} onCollectSticker={vi.fn()} />);
    const card = screen.getByRole("button", { name: "Flip card: Papan prestasi" });
    card.focus();
    fireEvent.keyDown(card, { key: "Enter", code: "Enter" });

    expect(card).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("[Tambahkan cerita nyata atau pencapaian Adhelia di sini.]" )).toBeInTheDocument();
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

    expect(screen.getAllByText(/belum diisi/i).length).toBeGreaterThan(0);
    expect(screen.getByText("[Tulis statistik lucu]")).toBeInTheDocument();
  });

  it("revealsSurpriseOnTap", () => {
    render(<PlayfulSection collectedStickerIds={[]} onCollectSticker={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /cari kejutan kecil/i }));
    expect(screen.getByRole("status")).toHaveTextContent("Kamu menemukan sedikit kilau tambahan, khusus untukmu");
  });
});
