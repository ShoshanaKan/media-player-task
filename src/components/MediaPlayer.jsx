import { useMediaSync } from "../hooks/useMediaPlayback";

export default function MediaPlayer({ meeting }) {
  const { audioRef, videoRef } = useMediaSync(meeting);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-md space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div
          className="flex-1 bg-black aspect-video relative rounded-md overflow-hidden"
          style={{ height: "400px" }}
        >
          <video ref={videoRef} className="w-full h-full object-contain" />
        </div>
      </div>

      <audio
        ref={audioRef}
        src={meeting.audio_content}
        controls
        className="w-full"
      />
    </div>
  );
}
