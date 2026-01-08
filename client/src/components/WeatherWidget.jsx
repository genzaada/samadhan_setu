import React from 'react';
import { Sun, Calendar } from 'lucide-react';

const WeatherWidget = () => {
    const today = new Date();
    const dateOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    const formattedDate = today.toLocaleDateString('en-US', dateOptions);

    return (
        <div
            className="glass-card-dark"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                padding: '1.25rem',
                marginBottom: '1rem',
                position: 'relative',
                overflow: 'hidden',
                maxWidth: '900px', // Match Quick Actions
                margin: '0 auto 1rem auto' // Center align
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                    <Calendar size={18} />
                    <span style={{ fontWeight: 600, color: 'white', fontSize: '1rem' }}>{formattedDate}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                    <span style={{ fontWeight: 600, color: 'white', fontSize: '1.1rem' }}>28°C</span>
                    <Sun size={20} color="#fbbf24" strokeWidth={2.5} />
                </div>
            </div>

            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: '1rem',
                marginTop: '0.5rem',
                textAlign: 'center',
                flex: 1, // Allow filling space
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <span style={{
                    fontStyle: 'italic',
                    color: 'rgba(255, 255, 255, 0.95)',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    fontWeight: '500',
                    fontSize: '1.25rem',
                    lineHeight: '1.5',
                    letterSpacing: '0.5px'
                }}>
                    Ask not what your city can do for you – ask what you can do for your city.
                </span>
            </div>
        </div>
    );
};

export default WeatherWidget;
