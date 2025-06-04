import { useCallback, useEffect, useRef, useState } from "react";

export function useMediaPlayback(meeting) {
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentVideoPath, setCurrentVideoPath] = useState(null);

  const audioStart = new Date(meeting.start_time).getTime() / 1000;

  useEffect(() => {
    let animationFrameId;
    const update = () => {
      if (!audioRef.current) return;

      const time = audioRef.current.currentTime;
      setCurrentTime(time);

      const active = meeting.video_content.find((item) => {
        const video_start =
          new Date(item.start_time).getTime() / 1000 - audioStart;
        const video_end = new Date(item.end_time).getTime() / 1000 - audioStart;
        return time >= video_start && time < video_end;
      });

      const newPath = active?.video_path ?? null;
      setCurrentVideoPath(newPath);
      animationFrameId = requestAnimationFrame(update);
    };

    update();

    return () => cancelAnimationFrame(animationFrameId);
  }, [meeting]);

  const handlePlay = useCallback(() => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio || !video) return;

    video.currentTime = audio.currentTime;
    if (video.paused) {
      video.play().catch((err) => {
        console.warn(err);
      });
    }
  }, []);

  const handlePause = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;

    if (!audio || !video) return;

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  function syncVideoWithAudio({ video, audio, currentVideoPath }) {
    if (!video || !audio) return;

    if (currentVideoPath) {
      const fullSrc = window.location.origin + currentVideoPath;

      if (video.src !== fullSrc) {
        video.src = fullSrc;
        video.load();

        video.onloadedmetadata = () => {
          video.currentTime = audio.currentTime;

          if (!audio.paused) {
            video.play().catch(() => {});
          } else {
            video.pause();
            video.currentTime = audio.currentTime;
          }
        };
      } else {
        video.currentTime = audio.currentTime;
      }
    } else {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  }

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    syncVideoWithAudio({ video, audio, currentVideoPath });
  }, [currentVideoPath, currentTime]);

  return {
    audioRef,
    videoRef,
    currentTime,
    currentVideoPath,
  };
}
