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
        <nav>
            <div className="container nav-content">
                <Link to="/" className="logo">
                    Samadhan Setu
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ThemeSwitch /> {/* Add ThemeSwitch here */}
                    <LanguageSelector />
                    {user ? (
                        <>
                            <span className="badge badge-pending">{user.role.toUpperCase()}</span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('hello')}, {user.name}</span>
                            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                                <LogOut size={16} style={{ marginRight: '0.5rem' }} /> {t('logout')}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary">{t('login')}</Link>
                            <Link to="/register" className="btn btn-primary">{t('register')}</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
