import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const App = () => {
  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/citizen" element={
            <PrivateRoute allowedRoles={['citizen']}>
              <CitizenDashboard />
            </PrivateRoute>
          } />

          <Route path="/admin" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } />

          <Route path="/worker" element={
            <PrivateRoute allowedRoles={['worker']}>
              <WorkerDashboard />
            </PrivateRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
