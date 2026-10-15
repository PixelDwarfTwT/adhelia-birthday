import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FavoritesSection } from "./favorites-section";

describe("favorite-things chapter", () => {
  it("opensFavoriteDetail", () => {
    render(<FavoritesSection />);
    fireEvent.click(screen.getByRole("button", { name: "Buka kadonya!" }));
    fireEvent.click(screen.getByRole("button", { name: "Game: [Tambahkan favorit]" }));

    expect(screen.getByRole("complementary", { name: "Favorite detail" })).toHaveTextContent("[Tambahkan game favorit.]");
  });

  it("labelsUnknownFavoritesAsPlaceholders", () => {
    render(<FavoritesSection />);
    fireEvent.click(screen.getByRole("button", { name: "Buka kadonya!" }));

    expect(screen.getByText("Biru")).toBeInTheDocument();
    expect(screen.getAllByText(/belum diisi/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Musik: [Tambahkan favorit]" }));
    expect(screen.getByText("[Tambahkan lagu atau artis favorit.]" )).toBeInTheDocument();
  });
});
