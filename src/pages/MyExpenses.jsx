import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { expenseService } from "../services/expenseService";
import { formatCurrency } from "../services/currencyService";
import { showNotification } from "../components/Notification";

export const MyExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    loadExpenses();
  }, [user]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseService.getExpenses({
        submitter: user._id,
      });
      setExpenses(data);
    } catch (error) {
      showNotification("Failed to load expenses", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    if (filter === "all") return true;
    return expense.status === filter;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      approved: "#10b981",
      rejected: "#ef4444",
      escalated: "#8b5cf6",
    };
    return colors[status] || "#6b7280";
  };

  const viewDetails = async (expenseId) => {
    try {
      const expense = await expenseService.getExpenseById(expenseId);
      setSelectedExpense(expense);
    } catch (error) {
      showNotification("Failed to load expense details", "error");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "8px",
          color: "#1f2937",
        }}
      >
        My Expenses
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        View and track all your expense claims
      </p>

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ marginBottom: "20px", display: "flex", gap: "8px" }}>
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: "8px 16px",
                backgroundColor: filter === status ? "#2563eb" : "#f3f4f6",
                color: filter === status ? "white" : "#374151",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.2s",
              }}
            >
              {status} (
              {
                expenses.filter((e) => status === "all" || e.status === status)
                  .length
              }
              )
            </button>
          ))}
        </div>

        {filteredExpenses.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}
          >
            No expenses found
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <td style={tdStyle}>
                      <div style={{ fontWeight: "500" }}>{expense.title}</div>
                      {expense.description && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginTop: "4px",
                          }}
                        >
                          {expense.description.substring(0, 50)}
                          {expense.description.length > 50 && "..."}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>{expense.category}</td>
                    <td style={tdStyle}>
                      <div>
                        {formatCurrency(
                          expense.convertedAmount || expense.converted_amount,
                          user.company?.currency || "USD"
                        )}
                      </div>
                      {expense.currency !==
                        (user.company?.currency || "USD") && (
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                          Original:{" "}
                          {formatCurrency(expense.amount, expense.currency)}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {new Date(expense.expense_date).toLocaleDateString()}
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
                    <td style={tdStyle}>
                      <button
                        onClick={() => viewDetails(expense.id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#f3f4f6",
                          color: "#374151",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "12px",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.target.style.backgroundColor = "#e5e7eb")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.backgroundColor = "#f3f4f6")
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedExpense && (
        <ExpenseDetailModal
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          currency={user.companies.currency}
        />
      )}
    </div>
  );
};

const ExpenseDetailModal = ({ expense, onClose, currency }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      approved: "#10b981",
      rejected: "#ef4444",
      escalated: "#8b5cf6",
    };
    return colors[status] || "#6b7280";
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937" }}
          >
            Expense Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <DetailRow label="Title" value={expense.title} />
          <DetailRow label="Description" value={expense.description || "N/A"} />
          <DetailRow label="Category" value={expense.category} />
          <DetailRow
            label="Amount"
            value={formatCurrency(expense.converted_amount, currency)}
          />
          {expense.currency !== currency && (
            <DetailRow
              label="Original Amount"
              value={formatCurrency(expense.amount, expense.currency)}
            />
          )}
          <DetailRow
            label="Date"
            value={new Date(expense.expense_date).toLocaleDateString()}
          />
          <DetailRow
            label="Status"
            value={
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "500",
                  backgroundColor: getStatusColor(expense.status) + "20",
                  color: getStatusColor(expense.status),
                }}
              >
                {expense.status}
              </span>
            }
          />
        </div>

        {expense.approval_history && expense.approval_history.length > 0 && (
          <div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "16px",
                color: "#1f2937",
              }}
            >
              Approval History
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {expense.approval_history.map((history) => (
                <div
                  key={history.id}
                  style={{
                    padding: "12px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "6px",
                    borderLeft: `3px solid ${getStatusColor(history.action)}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#1f2937",
                    }}
                  >
                    {history.approver.name} - {history.action}
                  </div>
                  {history.comment && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        marginTop: "4px",
                      }}
                    >
                      {history.comment}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      marginTop: "4px",
                    }}
                  >
                    {new Date(history.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div
    style={{
      display: "flex",
      paddingBottom: "12px",
      marginBottom: "12px",
      borderBottom: "1px solid #f3f4f6",
    }}
  >
    <div
      style={{
        width: "150px",
        fontSize: "14px",
        fontWeight: "500",
        color: "#6b7280",
      }}
    >
      {label}
    </div>
    <div style={{ flex: 1, fontSize: "14px", color: "#1f2937" }}>{value}</div>
  </div>
);

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
