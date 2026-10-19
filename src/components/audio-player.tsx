"use client";

import {
  forwardRef,
  useCallback,
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

const lyricLines = `When I look into your eyes
I can see a love restrained
But darlin' when I hold you
Don't you know I feel the same?
Nothin' lasts forever
And we both know hearts can change
And it's hard to hold a candle
In the cold November rain

We've been through this such a long long time
Just tryin' to kill the pain, ooh yeah
Love is always coming, love is always going
No one's really sure who's lettin' go today
Walking away

If we could take the time to lay it on the line
I could rest my head just knowin' that you were mine
All mine

So if you want to love me then darlin' don't refrain
Or I'll just end up walkin' in the cold November rain

Do you need some time on your own?
Do you need some time all alone?
Ooh, everybody needs some time on their own
Ooh, don't you know you need some time all alone

I know it's hard to keep an open heart
When even friends seem out to harm you
But if you could heal a broken heart
Wouldn't time be out to charm you?

Oh, oh, oh

Sometimes I need some time on my own
Sometimes I need some time all alone
Ooh, everybody needs some time on their own
Ooh, don't you know you need some time all alone

And when your fears subside
And shadows still remain, oh yeah
I know that you can love me when there's no one left to blame
So never mind the darkness, we still can find a way
'Cause nothin' lasts forever, even cold November rain

Don't ya think that you need somebody?
Don't ya think that you need someone?
Everybody needs somebody
You're not the only one
You're not the only one

Don't ya think that you need somebody?
Don't ya think that you need someone?
Everybody needs somebody
You're not the only one
You're not the only one

Don't ya think that you need somebody?
Don't ya think that you need someone?
Everybody needs somebody
You're not the only one
You're not the only one

Don't ya think that you need somebody?
Don't ya think that you need someone?
Everybody needs somebody`.split("\n");

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
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const [lyricsOpen, setLyricsOpen] = useState(false);

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
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
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
          className={`audio-player${error ? " audio-player--error" : ""}`}
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
                <p className={line ? undefined : "audio-player__lyrics-break"} key={`${index}-${line}`}>
                  {line || " "}
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
