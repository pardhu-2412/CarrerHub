import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { useLocation } from 'react-router-dom';

const COLUMNS = [
  { id: 'APPLIED',      title: 'Applied',      color: 'var(--status-applied)' },
  { id: 'IN_PROGRESS',  title: 'In Progress',  color: 'var(--status-inprogress)' },
  { id: 'INTERVIEWING', title: 'Interviewing', color: 'var(--status-interviewing)' },
  { id: 'OFFERED',      title: 'Offered',      color: 'var(--status-offered)' },
  { id: 'REJECTED',     title: 'Rejected',     color: 'var(--status-rejected)' }
];

/* ─────────────────────────────────────────────────────────────────────────────
   Skill Gap Analysis Sub-Component
   Renders the analysis panel inside the Detail modal.
───────────────────────────────────────────────────────────────────────────── */
const SkillGapPanel = ({ skillGap, loading, hasRequiredSkills }) => {
  if (!hasRequiredSkills) {
    return (
      <div style={{
        background: 'rgba(99,102,241,0.06)',
        border: '1px dashed var(--color-primary)',
        borderRadius: '10px',
        padding: '1.25rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        lineHeight: '1.6'
      }}>
        <span style={{ fontSize: '1.4rem' }}>⚡</span>
        <p style={{ margin: '0.5rem 0 0' }}>
          <strong style={{ color: 'var(--text-main)' }}>No required skills set.</strong><br />
          Edit this application and add <em>Required Skills</em> (e.g. "Java, React, SQL") to see your Skill Gap Analysis.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
        <div className="skeleton-line" style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0 }} />
        <span style={{ fontSize: '0.875rem' }}>Analysing your profile skills…</span>
      </div>
    );
  }

  if (!skillGap) {
    return (
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Could not load skill gap analysis. Ensure your profile has skills listed.
      </p>
    );
  }

  const pct = skillGap.matchPercentage;
  const barColor = pct >= 70 ? 'var(--color-success)' : pct >= 40 ? '#f59e0b' : 'var(--color-danger)';
  const label   = pct >= 70 ? 'Strong Match' : pct >= 40 ? 'Partial Match' : 'Skill Gap';

  return (
    <div>
      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`,
            background: barColor,
            height: '100%',
            borderRadius: '5px',
            transition: 'width 0.9s ease'
          }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: barColor, whiteSpace: 'nowrap' }}>
          {pct}% — {label}
        </span>
      </div>

      {/* Matching / Missing grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1rem' }}>
        {/* Matching skills */}
        <div>
          <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-success)', margin: '0 0 0.5rem' }}>
            ✓ Matching ({skillGap.matchingSkills.length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {skillGap.matchingSkills.length > 0 ? (
              skillGap.matchingSkills.map(s => (
                <span key={s} className="badge" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--color-success)', fontSize: '0.75rem' }}>
                  {s}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>None matched yet</span>
            )}
          </div>
        </div>

        {/* Missing skills */}
        <div>
          <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ef4444', margin: '0 0 0.5rem' }}>
            ✗ Missing ({skillGap.missingSkills.length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {skillGap.missingSkills.length > 0 ? (
              skillGap.missingSkills.map(s => (
                <span key={s} className="badge" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontSize: '0.75rem' }}>
                  {s}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.78rem', color: 'var(--color-success)' }}>All skills matched! 🎉</span>
            )}
          </div>
        </div>
      </div>

      {/* Recommended skills to improve */}
      {skillGap.missingSkills.length > 0 && (
        <div style={{
          background: 'rgba(245,158,11,0.07)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '10px',
          padding: '1rem'
        }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.4rem' }}>
            📚 Recommended Skills to Improve
          </h4>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
            To boost your chances, consider learning:{' '}
            <strong style={{ color: '#f59e0b' }}>{skillGap.missingSkills.join(', ')}</strong>.{' '}
            Once acquired, add them to your profile to see your alignment score improve.
          </p>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Main Applications Page
───────────────────────────────────────────────────────────────────────────── */
const Applications = () => {
  const { API_URL } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();

  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState('dateApplied');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  // Skill Gap state (for Detail modal)
  const [skillGap, setSkillGap] = useState(null);
  const [skillGapLoading, setSkillGapLoading] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('APPLIED');
  const [notes, setNotes] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [dateApplied, setDateApplied] = useState('');

  const fetchApplications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [appRes, resumeRes] = await Promise.all([
        axios.get(`${API_URL}/applications`),
        axios.get(`${API_URL}/resumes`)
      ]);
      setApplications(appRes.data);
      setResumes(resumeRes.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch job applications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (location.state && location.state.openAppId && applications.length > 0) {
      const targetApp = applications.find(a => a.id === location.state.openAppId);
      if (targetApp) {
        handleOpenDetailModal(targetApp);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, applications]);

  /* ── Modal helpers ── */
  const resetForm = () => {
    setCompanyName(''); setRole(''); setStatus('APPLIED');
    setNotes(''); setJobDescription(''); setRequiredSkills('');
    setResumeId(''); setDateApplied(new Date().toISOString().split('T')[0]);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (app) => {
    setSelectedApp(app);
    setCompanyName(app.companyName);
    setRole(app.role);
    setStatus(app.status);
    setNotes(app.notes || '');
    setJobDescription(app.jobDescription || '');
    setRequiredSkills(app.requiredSkills || '');
    setResumeId(app.resume ? app.resume.id.toString() : '');
    setDateApplied(app.dateApplied || '');
    setShowEditModal(true);
  };

  const handleOpenDetailModal = async (app) => {
    setSelectedApp(app);
    setSkillGap(null);
    setShowDetailModal(true);

    if (app.requiredSkills && app.requiredSkills.trim()) {
      setSkillGapLoading(true);
      try {
        const res = await axios.get(`${API_URL}/applications/${app.id}/skill-gap`);
        setSkillGap(res.data);
      } catch (err) {
        console.error('Skill gap fetch failed:', err);
      } finally {
        setSkillGapLoading(false);
      }
    }
  };

  /* ── CRUD handlers ── */
  const handleAddApplication = async (e) => {
    e.preventDefault();
    try {
      const payload = { companyName, role, status, notes, jobDescription, requiredSkills,
        dateApplied, resumeId: resumeId ? parseInt(resumeId) : null };
      await axios.post(`${API_URL}/applications`, payload);
      setShowAddModal(false);
      addToast(`Application at ${companyName} logged successfully!`, 'success');
      fetchApplications(true);
    } catch (err) {
      console.error(err);
      addToast('Failed to add application.', 'error');
    }
  };

  const handleEditApplication = async (e) => {
    e.preventDefault();
    try {
      const payload = { companyName, role, status, notes, jobDescription, requiredSkills,
        dateApplied, resumeId: resumeId ? parseInt(resumeId) : null };
      await axios.put(`${API_URL}/applications/${selectedApp.id}`, payload);
      setShowEditModal(false);
      addToast('Application updated successfully.', 'success');
      fetchApplications(true);
    } catch (err) {
      console.error(err);
      addToast('Failed to update application.', 'error');
    }
  };

  const handleDeleteApplication = async () => {
    try {
      await axios.delete(`${API_URL}/applications/${selectedApp.id}`);
      setShowDeleteConfirm(false);
      addToast('Application record removed.', 'info');
      fetchApplications(true);
    } catch (err) {
      console.error(err);
      addToast('Failed to delete application.', 'error');
    }
  };

  const handleMoveStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/applications/${id}/status?status=${newStatus}`);
      setApplications(prev =>
        prev.map(app => app.id === id ? { ...app, status: newStatus } : app)
      );
      addToast(`Moved to ${newStatus.replace('_', ' ')}`, 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to update application status.', 'error');
    }
  };

  const getSortedApplications = (colId) => {
    const colApps = applications.filter(app => app.status === colId);
    return [...colApps].sort((a, b) => {
      if (sortKey === 'dateApplied') return new Date(b.dateApplied) - new Date(a.dateApplied);
      if (sortKey === 'companyName') return a.companyName.localeCompare(b.companyName);
      if (sortKey === 'role')        return a.role.localeCompare(b.role);
      return 0;
    });
  };

  /* ── Shared form fields for Add / Edit modals ── */
  const FormFields = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Company Name *</label>
          <input type="text" className="form-control" required value={companyName}
            onChange={e => setCompanyName(e.target.value)} placeholder="E.g. Microsoft" />
        </div>
        <div className="form-group">
          <label className="form-label">Job Role *</label>
          <input type="text" className="form-control" required value={role}
            onChange={e => setRole(e.target.value)} placeholder="E.g. Frontend Engineer" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Tracking Stage</label>
          <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
            {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date Applied</label>
          <input type="date" className="form-control" value={dateApplied}
            onChange={e => setDateApplied(e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Job Description</label>
        <textarea className="form-control" rows="3" value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
          placeholder="Paste or summarise the job description here…" />
      </div>

      <div className="form-group">
        <label className="form-label">
          Required Skills ⚡
          <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
            (comma-separated — powers Skill Gap Analysis)
          </span>
        </label>
        <input type="text" className="form-control" value={requiredSkills}
          onChange={e => setRequiredSkills(e.target.value)}
          placeholder="E.g. Java, React, Spring Boot, SQL, AWS" />
      </div>

      <div className="form-group">
        <label className="form-label">Link Resume</label>
        <select className="form-control" value={resumeId} onChange={e => setResumeId(e.target.value)}>
          <option value="">-- Select Resume (Optional) --</option>
          {resumes.map(r => (
            <option key={r.id} value={r.id}>{r.fileName} {r.isDefault ? '(Default)' : ''}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="form-control" rows="2" value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="E.g. Referral from college senior, resume screened…" />
      </div>
    </>
  );

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title">Application Tracker</h1>
          <p className="page-subtitle">Track your pipeline and analyse your skill gaps for each applied role.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Sort:</span>
            <select className="form-control" value={sortKey} onChange={e => setSortKey(e.target.value)}
              style={{ width: '150px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              <option value="dateApplied">Date Applied</option>
              <option value="companyName">Company Name</option>
              <option value="role">Job Role</option>
            </select>
          </div>
          <button onClick={handleOpenAddModal} className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
            ➕ Log Application
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {COLUMNS.map(col => {
          const sortedApps = getSortedApplications(col.id);
          return (
            <div key={col.id} className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <span className="status-dot" style={{ color: col.color, backgroundColor: col.color }} />
                  {col.title}
                </div>
                <span className="kanban-count">{sortedApps.length}</span>
              </div>

              <div className="kanban-cards">
                {loading ? (
                  <CardSkeleton count={2} />
                ) : sortedApps.length > 0 ? (
                  sortedApps.map(app => (
                    <div key={app.id} className="kanban-card">
                      <div className="kanban-card-title" title={app.role}>{app.role}</div>
                      <div className="kanban-card-company">{app.companyName}</div>

                      {/* Skill match badge if requiredSkills is set */}
                      {app.requiredSkills && (
                        <div style={{ marginTop: '0.4rem' }}>
                          <span className="badge" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--color-primary)', fontSize: '0.7rem' }}>
                            ⚡ Skill Gap Available
                          </span>
                        </div>
                      )}

                      {app.resume && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          📄 {app.resume.fileName}
                        </div>
                      )}

                      <div className="kanban-card-meta">
                        <span>📅 {app.dateApplied}</span>
                      </div>

                      {app.notes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '0.4rem 0.6rem', borderRadius: '6px', marginTop: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.notes}>
                          {app.notes}
                        </div>
                      )}

                      <div className="kanban-card-actions">
                        <button onClick={() => handleOpenDetailModal(app)} className="kanban-action-btn" title="View details & skill gap" style={{ color: 'var(--color-primary)' }}>
                          🔍 Details
                        </button>
                        <button onClick={() => handleOpenEditModal(app)} className="kanban-action-btn" title="Edit">
                          ✏️ Edit
                        </button>
                        <button onClick={() => { setSelectedApp(app); setShowDeleteConfirm(true); }} className="kanban-action-btn" style={{ color: 'var(--color-danger)' }} title="Delete">
                          🗑️
                        </button>

                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.2rem' }}>
                          {col.id !== 'APPLIED' && (
                            <button onClick={() => { const idx = COLUMNS.findIndex(c => c.id === col.id); handleMoveStatus(app.id, COLUMNS[idx - 1].id); }}
                              className="kanban-action-btn" style={{ padding: '0 0.2rem' }} title="Move Left">◀</button>
                          )}
                          {col.id !== 'REJECTED' && (
                            <button onClick={() => { const idx = COLUMNS.findIndex(c => c.id === col.id); handleMoveStatus(app.id, COLUMNS[idx + 1].id); }}
                              className="kanban-action-btn" style={{ padding: '0 0.2rem' }} title="Move Right">▶</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem', border: '1px dashed var(--border-color)', borderRadius: '10px' }}>
                    No applications
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ────────── Add Application Modal ────────── */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <h3>Log Job Application</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddApplication}>
              <FormFields />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Save Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────── Edit Application Modal ────────── */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <h3>Edit Application Record</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditApplication}>
              <FormFields />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Update Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────── Application Detail + Skill Gap Modal ────────── */}
      {showDetailModal && selectedApp && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="glass-panel modal-content" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>{selectedApp.role}</h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 500, marginTop: '0.15rem' }}>
                  {selectedApp.companyName}
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>

            {/* Metadata row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>📅 Applied: {selectedApp.dateApplied}</span>
              {selectedApp.resume && <span>📄 {selectedApp.resume.fileName}</span>}
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                Stage: {COLUMNS.find(c => c.id === selectedApp.status)?.title || selectedApp.status}
              </span>
            </div>

            {/* Job Description */}
            {selectedApp.jobDescription && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  📝 Job Description
                </h4>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.65', whiteSpace: 'pre-line',
                  background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '8px',
                  border: '1px solid var(--border-color)' }}>
                  {selectedApp.jobDescription}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedApp.notes && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  🗒️ Notes
                </h4>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.65' }}>
                  {selectedApp.notes}
                </div>
              </div>
            )}

            {/* ── Skill Gap Analysis Section ── */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.25rem'
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚡ Skill Gap Analysis
              </h4>
              <SkillGapPanel
                skillGap={skillGap}
                loading={skillGapLoading}
                hasRequiredSkills={!!(selectedApp.requiredSkills && selectedApp.requiredSkills.trim())}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowDetailModal(false)}>Close</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => { setShowDetailModal(false); handleOpenEditModal(selectedApp); }}>
                ✏️ Edit Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────── Delete Confirmation ────────── */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Remove Application</h3>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Are you sure you want to delete the application for <strong>{selectedApp?.role}</strong> at <strong>{selectedApp?.companyName}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1.5, background: 'var(--color-danger)', boxShadow: 'none' }} onClick={handleDeleteApplication}>
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
