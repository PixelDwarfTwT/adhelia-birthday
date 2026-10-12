"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

export interface AudioPlayerHandle {
  startFromGesture(): Promise<boolean>;
  setDucked(ducked: boolean): void;
}

interface AudioPlayerProps {
  track: string;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

export const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(function AudioPlayer(
  { track },
  ref,
) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const volumeBeforeDuck = useRef<number | null>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [ducked, setDuckedState] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");

  const startFromGesture = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;

    setStarted(true);
    setError("");
    audio.setAttribute("src", track);
    audio.muted = muted;
    audio.volume = ducked ? (volumeBeforeDuck.current ?? 1) * 0.15 : 1;

    try {
      audio.load();
      await audio.play();
      setPlaying(true);
      return true;
    } catch {
      setPlaying(false);
      setError("A little music note got lost. Tap retry, or keep exploring without music.");
      return false;
    }
  }, [ducked, muted, track]);

  const setDucked = useCallback((shouldDuck: boolean) => {
    const audio = audioRef.current;
    if (shouldDuck) {
      if (volumeBeforeDuck.current === null) volumeBeforeDuck.current = audio?.volume ?? 1;
      if (audio) audio.volume = volumeBeforeDuck.current * 0.15;
    } else {
      if (audio && volumeBeforeDuck.current !== null) audio.volume = volumeBeforeDuck.current;
      volumeBeforeDuck.current = null;
    }
    setDuckedState(shouldDuck);
  }, []);

  useImperativeHandle(ref, () => ({ startFromGesture, setDucked }), [setDucked, startFromGesture]);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    if (!audio.getAttribute("src")) {
      await startFromGesture();
      return;
    }
    setError("");
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
      setError("A little music note got lost. Tap retry, or keep exploring without music.");
    }
  }

  function toggleMute() {
    const nextMuted = !muted;
    if (audioRef.current) audioRef.current.muted = nextMuted;
    setMuted(nextMuted);
  }

  function seek(value: string) {
    const nextTime = Number(value);
    if (!Number.isFinite(nextTime)) return;
    if (audioRef.current) audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  return (
    <>
      <audio
        aria-hidden="true"
        ref={audioRef}
        src={started ? track : undefined}
        preload="none"
        onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onEnded={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setError("A little music note got lost. You can retry, or keep exploring without music.");
        }}
      />
      {started && (
        <aside className="audio-player" aria-label="Birthday music controls">
          <div className="audio-player__identity">
            <span aria-hidden="true" className="audio-player__star">✦</span>
            <div><strong>A little soundtrack</strong><span>{error ? "The song is resting for a moment" : "For this little birthday world"}</span></div>
          </div>
          <div className="audio-player__controls">
            <button className="audio-player__icon" type="button" aria-label={muted ? "Unmute music" : "Mute music"} onClick={toggleMute}>
              {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
            </button>
            <button className="audio-player__play" type="button" aria-label={playing ? "Pause music" : "Play music"} onClick={() => void togglePlayback()}>
              {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            </button>
            <div className="audio-player__timeline">
              <span>{formatTime(currentTime)}</span>
              <input
                aria-label="Music progress"
                type="range"
                min="0"
                max={duration || 1}
                step="1"
                value={Math.min(currentTime, duration || 0)}
                onChange={(event) => seek(event.currentTarget.value)}
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          {error && (
            <div className="audio-player__error" role="alert">
              <p>{error}</p>
              <button type="button" onClick={() => void startFromGesture()}>Retry music</button>
            </div>
          )}
        </aside>
      )}
    </>
  );
});
