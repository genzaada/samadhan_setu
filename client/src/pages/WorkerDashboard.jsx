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
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

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

    // Derived State
    const pendingTasks = issues.filter(i => i.status !== 'Resolved');
    const resolvedTasks = issues.filter(i => i.status === 'Resolved');
    const isMapView = activeTab === 'map';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data } = await getIssues();
        setIssues(data);
    };

    // Checklist State
    const checklistItems = ['Wear high-visibility vest', 'Watch for sharp objects', 'Keep a safe distance from traffic'];
    const [checkedItems, setCheckedItems] = useState({});

    useEffect(() => {
        // Reset checklist when issue changes
        setCheckedItems({});
        setResolutionData({ remark: '', proofImage: '' });
    }, [selectedIssue]);

    const handleCheck = (item) => {
        setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
    };

    const isTaskComplete = () => {
        const allChecked = checklistItems.every(item => checkedItems[item]);
        const hasRemark = resolutionData.remark.trim().length > 0;
        const hasImage = !!resolutionData.proofImage;
        return allChecked && hasRemark && hasImage;
    };

    const handleResolveSubmit = async (e) => {
        e.preventDefault();
        if (!isTaskComplete()) return;

        try {
            await resolveIssue(selectedIssue._id, resolutionData);
            setResolutionData({ remark: '', proofImage: '' });
            setCheckedItems({});
            fetchData();
            // Move to next task or clear selection
            const nextIssue = pendingTasks.find(i => i._id !== selectedIssue._id);
            setSelectedIssue(nextIssue || null);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to resolve. Please try refreshing.');
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', padding: '1.5rem', gap: '1.5rem' }}>
            {/* SIDEBAR - Floating Glass Island */}
            <aside style={{
                width: '280px', flexShrink: 0,
                background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(24px)', // Neutral Black Glass, Strong Blur
                border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px',
                display: 'flex', flexDirection: 'column', color: 'white', transition: 'width 0.3s ease',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
                {/* Brand */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Leaf size={20} fill="white" />
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Worker Portal</span>
                </div>

                {/* Profile Widget (Transparent with Border) */}
                <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        background: 'transparent', // Transparent to let sidebar glass show
                        borderRadius: '16px', padding: '1rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>{user?.name || 'Worker'}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>{user?.role || 'Field Worker'}</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ padding: '0 1rem', flex: 1, background: 'transparent', backdropFilter: 'none', border: 'none', boxShadow: 'none' }}>
                    <div style={{ marginBottom: '0.5rem', paddingLeft: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase' }}>Menu</div>
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                        { id: 'tasks', icon: ListTodo, label: 'My Tasks' },
                        { id: 'total_reports', icon: FileText, label: 'Total Reports' },
                        { id: 'map', icon: MapIcon, label: 'Map View' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                width: '100%', padding: '0.75rem 1rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'transparent',
                                color: activeTab === item.id ? 'white' : 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.9rem', fontWeight: activeTab === item.id ? '800' : '500',
                                cursor: 'pointer', marginBottom: '0.5rem',
                                textAlign: 'left',
                                transition: 'all 0.2s',
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

            {/* MAIN CONTENT */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

                {/* Header (Hidden on Map View) */}
                {!isMapView && (
                    <header style={{
                        height: '70px', flexShrink: 0,
                        background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px',
                        marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem'
                    }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.5)' }} />
                            <input type="text" placeholder="Search task..." style={{
                                width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem',
                                background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px', outline: 'none', color: 'white', fontSize: '0.9rem'
                            }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'white' }}>
                            <Bell size={20} style={{ cursor: 'pointer' }} />
                            <HelpCircle size={20} style={{ cursor: 'pointer' }} />
                        </div>
                    </header>
                )}

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column' }}>

                    {/* Progress Card (Hidden on Map & Total Reports) */}
                    {!isMapView && activeTab !== 'total_reports' && (
                        <div style={{
                            background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)',
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
                    )}

                    {/* DASHBOARD VIEW: Pending Grid */}
                    {activeTab === 'dashboard' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem' }}>Pending Tasks</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                                {pendingTasks.length > 0 ? pendingTasks.map(task => (
                                    <div
                                        key={task._id}
                                        onClick={() => { setSelectedIssue(task); setActiveTab('tasks'); }}
                                        style={{
                                            background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)',
                                            borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)',
                                            height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s', textAlign: 'center'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white', margin: 0, lineHeight: '1.4' }}>
                                            {task.title}
                                        </h3>
                                    </div>
                                )) : (
                                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>No pending tasks.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* MY TASKS VIEW: Split Screen */}
                    {activeTab === 'tasks' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
                            {/* Task List */}
                            <div style={{ overflowY: 'auto', paddingRight: '0.5rem' }}>
                                <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Active Issues</h3>
                                {pendingTasks.length > 0 ? pendingTasks.map(issue => (
                                    <div
                                        key={issue._id}
                                        onClick={() => setSelectedIssue(issue)}
                                        style={{
                                            background: selectedIssue?._id === issue._id ? 'rgba(74, 222, 128, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                                            backdropFilter: 'blur(10px)',
                                            borderRadius: '16px', padding: '1.25rem',
                                            border: selectedIssue?._id === issue._id ? '1px solid #4ade80' : '1px solid rgba(255, 255, 255, 0.1)',
                                            marginBottom: '1rem', cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600', color: 'white' }}>{issue.title}</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>{issue.location?.city || 'Sector 14'}</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#f87171', background: 'rgba(248, 113, 113, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>Pending</span>
                                        </div>
                                    </div>
                                )) : (
                                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>No active tasks.</p>
                                )}
                            </div>

                            {/* Details Pane */}
                            <div style={{
                                background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)',
                                borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex', flexDirection: 'column', overflow: 'hidden'
                            }}>
                                {selectedIssue ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
                                        <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>{selectedIssue.title}</h2>
                                                <span style={{ background: 'rgba(248, 113, 113, 0.2)', color: '#f87171', padding: '0.25rem 1rem', borderRadius: '20px', fontWeight: '600', fontSize: '0.85rem' }}>High Priority</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1.5rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> {selectedIssue.location?.address}</div>
                                            </div>
                                        </div>

                                        <div style={{ padding: '2rem', flex: 1 }}>
                                            {/* Safety Checklist */}
                                            <div style={{ marginBottom: '2rem' }}>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <CheckSquare size={18} color="#4ade80" /> Safety Checklist
                                                </h3>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                    {checklistItems.map((item, i) => (
                                                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.8)' }}>
                                                            <input type="checkbox" checked={!!checkedItems[item]} onChange={() => handleCheck(item)} style={{ width: '18px', height: '18px', accentColor: '#4ade80' }} />
                                                            {item}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Action: Upload Proof Only */}
                                            <div style={{ marginBottom: '2rem' }}>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Camera size={18} color="#4ade80" /> Upload Proof
                                                </h3>
                                                <ImageUpload onImageSelect={(base64) => setResolutionData({ ...resolutionData, proofImage: base64 })} label="" />
                                                {!resolutionData.proofImage && <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>Capture or upload an image of the completed work.</p>}
                                            </div>

                                            {/* Remarks */}
                                            <div style={{ marginBottom: '2rem' }}>
                                                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Remarks</label>
                                                <textarea
                                                    value={resolutionData.remark}
                                                    onChange={e => setResolutionData({ ...resolutionData, remark: e.target.value })}
                                                    placeholder="Add closure notes..."
                                                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '1rem', color: 'white', outline: 'none', resize: 'vertical' }}
                                                    rows={3}
                                                />
                                            </div>

                                            <button
                                                onClick={handleResolveSubmit}
                                                disabled={!isTaskComplete()}
                                                style={{
                                                    width: '100%', padding: '1rem', borderRadius: '16px', border: 'none',
                                                    background: isTaskComplete() ? '#22c55e' : 'rgba(255, 255, 255, 0.1)',
                                                    color: isTaskComplete() ? 'white' : 'rgba(255, 255, 255, 0.3)',
                                                    fontWeight: 'bold', fontSize: '1rem',
                                                    cursor: isTaskComplete() ? 'pointer' : 'not-allowed',
                                                    transition: 'all 0.2s',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                                }}
                                            >
                                                <CheckCircle2 size={20} /> Complete Task
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255, 255, 255, 0.4)' }}>
                                        Select a task from the list to view details
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TOTAL REPORTS VIEW: Table */}
                    {activeTab === 'total_reports' && (
                        <div style={{
                            background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)',
                            borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden'
                        }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Resolved Reports History</h2>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                                <thead style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>TITLE</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>LOCATION</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>DATE RESOLVED</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resolvedTasks.length > 0 ? resolvedTasks.map(issue => (
                                        <tr key={issue._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                            <td style={{ padding: '1rem' }}>{issue.title}</td>
                                            <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>{issue.location?.city || 'Sector 14'}</td>
                                            <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>{new Date(issue.updatedAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Resolved</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No resolved reports yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* MAP VIEW: Full Screen (Rendered here because header/progress are blocked, taking full space) */}
                    {isMapView && (
                        <div style={{ flex: 1, borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)', position: 'relative' }}>
                            <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {issues.map((issue) => (
                                    issue.location && issue.location.lat && (
                                        <Marker key={issue._id} position={[issue.location.lat, issue.location.lng]}>
                                            <Popup>
                                                <strong>{issue.title}</strong><br />
                                                {issue.status}
                                            </Popup>
                                        </Marker>
                                    )
                                ))}
                            </MapContainer>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default WorkerDashboard;
