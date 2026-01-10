import React, { useState, useEffect } from 'react';
import { api } from '../api';
import ClinicalNoteAnalyzer from './ClinicalNoteAnalyzer'; // Assuming in same folder

export default function DoctorDashboard({ user }) {
    const [activeTab, setActiveTab] = useState('schedule');
    const [appointments, setAppointments] = useState([]);
    const [selectedAppt, setSelectedAppt] = useState(null); // For consultation modal
    const [consultationData, setConsultationData] = useState({ diagnosis: '', treatment_notes: '' });

    // History Search
    const [searchName, setSearchName] = useState('');
    const [historyResults, setHistoryResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        if (activeTab === 'schedule') {
            loadSchedule();
        }
    }, [activeTab]);

    const loadSchedule = async () => {
        try {
            const data = await api.getDoctorAppointments(user.user_id);
            setAppointments(data);
        } catch (e) {
            console.error("Failed to load schedule", e);
        }
    };

    const handleSearchHistory = async (e) => {
        e.preventDefault();
        if (!searchName.trim()) return;
        setLoading(true);
        try {
            const data = await api.getPatientHistory(searchName);
            setHistoryResults(data);
        } catch (e) {
            alert("No records found");
        } finally {
            setLoading(false);
        }
    };

    const openConsultation = (appt) => {
        setSelectedAppt(appt);
        setConsultationData({ diagnosis: appt.diagnosis || '', treatment_notes: appt.treatment_notes || '' });
    };

    const handleCompleteConsultation = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.completeAppointment(selectedAppt.id, consultationData);
            setMsg({ type: 'success', text: 'Consultation saved.' });
            setSelectedAppt(null); // Close modal
            loadSchedule(); // Refresh list
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ padding: '0 0 4rem 0' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-header-title">
                        Dr. {user.user_name} <span className="text-primary">Portal</span>
                    </h1>
                    <p className="page-header-subtitle">
                        Manage appointments and patient records.
                    </p>
                </div>
            </div>

            <div className="tabs-container" style={{ marginBottom: '2rem', padding: 0 }}>
                <button
                    className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
                    onClick={() => setActiveTab('schedule')}
                >
                    📅 My Schedule
                </button>
                <button
                    className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    📂 Patient History
                </button>
                <button
                    className={`tab-button ${activeTab === 'clinical' ? 'active' : ''}`}
                    onClick={() => setActiveTab('clinical')}
                >
                    📝 Clinical AI
                </button>
            </div>

            {activeTab === 'schedule' && (
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 className="section-title">Upcoming Appointments</h3>

                    <div className="card-list">
                        {appointments.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '2rem' }}>
                                No appointments scheduled for today.
                            </p>
                        ) : (
                            appointments.map(appt => (
                                <div key={appt.id} className="list-item" style={{
                                    borderLeft: `4px solid ${appt.status === 'Completed' ? 'var(--success)' : 'var(--primary)'}`,
                                    opacity: appt.status === 'Cancelled' ? 0.6 : 1
                                }}>
                                    <div className="list-item-header">
                                        <div>
                                            <div className="list-item-title">{new Date(appt.date_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</div>
                                            <div className="list-item-subtitle">{appt.patient_name}</div>
                                        </div>
                                        <div>
                                            {appt.status === 'Scheduled' && (
                                                <button
                                                    className="btn-primary"
                                                    style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
                                                    onClick={() => openConsultation(appt)}
                                                >
                                                    Start Consultation
                                                </button>
                                            )}
                                            {appt.status === 'Completed' && (
                                                <span className="badge badge-success">Completed</span>
                                            )}
                                            {appt.status === 'Cancelled' && (
                                                <span className="badge badge-error">Cancelled</span>
                                            )}
                                        </div>
                                    </div>

                                    {appt.reason && (
                                        <div className="list-item-meta" style={{ fontStyle: 'italic', marginBottom: '0.5rem' }}>
                                            "{appt.reason}"
                                        </div>
                                    )}

                                    {appt.status === 'Completed' && (
                                        <div className="list-item-meta" style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                                            <strong style={{ color: 'var(--text-dim)' }}>Diagnosis:</strong> {appt.diagnosis}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 className="section-title">Search Patient Records</h3>
                    <form onSubmit={handleSearchHistory} className="search-wrapper" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            value={searchName}
                            onChange={e => setSearchName(e.target.value)}
                            placeholder="Patient Name..."
                        />
                        <button type="submit" className="btn-primary" disabled={loading}>Search</button>
                    </form>

                    <div className="card-list">
                        {historyResults.length === 0 && !loading && (
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Search for a patient to view their history.</p>
                        )}
                        {historyResults.map((rec, i) => (
                            <div key={i} className="list-item">
                                <div className="list-item-header">
                                    <div className="list-item-title">{new Date(rec.date).toLocaleDateString()}</div>
                                    <div className="list-item-subtitle" style={{ color: 'var(--text-dim)' }}>Dr. {rec.doctor_name}</div>
                                </div>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <div style={{ color: 'var(--secondary)', fontWeight: 600 }}>Dx: {rec.diagnosis}</div>
                                    <div style={{ marginTop: '0.25rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>{rec.treatment_notes}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'clinical' && (
                <div className="fade-in">
                    <ClinicalNoteAnalyzer />
                </div>
            )}

            {/* Consultation Modal */}
            {selectedAppt && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Consultation</h2>
                            <p style={{ color: 'var(--text-dim)' }}>Patient: {selectedAppt.patient_name}</p>
                        </div>

                        <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Reason for Visit</div>
                            <div style={{ fontSize: '1.1rem' }}>{selectedAppt.reason}</div>
                        </div>

                        <form onSubmit={handleCompleteConsultation} className="form-container">
                            <div className="form-group">
                                <label>Diagnosis (Rx)</label>
                                <input
                                    type="text"
                                    value={consultationData.diagnosis}
                                    onChange={e => setConsultationData({ ...consultationData, diagnosis: e.target.value })}
                                    placeholder="e.g. Acute Bronchitis"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Treatment Notes & Plan</label>
                                <textarea
                                    value={consultationData.treatment_notes}
                                    onChange={e => setConsultationData({ ...consultationData, treatment_notes: e.target.value })}
                                    placeholder="Prescribed rest and fluids..."
                                    rows={5}
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setSelectedAppt(null)} className="tab-button" style={{ flex: 1, border: '1px solid var(--glass-border)' }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Complete Visit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
