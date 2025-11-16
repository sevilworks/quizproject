import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log("📤 Request:", config.method.toUpperCase(), config.url);
    console.log("🔑 Token présent:", !!token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Authorization header ajouté");
    } else {
      console.warn("⚠️ Aucun token trouvé dans localStorage");
    }

    return config;
  },
  (error) => {
    console.error("❌ Erreur dans request interceptor:", error);
    return Promise.reject(error);
  }
);

// Interceptor pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    console.log("✅ Réponse reçue:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ Erreur de réponse:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
    });

    if (error.response?.status === 401) {
      console.error("🚫 Token expiré ou invalide");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      console.error("🚫 Accès refusé - Vérifiez les autorisations");
    }

    return Promise.reject(error);
  }
);

export default api;
