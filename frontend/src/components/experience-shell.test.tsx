import { webcrypto } from "node:crypto";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExperienceShell } from "./experience-shell";

describe("birthday book journey", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("crypto", webcrypto as unknown as Crypto);
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function openBook() {
    fireEvent.click(await screen.findByRole("button", { name: "Buka amplop" }));
    return screen.findByRole("heading", { name: "Buat satu permohonan kecil." });
  }

  it("keeps the birthday book behind the passcode gate", async () => {
    render(<ExperienceShell />);

    expect(await screen.findByText("Berapa umur Adhelia sekarang?")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Jawaban"), { target: { value: "20" } });
    fireEvent.click(screen.getByRole("button", { name: "Buka amplop" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/belum tepat/i);
    expect(screen.queryByRole("heading", { name: /Happy Birthday/ })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Jawaban"), { target: { value: "19" } });
    fireEvent.click(screen.getByRole("button", { name: "Buka amplop" }));

    expect(await screen.findByRole("heading", { name: /Happy Birthday/ })).toBeInTheDocument();
    expect(window.localStorage.getItem("adhelia-birthday-access")).toBe("unlocked");
  });

  it("shows only the cake and letter pages", async () => {
    window.localStorage.setItem("adhelia-birthday-access", "unlocked");
    render(<ExperienceShell />);
    await openBook();

    expect(screen.getByRole("navigation", { name: "Navigasi hadiah ulang tahun" })).toBeInTheDocument();
    expect(document.querySelectorAll(".story-page")).toHaveLength(1);
    expect(screen.getByLabelText("Halaman 1 dari 2")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Buat satu permohonan kecil." })).toBeInTheDocument();
    expect(screen.queryByText("Sebuah kado kecil.")).not.toBeInTheDocument();
    expect(screen.queryByText("Hari yang ingin disimpan.")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Lanjut ke halaman surat" }));
    expect(await screen.findByRole("heading", { name: "Sepucuk surat untukmu." })).toBeInTheDocument();
    expect(screen.getByLabelText("Halaman 2 dari 2")).toBeInTheDocument();
    expect(screen.queryByText(/Tambahkan favorit/)).not.toBeInTheDocument();
    expect(screen.queryByText("Hari yang ingin disimpan.")).not.toBeInTheDocument();
    expect(document.querySelectorAll(".story-page")).toHaveLength(1);
  });

  it("opens the letter placeholder and cycles between the two remaining pages", async () => {
    window.localStorage.setItem("adhelia-birthday-access", "unlocked");
    render(<ExperienceShell />);
    await openBook();

    fireEvent.click(screen.getByRole("button", { name: "Lanjut ke halaman surat" }));
    expect(await screen.findByRole("heading", { name: "Sepucuk surat untukmu." })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Buka surat" }));
    expect(screen.getByText("Surat ini sedang menunggu kata-kata yang ingin kamu sampaikan.")).toBeInTheDocument();
    expect(screen.queryByText(/Aku selalu ingat/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Buka kembali halaman kue" }));
    expect(await screen.findByRole("heading", { name: "Buat satu permohonan kecil." })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Sebuah kado kecil." })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Hari yang ingin disimpan." })).not.toBeInTheDocument();
  });

  it("keeps the pages usable when audio cannot start", async () => {
    window.localStorage.setItem("adhelia-birthday-access", "unlocked");
    vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValueOnce(new Error("audio unavailable"));
    render(<ExperienceShell />);

    await openBook();

    expect(screen.getByRole("heading", { name: "Buat satu permohonan kecil." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Coba putar musik lagi" })).toBeInTheDocument();
    expect(screen.getByRole("status", { name: /nada musiknya tersendat/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lanjut ke halaman surat" })).toBeInTheDocument();
  });
});
