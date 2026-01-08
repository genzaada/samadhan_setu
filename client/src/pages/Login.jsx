import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/api';
import { Github, Facebook, Chrome, Leaf } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await loginApi(formData);
            login(data.user, data.token);

            switch (data.user.role) {
                case 'citizen': navigate('/citizen'); break;
                case 'admin': navigate('/admin'); break;
                case 'worker': navigate('/worker'); break;
                default: navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '420px',
                padding: '2.5rem',
                borderRadius: '24px',
                background: 'rgba(0, 0, 0, 0.4)', // Darker glass for better contrast on bg
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                {/* Logo & Header */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', opacity: 0.9 }} />
                </div>

                <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Welcome Back</h1>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>Sign in to continue to Samadhan Setu</p>

                {error && (
                    <div style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(248, 113, 113, 0.2)',
                        border: '1px solid rgba(248, 113, 113, 0.3)',
                        color: '#fca5a5',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', color: 'white', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="name@example.com"
                            style={{
                                width: '100%',
                                padding: '0.9rem 1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                background: 'rgba(255, 255, 255, 0.1)',
                                fontSize: '1rem',
                                outline: 'none',
                                color: 'white'
                            }}
                        />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label style={{ color: 'white', fontSize: '0.9rem', fontWeight: '500' }}>Password</label>
                            <a href="#" style={{ color: '#818cf8', fontSize: '0.85rem' }}>Forgot password?</a>
                        </div>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '0.9rem 1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                background: 'rgba(255, 255, 255, 0.1)',
                                fontSize: '1rem',
                                outline: 'none',
                                color: 'white'
                            }}
                        />
                    </div>

                    <button type="submit" style={{
                        width: '100%',
                        padding: '1rem',
                        marginTop: '0.5rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'white',
                        color: '#0f172a',
                        fontWeight: '700',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}>
                        Log In
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '1rem', margin: '2rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
                    <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem' }}>Or continue with</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    {[
                        { icon: Github, color: 'white' },
                        { icon: Chrome, color: '#f87171' },
                        { icon: Facebook, color: '#60a5fa' }
                    ].map((Item, i) => (
                        <button key={i} style={{
                            width: '50px', height: '50px',
                            borderRadius: '50%',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                            color: Item.color,
                            transition: 'all 0.2s'
                        }}>
                            <Item.icon size={20} />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Login;
