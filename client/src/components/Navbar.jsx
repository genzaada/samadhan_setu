import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Sun, Moon } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import ThemeSwitch from './ThemeSwitch'; // Import ThemeSwitch

import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            padding: '1.25rem 0', // Even broader
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.95) 100%)', // Deep Slate to Midnight Blue, more opaque
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
            <div className="container nav-content" style={{ maxWidth: '1400px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', textDecoration: 'none' }}>
                    <div style={{
                        height: '58px', // Slightly larger
                        width: '58px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' // Stronger Purple Glow
                    }}>
                        <img
                            src="/logo.jpg"
                            alt="Logo"
                            style={{
                                height: '100%',
                                width: '100%',
                                objectFit: 'contain',
                                padding: '4px', // Zoom out effect to prevent cutting
                                borderRadius: '50%'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
                        <span style={{
                            fontSize: '2rem',
                            fontWeight: '800',
                            letterSpacing: '-0.5px',
                            background: 'linear-gradient(to right, #ffffff 30%, #818cf8 100%)', // Crisp White to Soft Indigo
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                            fontFamily: 'system-ui, -apple-system, sans-serif'
                        }}>
                            Samadhan Setu
                        </span>
                        <span style={{
                            fontSize: '0.8rem',
                            color: '#94a3b8',
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            fontWeight: '600',
                            marginLeft: '2px',
                            opacity: 0.8
                        }}>
                            Civic Buddy
                        </span>
                    </div>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <ThemeSwitch />
                    <LanguageSelector />
                    {user ? (
                        <>
                            <span className="badge badge-pending" style={{
                                fontSize: '0.85rem',
                                padding: '0.5rem 1rem',
                                letterSpacing: '1px',
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: '#a5b4fc',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '12px'
                            }}>{user.role.toUpperCase()}</span>

                            <span style={{
                                fontSize: '1.1rem',
                                color: 'white',
                                fontWeight: '500',
                                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                            }}>
                                {t('hello')}, <span style={{ color: '#c7d2fe', fontWeight: '600' }}>{user.name}</span>
                            </span>

                            <button onClick={handleLogout} className="btn" style={{
                                padding: '0.6rem 1.2rem',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                borderRadius: '50px',
                                background: 'rgba(239, 68, 68, 0.1)', // Soft red bg
                                color: '#fca5a5',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                transition: 'all 0.2s'
                            }}>
                                <LogOut size={20} /> {t('logout')}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '1rem' }}>{t('login')}</Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '1rem' }}>{t('register')}</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
