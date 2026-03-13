import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const errorCode = error.response?.data?.errorCode;
        const originalRequest = error.config;

        if (
            (errorCode === "InvalidAccessToken" || errorCode === "NotAuthenticated") &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            try {
                await api.get("/auth/refresh");
                return api(originalRequest);
            } catch {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;