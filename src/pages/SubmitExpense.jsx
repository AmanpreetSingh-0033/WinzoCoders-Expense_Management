import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { expenseService } from "../services/expenseService";
import { showNotification } from "../components/Notification";
import { CATEGORIES, CURRENCIES } from "../lib/constants";

export const SubmitExpense = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    currency: user?.company?.currency || "USD",
    category: "Travel",
    expenseDate: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseFloat(formData.amount) <= 0) {
      showNotification("Amount must be greater than 0", "error");
      return;
    }

    setLoading(true);

    try {
      await expenseService.createExpense({
        ...formData,
        amount: parseFloat(formData.amount),
        submitter: user._id,
        company: user.company,
        convertedAmount: parseFloat(formData.amount), // For now, assume same as amount
      });

      showNotification("Expense submitted successfully!", "success");
      navigate("/expenses/my-expenses");
    } catch (error) {
      showNotification(error.message || "Failed to submit expense", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "8px",
          color: "#1f2937",
        }}
      >
        Submit Expense
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        Create a new expense claim for approval
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
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="e.g., Client dinner, Flight to NYC"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
              placeholder="Provide details about this expense..."
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label style={labelStyle}>Amount *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                style={inputStyle}
                placeholder="0.00"
              />
            </div>

            <div>
              <label style={labelStyle}>Currency *</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                required
                style={inputStyle}
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={labelStyle}>Expense Date *</label>
            <input
              type="date"
              name="expenseDate"
              value={formData.expenseDate}
              onChange={handleChange}
              required
              max={new Date().toISOString().split("T")[0]}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
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
              {loading ? "Submitting..." : "Submit Expense"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              style={{
                padding: "12px 24px",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#e5e7eb")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
            >
              Cancel
            </button>
          </div>
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
