import { forwardRef, useImperativeHandle, useState } from "react";
import { Play } from "lucide-react";
import { InputBox } from "@/components/form/InputBox";
import SpotifyEmbed from "@/components/SpotifyEmbed";
import { parseSpotifyUrl, INVALID_SPOTIFY_MESSAGE } from "@/lib/spotify";

// Optional Spotify link on the create/edit form. Validation is local to this
// field; the rest of the event can always be saved, even when the link is bad.
// The parent gets a ref so it can run the same validation on submit and drop
// the value from the payload.
const MusicField = forwardRef(function MusicField({ value, onChange }, ref) {
  const [error, setError] = useState("");
  const parsed = parseSpotifyUrl(value);

  const validate = (clearIfInvalid = false) => {
    const found = parseSpotifyUrl(value);
    const message =
      typeof value === "string" && value.trim() && !found
        ? INVALID_SPOTIFY_MESSAGE
        : "";
    setError(message);
    // On submit, an invalid link is simply dropped. On blur we keep the text
    // so the organizer can correct it.
    if (message && clearIfInvalid) onChange("");
    return found;
  };

  useImperativeHandle(
    ref,
    () => ({
      validate: () => validate(false),
      validateForSave: () => validate(true),
    }),
    [value, onChange],
  );

  return (
    <div>
      <InputBox
        id="spotify-link"
        label="Add music (Spotify link)"
        value={value ?? ""}
        placeholder="https://open.spotify.com/track/..."
        error={error}
        reserveError={false}
        onChange={(e) => {
          setError("");
          onChange(e.target.value);
        }}
        onBlur={() => validate(false)}
      />

      {/* Live preview for the organizer. Same player buyers see, with the
          app's signature orange glow around it. */}
      {parsed && (
        <div className="relative mt-4 rounded-2xl border border-[#FF7A00]/30 bg-[#15171a] p-2 shadow-[0_0_0_1px_rgba(255,122,0,0.08),0_0_30px_rgba(255,122,0,0.22)]">
          <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[#FF7A00]/10 blur-2xl" />
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2 px-1">
              <Play size={12} className="text-[#FF7A00]" fill="#FF7A00" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#FF7A00]">
                Preview
              </span>
            </div>
            <SpotifyEmbed
              spotifyType={parsed.type}
              spotifyId={parsed.id}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default MusicField;
