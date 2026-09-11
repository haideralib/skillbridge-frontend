import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use((config) => {
    const storedAuth = localStorage.getItem("skillbridge-auth");

    if (storedAuth) {
        const token = JSON.parse(storedAuth).state?.user?.token as string | undefined;
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});