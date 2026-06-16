import { Suspense } from "react";
import ReactPlayer from "react-player/youtube";

export default function YoutubePlayer({ url }) {
  return (
    <div className="aspect-video">
      <Suspense fallback={<div className="w-full h-full bg-black" />}>
        <ReactPlayer
          url={url}
          controls
          width="100%"
          height="100%"
        />
      </Suspense>
    </div>
  );
}