import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showNotification } from "../components/Notification";
import { COUNTRIES } from "../lib/constants";

export const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    country: "US",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showNotification("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    try {
      await signUp(formData.email, formData.password, {
        name: formData.name,
        companyName: formData.companyName,
        country: formData.country,
      });
      showNotification("Account created! Please log in.", "success");
      navigate("/login");
    } catch (error) {
      showNotification(error.response?.data?.error || error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "8px",
          color: "#1f2937",
          textAlign: "center",
        }}
      >
        Create Account
      </h1>
      <p
        style={{
          color: "#6b7280",
          marginBottom: "32px",
          textAlign: "center",
        }}
      >
        Join your company's expense management system
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
            <label style={labelStyle}>Full Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Email Address *</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Company Name *</label>
            <input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter your company name"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Country *</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.currency})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Password *</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={labelStyle}>Confirm Password *</label>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 24px",
              backgroundColor: loading ? "#9ca3af" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
              marginBottom: "24px",
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#1d4ed8";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#2563eb";
              }
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p style={{ textAlign: "center", color: "#6b7280" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: "500",
  color: "#374151",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "16px",
  color: "#1f2937",
  backgroundColor: "white",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};
