import React, { useEffect, useState } from 'react';
import { getPublicIssues } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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

const NearbyIssues = () => {
    const [issues, setIssues] = useState([]);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();
    const [userLocation, setUserLocation] = useState([28.6139, 77.2090]); // Default Delhi

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const { data } = await getPublicIssues();
                setIssues(data);
            } catch (error) {
                console.error("Error loading map data:", error);
            }
        };
        fetchIssues();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserLocation([position.coords.latitude, position.coords.longitude]);
            });
        }
    }, []);

    const filteredIssues = issues.filter(issue => {
        if (filter === 'all') return true;
        if (filter === 'pending') return issue.status !== 'Resolved';
        return true;
    });

    return (
        <div className="container fade-in" style={{ height: 'calc(100vh - 80px)', padding: '1rem', display: 'flex', flexDirection: 'column', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button className="btn btn-ghost" onClick={() => navigate('/citizen')}>
                    <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Back
                </button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilter('all')}
                        style={{ padding: '0.5rem' }}
                    >All</button>
                    <button
                        className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilter('pending')}
                        style={{ padding: '0.5rem' }}
                    >Pending</button>
                </div>
            </div>

            <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                {userLocation && (
                    <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {filteredIssues.map((issue) => (
                            issue.location && issue.location.lat && (
                                <Marker
                                    key={issue._id}
                                    position={[issue.location.lat, issue.location.lng]}
                                >
                                    <Popup>
                                        <div style={{ minWidth: '150px' }}>
                                            <strong style={{ display: 'block', fontSize: '1.1em', marginBottom: '5px' }}>{issue.title}</strong>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '0.8em',
                                                background: '#f3f4f6',
                                                marginBottom: '5px'
                                            }}>
                                                {issue.category || 'Issue'}
                                            </span>
                                            <p style={{
                                                fontWeight: 'bold',
                                                color: issue.status === 'Resolved' ? '#16a34a' : '#dc2626',
                                                margin: '5px 0'
                                            }}>
                                                {issue.status}
                                            </p>
                                            <small style={{ color: '#6b7280' }}>
                                                {new Date(issue.createdAt).toLocaleDateString()}
                                            </small>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </MapContainer>
                )}
            </div>
        </div>
    );
};

export default NearbyIssues;
