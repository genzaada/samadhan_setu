import React, { useEffect, useState } from 'react';
import { getIssues } from '../services/api';
import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await getIssues();
            // Flatten status history to create notifications
            const allNotifs = [];
            data.forEach(issue => {
                if (issue.status_history) {
                    issue.status_history.forEach(history => {
                        allNotifs.push({
                            issueTitle: issue.title,
                            status: history.status,
                            date: new Date(history.updatedAt),
                            remark: history.remark,
                            id: issue._id + history.updatedAt // unique key
                        });
                    });
                }
                // Add initial creation as notification
                allNotifs.push({
                    issueTitle: issue.title,
                    status: 'Reported',
                    date: new Date(issue.createdAt),
                    remark: 'Issue reported successfully',
                    id: issue._id + 'created'
                });
            });

            // Sort by date desc
            allNotifs.sort((a, b) => b.date - a.date);
            setNotifications(allNotifs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container fade-in" style={{ color: 'white' }}>
            <button className="btn btn-ghost" onClick={() => navigate('/citizen')} style={{ marginBottom: '1rem', color: 'white' }}>
                <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
            </button>
            <h1 style={{ marginBottom: '1.5rem' }}>Notifications</h1>

            {loading ? <div style={{ textAlign: 'center' }}>Loading...</div> : (
                <div className="grid grid-cols-1">
                    {notifications.map((notif) => (
                        <div key={notif.id} className="glass-card-dark" style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                            <div style={{ background: 'var(--surface)', padding: '0.5rem', borderRadius: '50%' }}>
                                <Bell size={20} color="var(--primary)" />
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                    {notif.status}: {notif.issueTitle}
                                </p>
                                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{notif.remark}</p>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {notif.date.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))}
                    {notifications.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No notifications yet.</p>}
                </div>
            )}
        </div>
    );
};

export default Notifications;
