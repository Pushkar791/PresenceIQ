import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Attendance from './pages/Attendance';
import { Camera, Users, Activity, LogOut } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
    <nav className="nav-bar glass-panel" style={{ margin: '20px', padding: '15px 30px', borderRadius: '15px', borderBottom: 'none' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Camera size={28} color="#6366f1" /> PresenceIQ
      </h2>
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} /> Dashboard</Link>
        <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> Register</Link>
        <Link to="/attendance" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Camera size={18} /> Live Mode</Link>

        <button onClick={logout} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)' }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <div style={{ padding: '0 20px 40px' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
