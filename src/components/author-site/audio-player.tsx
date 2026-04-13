"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";

interface AudioTrack {
  id:              string;
  title:           string;
  description:     string | null;
  url:             string;
  durationSeconds: number | null;
}

interface Props {
  tracks:      AudioTrack[];
  accentColor: string;
}

function formatTime(secs: number): string {
  if (!isFinite(secs) || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ tracks, accentColor }: Props) {
  const audioRef                = useRef<HTMLAudioElement>(null);
  const progressRef             = useRef<HTMLDivElement>(null);
  const [activeIdx, setActive]  = useState(0);
  const [playing, setPlaying]   = useState(false);
  const [currentTime, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted]       = useState(false);
  const [volume, setVolume]     = useState(1);

  const activeTrack = tracks[activeIdx];

  // When track changes, reset and auto-play if already playing
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.load();
    setCurrent(0);
    setDuration(0);
    if (playing) el.play().catch(() => setPlaying(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  function handlePlayPause() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else         { el.play().catch(() => {}); setPlaying(true); }
  }

  function handleTimeUpdate() {
    const el = audioRef.current;
    if (el) setCurrent(el.currentTime);
  }

  function handleLoadedMetadata() {
    const el = audioRef.current;
    if (el) setDuration(el.duration);
  }

  function handleEnded() {
    if (activeIdx < tracks.length - 1) {
      setActive((i) => i + 1);   // auto-advance
    } else {
      setPlaying(false);
      setCurrent(0);
    }
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const el  = audioRef.current;
    const bar = progressRef.current;
    if (!el || !bar || !duration) return;
    const rect  = bar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    el.currentTime = ratio * duration;
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    if (v === 0) setMuted(true);
    else         setMuted(false);
  }

  function toggleMute() {
    const el = audioRef.current;
    if (!el) return;
    const next = !muted;
    setMuted(next);
    el.muted = next;
  }

  function selectTrack(idx: number) {
    setActive(idx);
    setPlaying(true);
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayDuration = duration > 0 ? duration : (activeTrack.durationSeconds ?? 0);

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={activeTrack?.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        preload="metadata"
      />

      {/* Now playing */}
      <div className="px-5 pt-5 pb-4" style={{ backgroundColor: accentColor + "15" }}>
        <div className="flex items-start gap-3 mb-4">
          {/* Play button */}
          <button
            onClick={handlePlayPause}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-md transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: accentColor }}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing
              ? <Pause className="h-5 w-5" />
              : <Play  className="h-5 w-5 ml-0.5" />}
          </button>

          {/* Track info */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="font-semibold text-gray-900 leading-snug line-clamp-1">
              {activeTrack?.title}
            </p>
            {activeTrack?.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                {activeTrack.description}
              </p>
            )}
          </div>

          {/* Track counter */}
          {tracks.length > 1 && (
            <span className="text-xs text-gray-400 flex-shrink-0 pt-1">
              {activeIdx + 1} / {tracks.length}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="h-1.5 bg-gray-200 rounded-full cursor-pointer group relative overflow-hidden"
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: accentColor }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(displayDuration)}</span>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between mt-3">
          {/* Prev / Next */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActive((i) => Math.max(0, i - 1))}
              disabled={activeIdx === 0}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
              aria-label="Previous track"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActive((i) => Math.min(tracks.length - 1, i + 1))}
              disabled={activeIdx === tracks.length - 1}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
              aria-label="Next track"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted || volume === 0
                ? <VolumeX className="h-4 w-4" />
                : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 appearance-none rounded-full cursor-pointer accent-gray-400"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>

      {/* Track list — only shown when more than 1 track */}
      {tracks.length > 1 && (
        <div className="divide-y divide-gray-100 border-t border-gray-100">
          {tracks.map((track, idx) => (
            <button
              key={track.id}
              onClick={() => selectTrack(idx)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                idx === activeIdx
                  ? "bg-gray-50"
                  : "hover:bg-gray-50"
              }`}
            >
              {/* Play indicator */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  idx === activeIdx
                    ? "text-white"
                    : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                }`}
                style={idx === activeIdx ? { backgroundColor: accentColor } : {}}
              >
                {idx === activeIdx && playing
                  ? <Pause className="h-3 w-3" />
                  : <Play  className="h-3 w-3 ml-0.5" />}
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug line-clamp-1 ${
                  idx === activeIdx ? "text-gray-900" : "text-gray-700"
                }`}>
                  {track.title}
                </p>
                {track.description && (
                  <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                    {track.description}
                  </p>
                )}
              </div>

              {/* Duration badge */}
              {track.durationSeconds && (
                <span className="text-xs text-gray-400 font-mono flex-shrink-0">
                  {formatTime(track.durationSeconds)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
