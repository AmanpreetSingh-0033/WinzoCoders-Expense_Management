import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Notification } from './components/Notification';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { SubmitExpense } from './pages/SubmitExpense';
import { MyExpenses } from './pages/MyExpenses';
import { Approvals } from './pages/Approvals';
import { Users } from './pages/admin/Users';
import { ApprovalRules } from './pages/admin/ApprovalRules';
import { CompanySettings } from './pages/admin/CompanySettings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Notification />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/expenses/submit"
            element={
              <ProtectedRoute>
                <Layout>
                  <SubmitExpense />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/expenses/my-expenses"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyExpenses />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/approvals"
            element={
              <ProtectedRoute roles={['admin', 'manager']}>
                <Layout>
                  <Approvals />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/rules"
            element={
              <ProtectedRoute roles={['admin']}>
                <Layout>
                  <ApprovalRules />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/company"
            element={
              <ProtectedRoute roles={['admin']}>
                <Layout>
                  <CompanySettings />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
