import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { buildSpotifyEmbedUrl } from "@/lib/spotify";
import { getSpotifyApi } from "./spotifyApi";
import {
  registerSpotifyController,
  unregisterSpotifyController,
  setSpotifyPlaying,
  subscribeSpotify,
  toggleSpotify,
} from "./spotifyControl";

// The API gives us a controller whose play()/pause() can be driven by our own
// button (a plain iframe cannot be clicked from outside its origin).

// Renders nothing unless both values are valid. The src/uri is always built
// from the validated type + id, never from an organizer's raw pasted URL.
const SpotifyEmbed = ({ spotifyType, spotifyId, label = "Soundtrack", glow = false, hidden = false }) => {
  const embedUrl = buildSpotifyEmbedUrl(spotifyType, spotifyId);
  const type = String(spotifyType).toLowerCase();
  const height = type === "track" ? 152 : 352;

  const hostRef = useRef(null);
  const controllerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  // A plain Spotify iframe is shown until the API controller takes over, so
  // there is always a working player even if the API script is blocked.
  const [plainIframe, setPlainIframe] = useState(true);

  useEffect(
    () => subscribeSpotify(type, spotifyId, setPlaying),
    [type, spotifyId],
  );

  useEffect(() => {
    if (!embedUrl) return undefined;
    let cancelled = false;
    setReady(false);
    setPlainIframe(true);

    getSpotifyApi().then((api) => {
      if (cancelled || !hostRef.current) return;
      const mount = document.createElement("div");
      hostRef.current.appendChild(mount);
      api.createController(
        mount,
        { uri: `spotify:${type}:${spotifyId}`, height },
        (controller) => {
          if (cancelled) {
            controller.destroy?.();
            return;
          }
          controllerRef.current = controller;
          controller.addListener("playback_update", (event) => {
            setSpotifyPlaying(type, spotifyId, !event.data.isPaused);
          });
          registerSpotifyController(type, spotifyId, controller);
          setReady(true);
          setPlainIframe(false);
        },
      );
    });

    return () => {
      cancelled = true;
      unregisterSpotifyController(type, spotifyId);
      controllerRef.current?.destroy?.();
      controllerRef.current = null;
      const host = hostRef.current;
      if (host) while (host.firstChild) host.removeChild(host.firstChild);
    };
  }, [embedUrl, type, spotifyId]);

  const toggle = () => toggleSpotify(type, spotifyId);

  if (!embedUrl) return null;

  // On the event page the player lives off-screen: the cover's now-playing
  // bar drives it, so no separate Soundtrack section is needed.
  if (hidden) {
    return (
      <div
        ref={hostRef}
        aria-hidden="true"
        className="spotify-embed-host pointer-events-none fixed bottom-0 right-0 z-0 h-[200px] w-[400px] overflow-hidden opacity-0"
      />
    );
  }

  return (
    <div
      className={
        glow
          ? "relative mt-4 rounded-2xl border border-[#FF7A00]/30 bg-[#15171a] p-2 shadow-[0_0_0_1px_rgba(255,122,0,0.08),0_0_30px_rgba(255,122,0,0.22)]"
          : "w-full max-w-full"
      }
    >
      {glow && (
        <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[#FF7A00]/10 blur-2xl" />
      )}
      <div className="relative z-10">
        <div className="mb-2 flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <span className="h-4 w-[3px] rounded-full bg-[#FF7A00]" />
            <span
              className={`text-[#FF7A00] ${glow ? "text-[10px] font-extrabold uppercase tracking-[0.2em]" : "text-[11px] font-bold uppercase tracking-[0.24em]"}`}
            >
              {label}
            </span>
          </div>
          {ready && !plainIframe && (
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause music" : "Play music"}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF7A00] text-black shadow-lg shadow-black/30 transition hover:scale-105 active:scale-95"
            >
              {playing ? (
                <Pause size={16} fill="currentColor" />
              ) : (
                <Play size={16} fill="currentColor" className="ml-0.5" />
              )}
            </button>
          )}
        </div>

        <div className="w-full max-w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-black/20">
          <div ref={hostRef} className="spotify-embed-host w-full" />
          {plainIframe && (
            <iframe
              title="Spotify player"
              src={embedUrl}
              width="100%"
              height={height}
              frameBorder="0"
              style={{ border: 0 }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="block w-full max-w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotifyEmbed;
