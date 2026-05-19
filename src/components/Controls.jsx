import { useState, useEffect, useRef, useCallback } from "react";
import { parseVideoId } from "./VideoPlayer";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Controls({ videoState, canControl, onPlay, onPause, onSeek, onChangeVideo, playerRef }) {
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [localTime, setLocalTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);
  const intervalRef = useRef(null);

  const isPlaying = videoState?.playState === "playing";
  const hasVideo = !!videoState?.videoId;

  // Poll player for current time to update seek bar smoothly
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (!hasVideo) return;

    intervalRef.current = setInterval(() => {
      if (dragging) return;
      const player = window._ytPlayer;
      if (!player) return;
      try {
        const t = player.getCurrentTime?.() ?? 0;
        const d = player.getDuration?.() ?? 0;
        setLocalTime(t);
        if (d > 0) setDuration(d);
      } catch {}
    }, 500);

    return () => clearInterval(intervalRef.current);
  }, [hasVideo, dragging]);

  // Sync localTime when videoState changes (pause/seek from server)
  useEffect(() => {
    if (!dragging && videoState?.currentTime !== undefined) {
      setLocalTime(videoState.currentTime);
    }
  }, [videoState?.currentTime, dragging]);

  function handleUrlSubmit(e) {
    e.preventDefault();
    const id = parseVideoId(urlInput.trim());
    if (!id) return;
    onChangeVideo(id);
    setUrlInput("");
    setShowUrlInput(false);
  }

  function handleSeekStart() {
    setDragging(true);
  }

  function handleSeekMove(e) {
    setLocalTime(parseFloat(e.target.value));
  }

  function handleSeekEnd(e) {
    const time = parseFloat(e.target.value);
    setDragging(false);
    onSeek(time);
  }

  const progress = duration > 0 ? (localTime / duration) * 100 : 0;

  return (
    <div
      className="flex flex-col gap-2 px-4 py-5"
      style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}
    >
      {/* URL input */}
      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit(e)}
            placeholder="Paste YouTube video URL"
            autoFocus
            className="flex-1 px-3 py-2 rounded text-sm outline-none"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              fontFamily: "var(--font-body)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          />
          <CtrlBtn onClick={() => setShowUrlInput(false)} variant="ghost">✕</CtrlBtn>
          <CtrlBtn onClick={handleUrlSubmit} variant="accent">Load</CtrlBtn>
        </div>
      )}

      {/* Seek bar — only shown when video is loaded */}
      {hasVideo && (
        <div className="flex items-center gap-2">
          <span className="text-xs w-10 shrink-0 text-right" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>
            {formatTime(localTime)}
          </span>
          <div className="flex-1 relative flex items-center" style={{ height: "16px" }}>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={localTime}
              disabled={!canControl}
              onMouseDown={canControl ? handleSeekStart : undefined}
              onTouchStart={canControl ? handleSeekStart : undefined}
              onChange={handleSeekMove}
              onMouseUp={canControl ? handleSeekEnd : undefined}
              onTouchEnd={canControl ? handleSeekEnd : undefined}
              className="w-full"
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                height: "3px",
                borderRadius: "2px",
                background: `linear-gradient(to right, var(--color-accent) ${progress}%, var(--color-border) ${progress}%)`,
                cursor: canControl ? "pointer" : "not-allowed",
                outline: "none",
              }}
            />
          </div>
          <span className="text-xs w-10 shrink-0" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>
            {formatTime(duration)}
          </span>
        </div>
      )}

      {/* Controls row */}
      <div className="flex items-center gap-3">
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={!canControl || !hasVideo}
          title={canControl ? (isPlaying ? "Pause" : "Play") : "Only host/moderator can control playback"}
          className="w-9 h-9 rounded-full flex items-center justify-center text-base transition-all shrink-0"
          style={{
            background: canControl && hasVideo ? "var(--color-accent)" : "var(--color-surface-2)",
            color: canControl && hasVideo ? "#fff" : "var(--color-muted)",
            border: "none",
            cursor: canControl && hasVideo ? "pointer" : "not-allowed",
          }}
          onMouseEnter={(e) => { if (canControl && hasVideo) e.currentTarget.style.background = "var(--color-accent-dim)"; }}
          onMouseLeave={(e) => { if (canControl && hasVideo) e.currentTarget.style.background = "var(--color-accent)"; }}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        <div className="flex-1">
          <p className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
            {!hasVideo
              ? "No video loaded"
              : isPlaying
              ? "▶ Playing"
              : "⏸ Paused"}
            {hasVideo && !canControl && " · Watch only"}
          </p>
        </div>

        {canControl && (
          <CtrlBtn
            onClick={() => setShowUrlInput((v) => !v)}
            variant={showUrlInput ? "accent" : "ghost"}
          >
            Add Video
          </CtrlBtn>
        )}
      </div>
    </div>
  );
}

function CtrlBtn({ children, onClick, variant = "ghost", disabled }) {
  const styles = {
    ghost: { background: "var(--color-surface-2)", color: "var(--color-text)", border: "1px solid var(--color-border)" },
    accent: { background: "var(--color-accent)", color: "#fff", border: "none" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 rounded text-xs font-medium transition-all"
      style={{ ...styles[variant], cursor: disabled ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", opacity: disabled ? 0.5 : 1 }}
    >
      {children}
    </button>
  );
}
