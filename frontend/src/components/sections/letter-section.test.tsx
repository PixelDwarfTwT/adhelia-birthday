import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LetterSection } from "./letter-section";

describe("personal letter page", () => {
  it("rendersFriendlyLetterFallbackWithoutInventingCopy", () => {
    render(<LetterSection />);

    fireEvent.click(screen.getByRole("button", { name: "Buka surat" }));

    expect(screen.getByText("Adhelia,")).toBeInTheDocument();
    expect(screen.getByText("Surat ini sedang menunggu kata-kata yang ingin kamu sampaikan.")).toBeInTheDocument();
    expect(screen.queryByText(/Aku ingat ketika/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Tulis namamu/)).not.toBeInTheDocument();
  });
});
