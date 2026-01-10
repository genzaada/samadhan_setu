import React, { useState, useEffect } from 'react';
import { getIssues, getWorkers, assignIssue, getSummary, verifyIssue, dismissIssue, improveIssue } from '../services/api';
import { Users, FileText, CheckCircle, Menu, X, Filter, BarChart2, CheckSquare, Eye, Check, MapPin, Sparkles, AlertTriangle, LayoutGrid, DollarSign, Calendar, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const AdminDashboard = () => {
    const { t } = useLanguage();
    const [issues, setIssues] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [summary, setSummary] = useState('');
    const [generatedSummary, setGeneratedSummary] = useState(false);

    // Navigation State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState('dashboard');
    const [assignModalIssue, setAssignModalIssue] = useState(null);


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

    // --- VIEW RENDERERS ---

    // KPI Filter State
    const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Pending', 'Resolved', 'Failed'

    // Derived Stats
    const stats = {
        total: issues.length,
        pending: issues.filter(i => i.status === 'Pending').length,
        successful: issues.filter(i => i.status === 'Resolved').length,
        failed: issues.filter(i => i.status === 'Failed').length
    };

    // Filtered Issues for Display
    const displayedIssues = issues.filter(issue => {
        if (filterStatus === 'All') return true;
        if (filterStatus === 'Successful') return issue.status === 'Resolved';
        return issue.status === filterStatus;
    });

    const renderDashboard = () => (
        <div>
            {/* KPI CARDS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>

                {/* Total Stats Card */}
                <div
                    onClick={() => setFilterStatus('All')}
                    className="glass-card"
                    style={{
                        padding: '1.5rem', cursor: 'pointer',
                        borderLeft: '5px solid #2563eb', // Blue
                        opacity: filterStatus === 'All' ? 1 : 0.7,
                        position: 'relative'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text)', margin: 0 }}>{stats.total}</h2>
                        <span style={{ color: '#2563eb' }}>📊</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: '500' }}>Total Reports</p>
                        <div style={{ transform: filterStatus === 'All' ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                            <ChevronRight size={20} color="#2563eb" />
                        </div>
                    </div>
                </div>

                {/* Pending Card */}
                <div
                    onClick={() => setFilterStatus('Pending')}
                    className="glass-card"
                    style={{
                        padding: '1.5rem', cursor: 'pointer',
                        borderLeft: '5px solid #f59e0b', // Orange
                        opacity: filterStatus === 'Pending' ? 1 : 0.7,
                        position: 'relative'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text)', margin: 0 }}>{stats.pending}</h2>
                        <span style={{ color: '#f59e0b' }}>🕒</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: '500' }}>Pending</p>
                        <div style={{ transform: filterStatus === 'Pending' ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                            <ChevronRight size={20} color="#f59e0b" />
                        </div>
                    </div>
                </div>

                {/* Successful Card */}
                <div
                    onClick={() => setFilterStatus('Successful')}
                    className="glass-card"
                    style={{
                        padding: '1.5rem', cursor: 'pointer',
                        borderLeft: '5px solid #10b981', // Green
                        opacity: filterStatus === 'Successful' ? 1 : 0.7,
                        position: 'relative'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text)', margin: 0 }}>{stats.successful}</h2>
                        <span style={{ color: '#10b981' }}>✅</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: '500' }}>Successful</p>
                        <div style={{ transform: filterStatus === 'Successful' ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                            <ChevronRight size={20} color="#10b981" />
                        </div>
                    </div>
                </div>

                {/* Failed Card */}
                <div
                    onClick={() => setFilterStatus('Failed')}
                    className="glass-card"
                    style={{
                        padding: '1.5rem', cursor: 'pointer',
                        borderLeft: '5px solid #ef4444', // Red
                        opacity: filterStatus === 'Failed' ? 1 : 0.7,
                        position: 'relative'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text)', margin: 0 }}>{stats.failed}</h2>
                        <span style={{ color: '#ef4444' }}>❌</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: '500' }}>Failed</p>
                        <div style={{ transform: filterStatus === 'Failed' ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                            <ChevronRight size={20} color="#ef4444" />
                        </div>
                    </div>
                </div>
            </div>

            {/* RECENT ACTIVITY WIDGET */}
            <div className="glass-card" style={{ marginBottom: '2rem', padding: '0', overflow: 'hidden' }}>
                <div style={{
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text)' }}>{t('recent_activity')}</h3>
                </div>

                <div style={{ padding: '0' }}>
                    {issues
                        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                        .slice(0, 5)
                        .map((item, idx) => (
                            <div key={item._id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '1.5rem',
                                borderBottom: idx !== 4 ? '1px solid var(--border)' : 'none',
                                alignItems: 'center'
                            }}>
                                {/* Left: Info */}
                                <div>
                                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text)', fontSize: '1rem', fontWeight: '600' }}>{item.title}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                            {item.category === 'Cleanliness' && '🗑️ '}
                                            {item.category === 'Drainage' && '💧 '}
                                            {item.category === 'Infrastructure' && '🚧 '}
                                            {item.category === 'Maintenance' && '💡 '}
                                            {item.category || 'General'}
                                        </span>
                                    </div>
                                    <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Assigned to: {item.assignedTo ? item.assignedTo.name : 'Unassigned'}</p>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <MapPin size={12} /> {item.location?.address || 'No location'}
                                    </p>
                                </div>

                                {/* Right: Status & Date */}
                                <div style={{ textAlign: 'right' }}>
                                    <span className={`badge badge-${item.status.toLowerCase().replace(' ', '-')}`} style={{
                                        display: 'inline-block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.75rem',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '4px',
                                        fontWeight: '600',
                                        backgroundColor: item.status === 'Resolved' ? '#dcfce7' : (item.status === 'Pending' ? '#fee2e2' : '#fef9c3'),
                                        color: item.status === 'Resolved' ? '#166534' : (item.status === 'Pending' ? '#991b1b' : '#854d0e')
                                    }}>
                                        {t('status_' + item.status.toLowerCase().replace(' ', '_'))}
                                    </span>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(item.updatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    {issues.length === 0 && (
                        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>No recent activity.</div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {filterStatus === 'All' ? t('dashboard_overview') : `${filterStatus} Reports`}
                </h2>
                <button className="btn btn-secondary" onClick={handleSummary}>
                    <FileText size={18} style={{ marginRight: '0.5rem' }} /> {t('generate_summary')}
                </button>
            </div>

            {generatedSummary && (
                <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
                    <h3>AI Executive Summary</h3>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', marginTop: '1rem', color: 'var(--text-muted)' }}>{summary || 'Generating...'}</pre>
                </div>
            )}

            <div className="grid grid-cols-1">
                {displayedIssues.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        <p>No reports found for this category.</p>
                    </div>
                ) : (
                    displayedIssues.map(issue => (
                        <div key={issue._id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <div>
                                    <h3>{issue.title}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{issue.location?.address}</p>

                                    {/* Issue Image Thumbnail */}
                                    {issue.images && issue.images.length > 0 && (
                                        <div style={{ marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', height: '150px' }}>
                                            <img
                                                src={issue.images[0]}
                                                alt="Issue Evidence"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}

                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span className={`badge badge-${issue.status.toLowerCase().replace(' ', '-')}`} style={{
                                        display: 'inline-block',
                                        fontSize: '0.75rem',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '4px',
                                        fontWeight: '600',
                                        backgroundColor: issue.status === 'Resolved' ? '#dcfce7' : (issue.status === 'Pending' ? '#fee2e2' : '#fef9c3'),
                                        color: issue.status === 'Resolved' ? '#166534' : (issue.status === 'Pending' ? '#991b1b' : '#854d0e')
                                    }}>
                                        {t('status_' + issue.status.toLowerCase().replace(' ', '_'))}
                                    </span>
                                    {issue.assignedTo && <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Assigned: {issue.assignedTo.name}</p>}
                                </div>
                            </div>

                            {/* AI Insights Section */}
                            {(issue.severity || issue.recommendedAction) && (
                                <div style={{
                                    background: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    marginBottom: '1rem',
                                    fontSize: '0.85rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 'bold', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Sparkles size={14} /> AI Insights
                                        </span>
                                        {issue.severity && (
                                            <span style={{
                                                textTransform: 'uppercase',
                                                fontWeight: '700',
                                                color: issue.severity.toLowerCase() === 'high' || issue.severity.toLowerCase() === 'critical' ? '#dc2626' : '#166534'
                                            }}>
                                                Severity: {issue.severity}
                                            </span>
                                        )}
                                    </div>
                                    {issue.recommendedAction && (
                                        <p style={{ margin: 0, color: '#15803d' }}>
                                            <strong>Recommendation:</strong> {issue.recommendedAction}
                                        </p>
                                    )}
                                </div>
                            )}

                            <p style={{ marginBottom: '1rem' }}>{issue.ai_enhanced_description || issue.original_description}</p>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                                {issue.status === 'Resolved' ? (
                                    <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <CheckCircle size={18} /> Resolved
                                    </span>
                                ) : (
                                    <>
                                        {/* AI Enhance Button */}
                                        <button
                                            onClick={async () => {
                                                const originalText = issue.original_description || issue.title; // Fallback
                                                if (!originalText) return alert("No description to analyze.");

                                                // Create a temporary loading state for this specific card button if possible, 
                                                // or just use global loading. For simplicity, minimal inline loading feedback.
                                                const btn = document.getElementById(`ai-btn-${issue._id}`);
                                                if (btn) btn.innerText = "Analyzing...";

                                                try {
                                                    const aiData = await improveIssue(originalText);

                                                    // Optimistically update the local state for immediate feedback
                                                    // We need to update the specific issue in the 'issues' array
                                                    setIssues(prevIssues => prevIssues.map(i => {
                                                        if (i._id === issue._id) {
                                                            return {
                                                                ...i,
                                                                ai_enhanced_description: aiData.improved_description,
                                                                category: aiData.category, // Auto-update category
                                                                severity: aiData.severity_level,
                                                                recommendedAction: aiData.recommended_action,
                                                                priority: aiData.priority
                                                            };
                                                        }
                                                        return i;
                                                    }));
                                                    alert("AI Analysis Complete! Category, Priority, and Description summarized/updated.");
                                                } catch (err) {
                                                    console.error(err);
                                                    alert("AI Analysis Failed.");
                                                } finally {
                                                    if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg> Analyze';
                                                }
                                            }}
                                            id={`ai-btn-${issue._id}`}
                                            className="btn"
                                            style={{
                                                background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                                                color: 'white',
                                                border: 'none',
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.8rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                marginRight: 'auto' // Push other elements to the right
                                            }}
                                        >
                                            <Sparkles size={16} /> Analyze
                                        </button>

                                        <button
                                            onClick={() => setAssignModalIssue(issue)}
                                            disabled={issue.status === 'Resolved'}
                                            className="btn"
                                            style={{
                                                background: 'var(--surface)',
                                                border: '1px solid var(--border)',
                                                color: 'var(--text)',
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.8rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Users size={16} /> Assign
                                        </button>

                                    </>
                                )}
                            </div>
                        </div>
                    )))}
            </div>
            {/* ASSIGN WORKER MODAL */}
            {assignModalIssue && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setAssignModalIssue(null)}>
                    <div
                        className="card"
                        style={{ width: '90%', maxWidth: '500px', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Assign Worker</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ticket ID: {assignModalIssue._id.slice(-6)}</p>
                            </div>
                            <button onClick={() => setAssignModalIssue(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1.5rem', background: 'var(--surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{assignModalIssue.title}</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{assignModalIssue.original_description}</p>

                                {/* Modal Image Display */}
                                {assignModalIssue.images && assignModalIssue.images.length > 0 && (
                                    <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                        <img
                                            src={assignModalIssue.images[0]}
                                            alt="Issue Evidence"
                                            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }}
                                        />
                                    </div>
                                )}
                            </div>

                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Field Worker</label>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                {workers.map(worker => (
                                    <div
                                        key={worker._id}
                                        onClick={() => {
                                            handleAssign(assignModalIssue._id, worker._id);
                                            setAssignModalIssue(null);
                                        }}
                                        style={{
                                            padding: '1rem',
                                            borderBottom: '1px solid var(--border)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: 'var(--bg)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg)'}
                                    >
                                        <span style={{ fontWeight: '500' }}>{worker.name}</span>
                                        {/* Optional: Show worker load/status if available */}
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // --- WORKER MANAGEMENT VIEW ---
    const [selectedWorkerForHistory, setSelectedWorkerForHistory] = useState(null);

    const renderWorkerManagement = () => {
        // Calculate stats per worker
        const workerStats = workers.map(worker => {
            const workerIssues = issues.filter(i => i.assignedTo?._id === worker._id);
            return {
                ...worker,
                completed: workerIssues.filter(i => i.status === 'Resolved').length,
                pending: workerIssues.filter(i => i.status !== 'Resolved').length,
                total: workerIssues.length
            };
        });

        const workerHistory = selectedWorkerForHistory
            ? issues.filter(i => i.assignedTo?._id === selectedWorkerForHistory._id).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            : [];

        return (
            <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={24} /> Field Worker Management
                </h2>

                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Worker Profiles</h3>
                    </div>
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                            <div>NAME</div>
                            <div style={{ textAlign: 'right' }}>COMPLETED</div>
                        </div>
                        {workerStats.map(worker => (
                            <div
                                key={worker._id}
                                onClick={() => setSelectedWorkerForHistory(worker)}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 100px',
                                    padding: '1.5rem',
                                    borderBottom: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    color: 'var(--text)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ fontWeight: '500', color: 'var(--text)' }}>{worker.name}</div>
                                <div style={{ textAlign: 'right', fontWeight: '600', color: 'var(--success)' }}>{worker.completed}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Worker History Modal */}
                {selectedWorkerForHistory && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }} onClick={() => setSelectedWorkerForHistory(null)}>
                        <div
                            className="card"
                            style={{ width: '90%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedWorkerForHistory.name}</h3>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Work History</p>
                                </div>
                                <button onClick={() => setSelectedWorkerForHistory(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ overflowY: 'auto', padding: '1.5rem' }}>
                                {workerHistory.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#94a3b8' }}>No history found for this worker.</p>
                                ) : (
                                    workerHistory.map(issue => (
                                        <div key={issue._id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>{issue.title}</h4>
                                                <span className={`badge badge-${issue.status.toLowerCase().replace(' ', '-')}`} style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '4px',
                                                    fontWeight: '600',
                                                    backgroundColor: issue.status === 'Resolved' ? '#dcfce7' : (issue.status === 'Pending' ? '#fee2e2' : '#fef9c3'),
                                                    color: issue.status === 'Resolved' ? '#166534' : (issue.status === 'Pending' ? '#991b1b' : '#854d0e')
                                                }}>
                                                    {issue.status}
                                                </span>
                                            </div>
                                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>{new Date(issue.updatedAt).toLocaleDateString()} • {issue.category || 'General'}</p>
                                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155' }}>{issue.location?.address}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // --- RENDER FILTER REPORTS ---
    const [selectedZone, setSelectedZone] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTimePeriod, setSelectedTimePeriod] = useState('All');

    const getFilteredIssues = () => {
        return issues.filter(issue => {
            const matchesZone = selectedZone === 'All' || (issue.zone === selectedZone);
            const matchesCategory = selectedCategory === 'All' || (issue.category === selectedCategory);

            let matchesTime = true;
            if (selectedTimePeriod !== 'All') {
                const issueDate = new Date(issue.createdAt);
                const now = new Date();
                if (selectedTimePeriod === 'Today') {
                    matchesTime = issueDate.toDateString() === now.toDateString();
                } else if (selectedTimePeriod === 'This Week') {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(now.getDate() - 7);
                    matchesTime = issueDate >= oneWeekAgo;
                } else if (selectedTimePeriod === 'This Month') {
                    matchesTime = issueDate.getMonth() === now.getMonth() && issueDate.getFullYear() === now.getFullYear();
                }
            }
            return matchesZone && matchesCategory && matchesTime;
        });
    };

    const renderFilterReports = () => {
        const filteredList = getFilteredIssues();

        return (
            <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={24} /> {t('filter_reports')}
                </h2>

                {/* Filter Controls */}
                <div className="glass-card" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>AREA / ZONE</label>
                            <select
                                value={selectedZone}
                                onChange={(e) => setSelectedZone(e.target.value)}
                                className="input"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.5)', color: 'var(--text)', border: '1px solid var(--border)' }}
                            >
                                <option value="All">All Zones</option>
                                <option value="North Zone">North Zone</option>
                                <option value="South Zone">South Zone</option>
                                <option value="East Zone">East Zone</option>
                                <option value="West Zone">West Zone</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>CATEGORY</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="input"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.5)', color: 'var(--text)', border: '1px solid var(--border)' }}
                            >
                                <option value="All">All Categories</option>
                                <option value="Roads">Roads</option>
                                <option value="Electricity">Electricity</option>
                                <option value="Water Supply">Water Supply</option>
                                <option value="Cleanliness">Cleanliness</option>
                                <option value="Drainage">Drainage</option>
                                <option value="Infrastructure">Infrastructure</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>TIME PERIOD</label>
                            <select
                                value={selectedTimePeriod}
                                onChange={(e) => setSelectedTimePeriod(e.target.value)}
                                className="input"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.5)', color: 'var(--text)', border: '1px solid var(--border)' }}
                            >
                                <option value="All">All Time</option>
                                <option value="Today">Today</option>
                                <option value="This Week">This Week</option>
                                <option value="This Month">This Month</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Filter Results Table */}
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>TOKEN</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>TITLE</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>AREA</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>CATEGORY</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No reports match your filters.</td>
                                </tr>
                            ) : (
                                filteredList.map((issue, index) => (
                                    <tr key={issue._id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--text)' }}>
                                            {`T${(index + 1).toString().padStart(3, '0')}`}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                            {issue.title}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                            {issue.zone || 'North Zone'}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                            {issue.category === 'Cleanliness' && '🗑️ '}
                                            {issue.category === 'Drainage' && '💧 '}
                                            {issue.category === 'Infrastructure' && '🚧 '}
                                            {issue.category === 'Maintenance' && '💡 '}
                                            {issue.category}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <span className={`badge badge-${issue.status.toLowerCase().replace(' ', '-')}`} style={{
                                                fontSize: '0.75rem',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '4px', // Rectangular badge style from design
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                backgroundColor: issue.status === 'Resolved' ? '#dcfce7' : (issue.status === 'Pending' ? '#fee2e2' : '#fef9c3'),
                                                color: issue.status === 'Resolved' ? '#166534' : (issue.status === 'Pending' ? '#991b1b' : '#854d0e')
                                            }}>
                                                {t('status_' + issue.status.toLowerCase().replace(' ', '_'))}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // --- VERIFY SOLUTIONS VIEW ---
    const [viewProofIssue, setViewProofIssue] = useState(null);

    const handleVerify = async (id) => {
        try {
            await verifyIssue(id);
            fetchData(); // Refresh list
        } catch (error) {
            alert('Verification failed');
        }
    };

    const handleDismiss = async (id) => {
        if (!window.confirm('Are you sure you want to dismiss this resolution? It will revert to "In Progress".')) return;
        try {
            await dismissIssue(id);
            fetchData(); // Refresh list
        } catch (error) {
            alert('Dismissal failed');
        }
    };

    const renderVerifySolutions = () => {
        const pendingVerificationIssues = issues.filter(i => i.status === 'Pending Verification');

        return (
            <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={24} /> Pending Resolution Verification
                </h2>

                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 2fr 1.5fr 300px', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg)', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        <div>REPORT ID (TOKEN)</div>
                        <div>ISSUE TITLE</div>
                        <div>WORKER ASSIGNED</div>
                        <div>ACTION</div>
                    </div>

                    {pendingVerificationIssues.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <p>No solutions pending verification.</p>
                        </div>
                    ) : (
                        pendingVerificationIssues.map(issue => (
                            <div key={issue._id} style={{
                                display: 'grid',
                                gridTemplateColumns: '150px 2fr 1.5fr 300px',
                                padding: '1.5rem',
                                borderBottom: '1px solid var(--border)',
                                alignItems: 'center',
                                color: 'var(--text)'
                            }}>
                                <div style={{ fontWeight: 'bold', color: 'var(--text)' }}>
                                    {issue._id.slice(-4)}
                                </div>
                                <div style={{ fontWeight: '500', color: 'var(--text-muted)' }}>{issue.title}</div>
                                <div style={{ color: 'var(--text-muted)' }}>{issue.assignedTo?.name || 'Unknown'}</div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => setViewProofIssue(issue)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8rem' }}
                                    >
                                        <Eye size={16} /> VIEW PROOF
                                    </button>
                                    <button
                                        onClick={() => handleVerify(issue._id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', border: 'none', background: '#059669', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', color: 'white', fontSize: '0.8rem' }}
                                    >
                                        <Check size={16} /> VERIFY
                                    </button>
                                    <button
                                        onClick={() => handleDismiss(issue._id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', border: 'none', background: '#e11d48', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', color: 'white', fontSize: '0.8rem' }}
                                    >
                                        <X size={16} /> DISMISS
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* PROOF MODAL */}
                {viewProofIssue && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setViewProofIssue(null)}>
                        <div className="card" style={{ width: '90%', maxWidth: '500px', padding: '0', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                            <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0 }}>Proof of Completion</h3>
                                <button onClick={() => setViewProofIssue(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                {(() => {
                                    // Find the status history item that is likely the resolution attempt (latest 'Pending Verification')
                                    const historyItem = [...viewProofIssue.status_history].reverse().find(h => h.status === 'Pending Verification' || h.status === 'Resolved'); // Should be 'Pending Verification'

                                    return (
                                        <>
                                            {historyItem?.proofImage ? (
                                                <img src={historyItem.proofImage} alt="Proof" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem', maxHeight: '300px', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ padding: '2rem', background: '#f1f5f9', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem', color: '#94a3b8' }}>No Image Provided</div>
                                            )}
                                            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Worker's Remark:</p>
                                            <p style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', margin: 0 }}>
                                                {historyItem?.remark || "No remarks provided."}
                                            </p>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // --- COST ANALYSIS STATE ---
    const [issueCosts, setIssueCosts] = useState({});

    useEffect(() => {
        const initialCosts = {};
        issues.forEach(issue => {
            initialCosts[issue._id] = issue.cost || 0;
        });
        setIssueCosts(initialCosts);
    }, [issues]);

    const handleCostChangeLocal = (id, newCost) => {
        setIssueCosts(prev => ({
            ...prev,
            [id]: Number(newCost)
        }));
    };

    const saveCost = async (id) => {
        try {
            const cost = issueCosts[id];
            // Dynamic import can stay, or move to top. Keeping it here is fine as it's an async function, not a hook.
            await import('../services/api').then(module => module.updateIssueCost(id, cost));
            alert('Cost updated successfully');
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Failed to update cost');
        }
    };

    // Cost Analysis View
    const renderCostAnalysis = () => {
        const totalCost = issues.reduce((acc, issue) => acc + (issue.cost || 0), 0);
        const utilizedCost = issues
            .filter(i => i.status === 'Resolved' || i.status === 'Closed')
            .reduce((acc, issue) => acc + (issue.cost || 0), 0);
        const remainingCost = totalCost - utilizedCost;

        return (
            <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Cost Analysis & Projections</h2>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="glass-card" style={{
                        padding: '1.5rem',
                        borderLeft: '4px solid #2563eb', // Blue
                        borderRadius: '16px'
                    }}>
                        <h3 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: 'var(--text)' }}>₹{totalCost.toLocaleString()}</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Total Estimated Expenditure</p>
                    </div>
                    <div className="glass-card" style={{
                        padding: '1.5rem',
                        borderLeft: '4px solid #10b981', // Green
                        borderRadius: '16px'
                    }}>
                        <h3 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: 'var(--text)' }}>₹{utilizedCost.toLocaleString()}</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Funds Utilized (YTD)</p>
                    </div>
                    <div className="glass-card" style={{
                        padding: '1.5rem',
                        borderLeft: '4px solid #f59e0b', // Orange
                        borderRadius: '16px'
                    }}>
                        <h3 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: 'var(--text)' }}>₹{remainingCost.toLocaleString()}</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Projected Remaining (Pending)</p>
                    </div>
                </div>

                {/* Detailed Cost Table */}
                <div className="card" style={{
                    padding: '0',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '16px'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Report Name / Issue</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Date</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Status</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'right' }}>Estimated Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issues.map((issue, idx) => {
                                const isFixed = issue.status === 'Resolved';
                                // Always allow editing for admin power
                                return (
                                    <tr key={issue._id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                                        <td style={{ padding: '1rem', fontWeight: '500', color: 'var(--text)' }}>
                                            {issue.title}
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{issue.location?.address}</div>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                            {new Date(issue.createdAt || Date.now()).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span className={`badge badge-${issue.status.toLowerCase().replace(' ', '-')}`} style={{
                                                display: 'inline-block',
                                                fontSize: '0.75rem',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '4px',
                                                fontWeight: '600',
                                                backgroundColor: issue.status === 'Resolved' ? '#dcfce7' : (issue.status === 'Pending' ? '#fee2e2' : '#fef9c3'),
                                                color: issue.status === 'Resolved' ? '#166534' : (issue.status === 'Pending' ? '#991b1b' : '#854d0e')
                                            }}>
                                                {issue.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <span style={{ marginRight: '0.25rem', color: 'var(--text)', fontWeight: '600' }}>₹</span>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <input
                                                    type="number"
                                                    value={issueCosts[issue._id] !== undefined ? issueCosts[issue._id] : 0}
                                                    onChange={(e) => handleCostChangeLocal(issue._id, e.target.value)}
                                                    style={{
                                                        width: '80px',
                                                        padding: '0.25rem',
                                                        borderRadius: '4px',
                                                        border: '1px solid var(--border)',
                                                        textAlign: 'right',
                                                        fontFamily: 'monospace',
                                                        fontWeight: '600'
                                                    }}
                                                />
                                                <button
                                                    onClick={() => saveCost(issue._id)}
                                                    className="btn btn-sm"
                                                    style={{
                                                        padding: '0.25rem 0.5rem',
                                                        fontSize: '0.75rem',
                                                        background: 'var(--primary)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Sidebar items configuration
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={22} /> },
        { id: 'filter_reports', label: 'Filter Reports', icon: <Filter size={22} /> },
        { id: 'cost_analysis', label: 'Cost Analysis', icon: <DollarSign size={22} /> },
        { id: 'worker_management', label: 'Worker Management', icon: <Users size={22} /> },
        // Year Reports is hardcoded in the render function as a placeholder for now, or we can add it here if we had a view for it.
        // For visual match, I'll keep the view switching logic simple.
        { id: 'verify_solutions', label: 'Verify Solutions', icon: <Check size={22} /> }
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
            {/* BACKGROUND LAYER REMOVED (Global in App.jsx) */}

            {/* SIDEBAR (Collapsible) */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '280px',
                background: '#064e3b', // Deep Bottle Green (Tailwind emerald-900 like) - Adjusted Match
                color: 'white',
                zIndex: 1000,
                transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s ease-in-out',
                boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src="/logo.jpg" alt="Logo" style={{ height: '32px', width: '32px', objectFit: 'contain', borderRadius: '50%', background: 'white', padding: '2px' }} />
                        SAMADHAN SETU
                    </h2>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                    >
                        <X size={28} strokeWidth={2.5} />
                    </button>
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 1.5rem 1rem 1.5rem' }}></div>

                {/* Menu */}
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1rem' }}>
                    {menuItems.map((item, idx) => (
                        <React.Fragment key={item.id}>
                            {/* Insert Divider if needed based on grouping */}
                            {item.id === 'cost_analysis' && (
                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0.5rem 0.5rem 0.5rem' }}></div>
                            )}

                            <button
                                onClick={() => { setActiveView(item.id); setIsSidebarOpen(false); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    background: 'transparent',
                                    color: activeView === item.id ? 'white' : 'rgba(255,255,255,0.7)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '1rem',
                                    fontWeight: activeView === item.id ? '800' : '500',
                                    transition: 'all 0.2s',
                                    letterSpacing: '0.3px',
                                    marginBottom: '0.5rem' // Added separation
                                }}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        </React.Fragment>
                    ))}

                    {/* Placeholder for Year Reports if it's not in menuItems yet, or add it to menuItems config above */}
                    <button
                        onClick={() => alert("Year Reports View - Coming Soon")}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            background: 'transparent',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '1rem',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Calendar size={20} />
                        Year Reports
                    </button>

                </nav>

                {/* Footer */}
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6ee7b7', fontSize: '0.9rem', fontWeight: '500' }}>
                    Government of India
                </div>
            </div>

            {/* OVERLAY (Background dimming) */}
            {
                isSidebarOpen && (
                    <div
                        onClick={() => setIsSidebarOpen(false)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 900 }}
                    />
                )
            }

            {/* MAIN CONTENT AREA */}
            <div style={{
                flex: 1,
                padding: '2rem',
                marginLeft: 0,
                transition: 'margin-left 0.3s',
                minHeight: '100vh',
                position: 'relative', // Context for content
                zIndex: 1 // Ensure above background
            }}>

                {/* Header with Hamburger */}
                <header style={{
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    background: '#064e3b', // Bottle Green to match sidebar
                    color: 'white',        // White text for contrast
                    backdropFilter: 'blur(10px)',
                    padding: '1rem',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)', // Slightly stronger shadow
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        style={{ background: 'white', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Menu size={24} color="var(--text-muted)" />
                    </button>
                    <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Admin Portal</h1>
                </header>

                {/* View Switcher */}
                {activeView === 'dashboard' && renderDashboard()}
                {activeView === 'filter_reports' && renderFilterReports()}
                {activeView === 'worker_management' && renderWorkerManagement()}
                {activeView === 'cost_analysis' && renderCostAnalysis()}
                {activeView === 'verify_solutions' && renderVerifySolutions()}

            </div>
        </div >
    );
};

export default AdminDashboard;
