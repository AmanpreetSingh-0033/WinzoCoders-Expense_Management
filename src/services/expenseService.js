import axios from "axios";

export const expenseService = {
  async createExpense(expenseData) {
    const res = await axios.post("/api/expenses", expenseData);
    return res.data;
  },

  async getExpenses(params = {}) {
    const res = await axios.get("/api/expenses", { params });
    return res.data;
  },

  async getExpenseById(id) {
    const res = await axios.get(`/api/expenses/${id}`);
    return res.data;
  },

  async updateExpense(id, updates) {
    const res = await axios.put(`/api/expenses/${id}`, updates);
    return res.data;
  },

  async deleteExpense(id) {
    const res = await axios.delete(`/api/expenses/${id}`);
    return res.data;
  },

  async getPendingApprovals(approverId) {
    const res = await axios.get("/api/expenses", {
      params: {
        status: "pending",
        approverId: approverId,
      },
    });
    return res.data;
  },

  async approveExpense(expenseId, approverId, comment) {
    const res = await axios.post(`/api/expenses/${expenseId}/approve`, {
      approverId,
      comment,
      action: "approved",
    });
    return res.data;
  },

  async rejectExpense(expenseId, approverId, comment) {
    const res = await axios.post(`/api/expenses/${expenseId}/reject`, {
      approverId,
      comment,
      action: "rejected",
    });
    return res.data;
  },
};
