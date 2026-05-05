import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CategoryView from './pages/CategoryView';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function Settings() {
  return (
    <div className="flex h-screen items-center justify-center bg-sanctuary-bg text-sanctuary-textMain">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Settings</h2>
        <p className="text-sanctuary-textMuted">Preferences and configurations coming soon.</p>
      </div>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-sanctuary-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sanctuary-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path="/reset-password/:token" element={!user ? <ResetPassword /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/category/:categoryId" element={user ? <CategoryView /> : <Navigate to="/login" />} />
        <Route path="/archive" element={user ? <CategoryView /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
