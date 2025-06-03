import { useEffect, useRef, useState } from "react";

export function useMediaSync(meeting) {
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

  useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;

    if (!audio || !video) return;

    const syncVideoToAudio = () => {
      video.currentTime = audio.currentTime;
    };

    const handlePlay = () => {
      syncVideoToAudio();
      if (video.paused) {
        video.play().catch(() => {});
      }
    };

    const handlePause = () => {
      video.pause();
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

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
  }, [currentVideoPath, currentTime]);

  return {
    audioRef,
    videoRef,
    currentTime,
    currentVideoPath,
  };
}
