import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { approvalRuleService } from '../../services/approvalRuleService';
import { userService } from '../../services/userService';
import { showNotification } from '../../components/Notification';

export const ApprovalRules = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  useEffect(() => {
    loadRules();
  }, [user]);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await approvalRuleService.getRules(user.company_id);
      setRules(data);
    } catch (error) {
      showNotification('Failed to load approval rules', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (ruleId, currentStatus) => {
    try {
      await approvalRuleService.toggleRuleStatus(ruleId, !currentStatus);
      showNotification('Rule status updated', 'success');
      await loadRules();
    } catch (error) {
      showNotification('Failed to update rule status', 'error');
    }
  };

  const handleDelete = async (ruleId) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      await approvalRuleService.deleteRule(ruleId);
      showNotification('Rule deleted successfully', 'success');
      await loadRules();
    } catch (error) {
      showNotification('Failed to delete rule', 'error');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
            Approval Rules
          </h1>
          <p style={{ color: '#6b7280' }}>
            Configure approval workflows and conditions
          </p>
        </div>
        <button
          onClick={() => {
            setEditingRule(null);
            setShowModal(true);
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
        >
          + Add Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '60px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            No approval rules configured yet
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Create Your First Rule
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {rules.map(rule => (
            <div key={rule.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: `4px solid ${rule.is_active ? '#10b981' : '#6b7280'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    {rule.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Badge color="#2563eb">
                      Amount threshold: ${rule.amount_threshold}
                    </Badge>
                    {rule.percentage_threshold > 0 && (
                      <Badge color="#8b5cf6">
                        {rule.percentage_threshold}% approval required
                      </Badge>
                    )}
                    {rule.specific_approver_ids && rule.specific_approver_ids.length > 0 && (
                      <Badge color="#f59e0b">
                        {rule.specific_approver_ids.length} specific approver(s)
                      </Badge>
                    )}
                    {rule.is_hybrid && (
                      <Badge color="#10b981">
                        Hybrid Rule (OR logic)
                      </Badge>
                    )}
                    <Badge color={rule.is_active ? '#10b981' : '#6b7280'}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleToggleStatus(rule.id, rule.is_active)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    {rule.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingRule(rule);
                      setShowModal(true);
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {rule.sequence && rule.sequence.length > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                    Approval Sequence ({rule.sequence.length} approvers)
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {rule.sequence.map((approver, index) => (
                      <div key={index} style={{
                        padding: '6px 12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#374151'
                      }}>
                        {index + 1}. {approver.name || approver.role}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <RuleFormModal
          rule={editingRule}
          companyId={user.company_id}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadRules();
          }}
        />
      )}
    </div>
  );
};

const RuleFormModal = ({ rule: editRule, companyId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: editRule?.name || '',
    amount_threshold: editRule?.amount_threshold || 0,
    percentage_threshold: editRule?.percentage_threshold || 0,
    specific_approver_ids: editRule?.specific_approver_ids || [],
    sequence: editRule?.sequence || [],
    is_hybrid: editRule?.is_hybrid || false,
    is_active: editRule?.is_active !== undefined ? editRule.is_active : true
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [companyId]);

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers(companyId);
      setUsers(data.filter(u => u.role === 'admin' || u.role === 'manager'));
    } catch (error) {
      showNotification('Failed to load users', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const ruleData = {
        ...formData,
        company_id: companyId
      };

      if (editRule) {
        await approvalRuleService.updateRule(editRule.id, ruleData);
        showNotification('Rule updated successfully', 'success');
      } else {
        await approvalRuleService.createRule(ruleData);
        showNotification('Rule created successfully', 'success');
      }
      onSuccess();
    } catch (error) {
      showNotification(error.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addApprover = () => {
    if (users.length > 0) {
      const firstUser = users[0];
      setFormData({
        ...formData,
        sequence: [
          ...formData.sequence,
          {
            user_id: firstUser.id,
            name: firstUser.name,
            role: firstUser.role,
            required: true
          }
        ]
      });
    }
  };

  const removeApprover = (index) => {
    setFormData({
      ...formData,
      sequence: formData.sequence.filter((_, i) => i !== index)
    });
  };

  const updateApprover = (index, userId) => {
    const selectedUser = users.find(u => u.id === userId);
    const newSequence = [...formData.sequence];
    newSequence[index] = {
      user_id: selectedUser.id,
      name: selectedUser.name,
      role: selectedUser.role,
      required: true
    };
    setFormData({ ...formData, sequence: newSequence });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>
          {editRule ? 'Edit Approval Rule' : 'Create Approval Rule'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Rule Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={inputStyle}
              placeholder="e.g., Standard Approval Flow"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Amount Threshold *</label>
            <input
              type="number"
              value={formData.amount_threshold}
              onChange={(e) => setFormData({ ...formData, amount_threshold: parseFloat(e.target.value) || 0 })}
              required
              min="0"
              step="0.01"
              style={inputStyle}
              placeholder="Rule applies to expenses above this amount"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Percentage Threshold (0-100)</label>
            <input
              type="number"
              value={formData.percentage_threshold}
              onChange={(e) => setFormData({ ...formData, percentage_threshold: parseFloat(e.target.value) || 0 })}
              min="0"
              max="100"
              step="1"
              style={inputStyle}
              placeholder="e.g., 60 for 60% approval required"
            />
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              If set, expense auto-approves when this % of approvers approve
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Approval Sequence</label>
            <div style={{ marginBottom: '12px' }}>
              {formData.sequence.map((approver, index) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '8px',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', color: '#6b7280', minWidth: '30px' }}>
                    {index + 1}.
                  </span>
                  <select
                    value={approver.user_id}
                    onChange={(e) => updateApprover(index, e.target.value)}
                    style={{ ...inputStyle, margin: 0 }}
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeApprover(index)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addApprover}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              + Add Approver
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.is_hybrid}
                onChange={(e) => setFormData({ ...formData, is_hybrid: e.target.checked })}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontSize: '14px', color: '#374151' }}>
                Hybrid Rule (Percentage OR Specific Approver)
              </span>
            </label>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontSize: '14px', color: '#374151' }}>
                Active
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Saving...' : (editRule ? 'Update Rule' : 'Create Rule')}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
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

const Badge = ({ color, children }) => (
  <span style={{
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: color + '20',
    color: color,
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  }}>
    {children}
  </span>
);

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '500',
  marginBottom: '6px',
  color: '#374151'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  boxSizing: 'border-box'
};
