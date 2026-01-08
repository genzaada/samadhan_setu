import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { submitFeedback } from '../services/api';

const Feedback = () => {
    const [formData, setFormData] = useState({ subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await submitFeedback(formData);
            setSubmitted(true);
            setFormData({ subject: '', message: '' });
        } catch (error) {
            console.error("Feedback error", error);
            alert("Failed to submit feedback");
        }
    };

    return (
        <div className="container fade-in" style={{ color: 'white' }}>
            <button className="btn btn-ghost" onClick={() => navigate('/citizen')} style={{ marginBottom: '1rem', color: 'white' }}>
                <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
            </button>
            <div className="glass-card-dark" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Share Your Feedback</h2>

                {submitted ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <CheckCircle size={48} color="var(--success)" style={{ display: 'block', margin: '0 auto 1rem' }} />
                        <h3>Thank You!</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Your feedback has been sent to the authorities.</p>
                        <button className="btn btn-primary" onClick={() => setSubmitted(false)} style={{ marginTop: '1.5rem' }}>Send Another</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="grid grid-cols-1">
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Subject</label>
                            <input
                                className="input"
                                placeholder="E.g., App Suggestion, General Complaint"
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Message</label>
                            <textarea
                                className="input"
                                placeholder="Write your note to authorities here..."
                                rows="5"
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                required
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            <Send size={18} style={{ marginRight: '0.5rem' }} /> Submit Feedback
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Feedback;
