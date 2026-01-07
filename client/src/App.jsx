import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import ReportIssue from './pages/ReportIssue';
import NearbyIssues from './pages/NearbyIssues';
import MyReports from './pages/MyReports';
import Notifications from './pages/Notifications';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};



const App = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
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
            <Route path="/citizen/report" element={
              <PrivateRoute allowedRoles={['citizen']}>
                <ReportIssue />
              </PrivateRoute>
            } />
            <Route path="/citizen/map" element={
              <PrivateRoute allowedRoles={['citizen']}>
                <NearbyIssues />
              </PrivateRoute>
            } />
            <Route path="/citizen/my-reports" element={
              <PrivateRoute allowedRoles={['citizen']}>
                <MyReports />
              </PrivateRoute>
            } />
            <Route path="/citizen/notifications" element={
              <PrivateRoute allowedRoles={['citizen']}>
                <Notifications />
              </PrivateRoute>
            } />
            <Route path="/citizen/feedback" element={
              <PrivateRoute allowedRoles={['citizen']}>
                <Feedback />
              </PrivateRoute>
            } />
            <Route path="/citizen/profile" element={
              <PrivateRoute allowedRoles={['citizen']}>
                <Profile />
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
      </LanguageProvider>
    </ThemeProvider>
  );

};

export default App;
