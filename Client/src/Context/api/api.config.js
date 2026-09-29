import axios from "axios";

// Hosting is now cPanel: the frontend (paysso.et) and backend
// (api.paysso.et) are separate subdomains, not separate sites, so there's
// no same-origin proxy in front of the API the way Netlify's /api/*
// redirect provided. Browsers - including Safari's ITP - treat same
// registrable-domain subdomains as first-party, so a direct cross-subdomain
// request with SameSite=None;Secure cookies works fine here without one.
const baseURL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/api/auth/login") &&
      !originalRequest.url.includes("/api/auth/tokens")
    ) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${baseURL}/api/auth/tokens`,
          {},
          { withCredentials: true },
        );

        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
