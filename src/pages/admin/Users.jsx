import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { showNotification } from "../../components/Notification";
// import { ROLES } from '../../lib/supabase';

export const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [user]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [usersData, managersData] = await Promise.all([
        userService.getUsers(user.company_id),
        userService.getManagers(user.company_id),
      ]);
      setUsers(usersData);
      setManagers(managersData);
    } catch (error) {
      showNotification("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userToEdit) => {
    setEditingUser(userToEdit);
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await userService.deleteUser(userId);
      showNotification("User deleted successfully", "success");
      await loadUsers();
    } catch (error) {
      showNotification(error.message || "Failed to delete user", "error");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              marginBottom: "8px",
              color: "#1f2937",
            }}
          >
            Manage Users
          </h1>
          <p style={{ color: "#6b7280" }}>Add, edit, and manage team members</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
          style={{
            padding: "12px 24px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
        >
          + Add User
        </button>
      </div>

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Manager</th>
                <th style={thStyle}>Manager Approver</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={tdStyle}>{u.name}</td>
                  <td style={tdStyle}>{u.email}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "500",
                        backgroundColor: getRoleBg(u.role),
                        color: getRoleColor(u.role),
                        textTransform: "capitalize",
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={tdStyle}>{u.manager ? u.manager.name : "N/A"}</td>
                  <td style={tdStyle}>
                    {u.is_manager_approver ? (
                      <span style={{ color: "#10b981", fontWeight: "500" }}>
                        ✓ Yes
                      </span>
                    ) : (
                      <span style={{ color: "#6b7280" }}>No</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleEdit(u)}
                        style={actionButtonStyle}
                      >
                        Edit
                      </button>
                      {u.id !== user.id && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          style={{
                            ...actionButtonStyle,
                            backgroundColor: "#fee2e2",
                            color: "#dc2626",
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <UserFormModal
          user={editingUser}
          managers={managers}
          companyId={user.company_id}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadUsers();
          }}
        />
      )}
    </div>
  );
};

const UserFormModal = ({
  user: editUser,
  managers,
  companyId,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: editUser?.name || "",
    email: editUser?.email || "",
    password: "",
    role: editUser?.role || "employee",
    manager_id: editUser?.manager_id || "",
    is_manager_approver: editUser?.is_manager_approver || false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editUser) {
        await userService.updateUser(editUser.id, formData);
        showNotification("User updated successfully", "success");
      } else {
        if (!formData.password || formData.password.length < 6) {
          showNotification("Password must be at least 6 characters", "error");
          setLoading(false);
          return;
        }
        await userService.createUser({ ...formData, company_id: companyId });
        showNotification("User created successfully", "success");
      }
      onSuccess();
    } catch (error) {
      showNotification(error.message || "Operation failed", "error");
    } finally {
      setLoading(false);
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
          maxWidth: "500px",
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "24px",
            color: "#1f2937",
          }}
        >
          {editUser ? "Edit User" : "Add New User"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              disabled={!!editUser}
              style={inputStyle}
            />
          </div>

          {!editUser && (
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={6}
                style={inputStyle}
                placeholder="Min 6 characters"
              />
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Role *</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              required
              style={inputStyle}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Manager (Optional)</label>
            <select
              value={formData.manager_id}
              onChange={(e) =>
                setFormData({ ...formData, manager_id: e.target.value })
              }
              style={inputStyle}
            >
              <option value="">No Manager</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={formData.is_manager_approver}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_manager_approver: e.target.checked,
                  })
                }
                style={{ marginRight: "8px" }}
              />
              <span style={{ fontSize: "14px", color: "#374151" }}>
                Manager must approve first
              </span>
            </label>
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
              }}
            >
              {loading ? "Saving..." : editUser ? "Update User" : "Create User"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "12px 24px",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const getRoleBg = (role) => {
  const colors = {
    admin: "#fee2e2",
    manager: "#dbeafe",
    employee: "#f3f4f6",
  };
  return colors[role] || "#f3f4f6";
};

const getRoleColor = (role) => {
  const colors = {
    admin: "#dc2626",
    manager: "#2563eb",
    employee: "#6b7280",
  };
  return colors[role] || "#6b7280";
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

const actionButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#f3f4f6",
  color: "#374151",
  border: "none",
  borderRadius: "4px",
  fontSize: "12px",
  cursor: "pointer",
  transition: "background-color 0.2s",
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
