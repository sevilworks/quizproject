import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

// Configuration d'Axios avec intercepteur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token JWT aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  // Inscription
  async signup(userData) {
    try {
      const endpoint = userData.role === 'student' ? '/register/student' : '/register/professor';
      const payload = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName
      };
      const response = await api.post(endpoint, payload);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      throw error;
    }
  },

  // Connexion
  async login(username, password) {
    try {
      const response = await api.post("/login", { username, password });
      
      // Handle different response structures
      const { token, user, role, message, emailVerificationRequired, verified } = response.data;

      // Removed email verification check - users can login without email verification
      console.log("Login successful for user:", user.username);

      // Sauvegarder les informations dans localStorage
      if (token) {
        console.log("Login response - user data:", user);
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("username", user.username);
        localStorage.setItem("email", user.email);
        localStorage.setItem("role", role);
        localStorage.setItem("firstName", user.firstName || "");
        localStorage.setItem("lastName", user.lastName || "");
        // Store verification status
        localStorage.setItem("emailVerified", verified !== false ? "true" : "false");
      }

      return response.data;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  },

  // Vérification d'email avec token (GET request with query parameter)
  async verifyEmail(token) {
    try {
      const response = await api.get(`/verify-email?token=${encodeURIComponent(token)}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la vérification d'email:", error);
      throw error;
    }
  },

  // Renvoyer l'email de vérification
  async resendVerificationEmail(email) {
    try {
      const response = await api.post("/resend-verification", { email });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de vérification:", error);
      throw error;
    }
  },

  // ========== PASSWORD RESET METHODS - Not implemented in backend ==========

  // Demander une réinitialisation de mot de passe
  async requestPasswordReset(email) {
    console.warn("Password reset not implemented in backend");
    return { message: "Password reset not available" };
  },

  // Valider le token de réinitialisation
  async validateResetToken(token) {
    console.warn("Password reset token validation not implemented in backend");
    return { valid: false };
  },

  // Réinitialiser le mot de passe
  async resetPassword(token, newPassword) {
    console.warn("Password reset not implemented in backend");
    return { message: "Password reset not available" };
  },

  // ========== END PASSWORD RESET METHODS ==========

  // Déconnexion - Note: Backend doesn't have logout endpoint, just clear localStorage
  async logout() {
    try {
      // Nettoyer le localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      localStorage.removeItem("firstName");
      localStorage.removeItem("lastName");
      window.location.href = "/";

      return true;
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      localStorage.clear();
      throw error;
    }
  },

  // Rafraîchir le token - Note: Backend doesn't have refresh token endpoint
  async refreshToken() {
    console.warn("Token refresh not implemented in backend");
    throw new Error("Token refresh not available");
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    const token = localStorage.getItem("token");
    return !!token;
  },

  // Obtenir les informations de l'utilisateur connecté
  getCurrentUser() {
    return {
      userId: localStorage.getItem("userId"),
      username: localStorage.getItem("username"),
      email: localStorage.getItem("email"),
      role: localStorage.getItem("role"),
      firstName: localStorage.getItem("firstName"),
      lastName: localStorage.getItem("lastName"),
    };
  },

  // Obtenir le rôle de l'utilisateur
  getUserRole() {
    return localStorage.getItem("role");
  },

  // Redirection selon le rôle
  redirectToDashboard(role) {
    if (role === "STUDENT") {
      window.location.href = "/student/dashboard";
    } else if (role === "PROFESSOR_FREE" || role === "PROFESSOR_VIP") {
      window.location.href = "/professor/dashboard";
    } else if (role === "ADMIN") {
      window.location.href = "/admin/dashboard";
    } else {
      window.location.href = "/";
    }
  },

  // Get current user info
  async getMe() {
    try {
      const response = await api.get("/me");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des infos utilisateur:", error);
      throw error;
    }
  },
};

export default authService;
