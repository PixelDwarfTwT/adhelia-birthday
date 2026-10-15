import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { birthdayContent } from "@/data/content";
import { ConstellationSection } from "./constellation-section";

const letters = ["A", "D", "H", "E", "L", "I", "A"];

describe("final constellation", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });
  afterEach(() => vi.restoreAllMocks());

  it("connectsStarsInOrderToSpellAdhelia", () => {
    const onComplete = vi.fn();
    render(<ConstellationSection completed={false} onComplete={onComplete} />);

    letters.forEach((letter, index) => {
      fireEvent.click(screen.getByRole("button", { name: `Bintang ${index + 1}: ${letter}` }));
    });

    expect(screen.getByText("ADHELIA")).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("ignoresOutOfOrderStarAndKeepsProgressClear", () => {
    render(<ConstellationSection completed={false} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Bintang 3: H" }));

    expect(screen.getByRole("status")).toHaveTextContent(/bintang ke-1 menunggu/i);
    expect(screen.getByText("0 dari 7 bintang terhubung")).toBeInTheDocument();
  });

  it("showsFinalMessageAfterCompletion", () => {
    render(<ConstellationSection completed={true} onComplete={vi.fn()} />);

    expect(screen.getByText(birthdayContent.finalMessage)).toBeInTheDocument();
    expect(screen.getByText(birthdayContent.finalGreeting)).toBeInTheDocument();
  });
});
