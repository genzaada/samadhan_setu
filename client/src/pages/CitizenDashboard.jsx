import React from 'react';
import { useAuth } from '../context/AuthContext';
import WeatherWidget from '../components/WeatherWidget';
import DashboardGrid from '../components/DashboardGrid';
import { useLanguage } from '../context/LanguageContext';

const CitizenDashboard = () => {
    const { user } = useAuth();
    const { t } = useLanguage();

    return (
        <div className="fade-in" style={{ color: 'white' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        {t('hello')}, <span className="text-gradient">{user?.name || 'Citizen'}</span>
                    </h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        Here's what's happening in your city today.
                    </p>
                </header>

                <WeatherWidget />

                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Quick Actions</h2>
                {/* DashboardGrid handles its own internal grid, but we remove its internal margin/width constraints 
                    if we want IT to align perfectly inside THIS container. 
                    However, checking DashboardGrid logic: it has maxWidth 900px margin 0 auto. 
                    So actually, we can either:
                    1. Remove constraints from DashboardGrid and let parent handle it.
                    2. Or just align header separately.
                    
                    Given DashboardGrid is a self-contained component often used alone, 
                    I will let DashboardGrid keep its centering, 
                    and JUST center the header pieces here to match it.
                    
                    WAIT: If DashboardGrid has margin: 0 auto, it centers itself inside the parent. 
                    If I wrap everything in maxWidth 900px here, DashboardGrid will fill that 900px.
                    
                    Let's check DashboardGrid again. It has margin: 0 auto inside itself.
                    So if I put it inside a 900px container, it will work fine.
                    But to be safe and avoid double margins, I'll pass a prop or just rely on its specific centering.
                    
                    Actually, the CLEANEST way to align distinct blocks (Head, Widget, Grid) 
                    is to have a common container. 
                    Let's update this file to have that common container.
                 */}
                <div style={{ marginLeft: '-1rem', marginRight: '-1rem' }}> {/* Negative margin to offset grid padding if needed? No, DashboardGrid handles padding. */}
                    <DashboardGrid />
                </div>
            </div>
        </div>
    );
};

export default CitizenDashboard;
