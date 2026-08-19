import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * A fetch wrapper that automatically attempts to refresh the access token
 * if the request returns a 401 Unauthorized status.
 */
export const fetchWithAuth = async (url, options = {}) => {
  const finalOptions = {
    ...options,
    credentials: options.credentials || "include",
  };

  let res = await fetch(url, finalOptions);

  if (res.status === 401) {
    try {
      const refreshRes = await fetch(`${API_URL}/api/auth/tokens`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        // Retry the original request
        res = await fetch(url, finalOptions);
      }
    } catch (error) {
      console.error("Token refresh failed", error);
    }
  }

  return res;
};

/**
 * An axios instance that automatically intercepts 401 responses
 * and attempts to refresh the token before retrying.
 */
export const axiosWithAuth = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosWithAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(
          `${API_URL}/api/auth/tokens`,
          {},
          { withCredentials: true }
        );
        return axiosWithAuth(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
