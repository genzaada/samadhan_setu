import React, { useState, useEffect } from 'react';
import { getIssues, getWorkers, assignIssue, getSummary } from '../services/api';
import { Users, FileText, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
    const [issues, setIssues] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [summary, setSummary] = useState('');
    const [generatedSummary, setGeneratedSummary] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [issuesRes, workersRes] = await Promise.all([getIssues(), getWorkers()]);
        setIssues(issuesRes.data);
        setWorkers(workersRes.data);
    };

    const handleAssign = async (issueId, workerId) => {
        if (!workerId) return;
        try {
            await assignIssue(issueId, workerId);
            fetchData(); // Refresh to show updated status
        } catch (error) {
            alert('Assignment failed');
        }
    };

    const handleSummary = async () => {
        try {
            setGeneratedSummary(true);
            const { data } = await getSummary();
            setSummary(data.summary);
        } catch (error) {
            setSummary('Failed to generate summary.');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Admin Dashboard</h1>
                <button className="btn btn-secondary" onClick={handleSummary}>
                    <FileText size={18} style={{ marginRight: '0.5rem' }} /> Generate Daily Summary
                </button>
            </div>

            {generatedSummary && (
                <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
                    <h3>AI Executive Summary</h3>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', marginTop: '1rem', color: 'var(--text-muted)' }}>{summary || 'Generating...'}</pre>
                </div>
            )}

            <div className="grid grid-cols-1">
                {issues.map(issue => (
                    <div key={issue._id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div>
                                <h3>{issue.title}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{issue.location?.address}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span className={`badge badge-${issue.status.toLowerCase().replace(' ', '-')}`}>{issue.status}</span>
                                {issue.assignedTo && <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Assigned: {issue.assignedTo.name}</p>}
                            </div>
                        </div>

                        <p style={{ marginBottom: '1rem' }}>{issue.ai_enhanced_description || issue.original_description}</p>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                            {issue.status === 'Resolved' ? (
                                <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckCircle size={18} /> Resolved
                                </span>
                            ) : (
                                <>
                                    <Users size={18} color="var(--text-muted)" />
                                    <select
                                        className="input"
                                        style={{ padding: '0.5rem' }}
                                        onChange={(e) => handleAssign(issue._id, e.target.value)}
                                        value={issue.assignedTo?._id || ''}
                                        disabled={issue.status === 'Resolved'}
                                    >
                                        <option value="">Assign Worker...</option>
                                        {workers.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                                    </select>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
