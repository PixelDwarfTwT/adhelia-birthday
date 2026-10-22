import { act, createRef } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AudioPlayer, type AudioPlayerHandle } from "./audio-player";

describe("AudioPlayer", () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
  });

  it("preparesButDoesNotPlayBeforeOpening", () => {
    render(<AudioPlayer track="/assets/metal.mp3" />);
    const audio = document.querySelector("audio");

    expect(audio).not.toBeNull();
    expect(audio?.getAttribute("src")).toBe("/assets/metal.mp3");
    expect(audio?.loop).toBe(true);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it("startsTrackFromOpeningGesture", async () => {
    const player = createRef<AudioPlayerHandle>();
    render(<AudioPlayer ref={player} track="/assets/metal.mp3" />);
    let started = false;

    await act(async () => {
      started = await player.current!.startFromGesture();
    });

    expect(started).toBe(true);
    expect(document.querySelector("audio")?.getAttribute("src")).toBe("/assets/metal.mp3");
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  });

  it("keepsTheTrackReadyAfterTheOpeningGesture", async () => {
    const player = createRef<AudioPlayerHandle>();
    render(<AudioPlayer ref={player} track="/assets/metal.mp3" />);
    const audio = document.querySelector("audio")!;
    await act(async () => {
      await player.current!.startFromGesture();
    });

    expect(audio.getAttribute("src")).toBe("/assets/metal.mp3");
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  });

  it("togglesMuteAndPlayPause", async () => {
    const player = createRef<AudioPlayerHandle>();
    render(<AudioPlayer ref={player} track="/assets/metal.mp3" />);
    await act(async () => { await player.current!.startFromGesture(); });
    const audio = document.querySelector("audio")!;

    fireEvent.click(screen.getByRole("button", { name: "Bisukan musik" }));
    expect(audio.muted).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Nyalakan musik" }));
    expect(audio.muted).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Jeda musik" }));
    expect(screen.getByRole("button", { name: "Putar musik" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Putar musik" }));
    await waitFor(() => expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2));
  });

  it("togglesTheLyricsPanel", async () => {
    const player = createRef<AudioPlayerHandle>();
    render(<AudioPlayer ref={player} track="/assets/metal.mp3" />);
    await act(async () => { await player.current!.startFromGesture(); });

    const lyricsButton = screen.getByRole("button", { name: "Lihat lirik" });
    const lyricsPanel = document.getElementById("birthday-lyrics");
    expect(lyricsPanel).toHaveAttribute("aria-hidden", "true");

    fireEvent.click(lyricsButton);

    expect(screen.getByRole("button", { name: "Tutup lirik" })).toBeInTheDocument();
    expect(lyricsPanel).toHaveAttribute("aria-hidden", "false");
  });

  it("updatesProgress", async () => {
    const player = createRef<AudioPlayerHandle>();
    render(<AudioPlayer ref={player} track="/assets/metal.mp3" />);
    await act(async () => { await player.current!.startFromGesture(); });
    const audio = document.querySelector("audio")!;
    Object.defineProperty(audio, "duration", { configurable: true, value: 120 });
    Object.defineProperty(audio, "currentTime", { configurable: true, writable: true, value: 30 });
    fireEvent.loadedMetadata(audio);
    fireEvent.timeUpdate(audio);

    expect(screen.getByRole("slider", { name: "Posisi musik" })).toHaveValue("30");
    fireEvent.click(screen.getByRole("button", { name: "Lihat lirik" }));
    expect(screen.getByText("In the cold November rain")).toHaveAttribute("data-active", "true");
  });

  it("showsRetryAfterPlaybackFailure", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValueOnce(new Error("blocked"));
    const player = createRef<AudioPlayerHandle>();
    render(<AudioPlayer ref={player} track="/assets/metal.mp3" />);

    await act(async () => { await player.current!.startFromGesture(); });
    expect(await screen.findByRole("status", { name: /nada musiknya tersendat/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Coba putar musik lagi" }));
    expect(await screen.findByRole("button", { name: "Jeda musik" })).toBeInTheDocument();
  });

});
