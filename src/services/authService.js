import axios from "axios";

const API = "/api/auth";

export const authService = {
  async signUp(email, password, { name, companyName, country }) {
    const res = await axios.post(`${API}/signup`, {
      name,
      email,
      password,
      companyName,
      country,
    });
    return res.data;
  },

  async signIn(email, password) {
    const res = await axios.post(`${API}/login`, { email, password });
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }
    return res.data.user;
  },

  async signOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  async getCurrentUser() {
    const user = localStorage.getItem("user");
    if (user) return JSON.parse(user);
    return null;
  },

  onAuthStateChange() {
    // No real-time auth state in JWT, so just a no-op
    return () => {};
  },
};
