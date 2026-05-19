import { useEffect, useRef } from "react";
import { useYouTubePlayer } from "../hooks/useYouTubePlayer";

function parseVideoId(input) {
  if (!input) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1];
  }
  return null;
}

const YT_PLAYING = 1;
const YT_ENDED   = 0;

export default function VideoPlayer({ videoState, canControl, onPlay, onPause, onSeek }) {
  const isSyncing     = useRef(false);
  const lastVideoId   = useRef(null);
  const canControlRef = useRef(canControl);
  useEffect(() => { canControlRef.current = canControl; }, [canControl]);

  const { playerReady, loadVideo, playVideo, pauseVideo, seekTo, getCurrentTime, getDuration } =
    useYouTubePlayer({
      containerId: "yt-player",
      onReady: () => {
        // Player just became ready — apply current server state immediately
        // This handles the "joiner sees video from start" bug (fix #3)
        if (videoState?.videoId) {
          loadVideo(videoState.videoId, videoState.currentTime ?? 0);
          setTimeout(() => {
            seekTo(videoState.currentTime ?? 0);
            if (videoState.playState === "playing") playVideo();
            else pauseVideo();
          }, 300);
        }
      },
      onStateChange: (e) => {
        if (isSyncing.current) return;

        if (!canControlRef.current) {
          if (e.data === YT_PLAYING || e.data === YT_ENDED) {
            isSyncing.current = true;
            pauseVideo();
            setTimeout(() => { isSyncing.current = false; }, 600);
          }
          return;
        }

        if (e.data === YT_PLAYING) onPlay();
        else if (e.data === 2) onPause(); // YT_PAUSED = 2
      },
    });

  // Apply incoming videoState from server
  useEffect(() => {
    if (!playerReady || !videoState) return;

    isSyncing.current = true;

    // New video loaded — cue it at the correct position (fix #2 & #3)
    if (videoState.videoId && videoState.videoId !== lastVideoId.current) {
      lastVideoId.current = videoState.videoId;
      loadVideo(videoState.videoId, videoState.currentTime ?? 0);
      // After cueing, seek and apply play state
      setTimeout(() => {
        seekTo(videoState.currentTime ?? 0);
        if (videoState.playState === "playing") playVideo();
        else pauseVideo();
        setTimeout(() => { isSyncing.current = false; }, 500);
      }, 400);
      return;
    }

    // Same video — just sync time and play state
    const drift = Math.abs(getCurrentTime() - (videoState.currentTime ?? 0));
    if (drift > 1.5) seekTo(videoState.currentTime ?? 0); // tighter drift threshold

    if (videoState.playState === "playing") playVideo();
    else pauseVideo();

    setTimeout(() => { isSyncing.current = false; }, 600);
  }, [videoState, playerReady]);

  return (
    <div className="w-full" style={{ background: "#000", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
      <div className="yt-wrapper">
        <div id="yt-player" />
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 10,
            pointerEvents: canControl ? "none" : "auto",
            cursor: canControl ? "default" : "not-allowed",
            background: "transparent",
          }}
          title={canControl ? undefined : "Only host & moderators can control playback"}
        />
      </div>
    </div>
  );
}

export { parseVideoId };
