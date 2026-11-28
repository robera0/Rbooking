import { buildSpotifyEmbedUrl } from "@/lib/spotify";

// Renders nothing unless both values are valid. The src is always built from
// the validated type + id, never from anything the organizer pasted.
const SpotifyEmbed = ({ spotifyType, spotifyId }) => {
  const src = buildSpotifyEmbedUrl(spotifyType, spotifyId);
  if (!src) return null;

  const type = String(spotifyType).toLowerCase();
  const height = type === "track" ? 152 : 352;

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-black/20">
      <iframe
        title="Spotify player"
        src={src}
        width="100%"
        height={height}
        frameBorder="0"
        style={{ border: 0 }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="block w-full max-w-full"
      />
    </div>
  );
};

export default SpotifyEmbed;
