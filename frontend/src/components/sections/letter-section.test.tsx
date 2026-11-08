import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LetterSection } from "./letter-section";

describe("personal letter page", () => {
  it("adds decorative florals without exposing them to assistive technology", () => {
    const { container } = render(<LetterSection />);
    const florals = container.querySelector(".letter-section__florals");

    expect(florals).toHaveAttribute("aria-hidden", "true");
    expect(florals?.children).toHaveLength(4);
    expect(florals?.firstElementChild?.getAttribute("style")).toContain("hydrangea-carnation-frame.webp");
  });

  it("rendersFriendlyLetterFallbackWithoutInventingCopy", () => {
    render(<LetterSection />);

    fireEvent.click(screen.getByRole("button", { name: "Buka surat" }));

    expect(screen.getByRole("article", { name: "Surat ulang tahun untuk Adhelia" })).toHaveFocus();
    expect(screen.getByText("Adhelia,")).toBeInTheDocument();
    expect(screen.getByText("Surat ini sedang menunggu kata-kata yang ingin kamu sampaikan.")).toBeInTheDocument();
    expect(screen.queryByText(/Aku ingat ketika/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Tulis namamu/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Lipat kembali" }));

    expect(screen.getByRole("button", { name: "Buka surat" })).toHaveFocus();
  });
});
