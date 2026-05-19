import { useEffect, useRef, useCallback, useState } from "react";

let apiLoaded = false;
let apiLoading = false;
const readyCallbacks = [];

function loadYouTubeAPI(cb) {
  if (apiLoaded) return cb();
  readyCallbacks.push(cb);
  if (apiLoading) return;
  apiLoading = true;

  window.onYouTubeIframeAPIReady = () => {
    apiLoaded = true;
    readyCallbacks.forEach((fn) => fn());
    readyCallbacks.length = 0;
  };

  const script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(script);
}

export function useYouTubePlayer({ containerId, onReady, onStateChange }) {
  const playerRef = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    loadYouTubeAPI(() => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }

      window._ytPlayer = playerRef.current = new window.YT.Player(containerId, {
        height: "100%",
        width: "100%",
        playerVars: {
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          showinfo: 0,
          cc_load_policy: 0,
          autohide: 1,
        },
        events: {
          onReady: (e) => {
            setPlayerReady(true);
            onReady?.(e);
          },
          onStateChange: (e) => {
            onStateChange?.(e);
          },
        },
      });
    });

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
        setPlayerReady(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  // FIX: cueVideoById only buffers without auto-playing, then we control play/pause separately
  // loadVideoById auto-plays which fights our pause state
  const loadVideo = useCallback((videoId, startSeconds = 0) => {
    if (!playerRef.current) return;
    playerRef.current.cueVideoById({ videoId, startSeconds });
  }, []);

  const playVideo = useCallback(() => {
    if (!playerRef.current) return;
    playerRef.current.playVideo();
  }, []);

  const pauseVideo = useCallback(() => {
    if (!playerRef.current) return;
    playerRef.current.pauseVideo();
  }, []);

  const seekTo = useCallback((time) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(time, true);
  }, []);

  const getCurrentTime = useCallback(() => {
    if (!playerRef.current) return 0;
    return playerRef.current.getCurrentTime?.() ?? 0;
  }, []);

  const getDuration = useCallback(() => {
    if (!playerRef.current) return 0;
    return playerRef.current.getDuration?.() ?? 0;
  }, []);

  const getPlayerState = useCallback(() => {
    if (!playerRef.current) return -1;
    return playerRef.current.getPlayerState?.() ?? -1;
  }, []);

  return { playerReady, loadVideo, playVideo, pauseVideo, seekTo, getCurrentTime, getDuration, getPlayerState };
}
