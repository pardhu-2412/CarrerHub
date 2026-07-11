import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const Interviews = () => {
  const { API_URL } = useAuth();
  const { addToast } = useToast();
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextInterviewCountdown, setNextInterviewCountdown] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  // Form states
  const [applicationId, setApplicationId] = useState('');
  const [title, setTitle] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [platform, setPlatform] = useState('Google Meet');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [interviewRes, appRes] = await Promise.all([
        axios.get(`${API_URL}/interviews`),
        axios.get(`${API_URL}/applications`)
      ]);
      setInterviews(interviewRes.data);
      setApplications(appRes.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch interview schedules.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Countdown timer logic for upcoming interview
  useEffect(() => {
    if (interviews.length === 0) {
      setNextInterviewCountdown('');
      return;
    }

    const upcoming = interviews.find(i => new Date(i.interviewDate) > new Date());
    if (!upcoming) {
      setNextInterviewCountdown('No upcoming interviews.');
      return;
    }

    const interval = setInterval(() => {
      const diff = new Date(upcoming.interviewDate) - new Date();
      if (diff <= 0) {
        setNextInterviewCountdown('Happening now!');
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      let timerStr = '';
      if (days > 0) timerStr += `${days}d `;
      if (hours > 0 || days > 0) timerStr += `${hours}h `;
      timerStr += `${minutes}m`;

      setNextInterviewCountdown(`Next interview in: ${timerStr}`);
    }, 60000);

    // Initial run
    const diff = new Date(upcoming.interviewDate) - new Date();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    let timerStr = '';
    if (days > 0) timerStr += `${days}d `;
    if (hours > 0 || days > 0) timerStr += `${hours}h `;
    timerStr += `${minutes}m`;
    setNextInterviewCountdown(`Next interview in: ${timerStr}`);

    return () => clearInterval(interval);
  }, [interviews]);

  const handleOpenAddModal = () => {
    if (applications.length === 0) {
      addToast('You need to add at least one Job Application first.', 'warning');
      return;
    }
    setApplicationId(applications[0].id.toString());
    setTitle('Technical Round 1');
    setInterviewDate('');
    setPlatform('Google Meet');
    setLink('');
    setNotes('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (interview) => {
    setSelectedInterview(interview);
    setApplicationId(interview.jobApplication.id.toString());
    setTitle(interview.title);
    const formattedDate = interview.interviewDate ? interview.interviewDate.substring(0, 16) : '';
    setInterviewDate(formattedDate);
    setPlatform(interview.platform || 'Google Meet');
    setLink(interview.link || '');
    setNotes(interview.notes || '');
    setShowEditModal(true);
  };

  const handleOpenCancelModal = (interview) => {
    setSelectedInterview(interview);
    setShowCancelModal(true);
  };

  const handleAddInterview = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        applicationId: parseInt(applicationId),
        title,
        interviewDate,
        platform,
        link,
        notes
      };

      await axios.post(`${API_URL}/interviews`, payload);
      addToast('Interview scheduled successfully!', 'success');
      setShowAddModal(false);
      fetchData(true);
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to schedule interview.', 'error');
    }
  };

  const handleEditInterview = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        applicationId: parseInt(applicationId),
        title,
        interviewDate,
        platform,
        link,
        notes
      };

      await axios.put(`${API_URL}/interviews/${selectedInterview.id}`, payload);
      addToast('Interview details updated successfully.', 'success');
      setShowEditModal(false);
      fetchData(true);
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to update interview details.', 'error');
    }
  };

  const handleDeleteInterview = async () => {
    if (!selectedInterview) return;
    try {
      await axios.delete(`${API_URL}/interviews/${selectedInterview.id}`);
      addToast('Interview schedule cancelled.', 'info');
      setShowCancelModal(false);
      setSelectedInterview(null);
      fetchData(true);
    } catch (err) {
      console.error(err);
      addToast('Failed to cancel interview.', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title">Interview Scheduler</h1>
          <p className="page-subtitle">Schedule virtual rounds, save join links, and track countdowns.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {nextInterviewCountdown && (
            <span style={{ fontSize: '0.85rem', color: 'var(--color-warning)', fontWeight: 700, padding: '0.4rem 0.8rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              ⏰ {nextInterviewCountdown}
            </span>
          )}
          <button onClick={handleOpenAddModal} className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
            📅 Schedule Round
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '1.15rem' }}>Upcoming Schedules</h3>
        
        {loading ? (
          <ListSkeleton count={2} />
        ) : interviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {interviews.map(i => {
              const app = i.jobApplication;
              const dateObj = new Date(i.interviewDate);
              const formattedTime = dateObj.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) + ' at ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              const isSoon = (dateObj.getTime() - new Date().getTime()) < 24 * 60 * 60 * 1000 && (dateObj.getTime() - new Date().getTime()) > 0;

              return (
                <div 
                  key={i.id} 
                  className="resume-item"
                  style={{ 
                    borderColor: isSoon ? 'var(--color-warning)' : 'var(--border-color)',
                    background: isSoon ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-card)',
                    padding: '1.5rem',
                    flexDirection: 'row',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '1.5rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>{i.title}</strong>
                      <span className="badge-default" style={{ margin: 0, background: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}>
                        {app.companyName} | {app.role}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: isSoon ? 'var(--color-warning)' : 'var(--color-secondary)', fontWeight: 700, marginBottom: '0.5rem' }}>
                      📅 {formattedTime} {isSoon ? '(Soon)' : ''}
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      📍 Platform: <strong>{i.platform}</strong>
                      {i.link && (
                        <span>
                          {' | Link: '}
                          <a href={i.link} target="_blank" rel="noopener noreferrer" className="auth-link" style={{ textDecoration: 'none' }}>
                            Join Interview Link 🔗
                          </a>
                        </span>
                      )}
                    </div>

                    {i.notes && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
                        <strong>Preparation Notes:</strong> {i.notes}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'center', flexShrink: 0 }}>
                    <button onClick={() => handleOpenEditModal(i)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleOpenCancelModal(i)} 
                      className="btn-secondary" 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState 
            icon="📅"
            title="No scheduled interviews"
            description="All scheduled rounds are clean. Trigger preparation when recruiters send schedules."
            actionText="Schedule round now"
            onAction={handleOpenAddModal}
          />
        )}
      </div>

      {/* Add Interview Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3>Schedule Interview Round</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddInterview}>
              <div className="form-group">
                <label className="form-label">Linked Job Application *</label>
                <select 
                  className="form-control" 
                  required
                  value={applicationId} 
                  onChange={(e) => setApplicationId(e.target.value)}
                >
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.companyName} - {app.role} ({app.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Interview Title *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="E.g. Technical Round 1, System Design"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date & Time *</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Platform</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="E.g. Google Meet, Zoom, MS Teams, In-Person"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Meeting URL Link</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://meet.google.com/..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preparation Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="E.g. Review data structures, OOP concepts, Spring Boot lifecycle..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Schedule Interview</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Interview Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3>Edit Interview Details</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditInterview}>
              <div className="form-group">
                <label className="form-label">Linked Job Application *</label>
                <select 
                  className="form-control" 
                  required
                  value={applicationId} 
                  onChange={(e) => setApplicationId(e.target.value)}
                >
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.companyName} - {app.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Interview Title *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date & Time *</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Platform</label>
                <input
                  type="text"
                  className="form-control"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Meeting URL Link</label>
                <input
                  type="text"
                  className="form-control"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Update Interview</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Cancel Interview</h3>
              <button className="modal-close" onClick={() => setShowCancelModal(false)}>×</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you sure you want to cancel the interview round <strong>{selectedInterview?.title}</strong> for <strong>{selectedInterview?.jobApplication.companyName}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowCancelModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1.5, background: 'var(--color-danger)', boxShadow: 'none' }} onClick={handleDeleteInterview}>Remove Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interviews;
