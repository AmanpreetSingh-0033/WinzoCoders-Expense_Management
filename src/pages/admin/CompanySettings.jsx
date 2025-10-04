import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { companyService } from "../../services/companyService";
import { showNotification } from "../../components/Notification";
import { COUNTRIES, CURRENCIES } from "../../lib/constants";

export const CompanySettings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    currency: "",
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadCompanyData();
  }, [user]);

  const loadCompanyData = async () => {
    try {
      setInitialLoading(true);
      if (user?.company_id) {
        const company = await companyService.getCompanyById(user.company_id);
        setFormData({
          name: company.name,
          country: company.country,
          currency: company.currency,
        });
      }
    } catch (error) {
      showNotification("Failed to load company settings", "error");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await companyService.updateCompany(user.company_id, formData);
      showNotification("Company settings updated successfully", "success");
    } catch (error) {
      showNotification(error.message || "Failed to update settings", "error");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: "700px" }}>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "8px",
          color: "#1f2937",
        }}
      >
        Company Settings
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        Manage your company information and preferences
      </p>

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Company Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              style={inputStyle}
              placeholder="Your Company Name"
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Country *</label>
            <select
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              required
              style={inputStyle}
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={labelStyle}>Default Currency *</label>
            <select
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value })
              }
              required
              style={inputStyle}
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.name} ({curr.code}) - {curr.symbol}
                </option>
              ))}
            </select>
            <div
              style={{ fontSize: "13px", color: "#6b7280", marginTop: "8px" }}
            >
              All expenses will be converted to this currency for reporting
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              backgroundColor: "#f0f9ff",
              borderRadius: "8px",
              borderLeft: "4px solid #2563eb",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#1e40af",
                marginBottom: "8px",
              }}
            >
              Company Information
            </div>
            <div style={{ fontSize: "13px", color: "#1e3a8a" }}>
              <div style={{ marginBottom: "4px" }}>
                <strong>Total Users:</strong>{" "}
                {user?.companies?.users?.length || "N/A"}
              </div>
              <div style={{ marginBottom: "4px" }}>
                <strong>Company ID:</strong> {user?.company_id}
              </div>
              <div>
                <strong>Created:</strong>{" "}
                {new Date(user?.companies?.created_at).toLocaleDateString() ||
                  "N/A"}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) =>
              !loading && (e.target.style.backgroundColor = "#1d4ed8")
            }
            onMouseOut={(e) =>
              !loading && (e.target.style.backgroundColor = "#2563eb")
            }
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: "500",
  marginBottom: "6px",
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
};
