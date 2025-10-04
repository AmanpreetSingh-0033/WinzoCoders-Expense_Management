import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { expenseService } from "../services/expenseService";
import { formatCurrency } from "../services/currencyService";
import { showNotification } from "../components/Notification";

export const Approvals = () => {
  const { user } = useAuth();
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPendingApprovals();
  }, [user]);

  const loadPendingApprovals = async () => {
    try {
      setLoading(true);
      const data = await expenseService.getPendingApprovals(user._id);
      setPendingExpenses(data);
    } catch (error) {
      showNotification("Failed to load pending approvals", "error");
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (expenseId) => {
    try {
      const expense = await expenseService.getExpenseById(expenseId);
      setSelectedExpense(expense);
    } catch (error) {
      showNotification("Failed to load expense details", "error");
    }
  };

  const handleApprove = async (expenseId, comment) => {
    setActionLoading(true);
    try {
      await expenseService.approveExpense(expenseId, user._id, comment);
      showNotification("Expense approved successfully", "success");
      setSelectedExpense(null);
      await loadPendingApprovals();
    } catch (error) {
      showNotification(error.message || "Failed to approve expense", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (expenseId, comment) => {
    if (!comment || comment.trim() === "") {
      showNotification("Please provide a reason for rejection", "warning");
      return;
    }

    setActionLoading(true);
    try {
      await expenseService.rejectExpense(expenseId, user._id, comment);
      showNotification("Expense rejected", "success");
      setSelectedExpense(null);
      await loadPendingApprovals();
    } catch (error) {
      showNotification(error.message || "Failed to reject expense", "error");
    } finally {
      setActionLoading(false);
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
        Pending Approvals
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        Review and approve expense claims
      </p>

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        {pendingExpenses.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✓</div>
            <div style={{ fontSize: "18px", fontWeight: "500" }}>
              All caught up!
            </div>
            <div style={{ marginTop: "8px" }}>
              No pending approvals at the moment
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th style={thStyle}>Submitter</th>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <td style={tdStyle}>
                      <div style={{ fontWeight: "500" }}>
                        {expense.submitter.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {expense.submitter.email}
                      </div>
                    </td>
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
                          {expense.description.substring(0, 40)}
                          {expense.description.length > 40 && "..."}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>{expense.category}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: "500" }}>
                        {formatCurrency(
                          expense.converted_amount,
                          user.companies.currency
                        )}
                      </div>
                      {expense.currency !== user.companies.currency && (
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                          {formatCurrency(expense.amount, expense.currency)}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => viewDetails(expense.id)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#2563eb",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "14px",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.target.style.backgroundColor = "#1d4ed8")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.backgroundColor = "#2563eb")
                        }
                      >
                        Review
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
        <ApprovalModal
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          currency={user.companies.currency}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

const ApprovalModal = ({
  expense,
  onClose,
  onApprove,
  onReject,
  currency,
  loading,
}) => {
  const [comment, setComment] = useState("");
  const [action, setAction] = useState(null);

  const handleSubmit = () => {
    if (action === "approve") {
      onApprove(expense.id, comment);
    } else if (action === "reject") {
      onReject(expense.id, comment);
    }
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
          maxWidth: "700px",
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
            Review Expense
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

        <div
          style={{
            padding: "16px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <InfoItem label="Submitter" value={expense.submitter.name} />
            <InfoItem label="Email" value={expense.submitter.email} />
            <InfoItem label="Title" value={expense.title} />
            <InfoItem label="Category" value={expense.category} />
            <InfoItem
              label="Amount"
              value={formatCurrency(expense.converted_amount, currency)}
            />
            <InfoItem
              label="Date"
              value={new Date(expense.expense_date).toLocaleDateString()}
            />
          </div>
          {expense.description && (
            <div style={{ marginTop: "16px" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Description
              </div>
              <div style={{ fontSize: "14px", color: "#1f2937" }}>
                {expense.description}
              </div>
            </div>
          )}
        </div>

        {expense.approval_history && expense.approval_history.length > 1 && (
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#1f2937",
              }}
            >
              Previous Actions
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {expense.approval_history.slice(0, -1).map((history) => (
                <div
                  key={history.id}
                  style={{
                    padding: "12px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ fontWeight: "500", color: "#1f2937" }}>
                    {history.approver.name} - {history.action}
                  </div>
                  {history.comment && (
                    <div style={{ color: "#6b7280", marginTop: "4px" }}>
                      {history.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "8px",
              color: "#374151",
            }}
          >
            Comment{" "}
            {action === "reject" && <span style={{ color: "#ef4444" }}>*</span>}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              action === "reject"
                ? "Please provide a reason for rejection..."
                : "Add a comment (optional)..."
            }
            style={{
              width: "100%",
              minHeight: "100px",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => {
              setAction("approve");
              handleSubmit();
            }}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: "#10b981",
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
              !loading && (e.target.style.backgroundColor = "#059669")
            }
            onMouseOut={(e) =>
              !loading && (e.target.style.backgroundColor = "#10b981")
            }
          >
            {loading && action === "approve" ? "Approving..." : "Approve"}
          </button>

          <button
            onClick={() => {
              setAction("reject");
              setTimeout(handleSubmit, 0);
            }}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: "#ef4444",
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
              !loading && (e.target.style.backgroundColor = "#dc2626")
            }
            onMouseOut={(e) =>
              !loading && (e.target.style.backgroundColor = "#ef4444")
            }
          >
            {loading && action === "reject" ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <div
      style={{
        fontSize: "12px",
        fontWeight: "600",
        color: "#6b7280",
        marginBottom: "4px",
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: "14px", color: "#1f2937", fontWeight: "500" }}>
      {value}
    </div>
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
