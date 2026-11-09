import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, LoaderCircle } from "lucide-react";

const formatTime = (time) => {
  if (!Number.isFinite(time) || time < 0) return "0:00";

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const SwarAudioPlayer = ({ src, autoPlay = false, compact = false }) => {
  const audioRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Reset and load audio whenever the source changes.
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;

    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(false);
    setLoading(Boolean(src));

    if (!src) {
      audio.removeAttribute("src");
      audio.load();
      return;
    }

    audio.load();

    return () => {
      audio.pause();
    };
  }, [src]);

  // Handle audio events.
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setLoading(false);
      setError(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleDurationChange = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handlePlay = () => {
      setPlaying(true);
      setLoading(false);
    };

    const handlePause = () => {
      setPlaying(false);
    };

    const handleWaiting = () => {
      if (!audio.paused) {
        setLoading(true);
      }
    };

    const handleCanPlay = () => {
      setLoading(false);
      setError(false);
    };

    const handleEnded = () => {
      audio.currentTime = 0;
      setPlaying(false);
      setCurrentTime(0);
      setLoading(false);
    };

    const handleError = () => {
      setPlaying(false);
      setLoading(false);
      setError(true);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  // Keep audio volume synchronized.
  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  // Autoplay when requested.
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !src || !autoPlay) return;

    const attemptPlay = async () => {
      try {
        await audio.play();
      } catch {
        setPlaying(false);
        setLoading(false);
      }
    };

    attemptPlay();
  }, [src, autoPlay]);

  const togglePlay = async () => {
    const audio = audioRef.current;

    if (!audio || !src || error) return;

    if (audio.paused) {
      try {
        setLoading(true);
        await audio.play();
      } catch {
        setPlaying(false);
        setLoading(false);
      }
    } else {
      audio.pause();
    }
  };

  const handleSeek = (event) => {
    const value = Number(event.target.value);
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(value) || !Number.isFinite(audio.duration)) {
      return;
    }

    const safeValue = Math.max(0, Math.min(value, audio.duration));

    audio.currentTime = safeValue;
    setCurrentTime(safeValue);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);
    } else {
      setVolume(previousVolume || 1);
    }
  };

  const handleVolumeChange = (event) => {
    const value = Number(event.target.value);

    if (!Number.isFinite(value)) return;

    const safeValue = Math.max(0, Math.min(1, value));

    setVolume(safeValue);

    if (safeValue > 0) {
      setPreviousVolume(safeValue);
    }
  };

  const progress =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      className={`w-full ${compact ? "py-1" : "py-2"}`}
      onClick={(event) => event.stopPropagation()}
    >
      <audio ref={audioRef} src={src || undefined} preload="metadata" />

      {/* Playback controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          disabled={!src || error}
          aria-label={playing ? "Pause audio" : "Play audio"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all duration-200 hover:bg-[#7C3AED] hover:shadow-[0_0_20px_rgba(139,92,246,0.35)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <LoaderCircle size={19} className="animate-spin" />
          ) : playing ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" className="ml-0.5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            onChange={handleSeek}
            disabled={!duration || error}
            aria-label="Audio progress"
            className="swar-audio-range h-1.5 w-full cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: `linear-gradient(to right, #8B5CF6 ${progress}%, rgba(255,255,255,0.12) ${progress}%)`,
            }}
          />

          <div className="mt-1.5 flex justify-between text-[10px] font-medium tabular-nums text-white/40">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleMute}
          aria-label={volume === 0 ? "Unmute audio" : "Mute audio"}
          className="shrink-0 text-white/40 transition-colors hover:text-[#A78BFA]"
        >
          {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {!compact && (
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Volume"
            className="swar-audio-range hidden h-1 w-16 cursor-pointer sm:block"
            style={{
              background: `linear-gradient(to right, #8B5CF6 ${volume * 100}%, rgba(255,255,255,0.12) ${volume * 100}%)`,
            }}
          />
        )}
      </div>

      {/* Playback error */}
      {error && (
        <p className="mt-2 text-xs text-red-400">
          Unable to play this audio. Please try again later.
        </p>
      )}

      {/* Custom range styling */}
      <style>{`
        .swar-audio-range {
          accent-color: #8B5CF6;
        }

        .swar-audio-range::-webkit-slider-thumb {
          appearance: none;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: #C4B5FD;
          border: 2px solid #8B5CF6;
          box-shadow: 0 0 8px rgba(139, 92, 246, 0.35);
          cursor: pointer;
        }

        .swar-audio-range::-moz-range-thumb {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #C4B5FD;
          border: 2px solid #8B5CF6;
          box-shadow: 0 0 8px rgba(139, 92, 246, 0.35);
          cursor: pointer;
        }

        .swar-audio-range:disabled::-webkit-slider-thumb {
          cursor: not-allowed;
          opacity: 0.4;
        }
      `}</style>
    </div>
  );
};

export default SwarAudioPlayer;
