import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Map, FileText, Bell, MessageSquare, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DashboardGrid = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const menuItems = [
        // Saffron - Action/Revolution
        {
            title: t('report_issue'),
            icon: <PlusCircle size={32} />,
            path: '/citizen/report',
            color: '#E65100', // Deep Orange
        },
        // Green - Environment/Maps
        {
            title: t('nearby_issues'),
            icon: <Map size={32} />,
            path: '/citizen/map',
            color: '#138808', // Indian Green
        },
        // Navy Blue - History/Records (Chakra color)
        {
            title: t('my_reports'),
            icon: <FileText size={32} />,
            path: '/citizen/my-reports',
            color: '#000080', // Navy Blue
        },
        // Gold/Orange - Alerts
        {
            title: t('notifications'),
            icon: <Bell size={32} />,
            path: '/citizen/notifications',
            color: '#B45309', // Golden
        },
        // Teal/Blue - Feedback
        {
            title: t('feedback'),
            icon: <MessageSquare size={32} />,
            path: '/citizen/feedback',
            color: '#0891B2', // Teal
        },
        // Deep Purple/Pink - Profile
        {
            title: t('profile'),
            icon: <User size={32} />,
            path: '/citizen/profile',
            color: '#BE185D', // Pink
        },
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            padding: '1rem',
            maxWidth: '900px',
            margin: '0 auto'
        }}>
            {menuItems.map((item, index) => (
                <div
                    key={index}
                    className="glass-card-dark"
                    onClick={() => navigate(item.path)}
                    style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        cursor: 'pointer',
                        aspectRatio: '1 / 1',
                        width: '100%',
                        borderBottom: `4px solid ${item.color}`,
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = `0 15px 30px -10px ${item.color}66`; // Colored shadow
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.background = '';
                    }}
                >
                    <div style={{
                        marginBottom: '1rem',
                        color: item.color,
                        padding: '1rem',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(4px)',
                        border: `1px solid ${item.color}44`
                    }}>
                        {item.icon}
                    </div>
                    <span style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        {item.title}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default DashboardGrid;
