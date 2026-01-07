import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageSelector = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'mr', name: 'मराठी' },
        { code: 'hi', name: 'हिंदी' },
        { code: 'ta', name: 'தமிழ்' },
        { code: 'ur', name: 'اردو' }
    ];

    const currentLanguage = languages.find(l => l.code === language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (code) => {
        setLanguage(code);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative', zIndex: 1000 }}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    padding: '0.5rem 1rem',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    minWidth: '140px'
                }}
            >
                <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '4px', display: 'flex' }}>
                    <Globe size={16} color="white" />
                </div>
                <span>{currentLanguage.name}</span>
                <ChevronDown size={14} style={{ marginLeft: 'auto', opacity: 0.7 }} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '160px',
                    background: '#1a1a2e', // Deep dark blue background
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '0.5rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    {languages.map(lang => (
                        <div
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            style={{
                                padding: '0.75rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                background: language === lang.code ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                color: 'white',
                                transition: 'background 0.2s',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = language === lang.code ? 'rgba(255, 255, 255, 0.05)' : 'transparent'}
                        >
                            {/* Accent Bar */}
                            <div style={{
                                width: '4px',
                                height: '24px',
                                background: '#d946ef', // Fuchsia/Pink accent
                                borderRadius: '4px',
                                opacity: 0.8
                            }}></div>

                            <span style={{ fontSize: '1rem', fontWeight: 500 }}>{lang.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
