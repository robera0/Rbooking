import axios from "axios";

// Use empty string in dev to leverage Vite's proxy, otherwise use env variable
const baseURL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");

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
