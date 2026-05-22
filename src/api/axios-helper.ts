/**
 * Axios Helper
 * Configured axios instance for API calls
 */

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://https://orca-app-s8tpj.ondigitalocean.app/";

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url || "";
      const isAuthEndpoint = url.startsWith("/auth");
      const isLoginPage =
        typeof window !== "undefined" && window.location.pathname === "/login";

      switch (status) {
        case 401:
          if (!isAuthEndpoint && !isLoginPage) {
            localStorage.removeItem("authToken");
            // Use replace to avoid back-button returning to authed page
            window.location.replace("/login");
          }
          break;
        case 403:
          console.error("Access forbidden");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          console.error("API error:", error.response.data);
      }
    } else if (error.request) {
      console.error("No response from server");
    } else {
      console.error("Request error:", error.message);
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
