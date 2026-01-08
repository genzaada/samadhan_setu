import React from 'react';
import {
    Construction, Lightbulb, Waves, Droplet, Zap, Bus,
    Trash2, Trash, Home, Flame, AlertTriangle, Bug, XCircle, PawPrint,
    Volume2, TreeDeciduous
} from 'lucide-react';

const categories = [
    { name: 'Roads and potholes', icon: <Construction size={24} />, color: '#71717a' },
    { name: 'Street lighting', icon: <Lightbulb size={24} />, color: '#fbbf24' },
    { name: 'Drainage and sewage systems', icon: <Waves size={24} />, color: '#3b82f6' },
    { name: 'Water supply issues', icon: <Droplet size={24} />, color: '#0ea5e9' },
    { name: 'Electricity supply', icon: <Zap size={24} />, color: '#eab308' },
    { name: 'Public transportation', icon: <Bus size={24} />, color: '#fca5a5' },
    { name: 'Garbage collection', icon: <Trash2 size={24} />, color: '#16a34a' },
    { name: 'Lack of dustbins', icon: <Trash size={24} />, color: '#22c55e' },
    { name: 'Maintenance of public toilets', icon: <Home size={24} />, color: '#a8a29e' },
    { name: 'Fire safety violations', icon: <Flame size={24} />, color: '#ef4444' },
    { name: 'Water pollution', icon: <AlertTriangle size={24} />, color: '#8b5cf6' },
    { name: 'Mosquito breeding', icon: <Bug size={24} />, color: '#84cc16' },
    { name: 'Waste burning', icon: <XCircle size={24} />, color: '#f97316' },
    { name: 'Stray Animal Issues', icon: <PawPrint size={24} />, color: '#d946ef' },
    { name: 'Noise Pollution', icon: <Volume2 size={24} />, color: '#6366f1' },
    { name: 'Tree Maintenance', icon: <TreeDeciduous size={24} />, color: '#15803d' },
];

const CategorySelection = ({ onSelect }) => {
    return (
        <div className="fade-in" style={{ color: 'white' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Select Issue Category</h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.75rem',
                maxWidth: '650px', // Constrain width to keep boxes small
                margin: '0 auto'
            }}>
                {categories.map((cat, index) => (
                    <div
                        key={index}
                        className="glass-card-dark"
                        onClick={() => onSelect(cat.name)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.75rem',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            aspectRatio: '1 / 1'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.borderColor = cat.color;
                            e.currentTarget.style.boxShadow = `0 4px 12px ${cat.color}33`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ color: cat.color, marginBottom: '0.5rem' }}>
                            {cat.icon}
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 500, lineHeight: '1.1' }}>{cat.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategorySelection;
