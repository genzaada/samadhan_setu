import React, { useState, useEffect } from 'react';
import { getIssues, resolveIssue } from '../services/api';
import { CheckSquare } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

const WorkerDashboard = () => {
    const [issues, setIssues] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [resolutionData, setResolutionData] = useState({ remark: '', proofImage: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data } = await getIssues();
        setIssues(data);
    };

    const handleResolveSubmit = async (e) => {
        e.preventDefault();
        try {
            await resolveIssue(selectedIssue, resolutionData);
            setSelectedIssue(null);
            setResolutionData({ remark: '', proofImage: '' });
            fetchData();
        } catch (error) {
            alert('Failed to resolve');
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>My Tasks</h1>

            {selectedIssue && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                        <h2>Resolve Issue</h2>
                        <form onSubmit={handleResolveSubmit} style={{ marginTop: '1rem' }}>
                            <textarea
                                className="input"
                                placeholder="Resolution Remarks..."
                                value={resolutionData.remark}
                                onChange={e => setResolutionData({ ...resolutionData, remark: e.target.value })}
                                required
                                style={{ marginBottom: '1rem' }}
                            />
                            <ImageUpload
                                onImageSelect={(base64) => setResolutionData({ ...resolutionData, proofImage: base64 })}
                                label="Proof of Work (Upload or Take Photo)"
                            />
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setSelectedIssue(null)}>Cancel</button>
                                <button type="submit" className="btn btn-success" style={{ background: 'var(--success)', color: 'white' }}>Complete</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1">
                {issues.map(issue => (
                    <div key={issue._id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3>{issue.title}</h3>
                            <span className={`badge badge-${issue.status.toLowerCase().replace(' ', '-')}`}>{issue.status}</span>
                        </div>
                        <p style={{ margin: '0.5rem 0', color: 'var(--text-muted)' }}>{issue.location?.address}</p>
                        <p style={{ marginBottom: '1rem' }}>{issue.ai_enhanced_description}</p>

                        {issue.status === 'In Progress' && (
                            <button className="btn btn-primary" onClick={() => setSelectedIssue(issue._id)}>
                                <CheckSquare size={18} style={{ marginRight: '0.5rem' }} /> Mark Resolved
                            </button>
                        )}
                        {issue.status === 'Resolved' && (
                            <p style={{ fontSize: '0.9rem', color: 'var(--success)' }}>Completed on {new Date(issue.updatedAt).toLocaleDateString()}</p>
                        )}
                    </div>
                ))}
                {issues.length === 0 && <p>No tasks assigned.</p>}
            </div>
        </div>
    );
};

export default WorkerDashboard;
