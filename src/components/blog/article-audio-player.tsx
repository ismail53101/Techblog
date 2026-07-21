"use client";

import * as React from "react";
import { Headphones, Pause, Play, RotateCcw, RotateCw, Square } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "playing" | "paused";
type Chunk = { text: string; start: number };

const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;
const WPM = 200; // baseline speaking rate for time estimates
const CHARS_PER_SEC_1X = 15; // ~ average; used to translate the 10s skip into characters

/** Split text into short, sentence-sized chunks with cumulative char offsets. */
function buildChunks(text: string): { chunks: Chunk[]; total: number } {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return { chunks: [], total: 0 };
  const sentences = clean.match(/[^.!?]+[.!?]*\s*/g) ?? [clean];
  const chunks: Chunk[] = [];
  let start = 0;
  const MAX = 240;
  for (const s of sentences) {
    let piece = s;
    while (piece.length > MAX) {
      // Break overly long sentences on a space near the cap.
      let cut = piece.lastIndexOf(" ", MAX);
      if (cut <= 0) cut = MAX;
      const head = piece.slice(0, cut);
      chunks.push({ text: head.trim(), start });
      start += head.length;
      piece = piece.slice(cut);
    }
    if (piece.trim()) {
      chunks.push({ text: piece.trim(), start });
      start += piece.length;
    }
  }
  return { chunks, total: start };
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function ArticleAudioPlayer({
  text,
  title,
  storageKey,
}: {
  text: string;
  title: string;
  storageKey: string;
}) {
  const [supported, setSupported] = React.useState<boolean | null>(null);
  const [status, setStatus] = React.useState<Status>("idle");
  const [rate, setRate] = React.useState(1);
  const [progress, setProgress] = React.useState(0); // characters spoken

  const { chunks, total } = React.useMemo(() => buildChunks(text), [text]);
  const words = React.useMemo(() => (text.trim() ? text.trim().split(/\s+/).length : 0), [text]);

  const indexRef = React.useRef(0);
  const rateRef = React.useRef(rate);
  const statusRef = React.useRef<Status>("idle");
  const lsKey = `fixpedia:tts:${storageKey}`;

  rateRef.current = rate;
  statusRef.current = status;

  // Feature detection + restore saved position.
  React.useEffect(() => {
    const ok = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    setSupported(ok);
    if (!ok) return;
    try {
      const saved = Number(window.localStorage.getItem(lsKey));
      if (saved > 0 && saved < total) setProgress(saved);
    } catch {
      /* ignore */
    }
    // Warm up the voice list (some browsers load it lazily).
    window.speechSynthesis.getVoices();
    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lsKey, total]);

  const save = React.useCallback(
    (chars: number) => {
      try {
        if (chars > 0 && chars < total) window.localStorage.setItem(lsKey, String(Math.floor(chars)));
        else window.localStorage.removeItem(lsKey);
      } catch {
        /* ignore */
      }
    },
    [lsKey, total]
  );

  const pickVoice = React.useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang?.toLowerCase().startsWith("en") && /google|natural|samantha|zira|aria/i.test(v.name)) ||
      voices.find((v) => v.lang?.toLowerCase().startsWith("en")) ||
      voices[0] ||
      null
    );
  }, []);

  const speakFrom = React.useCallback(
    (offset: number) => {
      if (!chunks.length) return;
      const synth = window.speechSynthesis;
      synth.cancel();

      let idx = 0;
      for (let i = 0; i < chunks.length; i++) {
        if (chunks[i].start <= offset) idx = i;
        else break;
      }
      indexRef.current = idx;

      const speakChunk = () => {
        const i = indexRef.current;
        if (i >= chunks.length) {
          setStatus("idle");
          setProgress(total);
          save(0);
          return;
        }
        const chunk = chunks[i];
        const u = new SpeechSynthesisUtterance(chunk.text);
        u.rate = rateRef.current;
        const v = pickVoice();
        if (v) u.voice = v;
        u.onboundary = (e) => {
          const chars = chunk.start + (e.charIndex || 0);
          setProgress(chars);
        };
        u.onend = () => {
          if (statusRef.current === "idle") return; // stopped/cancelled
          indexRef.current = i + 1;
          const nextStart = indexRef.current < chunks.length ? chunks[indexRef.current].start : total;
          setProgress(nextStart);
          save(nextStart);
          speakChunk();
        };
        synth.speak(u);
      };

      setStatus("playing");
      statusRef.current = "playing";
      speakChunk();
    },
    [chunks, total, pickVoice, save]
  );

  const play = React.useCallback(() => {
    const from = progress >= total ? 0 : progress;
    if (from === 0) setProgress(0);
    speakFrom(from);
  }, [progress, total, speakFrom]);

  const pause = React.useCallback(() => {
    try {
      window.speechSynthesis.pause();
    } catch {
      /* ignore */
    }
    setStatus("paused");
    save(progress);
  }, [progress, save]);

  const resume = React.useCallback(() => {
    try {
      window.speechSynthesis.resume();
    } catch {
      /* ignore */
    }
    setStatus("playing");
  }, []);

  const stop = React.useCallback(() => {
    setStatus("idle");
    statusRef.current = "idle";
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    setProgress(0);
    save(0);
  }, [save]);

  const toggle = React.useCallback(() => {
    if (status === "playing") pause();
    else if (status === "paused") resume();
    else play();
  }, [status, pause, resume, play]);

  const seekTo = React.useCallback(
    (chars: number) => {
      const clamped = Math.max(0, Math.min(total, chars));
      setProgress(clamped);
      save(clamped);
      if (statusRef.current === "playing") speakFrom(clamped);
    },
    [total, save, speakFrom]
  );

  const skip = React.useCallback(
    (seconds: number) => seekTo(progress + seconds * CHARS_PER_SEC_1X * rate),
    [progress, rate, seekTo]
  );

  function changeRate(next: number) {
    setRate(next);
    rateRef.current = next;
    if (statusRef.current === "playing") speakFrom(progress);
  }

  // Hidden entirely when TTS isn't available.
  if (supported === false) return null;

  const fraction = total > 0 ? Math.min(1, progress / total) : 0;
  const totalSeconds = words > 0 ? (words / WPM) * 60 : 0;
  const elapsedSeconds = totalSeconds * fraction;
  const isPlaying = status === "playing";

  const ctrlBtn =
    "inline-flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div
      className={cn(
        "not-prose my-6 rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur sm:p-5",
        supported === null && "pointer-events-none opacity-60"
      )}
      aria-label="Article audio player"
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          disabled={!supported || !chunks.length}
          aria-label={isPlaying ? "Pause" : "Play article audio"}
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 translate-x-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Headphones className="size-4 text-primary" />
              Listen to this article
            </p>
            <span className="text-xs tabular-nums text-muted-foreground">
              {formatTime(elapsedSeconds)} / {formatTime(totalSeconds)}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={Math.max(1, total)}
            value={Math.round(progress)}
            onChange={(e) => seekTo(Number(e.target.value))}
            aria-label="Seek article audio"
            className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) ${fraction * 100}%, hsl(var(--muted)) ${
                fraction * 100
              }%)`,
            }}
          />

          <div className="mt-3 flex items-center gap-2">
            <button type="button" onClick={() => skip(-10)} aria-label="Rewind 10 seconds" className={ctrlBtn}>
              <RotateCcw className="size-4" />
            </button>
            <button type="button" onClick={() => skip(10)} aria-label="Forward 10 seconds" className={ctrlBtn}>
              <RotateCw className="size-4" />
            </button>
            <button
              type="button"
              onClick={stop}
              aria-label="Stop"
              className={ctrlBtn}
              disabled={status === "idle" && progress === 0}
            >
              <Square className="size-4" />
            </button>

            <div className="ml-auto flex items-center gap-1.5">
              <label htmlFor="tts-speed" className="sr-only">
                Playback speed
              </label>
              <select
                id="tts-speed"
                value={rate}
                onChange={(e) => changeRate(Number(e.target.value))}
                aria-label="Playback speed"
                className="rounded-full border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring"
              >
                {SPEEDS.map((s) => (
                  <option key={s} value={s}>
                    {s}×
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">Text-to-speech player for the article titled {title}.</span>
    </div>
  );
}
