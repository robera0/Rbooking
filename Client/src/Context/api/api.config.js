import axios from "axios";

// Always use a relative baseURL so requests go through the same origin as
// the frontend (Vite's dev proxy locally, Netlify's /api/* redirect in
// production). This keeps the auth cookie first-party — iOS Safari/Chrome
// (WebKit) blocks third-party cookies entirely, which broke login on
// iPhone when this pointed straight at the cross-site backend domain.
const baseURL = "";

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
