import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FavoritesSection } from "./favorites-section";

describe("favorite-things chapter", () => {
  it("opensFavoriteDetail", () => {
    render(<FavoritesSection />);
    fireEvent.click(screen.getByRole("button", { name: "Games: Add a favorite" }));

    expect(screen.getByRole("complementary", { name: "Favorite detail" })).toHaveTextContent("[Add a favorite game.]");
  });

  it("labelsUnknownFavoritesAsPlaceholders", () => {
    render(<FavoritesSection />);

    expect(screen.getByText("Blue")).toBeInTheDocument();
    expect(screen.getAllByText(/placeholder/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Music: Add a favorite" }));
    expect(screen.getByText("[Add a favorite song or artist.]" )).toBeInTheDocument();
  });
});
