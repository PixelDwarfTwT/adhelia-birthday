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
}

const lyricLines = [
  { time: 0, text: "When I look into your eyes" },
  { time: 3, text: "I can see a love restrained" },
  { time: 7, text: "But darlin' when I hold you" },
  { time: 11, text: "Don't you know I feel the same?" },
  { time: 16, text: "Nothin' lasts forever" },
  { time: 20, text: "And we both know hearts can change" },
  { time: 25, text: "And it's hard to hold a candle" },
  { time: 29, text: "In the cold November rain" },
  { time: 34, text: "" },
  { time: 38, text: "We've been through this such a long long time" },
  { time: 44, text: "Just tryin' to kill the pain, ooh yeah" },
  { time: 49, text: "Love is always coming, love is always going" },
  { time: 55, text: "No one's really sure who's lettin' go today" },
  { time: 61, text: "Walking away" },
  { time: 65, text: "" },
  { time: 69, text: "If we could take the time to lay it on the line" },
  { time: 76, text: "I could rest my head just knowin' that you were mine" },
  { time: 83, text: "All mine" },
  { time: 86, text: "" },
  { time: 90, text: "So if you want to love me then darlin' don't refrain" },
  { time: 97, text: "Or I'll just end up walkin' in the cold November rain" },
  { time: 105, text: "" },
  { time: 109, text: "Do you need some time on your own?" },
  { time: 114, text: "Do you need some time all alone?" },
  { time: 119, text: "Ooh, everybody needs some time on their own" },
  { time: 125, text: "Ooh, don't you know you need some time all alone" },
  { time: 132, text: "" },
  { time: 136, text: "I know it's hard to keep an open heart" },
  { time: 142, text: "When even friends seem out to harm you" },
  { time: 148, text: "But if you could heal a broken heart" },
  { time: 154, text: "Wouldn't time be out to charm you?" },
  { time: 161, text: "" },
  { time: 165, text: "Oh, oh, oh" },
  { time: 169, text: "" },
  { time: 173, text: "Sometimes I need some time on my own" },
  { time: 179, text: "Sometimes I need some time all alone" },
  { time: 185, text: "Ooh, everybody needs some time on their own" },
  { time: 191, text: "Ooh, don't you know you need some time all alone" },
  { time: 198, text: "" },
  { time: 202, text: "And when your fears subside" },
  { time: 207, text: "And shadows still remain, oh yeah" },
  { time: 213, text: "I know that you can love me when there's no one left to blame" },
  { time: 221, text: "So never mind the darkness, we still can find a way" },
  { time: 228, text: "'Cause nothin' lasts forever, even cold November rain" },
  { time: 238, text: "" },
  { time: 242, text: "Don't ya think that you need somebody?" },
  { time: 247, text: "Don't ya think that you need someone?" },
  { time: 252, text: "Everybody needs somebody" },
  { time: 257, text: "You're not the only one" },
  { time: 262, text: "You're not the only one" },
  { time: 267, text: "" },
  { time: 271, text: "Don't ya think that you need somebody?" },
  { time: 276, text: "Don't ya think that you need someone?" },
  { time: 281, text: "Everybody needs somebody" },
  { time: 286, text: "You're not the only one" },
  { time: 291, text: "You're not the only one" },
  { time: 296, text: "" },
  { time: 300, text: "Don't ya think that you need somebody?" },
  { time: 305, text: "Don't ya think that you need someone?" },
  { time: 310, text: "Everybody needs somebody" },
  { time: 315, text: "You're not the only one" },
  { time: 320, text: "You're not the only one" },
  { time: 325, text: "" },
  { time: 329, text: "Don't ya think that you need somebody?" },
  { time: 334, text: "Don't ya think that you need someone?" },
  { time: 339, text: "Everybody needs somebody" },
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function getActiveLyricIndex(seconds: number) {
  return lyricLines.reduce(
    (activeIndex, line, index) => (line.text && line.time <= seconds ? index : activeIndex),
    -1,
  );
}

export const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(function AudioPlayer(
  { track },
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
  const lyricRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  const startFromGesture = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;

    setStarted(true);
    setError("");
    audio.muted = muted;
    audio.volume = 1;

    try {
      await audio.play();
      setPlaying(true);
      return true;
    } catch {
      setPlaying(false);
      setError("Nada musiknya tersendat. Coba putar lagi, atau lanjutkan tanpa musik.");
      return false;
    }
  }, [muted]);

  useImperativeHandle(ref, () => ({ startFromGesture }), [startFromGesture]);

  useEffect(() => {
    if (!lyricsOpen || activeLyricIndex < 0) return;
    lyricRefs.current[activeLyricIndex]?.scrollIntoView?.({ block: "center", behavior: "smooth" });
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

  function seek(value: string) {
    const nextTime = Number(value);
    if (!Number.isFinite(nextTime)) return;
    if (audioRef.current) audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
    setActiveLyricIndex(getActiveLyricIndex(nextTime));
  }

  return (
    <>
      <audio
        aria-hidden="true"
        ref={audioRef}
        preload="metadata"
        src={track}
        loop
        onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onTimeUpdate={(event) => {
          const nextTime = event.currentTarget.currentTime;
          setCurrentTime(nextTime);
          setActiveLyricIndex(getActiveLyricIndex(nextTime));
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
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
                onChange={(event) => seek(event.currentTarget.value)}
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <div className={`audio-player__lyrics${lyricsOpen ? " audio-player__lyrics--open" : ""}`} id="birthday-lyrics" aria-hidden={!lyricsOpen}>
            <div className="audio-player__lyrics-heading">
              <span>Lirik untuk menemani</span>
              <small>scroll untuk membaca</small>
            </div>
            <div className="audio-player__lyrics-lines">
              {lyricLines.map((line, index) => (
                <p
                  className={`${line.text ? "" : "audio-player__lyrics-break"}${index === activeLyricIndex ? " audio-player__lyrics-line--active" : ""}`}
                  key={`${index}-${line.time}`}
                  ref={(element) => {
                    lyricRefs.current[index] = element;
                  }}
                  data-active={index === activeLyricIndex ? "true" : undefined}
                >
                  {line.text || " "}
                </p>
              ))}
            </div>
          </div>
          {error && <span className="audio-player__error-indicator" role="status" aria-label={error} title={error} />}
        </aside>
      )}
    </>
  );
});
