// A single playback controller per track, shared by the visible player and any
// play buttons on the page, so two players can never play the same song at once.
const registry = new Map();
const states = new Map();
const listeners = new Map();

const keyFor = (type, id) => `${type}:${id}`;

export const hasSpotifyController = (type, id) => registry.has(keyFor(type, id));
export const isSpotifyPlaying = (type, id) => states.get(keyFor(type, id)) || false;

export const setSpotifyPlaying = (type, id, playing) => {
  const key = keyFor(type, id);
  states.set(key, playing);
  (listeners.get(key) || []).forEach((fn) => fn(playing));
};

export const registerSpotifyController = (type, id, controller) => {
  registry.set(keyFor(type, id), controller);
  setSpotifyPlaying(type, id, false);
};

export const unregisterSpotifyController = (type, id) => {
  const key = keyFor(type, id);
  if (!registry.has(key)) return;
  registry.delete(key);
  states.delete(key);
  (listeners.get(key) || []).forEach((fn) => fn(false));
};

export const toggleSpotify = (type, id) => {
  const controller = registry.get(keyFor(type, id));
  if (!controller) return;
  if (isSpotifyPlaying(type, id)) controller.pause?.();
  else controller.play?.();
};

export const subscribeSpotify = (type, id, fn) => {
  const key = keyFor(type, id);
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key).add(fn);
  fn(isSpotifyPlaying(type, id));
  return () => listeners.get(key)?.delete(fn);
};
