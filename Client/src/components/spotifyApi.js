// One Spotify IFrame API script per page, shared by every player/button.
let apiPromise;

export const getSpotifyApi = () => {
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const previous = window.onSpotifyIframeApiReady;
      window.onSpotifyIframeApiReady = (api) => {
        if (typeof previous === "function") previous(api);
        resolve(api);
      };
      const script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      document.body.appendChild(script);
    });
  }
  return apiPromise;
};
