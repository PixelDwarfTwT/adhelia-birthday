import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LetterSection } from "./letter-section";

describe("personal letter chapter", () => {
  it("rendersLetterPlaceholderWithoutInventingCopy", () => {
    render(<LetterSection />);

    expect(screen.getByText("Dear Adhelia,")).toBeInTheDocument();
    expect(screen.getByText("[Add your personal message in src/data/content.ts.]")).toBeInTheDocument();
    expect(screen.queryByText(/I remember when/)).not.toBeInTheDocument();
    expect(screen.getByText("[Add your name]")).toBeInTheDocument();
  });
});
