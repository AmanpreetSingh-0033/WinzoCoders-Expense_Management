import axios from "axios";

export const approvalRuleService = {
  async createRule(ruleData) {
    const res = await axios.post("/api/approval-rules", ruleData);
    return res.data;
  },

  async getRules(companyId) {
    const res = await axios.get(`/api/approval-rules?company_id=${companyId}`);
    return res.data;
  },

  async getRuleById(ruleId) {
    const res = await axios.get(`/api/approval-rules/${ruleId}`);
    return res.data;
  },

  async updateRule(ruleId, updates) {
    const res = await axios.put(`/api/approval-rules/${ruleId}`, updates);
    return res.data;
  },

  async deleteRule(ruleId) {
    const res = await axios.delete(`/api/approval-rules/${ruleId}`);
    return res.data;
  },

  async toggleRuleStatus(ruleId, isActive) {
    const res = await axios.patch(`/api/approval-rules/${ruleId}`, {
      is_active: isActive,
    });
    return res.data;
  },
};
