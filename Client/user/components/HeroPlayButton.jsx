import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { buildSpotifyEmbedUrl } from "@/lib/spotify";
import {
  hasSpotifyController,
  subscribeSpotify,
  toggleSpotify,
} from "@/components/spotifyControl";

// Play control on the event cover. While playing it becomes a glassy
// now-playing bar like the organizer's cover art; it drives the same hidden
// Spotify controller for the page.
const HeroPlayButton = ({ spotifyType, spotifyId, title, tint }) => {
  const glassStyle = tint
    ? {
        backgroundColor: `rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, 0.38)`,
        borderColor: `rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, 0.65)`,
      }
    : undefined;
  const valid = buildSpotifyEmbedUrl(spotifyType, spotifyId);
  const type = String(spotifyType).toLowerCase();
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(
    () =>
      subscribeSpotify(type, spotifyId, (isPlaying) => {
        setPlaying(isPlaying);
        setReady(hasSpotifyController(type, spotifyId));
      }),
    [type, spotifyId],
  );

  if (!valid || !ready) return null;

  if (playing) {
    return (
      <div
        style={glassStyle}
        className="absolute inset-x-4 bottom-4 z-20 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5 text-white shadow-lg shadow-black/20 backdrop-blur-xl backdrop-saturate-150 sm:inset-x-6 sm:bottom-6"
      >
        <span className="eq-bars flex h-4 w-4 shrink-0 items-end justify-center gap-[2px]" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold">
          {title || "Now playing"}
        </span>
        <button
          type="button"
          onClick={() => toggleSpotify(type, spotifyId)}
          aria-label="Pause music"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20 active:scale-95"
        >
          <Pause size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleSpotify(type, spotifyId)}
      aria-label="Play music"
      style={glassStyle}
      className="absolute bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg shadow-black/20 backdrop-blur-xl backdrop-saturate-150 transition hover:bg-white/20 active:scale-95 sm:bottom-6 sm:right-6"
    >
      <Play size={18} strokeWidth={1.8} className="ml-0.5" />
    </button>
  );
};

export default HeroPlayButton;
