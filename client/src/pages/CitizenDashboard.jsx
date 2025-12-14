import React, { useState, useEffect, useRef } from 'react';
import { createIssue, getIssues } from '../services/api';
import { PlusCircle, MapPin, Loader2 } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import { useNavigate } from 'react-router-dom';

const CitizenDashboard = () => {
    const [issues, setIssues] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ title: '', description: '', location: { address: '', lat: 0, lng: 0 }, images: [] });
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerInstance = useRef(null);
    const [submitting, setSubmitting] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Location is already in formData from map
            // Use formData.imageInput which now contains Base64 from ImageUpload
            await createIssue({ ...formData, images: [formData.imageInput] });
            setFormData({ title: '', description: '', location: { address: '' }, imageInput: '' });
            setShowForm(false);
            fetchIssues(); // Refresh list to see AI processed enhanced description
            alert('Report submitted successfully!');
        } catch (error) {
            console.error("Report Error:", error);
            if (error.response && error.response.status === 401) {
                alert("Session expired. Please login again.");
                navigate('/');
            } else {
                alert(`Failed to report issue: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (showForm && mapRef.current && !mapInstance.current) {
            initMap();
        }
    }, [showForm]);

    const initMap = () => {
        if (!window.google) {
            console.error("Google Maps API not loaded");
            return;
        }

        // Default to a central location (e.g., Delhi) or browser location
        const defaultPos = { lat: 28.6139, lng: 77.2090 };

        mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: defaultPos,
            zoom: 13,
        });

        mapInstance.current.addListener("click", (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            updateLocation(lat, lng);
        });

        // Try getting user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                mapInstance.current.setCenter(pos);
                updateLocation(pos.lat, pos.lng);
            });
        }
    };

    const updateLocation = (lat, lng) => {
        // Update Marker
        if (markerInstance.current) {
            markerInstance.current.setMap(null);
        }
        markerInstance.current = new window.google.maps.Marker({
            position: { lat, lng },
            map: mapInstance.current,
        });

        // Geocode
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results[0]) {
                const address = results[0].formatted_address;
                setFormData(prev => ({
                    ...prev,
                    location: { lat, lng, address }
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    location: { lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }
                }));
            }
        });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>My Reports</h1>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <PlusCircle size={20} style={{ marginRight: '0.5rem' }} /> Report Issue
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1">
                        <input
                            className="input"
                            placeholder="Issue Title"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                        <textarea
                            className="input"
                            placeholder="Describe the issue..."
                            rows="4"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                        ></textarea>
                        <div className="grid md:grid-cols-2">
                            <div className="col-span-2">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <MapPin size={16} style={{ display: 'inline', marginRight: '5px' }} />
                                    Select Location (Click on map)
                                </label>
                                <div
                                    ref={mapRef}
                                    style={{
                                        width: '100%',
                                        height: '300px',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        marginBottom: '1rem'
                                    }}
                                />
                                {formData.location.address && (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                        Selected: <b>{formData.location.address}</b>
                                    </p>
                                )}
                            </div>
                            <div className="col-span-2">
                                <ImageUpload
                                    onImageSelect={(base64) => setFormData({ ...formData, imageInput: base64 })}
                                    label="Evidence Photo (Upload or Take Photo)"
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? <><Loader2 className="animate-spin" size={18} style={{ marginRight: '0.5rem' }} /> AI Processing...</> : 'Submit Report'}
                        </button>
                    </form>
                </div >
            )}

            {
                loading ? <div style={{ textAlign: 'center' }}>Loading...</div> : (
                    <div className="grid grid-cols-1">
                        {issues.map(issue => (
                            <div key={issue._id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{issue.title}</h3>
                                    <span className={`badge badge-${issue.status.toLowerCase().replace(' ', '-')}`}>{issue.status}</span>
                                </div>

                                <div className="grid md:grid-cols-2">
                                    <div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Original Description:</p>
                                        <p style={{ marginBottom: '1rem' }}>{issue.original_description}</p>

                                        {issue.ai_enhanced_description && (
                                            <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem' }}>✨ AI Enhanced</p>
                                                <p>{issue.ai_enhanced_description}</p>
                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                                                    <span>Category: <b>{issue.category}</b></span>
                                                    <span>Priority: <b style={{ color: issue.priority === 'Critical' ? 'var(--danger)' : 'inherit' }}>{issue.priority}</b></span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        {issue.images && issue.images[0] && (
                                            <img src={issue.images[0]} alt="Issue" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                                        )}
                                        {issue.ai_feedback && (
                                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: 'var(--radius)', color: 'var(--success)' }}>
                                                <b>Update:</b> {issue.ai_feedback}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {issues.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No issues reported yet.</p>}
                    </div>
                )
            }
        </div >
    );
};

export default CitizenDashboard;
