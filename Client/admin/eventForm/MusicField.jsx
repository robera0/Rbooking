import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { InputBox } from "@/components/form/InputBox";
import SpotifyEmbed from "@/components/SpotifyEmbed";
import {
  parseSpotifyUrl,
  fetchSpotifyTitle,
  INVALID_SPOTIFY_MESSAGE,
} from "@/lib/spotify";

// Optional Spotify link on the create/edit form. Validation is local to this
// field; the rest of the event can always be saved, even when the link is bad.
// The parent gets a ref so it can run the same validation on submit and drop
// the value from the payload.
const MusicField = forwardRef(function MusicField(
  { value, onChange, title, onTitleChange },
  ref,
) {
  const [error, setError] = useState("");
  const parsed = parseSpotifyUrl(value);
  const lastKeyRef = useRef("");
  const manualRef = useRef(false);

  // Fill the cover label from Spotify's public oEmbed data whenever a new
  // valid link is pasted. A label the organizer edits by hand is never
  // overwritten.
  useEffect(() => {
    const key = parsed ? `${parsed.type}:${parsed.id}` : "";
    if (key === lastKeyRef.current) return undefined;
    const first = lastKeyRef.current === "";
    lastKeyRef.current = key;
    manualRef.current = false;
    if (!first) onTitleChange?.("");
    if (!parsed || (first && title)) return undefined;

    const controller = new AbortController();
    fetchSpotifyTitle(parsed.type, parsed.id, controller.signal)
      .then((found) => {
        if (!manualRef.current && found) onTitleChange?.(found);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [parsed?.type, parsed?.id]);

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

      <InputBox
        id="spotify-title"
        label="Song label (filled from the link)"
        value={title ?? ""}
        maxLength={120}
        reserveError={false}
        placeholder="Filled automatically — edit to override"
        onChange={(e) => {
          manualRef.current = true;
          onTitleChange?.(e.target.value);
        }}
      />

      {/* Live preview for the organizer. Same player buyers see (including
          the orange play button), with the app's signature orange glow. */}
      {parsed && (
        <SpotifyEmbed
          spotifyType={parsed.type}
          spotifyId={parsed.id}
          label="Preview"
          glow
        />
      )}
    </div>
  );
});

export default MusicField;
