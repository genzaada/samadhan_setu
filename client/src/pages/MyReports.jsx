import React, { useEffect, useState } from 'react';
import { getIssues } from '../services/api';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyReports = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            const { data } = await getIssues();
            setIssues(data);
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
            <h1 style={{ marginBottom: '1.5rem' }}>My Reports</h1>

            {loading ? <div style={{ textAlign: 'center' }}>Loading...</div> : (
                <div className="grid grid-cols-1">
                    {issues.map(issue => (
                        <div key={issue._id} className="glass-card-dark">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{issue.title}</h3>
                                <span className={`badge badge-${issue.status.toLowerCase().replace(' ', '-')}`}>{issue.status}</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <MapPin size={16} style={{ display: 'inline', marginRight: '5px' }} />
                                {issue.location?.address || 'No address'}
                            </p>
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>Description:</p>
                                <p>{issue.original_description}</p>
                            </div>
                            {issue.ai_enhanced_description && (
                                <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius)', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '1rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>AI Enhanced</p>
                                    <p style={{ fontSize: '0.9rem' }}>{issue.ai_enhanced_description}</p>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <span>Category: {issue.category}</span>
                                <span>Date: {new Date(issue.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                    {issues.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>You haven't reported any issues yet.</p>}
                </div>
            )}
        </div>
    );
};

export default MyReports;
