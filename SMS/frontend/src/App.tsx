import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {user?.role === 'student' ? (
              <Navigate to="/student" replace />
            ) : user?.role === 'teacher' ? (
              <Navigate to="/teacher" replace />
            ) : (
              <Navigate to="/admin" replace />
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/*"
        element={
          <ProtectedRoute>
            {user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/" replace />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute>
            {user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/" replace />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            {user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
