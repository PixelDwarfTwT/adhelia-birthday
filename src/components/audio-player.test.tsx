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

  it("doesNotLoadOrPlayBeforeOpening", () => {
    render(<AudioPlayer track="/assets/metal.mp3" />);
    const audio = document.querySelector("audio");

    expect(audio).not.toBeNull();
    expect(audio?.getAttribute("src")).toBeNull();
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

  it("togglesMuteAndPlayPause", async () => {
    const player = createRef<AudioPlayerHandle>();
    render(<AudioPlayer ref={player} track="/assets/metal.mp3" />);
    await act(async () => { await player.current!.startFromGesture(); });
    const audio = document.querySelector("audio")!;

    fireEvent.click(screen.getByRole("button", { name: "Mute music" }));
    expect(audio.muted).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Unmute music" }));
    expect(audio.muted).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Pause music" }));
    expect(screen.getByRole("button", { name: "Play music" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Play music" }));
    await waitFor(() => expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2));
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

    expect(screen.getByRole("slider", { name: "Music progress" })).toHaveValue("30");
  });

  it("showsRetryAfterPlaybackFailure", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValueOnce(new Error("blocked"));
    const player = createRef<AudioPlayerHandle>();
    render(<AudioPlayer ref={player} track="/assets/metal.mp3" />);

    await act(async () => { await player.current!.startFromGesture(); });
    expect(await screen.findByRole("alert")).toHaveTextContent(/music note got lost/i);
    fireEvent.click(screen.getByRole("button", { name: "Retry music" }));
    expect(await screen.findByRole("button", { name: "Pause music" })).toBeInTheDocument();
  });

  it("ducksToFifteenPercentForVideo", async () => {
    const player = createRef<AudioPlayerHandle>();
    render(<AudioPlayer ref={player} track="/assets/metal.mp3" />);
    await act(async () => { await player.current!.startFromGesture(); });
    const audio = document.querySelector("audio")!;

    act(() => player.current!.setDucked(true));
    expect(audio.volume).toBeCloseTo(0.15);
    act(() => player.current!.setDucked(false));
    expect(audio.volume).toBe(1);
  });
});
