import ReactPlayer from "react-player";

export default function YoutubePlayer({ url }) {
  return (
    <div className="aspect-video">
      <ReactPlayer
        url={url}
        controls
        width="100%"
        height="100%"
      />
    </div>
  );
}