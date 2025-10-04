import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { expenseService } from "../services/expenseService";
import { formatCurrency } from "../services/currencyService";
import { Link } from "react-router-dom";

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
    pendingApprovals: 0,
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const expenses = await expenseService.getExpenses({
        company_id: user.company,
      });

      const myExpenses = expenses.filter(
        (e) => e.submitter._id === user._id || e.submitter === user._id
      );

      const statsData = {
        total: myExpenses.length,
        pending: myExpenses.filter((e) => e.status === "pending").length,
        approved: myExpenses.filter((e) => e.status === "approved").length,
        rejected: myExpenses.filter((e) => e.status === "rejected").length,
        totalAmount: myExpenses.reduce(
          (sum, e) =>
            sum + parseFloat(e.convertedAmount || e.converted_amount || 0),
          0
        ),
        pendingApprovals: 0,
      };

      if (user.role === "manager" || user.role === "admin") {
        const pendingApprovals = await expenseService.getPendingApprovals(
          user._id
        );
        statsData.pendingApprovals = pendingApprovals.length;
      }

      setStats(statsData);
      setRecentExpenses(myExpenses.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      approved: "#10b981",
      rejected: "#ef4444",
      escalated: "#8b5cf6",
    };
    return colors[status] || "#6b7280";
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#1f2937",
          }}
        >
          Welcome back, {user.name}!
        </h1>
        <p style={{ color: "#6b7280" }}>Here's your expense overview</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        <StatCard title="Total Expenses" value={stats.total} color="#2563eb" />
        <StatCard title="Pending" value={stats.pending} color="#f59e0b" />
        <StatCard title="Approved" value={stats.approved} color="#10b981" />
        <StatCard
          title="Total Amount"
          value={formatCurrency(
            stats.totalAmount,
            user.company?.currency || "USD"
          )}
          color="#8b5cf6"
        />
        {(user.role === "manager" || user.role === "admin") && (
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            color="#ef4444"
            link="/approvals"
          />
        )}
      </div>

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937" }}>
            Recent Expenses
          </h2>
          <Link
            to="/expenses/my-expenses"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            View All
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#6b7280",
            }}
          >
            <p>No expenses yet</p>
            <Link
              to="/expenses/submit"
              style={{
                display: "inline-block",
                marginTop: "16px",
                padding: "10px 20px",
                backgroundColor: "#2563eb",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              Submit Your First Expense
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <td style={tdStyle}>{expense.title}</td>
                    <td style={tdStyle}>{expense.category}</td>
                    <td style={tdStyle}>
                      {formatCurrency(
                        expense.convertedAmount || expense.converted_amount,
                        user.company?.currency || "USD"
                      )}
                    </td>
                    <td style={tdStyle}>
                      {new Date(
                        expense.expenseDate || expense.expense_date
                      ).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "500",
                          backgroundColor:
                            getStatusColor(expense.status) + "20",
                          color: getStatusColor(expense.status),
                        }}
                      >
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color, link }) => {
  const card = (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        borderLeft: `4px solid ${color}`,
        cursor: link ? "pointer" : "default",
        transition: "transform 0.2s",
      }}
      onMouseOver={(e) =>
        link && (e.currentTarget.style.transform = "translateY(-2px)")
      }
      onMouseOut={(e) =>
        link && (e.currentTarget.style.transform = "translateY(0)")
      }
    >
      <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
        {title}
      </div>
      <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937" }}>
        {value}
      </div>
    </div>
  );

  return link ? (
    <Link to={link} style={{ textDecoration: "none" }}>
      {card}
    </Link>
  ) : (
    card
  );
};

const thStyle = {
  textAlign: "left",
  padding: "12px",
  fontSize: "12px",
  fontWeight: "600",
  color: "#6b7280",
  textTransform: "uppercase",
};

const tdStyle = {
  padding: "16px 12px",
  fontSize: "14px",
  color: "#1f2937",
};
