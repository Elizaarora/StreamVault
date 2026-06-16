import YoutubePlayer from "./YoutubePlayer";
import Html5Player from "./Html5Player";

export default function VideoPlayer({ url }) {
  const isYoutube =
    url.includes("youtube.com") ||
    url.includes("youtu.be");

  return isYoutube ? (
    <YoutubePlayer url={url} />
  ) : (
    <Html5Player url={url} />
  );
}