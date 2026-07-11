import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/LoadingSkeleton';

const Admin = () => {
  const { API_URL, user } = useAuth();
  const { addToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [jobType, setJobType] = useState('FULL_TIME'); // FULL_TIME, INTERNSHIP, CONTRACT
  const [deadline, setDeadline] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchJobs = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await axios.get(`${API_URL}/jobs`);
      setJobs(res.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch job opportunities.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleOpenAddModal = () => {
    setTitle('');
    setCompanyName('');
    setLocation('');
    setSalaryRange('');
    setApplicationUrl('');
    setDescription('');
    setRequirements('');
    setRequiredSkills('');
    setJobType('FULL_TIME');
    setDeadline('');
    setIsActive(true);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (job) => {
    setSelectedJob(job);
    setTitle(job.title);
    setCompanyName(job.companyName);
    setLocation(job.location || '');
    setSalaryRange(job.salaryRange || '');
    setApplicationUrl(job.applicationUrl || '');
    setDescription(job.description || '');
    setRequirements(job.requirements || '');
    setRequiredSkills(job.requiredSkills || '');
    setJobType(job.jobType || 'FULL_TIME');
    setDeadline(job.deadline || '');
    setIsActive(job.active);
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (job) => {
    setSelectedJob(job);
    setShowDeleteModal(true);
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        companyName,
        location,
        salaryRange,
        applicationUrl,
        description,
        requirements,
        requiredSkills,
        jobType,
        deadline: deadline || null,
        active: isActive
      };

      await axios.post(`${API_URL}/jobs`, payload);
      addToast('Job opportunity posted successfully!', 'success');
      setShowAddModal(false);
      fetchJobs(true);
    } catch (err) {
      console.error(err);
      addToast('Failed to post new job. Verify fields.', 'error');
    }
  };

  const handleEditJob = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        companyName,
        location,
        salaryRange,
        applicationUrl,
        description,
        requirements,
        requiredSkills,
        jobType,
        deadline: deadline || null,
        active: isActive
      };

      await axios.put(`${API_URL}/jobs/${selectedJob.id}`, payload);
      addToast('Job opportunity updated successfully.', 'success');
      setShowEditModal(false);
      fetchJobs(true);
    } catch (err) {
      console.error(err);
      addToast('Failed to update job details.', 'error');
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;
    try {
      await axios.delete(`${API_URL}/jobs/${selectedJob.id}`);
      addToast('Job listing deleted.', 'info');
      setShowDeleteModal(false);
      setSelectedJob(null);
      fetchJobs(true);
    } catch (err) {
      console.error(err);
      addToast('Failed to delete job listing.', 'error');
    }
  };

  if (user.role !== 'ROLE_ADMIN') {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-danger)' }}>
        <span style={{ fontSize: '3rem' }}>⚠️</span>
        <h3 style={{ marginTop: '1rem' }}>Access Denied</h3>
        <p style={{ color: 'var(--text-muted)' }}>You do not have Placement Coordinator privileges to view this page.</p>
      </div>
    );
  }

  // Dashboard Stats summary
  const totalPostings = jobs.length;
  const activePostings = jobs.filter(j => j.active).length;

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title">Placement Admin Panel</h1>
          <p className="page-subtitle">Publish job postings, manage opening statuses, and monitor candidate discovery board.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
          ➕ Post Job Opening
        </button>
      </div>

      {/* Admin stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel stat-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="stat-info">
            <h4>Total Job Postings</h4>
            <div className="stat-value" style={{ fontSize: '1.8rem' }}>{totalPostings}</div>
          </div>
          <span style={{ fontSize: '1.5rem' }}>💼</span>
        </div>
        <div className="glass-panel stat-card stat-success" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="stat-info">
            <h4>Active Openings</h4>
            <div className="stat-value" style={{ fontSize: '1.8rem' }}>{activePostings}</div>
          </div>
          <span style={{ fontSize: '1.5rem' }}>✅</span>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '1.15rem' }}>Active Job Postings</h3>

        {loading ? (
          <ListSkeleton count={3} />
        ) : jobs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {jobs.map(job => (
              <div 
                key={job.id} 
                className="resume-item"
                style={{ 
                  opacity: job.active ? 1 : 0.6,
                  borderColor: job.active ? 'var(--border-color)' : 'rgba(244, 63, 94, 0.15)',
                  padding: '1.25rem 1.5rem'
                }}
              >
                <div style={{ flex: 1, paddingRight: '1rem', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{job.title}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', fontWeight: 700 }}>{job.companyName}</span>
                    <span className="badge-default" style={{ margin: 0, fontSize: '0.65rem', background: job.active ? 'var(--color-primary-glow)' : 'rgba(255,255,255,0.05)', color: job.active ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                      {job.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    {job.jobType && (
                      <span className="badge-default" style={{ margin: 0, fontSize: '0.65rem', background: 'rgba(14, 165, 233, 0.08)', color: 'var(--color-secondary)', borderColor: 'rgba(14, 165, 233, 0.2)' }}>
                        {job.jobType.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    📍 {job.location || 'Remote'} | 💰 {job.salaryRange || 'Not disclosed'} | 📅 Posted {new Date(job.postedAt).toLocaleDateString()}
                    {job.deadline && ` | ⚠️ Deadline: ${job.deadline}`}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                  <button onClick={() => handleOpenEditModal(job)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleOpenDeleteModal(job)} 
                    className="btn-secondary" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No jobs are currently posted on the platform. Add a posting to seed job discovery!
          </div>
        )}
      </div>

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3>Post Job Opening</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddJob}>
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="E.g. Graduate Software Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="E.g. Stripe"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select className="form-control" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                    <option value="FULL_TIME">Full-time</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="CONTRACT">Contract</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input
                    type="date"
                    className="form-control"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="E.g. Bangalore, India (or Remote)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Salary Range</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="E.g. ₹12,00,000 - ₹15,00,000 / year"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Application URL / Careers Link</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://careers.stripe.com/..."
                  value={applicationUrl}
                  onChange={(e) => setApplicationUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Detail daily responsibilities, role scopes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Requirements</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Detail qualifications, coding test languages, criteria..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Required Skills for Skill Match ⚡</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="E.g. Java, React, Spring Boot, SQL, AWS (comma-separated)"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Used by the Skill Match Analysis to compare against student profiles.</small>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.2rem 0' }}>
                <input
                  type="checkbox"
                  id="add-is-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="add-is-active" style={{ fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Publish as Active (visible in Discovery)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Post Job Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3>Edit Job Details</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditJob}>
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select className="form-control" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                    <option value="FULL_TIME">Full-time</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="CONTRACT">Contract</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input
                    type="date"
                    className="form-control"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Salary Range</label>
                <input
                  type="text"
                  className="form-control"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Application URL / Careers Link</label>
                <input
                  type="text"
                  className="form-control"
                  value={applicationUrl}
                  onChange={(e) => setApplicationUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Requirements</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Required Skills for Skill Match ⚡</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="E.g. Java, React, Spring Boot, SQL, AWS (comma-separated)"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Used by the Skill Match Analysis to compare against student profiles.</small>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.2rem 0' }}>
                <input
                  type="checkbox"
                  id="edit-is-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="edit-is-active" style={{ fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Publish as Active (visible in Discovery)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Update Job Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Delete Listing</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you sure you want to delete the job listing <strong>{selectedJob?.title}</strong> at <strong>{selectedJob?.companyName}</strong>? All bookmarked entries by candidates will be removed.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1.5, background: 'var(--color-danger)', boxShadow: 'none' }} onClick={handleDeleteJob}>Delete Listing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
