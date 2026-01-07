import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import API, { createIssue } from '../services/api';
import CategorySelection from '../components/CategorySelection';
import ImageUpload from '../components/ImageUpload';
import { MapPin, Loader2, ArrowLeft, Mic, Square, Trash2, StopCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const ReportIssue = () => {
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        priority: 'Medium',
        zone: 'North Zone',
        location: { lat: 20.5937, lng: 78.9629, address: '' },
        images: [],
        audio: null
    });
    const [submitting, setSubmitting] = useState(false);

    // Audio State
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [processingVoice, setProcessingVoice] = useState(false);
    const [voiceLang, setVoiceLang] = useState('en-US'); // Default English

    const mediaRecorderRef = useRef(null);
    const recognitionRef = useRef(null);
    const transcriptRef = useRef(''); // Ref for latest transcript
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    // Handle Voice Data Pre-fill (From Navigation)
    useEffect(() => {
        if (location.state?.voiceData) {
            const { title, description_clean_english, category } = location.state.voiceData;

            if (category) {
                setSelectedCategory(category);
                setStep(2);
            }

            setFormData(prev => ({
                ...prev,
                title: title || prev.title,
                description: description_clean_english || prev.description
            }));

            // Clear state so it doesn't re-trigger on simple re-renders
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Map Location Marker Component
    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                // If address is empty or looks like coordinates, update it. Otherwise keep user's text.
                const isCoord = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(formData.location.address);
                const newAddress = (formData.location.address === '' || isCoord) ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : formData.location.address;

                setFormData(prev => ({ ...prev, location: { ...prev.location, lat, lng, address: newAddress } }));
            },
        });

        return formData.location.lat ? (
            <Marker position={[formData.location.lat, formData.location.lng]} />
        ) : null;
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setStep(2);
    };

    // Location Initialization
    useEffect(() => {
        if (navigator.geolocation && step === 2) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                // Only update if not already set (retaining user choice if they go back)
                if (formData.location.address === '') {
                    setFormData(prev => ({ ...prev, location: { lat: latitude, lng: longitude, address: 'Current Location' } }));
                }
            });
        }
    }, [step]);

    // Cleanup Audio URL
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    // Audio Functions
    const getSupportedMimeType = () => {
        const types = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'];
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        return ''; // Default
    };

    const startRecording = async () => {
        try {
            // 1. Start Media Recorder
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = getSupportedMimeType();
            mediaRecorderRef.current = new MediaRecorder(stream, mimeType ? { mimeType } : {});
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
                setAudioBlob(blob);
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);

                // Convert to Base64 for submission (Attachment only)
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64String = reader.result;
                    setFormData(prev => ({ ...prev, audio: base64String }));
                };
            };

            mediaRecorderRef.current.start();

            // 2. Start Speech Recognition (Visual Feedback + Transcript Source)
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = voiceLang;

                recognition.onresult = (event) => {
                    let fullTranscript = '';
                    for (let i = 0; i < event.results.length; ++i) {
                        fullTranscript += event.results[i][0].transcript;
                    }
                    setTranscript(fullTranscript);
                    transcriptRef.current = fullTranscript;
                };

                recognition.onerror = (e) => console.error("Speech Error", e);

                recognitionRef.current = recognition;
                recognitionRef.current.start();
            }

            setRecording(true);
            setRecordingTime(0);

            // Start Timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = async () => {
        if (recording) {
            // Stop Media Recorder
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
            // Stop Speech Recognition
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }

            setRecording(false);
            clearInterval(timerRef.current);

            // Use Client-Side Transcript Directly
            const finalTranscript = transcriptRef.current;
            console.log("Stopping recording. Final Transcript:", finalTranscript);

            if (finalTranscript && finalTranscript.trim().length > 0) {
                setFormData(prev => ({
                    ...prev,
                    description: finalTranscript
                }));
            }
        }
    };

    const deleteRecording = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setFormData(prev => ({ ...prev, audio: '' }));
        setRecordingTime(0);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createIssue({
                ...formData,
                category: selectedCategory,
                images: formData.imageInput ? [formData.imageInput] : []
            });
            alert('Report submitted successfully!');
            navigate('/citizen');
        } catch (error) {
            console.error("Report Error:", error);
            alert(`Failed to report: ${error.response?.data?.message || error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (step === 1) {
        return (
            <div className="container">
                <button className="btn btn-ghost" onClick={() => navigate('/citizen')} style={{ marginBottom: '1rem' }}>
                    <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
                </button>
                <CategorySelection onSelect={handleCategorySelect} />
            </div>
        );
    }

    return (
        <div className="container fade-in">
            <style>{`
                @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    50% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(0.8); opacity: 0.5; }
                }
                .recording-animation {
                    width: 12px;
                    height: 12px;
                    background-color: #ef4444;
                    border-radius: 50%;
                    animation: pulse-ring 1.5s infinite;
                    margin-right: 8px;
                }
            `}</style>

            <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ marginBottom: '1rem' }}>
                <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Back to Categories
            </button>
            <div className="card">
                <h2 style={{ marginBottom: '1.5rem' }}>Report: {selectedCategory}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1">
                    <select
                        className="input"
                        value={formData.zone}
                        onChange={e => setFormData({ ...formData, zone: e.target.value })}
                        required
                        style={{ flex: 1, marginBottom: '1rem' }}
                    >
                        <option value="">{t('select_category')}</option>
                        <option value="North Zone">North Zone</option>
                        <option value="South Zone">South Zone</option>
                        <option value="East Zone">East Zone</option>
                        <option value="West Zone">West Zone</option>
                    </select>
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

                    {/* Enhanced Audio Recorder */}
                    <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Voice Description (Optional)</label>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', background: 'var(--bg)', padding: '0.75rem', borderRadius: '8px' }}>
                            {!recording && (
                                <select
                                    value={voiceLang}
                                    onChange={(e) => setVoiceLang(e.target.value)}
                                    style={{
                                        padding: '0.5rem',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border)',
                                        fontSize: '0.85rem',
                                        background: 'var(--surface)',
                                        color: 'var(--text)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="en-US">English</option>
                                    <option value="hi-IN">Hindi (हिंदी)</option>
                                    <option value="mr-IN">Marathi (मराठी)</option>
                                    <option value="ta-IN">Tamil (தமிழ்)</option>
                                    <option value="ur-IN">Urdu (اردو)</option>
                                </select>
                            )}

                            {/* Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: recording ? 'flex-start' : 'flex-end' }}>
                                {!recording && !audioUrl ? (
                                    <button type="button" className="btn" onClick={startRecording} style={{ background: 'transparent', color: '#dc2626', border: '1px solid #dc2626', display: 'flex', alignItems: 'center', padding: '0.5rem 1rem' }}>
                                        <Mic size={18} style={{ marginRight: '0.5rem' }} /> Tap to Record
                                    </button>
                                ) : recording ? (
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div className="recording-animation"></div>
                                            <span style={{ fontWeight: 'bold', color: '#dc2626' }}>{formatTime(recordingTime)}</span>
                                        </div>
                                        <button type="button" className="btn" onClick={stopRecording} style={{ background: '#dc2626', color: 'white', borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Square size={16} fill="white" />
                                        </button>
                                    </div>
                                ) : (
                                    // Playback Mode
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
                                        <audio controls src={audioUrl} style={{ height: '36px', flex: 1 }} />
                                        <button type="button" onClick={deleteRecording} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}>
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {(recording || transcript || processingVoice) && (
                            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                {processingVoice ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.9rem' }}>
                                        <Loader2 className="animate-spin" size={14} /> Processing voice description...
                                    </div>
                                ) : (
                                    <p style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                                        {transcript || "Listening..."}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <MapPin size={16} style={{ display: 'inline', marginRight: '5px' }} />
                            Location
                        </label>

                        <input
                            className="input"
                            placeholder="Address / Landmark (e.g., Near City Center)"
                            value={formData.location.address}
                            onChange={e => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
                            style={{ marginBottom: '0.5rem' }}
                        />

                        <div style={{ height: '300px', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <MapContainer center={[formData.location.lat, formData.location.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationMarker />
                            </MapContainer>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>* Tap map to auto-fill coordinates. You can edit the address above.</p>
                    </div>

                    <ImageUpload onImageSelect={(base64) => setFormData({ ...formData, imageInput: base64 })} label="Evidence Photo" />

                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '1rem' }}>
                        {submitting ? <><Loader2 className="animate-spin" size={18} style={{ marginRight: '0.5rem' }} /> Submitting...</> : 'Submit Report'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReportIssue;
