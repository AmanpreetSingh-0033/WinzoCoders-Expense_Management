import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showNotification } from './Notification';

export const Layout = ({ children }) => {
  const { user, signOut, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut();
      showNotification('Logged out successfully', 'success');
      navigate('/login');
    } catch (error) {
      showNotification('Error logging out', 'error');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <aside style={{
        width: '260px',
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>ExpenseFlow</h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
            {user?.companies?.name}
          </p>
        </div>

        <nav style={{ flex: 1 }}>
          <NavLink to="/dashboard" active={isActive('/dashboard')}>
            Dashboard
          </NavLink>

          <NavLink to="/expenses/submit" active={isActive('/expenses/submit')}>
            Submit Expense
          </NavLink>

          <NavLink to="/expenses/my-expenses" active={isActive('/expenses/my-expenses')}>
            My Expenses
          </NavLink>

          {(isManager || isAdmin) && (
            <NavLink to="/approvals" active={isActive('/approvals')}>
              Approvals
            </NavLink>
          )}

          {isAdmin && (
            <>
              <div style={{
                height: '1px',
                backgroundColor: '#374151',
                margin: '16px 0'
              }} />

              <NavLink to="/admin/users" active={isActive('/admin/users')}>
                Manage Users
              </NavLink>

              <NavLink to="/admin/rules" active={isActive('/admin/rules')}>
                Approval Rules
              </NavLink>

              <NavLink to="/admin/company" active={isActive('/admin/company')}>
                Company Settings
              </NavLink>
            </>
          )}
        </nav>

        <div style={{
          borderTop: '1px solid #374151',
          paddingTop: '16px',
          marginTop: '16px'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>{user?.name}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{user?.email}</div>
            <div style={{
              display: 'inline-block',
              marginTop: '4px',
              padding: '2px 8px',
              backgroundColor: '#374151',
              borderRadius: '4px',
              fontSize: '11px',
              textTransform: 'capitalize'
            }}>
              {user?.role}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px 16px',
              backgroundColor: '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#374151'}
          >
            Logout
          </button>
        </div>
      </aside>

      <main style={{
        flex: 1,
        padding: '32px',
        overflowY: 'auto'
      }}>
        {children}
      </main>
    </div>
  );
};

const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    style={{
      display: 'block',
      padding: '10px 16px',
      marginBottom: '4px',
      borderRadius: '6px',
      textDecoration: 'none',
      color: 'white',
      backgroundColor: active ? '#374151' : 'transparent',
      transition: 'background-color 0.2s',
      fontSize: '14px'
    }}
    onMouseOver={(e) => !active && (e.target.style.backgroundColor = '#374151')}
    onMouseOut={(e) => !active && (e.target.style.backgroundColor = 'transparent')}
  >
    {children}
  </Link>
);
