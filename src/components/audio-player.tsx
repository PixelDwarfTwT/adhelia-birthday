"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ListMusic, Music2, Pause, Play, Volume2, VolumeX, X } from "lucide-react";

export interface AudioPlayerHandle {
  startFromGesture(): Promise<boolean>;
}

interface AudioPlayerProps {
  track: string;
  lyricsOffset?: number;
}

const lyricLines = [
  { time: 0, text: "Ooh, everybody needs some time on their own" },
  { time: 6, text: "Ooh, don't you know you need some time all alone" },
  { time: 13, text: "" },
  { time: 17, text: "I know it's hard to keep an open heart" },
  { time: 23, text: "When even friends seem out to harm you" },
  { time: 29, text: "But if you could heal a broken heart" },
  { time: 35, text: "Wouldn't time be out to charm you?" },
  { time: 42, text: "" },
  { time: 46, text: "Oh, oh, oh" },
  { time: 50, text: "" },
  { time: 54, text: "Sometimes I need some time on my own" },
  { time: 60, text: "Sometimes I need some time all alone" },
  { time: 66, text: "Ooh, everybody needs some time on their own" },
  { time: 72, text: "Ooh, don't you know you need some time all alone" },
  { time: 79, text: "" },
  { time: 83, text: "And when your fears subside" },
  { time: 88, text: "And shadows still remain, oh yeah" },
  { time: 94, text: "I know that you can love me when there's no one left to blame" },
  { time: 102, text: "So never mind the darkness, we still can find a way" },
  { time: 109, text: "'Cause nothin' lasts forever, even cold November rain" },
  { time: 119, text: "" },
  { time: 123, text: "Don't ya think that you need somebody?" },
  { time: 128, text: "Don't ya think that you need someone?" },
  { time: 133, text: "Everybody needs somebody" },
  { time: 138, text: "You're not the only one" },
  { time: 143, text: "You're not the only one" },
  { time: 148, text: "" },
  { time: 152, text: "Don't ya think that you need somebody?" },
  { time: 157, text: "Don't ya think that you need someone?" },
  { time: 162, text: "Everybody needs somebody" },
  { time: 167, text: "You're not the only one" },
  { time: 172, text: "You're not the only one" },
  { time: 177, text: "" },
  { time: 181, text: "Don't ya think that you need somebody?" },
  { time: 186, text: "Don't ya think that you need someone?" },
  { time: 191, text: "Everybody needs somebody" },
  { time: 196, text: "You're not the only one" },
  { time: 201, text: "You're not the only one" },
  { time: 206, text: "" },
  { time: 210, text: "Don't ya think that you need somebody?" },
  { time: 215, text: "Don't ya think that you need someone?" },
  { time: 220, text: "Everybody needs somebody" },
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function getActiveLyricIndex(seconds: number) {
  // Blank entries are intentional stanza gaps; keep the last sung line active through them.
  return lyricLines.reduce(
    (activeIndex, line, index) => (line.text && line.time <= seconds ? index : activeIndex),
    -1,
  );
}

export const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(function AudioPlayer(
  { track, lyricsOffset = 0 },
  ref,
) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const lyricRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const lyricLinesRef = useRef<HTMLDivElement>(null);
  const lastPaintedTimeRef = useRef<number | null>(null);

  const syncLyrics = useCallback((audioSeconds: number, forceProgress = false) => {
    const nextTime = Number.isFinite(audioSeconds) ? Math.max(0, audioSeconds) : 0;
    const lastPaintedTime = lastPaintedTimeRef.current;

    // AudioEvent timeupdate fires only a few times per second. Keep the progress
    // display lightweight, but let the lyric clock below check the active line
    // every frame so a line does not wait for the next coarse media event.
    if (
      forceProgress ||
      lastPaintedTime === null ||
      Math.abs(nextTime - lastPaintedTime) >= 0.08
    ) {
      lastPaintedTimeRef.current = nextTime;
      setCurrentTime(nextTime);
    }

    const nextLyricIndex = getActiveLyricIndex(nextTime - lyricsOffset);
    setActiveLyricIndex((currentIndex) => (
      currentIndex === nextLyricIndex ? currentIndex : nextLyricIndex
    ));
  }, [lyricsOffset]);

  const startFromGesture = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;

    setStarted(true);
    setError("");
    audio.muted = muted;
    audio.volume = 1;
    syncLyrics(audio.currentTime, true);

    try {
      await audio.play();
      setPlaying(true);
      return true;
    } catch {
      setPlaying(false);
      setError("Nada musiknya tersendat. Coba putar lagi, atau lanjutkan tanpa musik.");
      return false;
    }
  }, [muted, syncLyrics]);

  useImperativeHandle(ref, () => ({ startFromGesture }), [startFromGesture]);

  useEffect(() => {
    if (!playing) return;

    let frameId = 0;
    const tick = () => {
      const audio = audioRef.current;
      if (!audio || audio.paused || audio.ended) return;

      syncLyrics(audio.currentTime);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [playing, syncLyrics]);

  useEffect(() => {
    if (!lyricsOpen || activeLyricIndex < 0) return;
    const container = lyricLinesRef.current;
    const activeLine = lyricRefs.current[activeLyricIndex];
    if (!container || !activeLine) return;

    const targetTop = activeLine.offsetTop - (container.clientHeight - activeLine.offsetHeight) / 2;
    const behavior = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    container.scrollTo?.({ top: Math.max(0, targetTop), behavior });
  }, [activeLyricIndex, lyricsOpen]);

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
      setError("Nada musiknya tersendat. Coba putar lagi, atau lanjutkan tanpa musik.");
    }
  }

  function toggleMute() {
    const nextMuted = !muted;
    if (audioRef.current) audioRef.current.muted = nextMuted;
    setMuted(nextMuted);
  }

  function seekAudio(nextTime: number) {
    if (!Number.isFinite(nextTime)) return;
    if (audioRef.current) audioRef.current.currentTime = nextTime;
    syncLyrics(nextTime, true);
  }

  function seekLyric(nextTime: number) {
    seekAudio(nextTime + lyricsOffset);
  }

  return (
    <>
      <audio
        aria-hidden="true"
        ref={audioRef}
        preload="metadata"
        src={track}
        loop
        onLoadedMetadata={(event) => {
          const nextDuration = Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0;
          setDuration(nextDuration);
        }}
        onTimeUpdate={(event) => {
          syncLyrics(event.currentTarget.currentTime);
        }}
        onPlay={() => setPlaying(true)}
        onPause={(event) => {
          syncLyrics(event.currentTarget.currentTime, true);
          setPlaying(false);
        }}
        onEnded={(event) => {
          syncLyrics(event.currentTarget.currentTime, true);
          setPlaying(false);
        }}
        onError={() => {
          setPlaying(false);
          setError("Nada musiknya tersendat. Kamu bisa mencoba lagi atau lanjut tanpa musik.");
        }}
      />
      {started && (
        <aside
          className={`audio-player${error ? " audio-player--error" : ""}${lyricsOpen ? " audio-player--lyrics-open" : ""}`}
          aria-label={error ? `Kontrol musik. ${error}` : "Kontrol musik ulang tahun"}
        >
          <div className="audio-player__identity">
            <span aria-hidden="true" className="audio-player__star"><Music2 /></span>
            <div>
              <strong>{error ? "Musik perlu diputar lagi" : "Musik ulang tahun"}</strong>
              <span>{error ? "Ketuk tombol putar untuk mencoba" : "Untuk menemani perjalanan ini"}</span>
            </div>
          </div>
          <div className="audio-player__controls">
            <button className="audio-player__icon" type="button" aria-label={muted ? "Nyalakan musik" : "Bisukan musik"} onClick={toggleMute}>
              {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
            </button>
            <button className="audio-player__play" type="button" aria-label={playing ? "Jeda musik" : error ? "Coba putar musik lagi" : "Putar musik"} onClick={() => void togglePlayback()}>
              {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            </button>
            <button
              aria-controls="birthday-lyrics"
              aria-expanded={lyricsOpen}
              aria-label={lyricsOpen ? "Tutup lirik" : "Lihat lirik"}
              className={`audio-player__lyrics-toggle${lyricsOpen ? " audio-player__lyrics-toggle--active" : ""}`}
              onClick={() => setLyricsOpen((open) => !open)}
              type="button"
            >
              {lyricsOpen ? <X aria-hidden="true" /> : <ListMusic aria-hidden="true" />}
            </button>
            <div className="audio-player__timeline">
              <span>{formatTime(currentTime)}</span>
              <input
                aria-label="Posisi musik"
                type="range"
                min="0"
                max={duration || 1}
                step="1"
                value={Math.min(currentTime, duration || 0)}
                onChange={(event) => seekAudio(Number(event.currentTarget.value))}
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <div className={`audio-player__lyrics${lyricsOpen ? " audio-player__lyrics--open" : ""}`} id="birthday-lyrics" aria-hidden={!lyricsOpen}>
            <div className="audio-player__lyrics-heading">
              <span>Lirik untuk menemani</span>
              <small>{activeLyricIndex >= 0 ? "sedang dimainkan" : "ketuk baris untuk mulai"}</small>
            </div>
            <div className="audio-player__lyrics-lines" ref={lyricLinesRef}>
              {lyricLines.map((line, index) => (
                line.text ? (
                  <button
                    aria-current={index === activeLyricIndex ? "true" : undefined}
                    aria-label={`Mulai dari ${line.text}`}
                    className="audio-player__lyrics-line"
                    data-active={index === activeLyricIndex ? "true" : undefined}
                    key={`${index}-${line.time}`}
                    onClick={() => seekLyric(line.time)}
                    ref={(element) => {
                      lyricRefs.current[index] = element;
                    }}
                    type="button"
                  >
                    <span className="audio-player__lyrics-line-time">{formatTime(line.time)}</span>
                    <span>{line.text}</span>
                  </button>
                ) : (
                  <span aria-hidden="true" className="audio-player__lyrics-break" key={`${index}-${line.time}`} />
                )
              ))}
            </div>
          </div>
          {error && <span className="audio-player__error-indicator" role="status" aria-label={error} title={error} />}
        </aside>
      )}
    </>
  );
});
