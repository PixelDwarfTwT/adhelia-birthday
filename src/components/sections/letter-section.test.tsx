import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LetterSection } from "./letter-section";

describe("personal letter chapter", () => {
  it("rendersLetterPlaceholderWithoutInventingCopy", () => {
    render(<LetterSection />);

    fireEvent.click(screen.getByRole("button", { name: "Buka surat" }));

    expect(screen.getByText("Untuk Adhelia,")).toBeInTheDocument();
    expect(screen.getByText("Pesan pribadimu akan ditulis di sini.")).toBeInTheDocument();
    expect(screen.queryByText(/Aku ingat ketika/)).not.toBeInTheDocument();
    expect(screen.getByText("[Tulis namamu]")).toBeInTheDocument();
  });
});
