import axios from "axios";
import { COUNTRIES } from "../lib/constants";

export const companyService = {
  async createCompany(companyData) {
    const country = COUNTRIES.find((c) => c.code === companyData.country);
    const currency = country ? country.currency : "USD";
    const res = await axios.post("/api/companies", {
      name: companyData.name,
      country: companyData.country,
      currency,
      approvalConfig: companyData.approval_config || {},
    });
    return res.data;
  },

  async getCompanyById(companyId) {
    const res = await axios.get(`/api/companies/${companyId}`);
    return res.data;
  },

  async updateCompany(companyId, updates) {
    const res = await axios.put(`/api/companies/${companyId}`, {
      name: updates.name,
      country: updates.country,
      currency: updates.currency,
      approvalConfig: updates.approval_config,
    });
    return res.data;
  },
};
