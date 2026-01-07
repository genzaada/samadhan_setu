import React, { useState, useEffect } from 'react';
import { getIssues, resolveIssue } from '../services/api';
import {
    CheckSquare, Leaf, Bell, Search, HelpCircle, RotateCcw, ChevronDown,
    LayoutDashboard, ListTodo, Map as MapIcon, FileText, History,
    MapPin, Clock, Briefcase, ChevronUp, Camera, Upload, Play, CheckCircle2
} from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import { useLanguage } from '../context/LanguageContext';

import { useAuth } from '../context/AuthContext';

const WorkerDashboard = () => {
    const { t } = useLanguage();
    const { user } = useAuth(); // Get user from context
    const [issues, setIssues] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [resolutionData, setResolutionData] = useState({ remark: '', proofImage: '' });

    // UI State
    const [activeTab, setActiveTab] = useState('dashboard');
    const [tasksCompleted, setTasksCompleted] = useState(2); // Mock for UI match
    const [totalTasks, setTotalTasks] = useState(5);         // Mock for UI match

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data } = await getIssues();
        setIssues(data);
        // Auto-select first issue if available for the details view
        if (data.length > 0 && !selectedIssue) {
            setSelectedIssue(data[0]);
        }
    };

    const handleResolveSubmit = async (e) => {
        e.preventDefault();
        try {
            await resolveIssue(selectedIssue._id, resolutionData);
            setResolutionData({ remark: '', proofImage: '' });
            fetchData();
            // Move to next issue or clear selection
            const currentIndex = issues.findIndex(i => i._id === selectedIssue._id);
            if (currentIndex < issues.length - 1) {
                setSelectedIssue(issues[currentIndex + 1]);
            }
        } catch (error) {
            alert('Failed to resolve');
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#f3f4f6', fontFamily: 'Inter, sans-serif' }}>

            {/* SIDEBAR */}
            <aside style={{
                width: '260px',
                background: '#064e3b', // Bottle Green
                borderRight: '1px solid #065f46',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                color: 'white'
            }}>
                {/* Brand */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #065f46', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                        }}>
                            <Leaf size={20} fill="white" />
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>Worker Portal</span>
                    </div>
                </div>

                {/* Profile Widget (Styled for Dark Sidebar) */}
                <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem',
                        display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%', background: '#374151',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                        }}>
                            <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="User" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'white', margin: 0 }}>{user?.name || 'Worker'}</h3>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{user?.role || 'Field Worker'}</p>
                        </div>
                    </div>
                    {/* Stats Row */}
                    <div style={{ display: 'flex', marginTop: '0.75rem', gap: '0.5rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', color: 'white', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Leaf size={12} /> 1,280 pts
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', color: 'white', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            ★ 4.7
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ padding: '0 1rem', flex: 1 }}>
                    <div style={{ marginBottom: '0.5rem', paddingLeft: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                        Menu
                    </div>
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                        { id: 'tasks', icon: ListTodo, label: 'My Tasks' },
                        { id: 'total_reports', icon: FileText, label: 'Total Reports' }, // Added Total Reports
                        { id: 'map', icon: MapIcon, label: 'Map View' },
                        { id: 'history', icon: History, label: 'History' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                width: '100%', padding: '0.75rem 1rem',
                                borderRadius: '8px', border: 'none',
                                background: activeTab === item.id ? 'white' : 'transparent',
                                color: activeTab === item.id ? '#064e3b' : 'rgba(255,255,255,0.7)', // Active: Bottle Green text, Inactive: White text
                                fontSize: '0.875rem', fontWeight: activeTab === item.id ? '700' : '500',
                                cursor: 'pointer', marginBottom: '0.5rem',
                                textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                        >
                            <item.icon size={18} /> {item.label}
                        </button>
                    ))}
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid #065f46', marginTop: 'auto' }}>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>Government of India</p>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* Top Header */}
                <header style={{
                    height: '64px', background: 'white', borderBottom: '1px solid #e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem'
                }}>
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Search task, location, sector"
                            style={{
                                width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem',
                                background: '#f3f4f6', border: 'none', borderRadius: '8px',
                                outline: 'none', color: '#374151'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#6b7280' }}>
                        <Bell size={20} style={{ cursor: 'pointer' }} />
                        <HelpCircle size={20} style={{ cursor: 'pointer' }} />
                        <RotateCcw size={20} style={{ cursor: 'pointer' }} />
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #e5e7eb' }}>
                            <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="User" style={{ width: '100%', height: '100%' }} />
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>

                    {/* Progress Card */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <CheckCircle2 size={20} color="#15803d" />
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
                                Tasks completed today: {tasksCompleted} / {totalTasks}
                            </h3>
                        </div>
                        <div style={{ height: '8px', width: '100%', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${(tasksCompleted / totalTasks) * 100}%`, height: '100%', background: '#15803d', borderRadius: '4px' }} />
                        </div>
                    </div>

                    {/* Split View */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '1.5rem', height: 'calc(100vh - 250px)' }}>

                        {/* LEFT: Map & Task List */}
                        {activeTab === 'total_reports' ? (
                            <div style={{ gridColumn: 'span 2', background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e5e7eb', overflowY: 'auto' }}>
                                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Total Reports History</h2>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #f3f4f6', textAlign: 'left' }}>
                                            <th style={{ padding: '1rem', color: '#6b7280' }}>ID</th>
                                            <th style={{ padding: '1rem', color: '#6b7280' }}>Title</th>
                                            <th style={{ padding: '1rem', color: '#6b7280' }}>Location</th>
                                            <th style={{ padding: '1rem', color: '#6b7280' }}>Status</th>
                                            <th style={{ padding: '1rem', color: '#6b7280' }}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {issues.map((issue, idx) => (
                                            <tr key={issue._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '1rem', fontWeight: '600' }}>#{idx + 1}</td>
                                                <td style={{ padding: '1rem' }}>{issue.title}</td>
                                                <td style={{ padding: '1rem' }}>{issue.location?.address}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600',
                                                        background: issue.status === 'Resolved' ? '#dcfce7' : '#fee2e2',
                                                        color: issue.status === 'Resolved' ? '#166534' : '#991b1b'
                                                    }}>
                                                        {issue.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', color: '#6b7280' }}>{new Date(issue.updatedAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* "Map" Placeholder */}
                                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', flex: 1, position: 'relative' }}>
                                        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MapPin size={18} color="#15803d" />
                                            <span style={{ fontWeight: '600', color: '#111827' }}>Live task map</span>
                                        </div>
                                        <div style={{ height: '300px', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {/* Simulated Map Visual */}
                                            <div style={{ textAlign: 'center', color: '#6b7280' }}>
                                                <MapIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                                <p>Map Visualization</p>
                                            </div>
                                            {/* Overlay Markers just for visuals */}
                                            <div style={{ position: 'absolute', top: '40%', left: '50%', color: '#15803d' }}><MapPin size={32} fill="#dcfce7" /></div>
                                            <div style={{ position: 'absolute', top: '60%', left: '30%', color: '#9ca3af' }}><MapPin size={24} /></div>
                                        </div>
                                    </div>

                                    {/* Task List (Scrollable) */}
                                    <div style={{ flex: 1, overflowY: 'auto' }}>
                                        {issues.map(issue => (
                                            <div
                                                key={issue._id}
                                                onClick={() => setSelectedIssue(issue)}
                                                style={{
                                                    background: selectedIssue?._id === issue._id ? '#f0fdf4' : 'white',
                                                    borderRadius: '12px', padding: '1rem',
                                                    border: selectedIssue?._id === issue._id ? '1px solid #166534' : '1px solid #e5e7eb',
                                                    marginBottom: '1rem', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{
                                                        width: '40px', height: '40px', borderRadius: '8px',
                                                        background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <ChevronDown color={selectedIssue?._id === issue._id ? '#166534' : '#6b7280'} />
                                                    </div>
                                                    <div>
                                                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: '#111827' }}>{issue.title}</h4>
                                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>{issue.location?.address}</p>
                                                    </div>
                                                </div>
                                                <span style={{
                                                    fontSize: '0.75rem', fontWeight: '600',
                                                    padding: '0.25rem 0.5rem', borderRadius: '4px',
                                                    background: issue.status === 'Pending' ? '#fee2e2' : '#dcfce7',
                                                    color: issue.status === 'Pending' ? '#991b1b' : '#166534'
                                                }}>
                                                    {issue.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* RIGHT: Task Details (Selected Issue) */}
                        {selectedIssue ? (
                            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
                                {/* Header */}
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div style={{ background: '#fee2e2', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ width: '16px', height: '16px', border: '2px solid #ef4444', borderRadius: '2px' }} />
                                        </div>
                                        <div style={{ flex: 1, paddingLeft: '1rem' }}>
                                            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: '700', color: '#111827', lineHeight: '1.4' }}>
                                                {selectedIssue.title}
                                            </h2>
                                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>
                                                {selectedIssue.ai_enhanced_description || selectedIssue.original_description}
                                            </p>
                                        </div>
                                        <ChevronUp size={20} color="#9ca3af" />
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '3rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '20px' }}>High</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.75rem', background: '#f3f4f6', color: '#374151', borderRadius: '20px' }}>Pending</span>
                                    </div>

                                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: '#4b5563' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MapPin size={16} /> {selectedIssue.location?.city || 'Sector 14'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Clock size={16} /> 35m
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Briefcase size={16} /> Gloves • Trash bags
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem' }}>

                                    {/* Safety Checklist */}
                                    <div style={{ marginBottom: '2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                            <CheckSquare size={18} color="#15803d" />
                                            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#111827' }}>Safety Checklist</h3>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {['Wear high-visibility vest', 'Watch for sharp objects', 'Keep a safe distance from traffic'].map((item, i) => (
                                                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
                                                    <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: '#15803d' }} />
                                                    {item}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action: Photos */}
                                    <div style={{ marginBottom: '2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                            <Camera size={18} color="#15803d" />
                                            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#111827' }}>Before / after photos</h3>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            {/* Resolution Data Proof Image Logic - simplified for "After" */}
                                            <button
                                                style={{
                                                    padding: '1rem', border: '1px dashed #d1d5db', borderRadius: '8px',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                                    background: '#f9fafb', cursor: 'pointer', color: '#6b7280'
                                                }}
                                            >
                                                <Upload size={20} />
                                                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Upload before (0)</span>
                                            </button>

                                            <div style={{ position: 'relative' }}>
                                                <ImageUpload
                                                    onImageSelect={(base64) => setResolutionData({ ...resolutionData, proofImage: base64 })}
                                                    label=""
                                                />
                                                {!resolutionData.proofImage && (
                                                    <div style={{
                                                        position: 'absolute', inset: 0, pointerEvents: 'none',
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#6b7280'
                                                    }}>
                                                        <Upload size={20} />
                                                        <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Upload after (0)</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remarks field (Hidden in design but needed for logic) */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Resolution Remarks</label>
                                        <textarea
                                            placeholder="Add notes about the cleanup..."
                                            value={resolutionData.remark}
                                            onChange={e => setResolutionData({ ...resolutionData, remark: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.875rem' }}
                                            rows={2}
                                        />
                                    </div>

                                    {/* Start Task Button */}
                                    <button
                                        onClick={handleResolveSubmit}
                                        style={{
                                            width: '100%', padding: '0.875rem',
                                            background: '#15803d', color: 'white',
                                            border: 'none', borderRadius: '8px',
                                            fontSize: '1rem', fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                        }}
                                    >
                                        <Play size={18} fill="white" /> Complete Task
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', color: '#9ca3af' }}>
                                Select a task to view details
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default WorkerDashboard;
