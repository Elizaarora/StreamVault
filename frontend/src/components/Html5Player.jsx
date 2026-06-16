import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function Html5Player({ url }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const isHls =
      url.toLowerCase().includes(".m3u8") ||
      url.includes("application/vnd.apple.mpegurl");

    setProgress(0);
    setDuration(0);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHls) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hlsRef.current = hls;
      } else {
        video.src = url;
        video.load();
      }
    } else {
      video.src = url;
      video.load();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url]);

  useEffect(() => {
    const handleKeyDown = async (e) => {
      const video = videoRef.current;
      if (!video) return;
      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          video.paused ? await video.play() : video.pause();
          break;
        case "arrowleft":
          video.currentTime -= 10;
          break;
        case "arrowright":
          video.currentTime += 10;
          break;
        case "m":
          video.muted = !video.muted;
          setMuted(video.muted);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      video.paused ? await video.play() : video.pause();
    } catch (err) {
      console.error(err);
    }
  };

  const seek = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime += seconds;
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled) return;
    try {
      document.pictureInPictureElement
        ? await document.exitPictureInPicture()
        : await video.requestPictureInPicture();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      document.fullscreenElement
        ? await document.exitFullscreen()
        : await video.requestFullscreen();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative bg-black rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        className="w-full aspect-video"
        preload="metadata"
        playsInline
        onLoadedMetadata={(e) => {
          const d = e.target.duration;
          if (!isNaN(d)) setDuration(d);
        }}
        onTimeUpdate={(e) => setProgress(e.target.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3">

        {/* Progress bar */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={progress}
          onChange={(e) => {
            const val = Number(e.target.value);
            setProgress(val);
            if (videoRef.current) videoRef.current.currentTime = val;
          }}
          className="w-full mb-2 accent-violet-500"
        />

        {/* Buttons row */}
        <div className="flex items-center gap-3 text-white text-sm">

          {/* Play/Pause */}
          <button onClick={togglePlay} className="hover:text-violet-400 transition-colors">
            {playing ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* Rewind 10s */}
          <button onClick={() => seek(-10)} className="hover:text-violet-400 transition-colors text-xs border border-white/30 rounded px-1">
            -10s
          </button>

          {/* Forward 10s */}
          <button onClick={() => seek(10)} className="hover:text-violet-400 transition-colors text-xs border border-white/30 rounded px-1">
            +10s
          </button>

          {/* Mute */}
          <button
            onClick={() => {
              const next = !muted;
              setMuted(next);
              if (videoRef.current) videoRef.current.muted = next;
            }}
            className="hover:text-violet-400 transition-colors"
          >
            {muted ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18L19 19.27 20.27 18 5.27 3 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            )}
          </button>

          {/* Volume slider */}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              if (videoRef.current) videoRef.current.volume = v;
            }}
            className="w-20 accent-violet-500"
          />

          {/* Time */}
          <span className="text-xs text-slate-300 min-w-[80px]">
            {formatTime(progress)} / {formatTime(duration)}
          </span>

          {/* Playback speed */}
          <select
            value={playbackRate}
            onChange={(e) => {
              const rate = Number(e.target.value);
              setPlaybackRate(rate);
              if (videoRef.current) videoRef.current.playbackRate = rate;
            }}
            className="bg-slate-800 text-white text-xs rounded px-1 py-0.5 border border-white/20"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>

          {/* PiP */}
          <button onClick={togglePiP} className="hover:text-violet-400 transition-colors ml-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3C1.9 3 1 3.88 1 4.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/>
            </svg>
          </button>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="hover:text-violet-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
          </button>

        </div>
      </div>
    </div>
  );
}