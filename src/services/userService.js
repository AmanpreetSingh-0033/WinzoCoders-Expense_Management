import axios from "axios";

export const userService = {
  async getUsers() {
    const res = await axios.get("/api/users");
    return res.data;
  },

  async getUserById(userId) {
    const res = await axios.get(`/api/users/${userId}`);
    return res.data;
  },

  async createUser(userData) {
    const res = await axios.post("/api/users", userData);
    return res.data;
  },

  async updateUser(userId, updates) {
    const res = await axios.put(`/api/users/${userId}`, updates);
    return res.data;
  },

  async deleteUser(userId) {
    const res = await axios.delete(`/api/users/${userId}`);
    return res.data;
  },
};
