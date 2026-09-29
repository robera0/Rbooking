import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "leaflet/dist/leaflet.css";

// Fire-and-forget warm-up ping for the backend, which can take a few
// seconds to spin up an idle process back up (Passenger on cPanel does
// this too, not just Render's free tier). Firing this as early as
// possible (before React even mounts) gives it a head start while the
// user is still looking at the page, so by the time they submit
// login/OAuth it's already warm instead of the delay happening - and
// looking like nothing happened - during that request itself. Must be an
// absolute URL: the backend lives on its own subdomain (api.paysso.et),
// not the same origin as this app.
fetch(`${import.meta.env.VITE_API_URL || ""}/api/health`).catch(() => {});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
