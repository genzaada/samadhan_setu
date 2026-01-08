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
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [resolutionData, setResolutionData] = useState({ remark: '', proofImage: '' });

    // UI State
    const [activeTab, setActiveTab] = useState('dashboard');
    const [tasksCompleted, setTasksCompleted] = useState(2);
    const [totalTasks, setTotalTasks] = useState(5);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data } = await getIssues();
        setIssues(data);
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
            const currentIndex = issues.findIndex(i => i._id === selectedIssue._id);
            if (currentIndex < issues.length - 1) {
                setSelectedIssue(issues[currentIndex + 1]);
            }
        } catch (error) {
            alert('Failed to resolve');
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', padding: '1.5rem', gap: '1.5rem' }}>
            {/* SIDEBAR - Floating Glass Island */}
            <aside style={{
                width: '18vw',
                minWidth: '260px',
                maxWidth: '320px',
                background: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(12px)',
                // Removed borderRight as it's now detached
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px', // Curved edges
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                color: 'white',
                transition: 'width 0.3s ease'
            }}>
                {/* Brand */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '32px', height: '32px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                        }}>
                            <Leaf size={20} fill="white" />
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>Worker Portal</span>
                    </div>
                </div>

                {/* Profile Widget */}
                <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '1rem',
                        display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', overflow: 'hidden'
                        }}>
                            <img src={user?.avatar || "https://i.pravatar.cc/150?u=a042581f4e29026024d"} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'white', margin: 0 }}>{user?.name || 'Worker'}</h3>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>{user?.role || 'Field Worker'}</p>
                        </div>
                    </div>
                    {/* Stats Row */}
                    <div style={{ display: 'flex', marginTop: '0.75rem', gap: '0.5rem' }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', color: 'white', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Leaf size={12} /> 1,280 pts
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', color: 'white', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            ★ 4.7
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ padding: '0 1rem', flex: 1, background: 'transparent', backdropFilter: 'none', border: 'none' }}>
                    <div style={{ marginBottom: '0.5rem', paddingLeft: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase' }}>
                        Menu
                    </div>
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                        { id: 'tasks', icon: ListTodo, label: 'My Tasks' },
                        { id: 'total_reports', icon: FileText, label: 'Total Reports' },
                        { id: 'map', icon: MapIcon, label: 'Map View' },
                        { id: 'history', icon: History, label: 'History' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                width: '100%', padding: '0.75rem 1rem',
                                borderRadius: '12px', border: 'none',
                                background: activeTab === item.id ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                color: activeTab === item.id ? 'white' : 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.9rem', fontWeight: activeTab === item.id ? '600' : '500',
                                cursor: 'pointer', marginBottom: '0.5rem',
                                textAlign: 'left',
                                transition: 'all 0.2s',
                                backdropFilter: activeTab === item.id ? 'blur(8px)' : 'none'
                            }}
                        >
                            <item.icon size={18} /> {item.label}
                        </button>
                    ))}
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: 'auto' }}>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>Government of India</p>
                </div>
            </aside>

            {/* MAIN CONTENT - Transparent background */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

                {/* Top Header - Floating Glassmorphism */}
                <header style={{
                    height: '70px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px', // Curved edges
                    marginBottom: '1.5rem', // Space below header
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem'
                }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.5)' }} />
                        <input
                            type="text"
                            placeholder="Search task, location, sector"
                            style={{
                                width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                outline: 'none', color: 'white',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'white' }}>
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <Bell size={20} />
                            <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span>
                        </div>
                        <HelpCircle size={20} style={{ cursor: 'pointer' }} />
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255, 255, 255, 0.2)' }}>
                            <img src={user?.avatar || "https://i.pravatar.cc/150?u=a042581f4e29026024d"} alt="User" style={{ width: '100%', height: '100%' }} />
                        </div>
                    </div>
                </header>

                {/* Dashboard Content - No extra padding needed as root container has it */}
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' /* Scrollbar space */ }}>

                    {/* Progress Card - Glassmorphism */}
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px', padding: '1.5rem', marginBottom: '1.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <CheckCircle2 size={22} color="#4ade80" />
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'white' }}>
                                Tasks completed today: {tasksCompleted} / {totalTasks}
                            </h3>
                        </div>
                        <div style={{ height: '8px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${(tasksCompleted / totalTasks) * 100}%`, height: '100%', background: '#4ade80', borderRadius: '4px', boxShadow: '0 0 10px rgba(74, 222, 128, 0.5)' }} />
                        </div>
                    </div>

                    {/* Split View */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1.5fr) minmax(350px, 1fr)', gap: '1.5rem', height: 'calc(100vh - 280px)' }}>

                        {/* LEFT: Map & Task List */}
                        {activeTab === 'total_reports' ? (
                            <div style={{ gridColumn: 'span 2', background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.1)', overflowY: 'auto' }}>
                                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Total Reports History</h2>
                                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left' }}>
                                            <th style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.6)' }}>ID</th>
                                            <th style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.6)' }}>Title</th>
                                            <th style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.6)' }}>Location</th>
                                            <th style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.6)' }}>Status</th>
                                            <th style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.6)' }}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {issues.map((issue, idx) => (
                                            <tr key={issue._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                <td style={{ padding: '1rem', fontWeight: '600' }}>#{idx + 1}</td>
                                                <td style={{ padding: '1rem' }}>{issue.title}</td>
                                                <td style={{ padding: '1rem' }}>{issue.location?.address}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600',
                                                        background: issue.status === 'Resolved' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                                                        color: issue.status === 'Resolved' ? '#4ade80' : '#f87171'
                                                    }}>
                                                        {issue.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.6)' }}>{new Date(issue.updatedAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* "Map" Placeholder */}
                                <div style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden', flex: 1, position: 'relative' }}>
                                    <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <MapPin size={18} color="#4ade80" />
                                        <span style={{ fontWeight: '600', color: 'white' }}>Live task map</span>
                                    </div>
                                    <div style={{ height: '300px', background: 'rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
                                            <MapIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                            <p>Map Visualization</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Task List */}
                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {issues.map(issue => (
                                        <div
                                            key={issue._id}
                                            onClick={() => setSelectedIssue(issue)}
                                            style={{
                                                background: selectedIssue?._id === issue._id ? 'rgba(74, 222, 128, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                                                backdropFilter: 'blur(10px)',
                                                borderRadius: '24px', padding: '1rem',
                                                border: selectedIssue?._id === issue._id ? '1px solid #4ade80' : '1px solid rgba(255, 255, 255, 0.1)',
                                                marginBottom: '1rem', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '12px',
                                                    background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <ChevronDown color={selectedIssue?._id === issue._id ? '#4ade80' : 'rgba(255, 255, 255, 0.7)'} />
                                                </div>
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'white' }}>{issue.title}</h4>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>{issue.location?.address}</p>
                                                </div>
                                            </div>
                                            <span style={{
                                                fontSize: '0.75rem', fontWeight: '600',
                                                padding: '0.25rem 0.5rem', borderRadius: '4px',
                                                background: issue.status === 'Pending' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(74, 222, 128, 0.2)',
                                                color: issue.status === 'Pending' ? '#f87171' : '#4ade80'
                                            }}>
                                                {issue.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* RIGHT: Task Details (Selected Issue) */}
                        {selectedIssue ? (
                            <div style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto'
                            }}>
                                {/* Details Header */}
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div style={{ background: 'rgba(248, 113, 113, 0.2)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ width: '14px', height: '14px', background: '#f87171', borderRadius: '2px' }} />
                                        </div>
                                        <div style={{ flex: 1, paddingLeft: '1rem' }}>
                                            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: '700', color: 'white', lineHeight: '1.4' }}>
                                                {selectedIssue.title}
                                            </h2>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.5' }}>
                                                {selectedIssue.ai_enhanced_description || selectedIssue.original_description}
                                            </p>
                                        </div>
                                        <ChevronUp size={20} color="rgba(255, 255, 255, 0.5)" />
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '3rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.75rem', background: 'rgba(248, 113, 113, 0.2)', color: '#f87171', borderRadius: '20px' }}>High Priority</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.75rem', background: 'rgba(255, 255, 255, 0.1)', color: 'white', borderRadius: '20px' }}>Pending</span>
                                    </div>

                                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
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
                                            <CheckSquare size={18} color="#4ade80" />
                                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'white' }}>Safety Checklist</h3>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {['Wear high-visibility vest', 'Watch for sharp objects', 'Keep a safe distance from traffic'].map((item, i) => (
                                                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                                                    <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: '#4ade80' }} />
                                                    {item}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action: Photos */}
                                    <div style={{ marginBottom: '2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                            <Camera size={18} color="#4ade80" />
                                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'white' }}>Before / after photos</h3>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <button
                                                style={{
                                                    padding: '1.5rem', border: '1px dashed rgba(255, 255, 255, 0.3)', borderRadius: '16px',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                                    background: 'rgba(255, 255, 255, 0.05)', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.6)'
                                                }}
                                            >
                                                <Upload size={24} />
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
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'rgba(255, 255, 255, 0.6)'
                                                    }}>
                                                        <Upload size={24} />
                                                        <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Upload after (0)</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remarks field */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', display: 'block', marginBottom: '0.5rem' }}>Resolution Remarks</label>
                                        <textarea
                                            placeholder="Add notes about the cleanup..."
                                            value={resolutionData.remark}
                                            onChange={e => setResolutionData({ ...resolutionData, remark: e.target.value })}
                                            style={{
                                                width: '100%', padding: '0.75rem', borderRadius: '16px',
                                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                                background: 'rgba(0, 0, 0, 0.2)',
                                                color: 'white',
                                                fontSize: '0.9rem'
                                            }}
                                            rows={2}
                                        />
                                    </div>

                                    {/* Start Task Button */}
                                    <button
                                        onClick={handleResolveSubmit}
                                        style={{
                                            width: '100%', padding: '1rem',
                                            background: 'linear-gradient(135deg, #22c55e, #16a34a)', // Green Gradient
                                            color: 'white',
                                            border: 'none', borderRadius: '16px',
                                            fontSize: '1rem', fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)'
                                        }}
                                    >
                                        <Play size={18} fill="white" /> Complete Task
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)',
                                borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.4)'
                            }}>
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
