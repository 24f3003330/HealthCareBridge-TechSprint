import React, { useState, useEffect } from 'react';
import { api } from '../api';
import DrugInteractionChecker from './DrugInteractionChecker';
import MedicationManager from './MedicationManager';
import PrescriptionScanner from './PrescriptionScanner';

export default function PatientDashboard({ user, setUser }) {
    const [activeTab, setActiveTab] = useState('findCare');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    // Find Care State
    const [doctors, setDoctors] = useState([]);
    const [specializationFilter, setSpecializationFilter] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null); // For booking modal
    const [bookingData, setBookingData] = useState({ dateTime: '', reason: '' });

    // My Health State
    const [appointments, setAppointments] = useState([]);

    // Profile State
    const [profileData, setProfileData] = useState({ fullName: user.user_name, password: '' });

    useEffect(() => {
        if (activeTab === 'findCare') {
            loadDoctors();
        } else if (activeTab === 'myHealth') {
            loadAppointments();
        }
    }, [activeTab]);

    const loadDoctors = async () => {
        try {
            const data = await api.getAllDoctors(specializationFilter);
            setDoctors(data);
        } catch (e) {
            console.error("Failed to load doctors", e);
        }
    };

    const loadAppointments = async () => {
        try {
            const data = await api.getMyAppointments(user.user_id);
            setAppointments(data);
        } catch (e) {
            console.error("Failed to load appointments", e);
        }
    };

    // Actions
    const handleSearchDocs = (e) => {
        e.preventDefault();
        loadDoctors();
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        try {
            await api.bookAppointment({
                doctor_id: selectedDoctor.id,
                organization_id: selectedDoctor.organization_id,
                patient_id: user.user_id,
                patient_name: user.user_name,
                date_time: bookingData.dateTime,
                reason: bookingData.reason
            });
            setMsg({ type: 'success', text: 'Appointment booked successfully!' });
            setBookingData({ dateTime: '', reason: '' });
            setSelectedDoctor(null);
        } catch (e) {
            setMsg({ type: 'error', text: e.message });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async (id) => {
        if (!confirm("Are you sure you want to cancel?")) return;
        try {
            await api.cancelMyAppointment(id);
            loadAppointments();
        } catch (e) {
            alert(e.message);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        try {
            await api.updateProfile(user.user_id, {
                full_name: profileData.fullName,
                password: profileData.password || undefined
            });
            setMsg({ type: 'success', text: 'Profile updated. Please re-login to see changes.' });
        } catch (e) {
            setMsg({ type: 'error', text: e.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ padding: '0 0 4rem 0' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-header-title">
                        Welcome, {user.user_name}
                    </h1>
                    <p className="page-header-subtitle">
                        Your personal health command center.
                    </p>
                </div>
            </div>

            <div className="tabs-container" style={{ marginBottom: '2rem', padding: 0 }}>
                <button
                    className={`tab-button ${activeTab === 'findCare' ? 'active' : ''}`}
                    onClick={() => setActiveTab('findCare')}
                >
                    🔍 Find Care
                </button>
                <button
                    className={`tab-button ${activeTab === 'myHealth' ? 'active' : ''}`}
                    onClick={() => setActiveTab('myHealth')}
                >
                    ❤️ My Health
                </button>
                <button
                    className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    👤 Profile
                </button>
                <button
                    className={`tab-button ${activeTab === 'interactions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('interactions')}
                >
                    💊 Safety Guard
                </button>
                <button
                    className={`tab-button ${activeTab === 'medications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('medications')}
                >
                    🏥 Care Plan
                </button>
                <button
                    className={`tab-button ${activeTab === 'scanner' ? 'active' : ''}`}
                    onClick={() => setActiveTab('scanner')}
                >
                    📸 Smart Scanner
                </button>
            </div>

            {activeTab === 'findCare' && (
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <div className="section-title">Find a Doctor</div>
                    <form onSubmit={handleSearchDocs} className="search-wrapper" style={{ marginBottom: '2rem' }}>
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            value={specializationFilter}
                            onChange={e => setSpecializationFilter(e.target.value)}
                            placeholder="Filter by Specialization (e.g. Cardio)"
                        />
                        <button type="submit" className="btn-primary">Filter</button>
                    </form>

                    <div className="card-list">
                        {doctors.map(doc => (
                            <div key={doc.id} className="list-item">
                                <div className="list-item-header">
                                    <div>
                                        <div className="list-item-title">{doc.full_name}</div>
                                        <div className="list-item-subtitle">{doc.specialization || 'General Practice'}</div>
                                    </div>
                                    <button
                                        className="btn-primary"
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                        onClick={() => setSelectedDoctor(doc)}
                                    >
                                        Book Now
                                    </button>
                                </div>
                                <div className="list-item-meta">
                                    🏥 {doc.organization_name}
                                </div>
                                <div className="list-item-meta">
                                    🕒 {doc.availability || 'Contact for hours'}
                                </div>
                            </div>
                        ))}
                    </div>
                    {doctors.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No doctors found matching criteria.</p>}
                </div>
            )}

            {activeTab === 'myHealth' && (
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 className="section-title">My Appointment History</h3>
                    <div className="card-list">
                        {appointments.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No appointment history.</p>
                        ) : (
                            appointments.map(appt => (
                                <div key={appt.id} className="list-item" style={{
                                    borderLeft: `4px solid ${appt.status === 'Completed' ? 'var(--success)' : appt.status === 'Cancelled' ? 'var(--danger)' : 'var(--primary)'}`
                                }}>
                                    <div className="list-item-header">
                                        <div>
                                            <div className="list-item-title">{new Date(appt.date_time).toLocaleString()}</div>
                                            <div className="list-item-subtitle">Dr. {appt.doctor_name} <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>({appt.specialization})</span></div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span className={`badge badge-${appt.status === 'Completed' ? 'success' : appt.status === 'Cancelled' ? 'error' : 'warning'}`}>
                                                {appt.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="list-item-meta" style={{ fontStyle: 'italic' }}>Reason: "{appt.reason}"</div>

                                    {appt.status === 'Completed' && (
                                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                            <div style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>DIAGNOSIS</div>
                                            <div style={{ marginBottom: '0.5rem' }}>{appt.diagnosis}</div>
                                            <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Rx Notes: {appt.treatment_notes}</div>
                                        </div>
                                    )}

                                    {appt.status === 'Scheduled' && (
                                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleCancelAppointment(appt.id)}
                                                style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
                                            >
                                                Cancel Appointment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
                    <h3 className="section-title">Edit Profile</h3>
                    <form onSubmit={handleUpdateProfile} className="form-container">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={profileData.fullName}
                                onChange={e => setProfileData({ ...profileData, fullName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password (Optional)</label>
                            <input
                                type="password"
                                value={profileData.password}
                                onChange={e => setProfileData({ ...profileData, password: e.target.value })}
                                placeholder="Leave blank to keep current"
                                autoComplete="new-password"
                            />
                        </div>

                        {msg && (
                            <div className={msg.type === 'error' ? 'error-message' : 'success-message'}>
                                {msg.text}
                            </div>
                        )}

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'interactions' && (
                <div className="fade-in">
                    <DrugInteractionChecker />
                </div>
            )}

            {activeTab === 'medications' && (
                <div className="fade-in">
                    <MedicationManager />
                </div>
            )}

            {activeTab === 'scanner' && (
                <div className="fade-in">
                    <PrescriptionScanner />
                </div>
            )}

            {/* Booking Modal */}
            {selectedDoctor && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Book Appointment</h2>
                            <p style={{ color: 'var(--text-dim)' }}>
                                with Dr. {selectedDoctor.full_name}
                            </p>
                            <div className="badge badge-primary" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                                Availability: {selectedDoctor.availability}
                            </div>
                        </div>

                        <form onSubmit={handleBookAppointment} className="form-container">
                            <div className="form-group">
                                <label>Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={bookingData.dateTime}
                                    onChange={e => setBookingData({ ...bookingData, dateTime: e.target.value })}
                                    required
                                />
                                <div style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: '0.25rem' }}>
                                    * Please ensure time matches doctor availability.
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Reason for Visit</label>
                                <input
                                    type="text"
                                    value={bookingData.reason}
                                    onChange={e => setBookingData({ ...bookingData, reason: e.target.value })}
                                    placeholder="e.g. Checkup, Fever"
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setSelectedDoctor(null)} className="tab-button" style={{ flex: 1, border: '1px solid var(--glass-border)' }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
                                    {loading ? 'Booking...' : 'Confirm Booking'}
                                </button>
                            </div>
                        </form>
                        {msg && msg.type === 'error' && (
                            <div className="error-message" style={{ marginTop: '1rem' }}>
                                {msg.text}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
