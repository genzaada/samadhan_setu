import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="container fade-in">
            <button className="btn btn-ghost" onClick={() => navigate('/citizen')} style={{ marginBottom: '1rem' }}>
                <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
            </button>
            <div className="card">
                <h1>Profile</h1>
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> {user?.role}</p>
                <button className="btn btn-primary" onClick={logout} style={{ marginTop: '1rem', background: 'var(--danger)' }}>Logout</button>
            </div>
        </div>
    );
};
export default Profile;
