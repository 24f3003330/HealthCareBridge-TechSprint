import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function OrgDashboard({ user }) {
    const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' or 'appointments'

    // Doctor State
    const [doctors, setDoctors] = useState([]);
    const [search, setSearch] = useState('');
    const [newDoc, setNewDoc] = useState({ fullName: '', email: '', password: '', specialization: '', availability: '' });
    const [editingDoc, setEditingDoc] = useState(null); // If set, showing edit modal

    // Appointment State
    const [appointments, setAppointments] = useState([]);
    const [newAppt, setNewAppt] = useState({ doctorId: '', patientName: '', dateTime: '', reason: '' });

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        loadDoctors();
        loadAppointments();
    }, [search]); // Reload doctors on search change

    const loadDoctors = async () => {
        try {
            const data = await api.getDoctors(user.organization_id, search);
            setDoctors(data);
        } catch (e) {
            console.error("Failed to load doctors", e);
        }
    };

    const loadAppointments = async () => {
        try {
            const data = await api.getAppointments(user.organization_id);
            setAppointments(data);
        } catch (e) {
            console.error("Failed to load appointments", e);
        }
    };

    // --- Doctor Actions ---

    const handleAddDoctor = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        try {
            await api.addDoctor({
                email: newDoc.email,
                password: newDoc.password,
                full_name: newDoc.fullName,
                specialization: newDoc.specialization,
                availability: newDoc.availability,
                organization_id: user.organization_id
            });
            setMsg({ type: 'success', text: 'Doctor added successfully!' });
            setNewDoc({ fullName: '', email: '', password: '', specialization: '', availability: '' });
            loadDoctors();
        } catch (e) {
            setMsg({ type: 'error', text: e.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDoctor = async (id) => {
        if (!confirm('Are you sure you want to remove this doctor?')) return;
        try {
            await api.deleteDoctor(id);
            loadDoctors();
        } catch (e) {
            alert(e.message);
        }
    };

    const handleUpdateDoctor = async (e) => {
        e.preventDefault();
        try {
            await api.updateDoctor(editingDoc.id, {
                full_name: editingDoc.full_name,
                specialization: editingDoc.specialization,
                availability: editingDoc.availability
            });
            setEditingDoc(null);
            loadDoctors();
        } catch (e) {
            alert(e.message);
        }
    };

    // --- Appointment Actions ---

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        try {
            await api.createAppointment({
                doctor_id: parseInt(newAppt.doctorId),
                organization_id: user.organization_id,
                patient_name: newAppt.patientName,
                date_time: newAppt.dateTime, // e.g. 2023-11-01T10:00
                reason: newAppt.reason
            });
            setMsg({ type: 'success', text: 'Appointment scheduled!' });
            setNewAppt({ doctorId: '', patientName: '', dateTime: '', reason: '' });
            loadAppointments();
        } catch (e) {
            setMsg({ type: 'error', text: e.message });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateApptStatus = async (id, status) => {
        try {
            await api.updateAppointment(id, { status });
            loadAppointments();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fade-in" style={{ padding: '0 0 4rem 0' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-header-title">
                        {user.organization_name} <span className="text-secondary">Manager</span>
                    </h1>
                    <p className="page-header-subtitle">
                        Comprehensive practice management dashboard.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="search-wrapper" style={{ maxWidth: '350px' }}>
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search doctors..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="tabs-container" style={{ marginBottom: '2rem', padding: 0 }}>
                <button
                    className={`tab-button ${activeTab === 'doctors' ? 'active' : ''}`}
                    onClick={() => setActiveTab('doctors')}
                >
                    👨‍⚕️ Medical Staff
                </button>
                <button
                    className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('appointments')}
                >
                    📅 Appointments
                </button>
            </div>

            {activeTab === 'doctors' ? (
                <div className="grid grid-2">
                    {/* Doctor List */}
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div className="section-title">
                            <span>Staff Directory</span>
                            <span className="badge badge-primary">{doctors.length}</span>
                        </div>

                        <div className="card-list">
                            {doctors.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>
                                    No doctors found. Add one to get started.
                                </p>
                            ) : (
                                doctors.map(doc => (
                                    <div key={doc.id} className="list-item">
                                        <div className="list-item-header">
                                            <div>
                                                <div className="list-item-title">{doc.full_name}</div>
                                                <div className="list-item-subtitle">{doc.specialization || 'General Practice'}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => setEditingDoc(doc)}
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="icon-btn danger"
                                                    onClick={() => handleDeleteDoctor(doc.id)}
                                                    title="Remove"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                        <div className="list-item-meta">
                                            📧 {doc.email}
                                        </div>
                                        {doc.availability && (
                                            <div className="list-item-meta">
                                                🕒 {doc.availability}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Add Doctor Form */}
                    <div className="glass-card" style={{ padding: '2rem', height: 'fit-content' }}>
                        <h3 className="section-title">Register New Doctor</h3>
                        <form onSubmit={handleAddDoctor} className="form-container">
                            <div className="grid grid-2" style={{ gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={newDoc.fullName}
                                        onChange={e => setNewDoc({ ...newDoc, fullName: e.target.value })}
                                        required
                                        placeholder="Dr. Jane Smith"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Specialization</label>
                                    <input
                                        type="text"
                                        value={newDoc.specialization}
                                        onChange={e => setNewDoc({ ...newDoc, specialization: e.target.value })}
                                        placeholder="Cardiology"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={newDoc.email}
                                    onChange={e => setNewDoc({ ...newDoc, email: e.target.value })}
                                    required
                                    placeholder="doctor@healthbridge.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Availability</label>
                                <input
                                    type="text"
                                    value={newDoc.availability}
                                    onChange={e => setNewDoc({ ...newDoc, availability: e.target.value })}
                                    placeholder="Mon-Fri, 9am - 5pm"
                                />
                            </div>

                            <div className="form-group">
                                <label>Temporary Password</label>
                                <input
                                    type="password"
                                    value={newDoc.password}
                                    onChange={e => setNewDoc({ ...newDoc, password: e.target.value })}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>

                            {msg && (
                                <div className={msg.type === 'error' ? 'error-message' : 'success-message'}>
                                    {msg.text}
                                </div>
                            )}

                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Processing...' : 'Add Doctor'}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="grid grid-2">
                    {/* Appointment List */}
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div className="section-title">
                            <span>Appointments</span>
                            <span className="badge badge-warning">{appointments.filter(a => a.status === 'Scheduled').length} Upcoming</span>
                        </div>

                        <div className="card-list">
                            {appointments.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>No appointments scheduled.</p>
                            ) : (
                                appointments.map(appt => (
                                    <div key={appt.id} className="list-item" style={{ borderLeft: `4px solid ${appt.status === 'Completed' ? 'var(--success)' : appt.status === 'Cancelled' ? 'var(--danger)' : 'var(--warning)'}` }}>
                                        <div className="list-item-header">
                                            <div>
                                                <div className="list-item-title">{new Date(appt.date_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</div>
                                                <div className="list-item-subtitle">{appt.patient_name}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div className={`badge badge-${appt.status === 'Completed' ? 'success' : appt.status === 'Cancelled' ? 'error' : 'warning'}`}>
                                                    {appt.status}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="list-item-meta">
                                            👨‍⚕️ w/ {appt.doctor_name}
                                        </div>
                                        {appt.reason && (
                                            <div className="list-item-meta" style={{ fontStyle: 'italic' }}>
                                                📝 "{appt.reason}"
                                            </div>
                                        )}

                                        {appt.status === 'Scheduled' && (
                                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                                                <button
                                                    className="icon-btn success"
                                                    onClick={() => handleUpdateApptStatus(appt.id, 'Completed')}
                                                    title="Mark Completed"
                                                    style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem', gap: '0.5rem' }}
                                                >
                                                    ✅ Complete
                                                </button>
                                                <button
                                                    className="icon-btn danger"
                                                    onClick={() => handleUpdateApptStatus(appt.id, 'Cancelled')}
                                                    title="Cancel Appointment"
                                                    style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem', gap: '0.5rem' }}
                                                >
                                                    ❌ Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Create Appointment Form */}
                    <div className="glass-card" style={{ padding: '2rem', height: 'fit-content' }}>
                        <h3 className="section-title">Schedule Appointment</h3>
                        <form onSubmit={handleCreateAppointment} className="form-container">
                            <div className="form-group">
                                <label>Patient Name</label>
                                <input
                                    type="text"
                                    value={newAppt.patientName}
                                    onChange={e => setNewAppt({ ...newAppt, patientName: e.target.value })}
                                    required
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="form-group">
                                <label>Select Doctor</label>
                                <select
                                    value={newAppt.doctorId}
                                    onChange={e => setNewAppt({ ...newAppt, doctorId: e.target.value })}
                                    required
                                >
                                    <option value="" style={{ color: 'black' }}>-- Choose Doctor --</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id} style={{ color: 'black' }}>
                                            {d.full_name} ({d.specialization || 'GP'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={newAppt.dateTime}
                                    onChange={e => setNewAppt({ ...newAppt, dateTime: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Reason for Visit</label>
                                <input
                                    type="text"
                                    value={newAppt.reason}
                                    onChange={e => setNewAppt({ ...newAppt, reason: e.target.value })}
                                    placeholder="Checkup, Fever, etc."
                                    required
                                />
                            </div>

                            {msg && (
                                <div className={msg.type === 'error' ? 'error-message' : 'success-message'}>
                                    {msg.text}
                                </div>
                            )}

                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Scheduling...' : 'Confirm Booking'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Doctor Modal */}
            {editingDoc && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Edit Profile</h3>
                            <p style={{ color: 'var(--text-dim)' }}>Update details for Dr. {editingDoc.full_name}</p>
                        </div>

                        <form onSubmit={handleUpdateDoctor} className="form-container">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    value={editingDoc.full_name || ''}
                                    onChange={e => setEditingDoc({ ...editingDoc, full_name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Specialization</label>
                                <input
                                    value={editingDoc.specialization || ''}
                                    onChange={e => setEditingDoc({ ...editingDoc, specialization: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Availability</label>
                                <input
                                    value={editingDoc.availability || ''}
                                    onChange={e => setEditingDoc({ ...editingDoc, availability: e.target.value })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setEditingDoc(null)} className="tab-button" style={{ flex: 1, border: '1px solid var(--glass-border)' }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
