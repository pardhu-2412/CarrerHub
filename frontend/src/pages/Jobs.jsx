import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { useNavigate } from 'react-router-dom';

const Jobs = () => {
  const { API_URL } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [appliedJobs, setAppliedJobs] = useState(new Map()); // jobId -> application
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Skill match analysis state
  const [skillMatch, setSkillMatch] = useState(null);
  const [skillLoading, setSkillLoading] = useState(false);

  // Filters state
  const [filterType, setFilterType] = useState('ALL'); // ALL, FULL_TIME, INTERNSHIP, CONTRACT
  const [filterLocation, setFilterLocation] = useState('ALL');

  const fetchJobs = async (query = '') => {
    try {
      setLoading(true);
      const url = query ? `${API_URL}/jobs?q=${encodeURIComponent(query)}` : `${API_URL}/jobs`;
      const [jobsRes, savedRes, appsRes] = await Promise.all([
        axios.get(url),
        axios.get(`${API_URL}/jobs/saved`),
        axios.get(`${API_URL}/applications`)
      ]);
      setJobs(jobsRes.data);
      setSavedJobIds(new Set(savedRes.data.map(j => j.id)));
      
      const appMap = new Map();
      appsRes.data.forEach(app => {
        if (app.job) {
          appMap.set(app.job.id, app);
        }
      });
      setAppliedJobs(appMap);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs(searchQuery);
  };

  const handleToggleSave = async (jobId) => {
    try {
      if (savedJobIds.has(jobId)) {
        await axios.delete(`${API_URL}/jobs/${jobId}/save`);
        setSavedJobIds(prev => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
        addToast('Job removed from bookmarks.', 'info');
      } else {
        await axios.post(`${API_URL}/jobs/${jobId}/save`);
        setSavedJobIds(prev => {
          const next = new Set(prev);
          next.add(jobId);
          return next;
        });
        addToast('Job bookmarked successfully!', 'success');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to update bookmark status.', 'error');
    }
  };

  const handleApplyJob = async (job) => {
    try {
      const payload = {
        companyName: job.companyName,
        role: job.title,
        status: 'APPLIED',
        notes: `Applied directly via internal job listing. Required skills match: ${skillMatch?.matchPercentage || 0}%`,
        dateApplied: new Date().toISOString().split('T')[0],
        jobId: job.id
      };

      const res = await axios.post(`${API_URL}/applications`, payload);
      addToast(`Applied and added ${job.title} at ${job.companyName} to your tracker!`, 'success');
      
      setAppliedJobs(prev => {
        const next = new Map(prev);
        next.set(job.id, res.data);
        return next;
      });
    } catch (err) {
      console.error(err);
      addToast('Failed to log job application. Make sure it is not already tracked.', 'error');
    }
  };

  const handleViewApplication = (appId) => {
    navigate('/applications', { state: { openAppId: appId } });
  };

  const handleSelectJob = async (job) => {
    setSelectedJob(job);
    setSkillMatch(null);
    setSkillLoading(true);
    try {
      const res = await axios.get(`${API_URL}/jobs/${job.id}/skill-match`);
      setSkillMatch(res.data);
    } catch (err) {
      console.error('Failed to load skill match analysis:', err);
    } finally {
      setSkillLoading(false);
    }
  };

  // Get unique locations for dropdown filter
  const locations = ['ALL', ...new Set(jobs.map(j => j.location).filter(Boolean))];

  // Client side filters
  const filteredJobs = jobs.filter(job => {
    const matchesType = filterType === 'ALL' || job.jobType === filterType;
    const matchesLocation = filterLocation === 'ALL' || job.location === filterLocation;
    return matchesType && matchesLocation;
  });

  return (
    <div className="jobs-page-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header and Search bar */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Job Discovery</h1>
        <p className="page-subtitle">Explore placement opportunities published by your coordinator and check your skill matching.</p>
        
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search jobs by title, company, requirements..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ flex: 1, minWidth: '250px' }}
          />
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="form-control"
            style={{ width: '160px' }}
          >
            <option value="ALL">All Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="CONTRACT">Contract</option>
          </select>
          <select 
            value={filterLocation} 
            onChange={(e) => setFilterLocation(e.target.value)}
            className="form-control"
            style={{ width: '160px' }}
          >
            <option value="ALL">All Locations</option>
            {locations.map(loc => loc !== 'ALL' && <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </div>

      {/* Main split content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem', flex: 1, minHeight: '500px' }} className="jobs-split-layout">
        
        {/* Job Listings Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
          {loading ? (
            <CardSkeleton count={3} />
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map(job => {
              const isApplied = appliedJobs.has(job.id);
              return (
                <div 
                  key={job.id} 
                  onClick={() => handleSelectJob(job)}
                  className={`glass-panel clickable-job-card ${selectedJob?.id === job.id ? 'active-job' : ''}`}
                  style={{ 
                    padding: '1.25rem', 
                    cursor: 'pointer', 
                    borderRadius: '12px',
                    border: selectedJob?.id === job.id ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                    transition: 'all 0.2s ease',
                    background: selectedJob?.id === job.id ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{job.title}</h3>
                        {isApplied && (
                          <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)', fontSize: '0.65rem', margin: 0, padding: '0.15rem 0.4rem' }}>
                            Applied
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{job.companyName}</div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSave(job.id);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}
                      title={savedJobIds.has(job.id) ? "Remove Bookmark" : "Bookmark Job"}
                    >
                      {savedJobIds.has(job.id) ? '⭐️' : '☆'}
                    </button>
                  </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                  <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)' }}>
                    {job.jobType?.replace('_', ' ')}
                  </span>
                  {job.location && (
                    <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
                      📍 {job.location}
                    </span>
                  )}
                  {job.salaryRange && (
                    <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
                      💰 {job.salaryRange}
                    </span>
                  )}
                </div>
              </div>
            );
          })
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <h3>No jobs found</h3>
              <p>Try refining your search or filters.</p>
            </div>
          )}
        </div>

        {/* Job Details Column */}
        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
          {selectedJob ? (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{selectedJob.title}</h2>
                    <div style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginTop: '0.25rem', fontWeight: 500 }}>{selectedJob.companyName}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      onClick={() => handleToggleSave(selectedJob.id)} 
                      className="btn-secondary" 
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      {savedJobIds.has(selectedJob.id) ? '⭐ Unsave' : '☆ Save'}
                    </button>
                    {appliedJobs.has(selectedJob.id) ? (
                      <button 
                        onClick={() => handleViewApplication(appliedJobs.get(selectedJob.id).id)} 
                        className="btn-primary"
                        style={{ padding: '0.5rem 1.25rem', backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                      >
                        👁️ View Application
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleApplyJob(selectedJob)} 
                        className="btn-primary"
                        style={{ padding: '0.5rem 1.25rem' }}
                      >
                        🚀 Apply Now
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                  {selectedJob.location && <span>📍 {selectedJob.location}</span>}
                  {selectedJob.salaryRange && <span>💰 {selectedJob.salaryRange}</span>}
                  <span>⏱️ Posted: {new Date(selectedJob.postedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

              {/* SKILL MATCH / RECOMMENDATION ENGINE SECTION */}
              <div className="skill-match-section" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ⚡ CareerHub Skill Recommendation
                </h3>

                {skillLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                    <div className="skeleton-line" style={{ width: '24px', height: '24px', borderRadius: '50%' }}></div>
                    <span>Analyzing your profile skills match...</span>
                  </div>
                ) : skillMatch ? (
                  <div>
                    {/* Visual Progress Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.1)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${skillMatch.matchPercentage}%`, 
                            background: skillMatch.matchPercentage >= 70 ? 'var(--color-success)' : skillMatch.matchPercentage >= 40 ? '#f59e0b' : 'var(--color-danger)', 
                            height: '100%', 
                            borderRadius: '6px',
                            transition: 'width 1s ease'
                          }} 
                        />
                      </div>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: skillMatch.matchPercentage >= 70 ? 'var(--color-success)' : skillMatch.matchPercentage >= 40 ? '#f59e0b' : 'var(--color-danger)' }}>
                        {skillMatch.matchPercentage}% Match
                      </span>
                    </div>

                    {/* Skill categorization grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      
                      {/* Matching Skills */}
                      <div>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                          Matching Skills ({skillMatch.matchingSkills.length})
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {skillMatch.matchingSkills.length > 0 ? (
                            skillMatch.matchingSkills.map(skill => (
                              <span key={skill} className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', fontSize: '0.75rem' }}>
                                ✓ {skill}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None matched.</span>
                          )}
                        </div>
                      </div>

                      {/* Missing Skills */}
                      <div>
                        <h4 style={{ fontSize: '0.85rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                          Missing Skills ({skillMatch.missingSkills.length})
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {skillMatch.missingSkills.length > 0 ? (
                            skillMatch.missingSkills.map(skill => (
                              <span key={skill} className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.75rem' }}>
                                ✗ {skill}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None missing!</span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Recommended Skills to Improve Section */}
                    {skillMatch.missingSkills.length > 0 && (
                      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                          Recommended Skills to Improve
                        </h4>
                        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
                          To boost your chances of landing this role, consider learning or showcasing these key competencies: 
                          <strong style={{ color: 'var(--color-primary)' }}> {skillMatch.missingSkills.join(', ')}</strong>. 
                          You can add these to your profile once acquired to increase your alignment score.
                        </p>
                      </div>
                    )}

                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    No skill matching information could be loaded. Please ensure you have set up your profile skills.
                  </div>
                )}
              </div>

              {/* Job Description */}
              {selectedJob.description && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Job Description</h3>
                  <div style={{ fontSize: '0.925rem', lineHeight: '1.6', color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
                    {selectedJob.description}
                  </div>
                </div>
              )}

              {/* Job Requirements */}
              {selectedJob.requirements && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Requirements</h3>
                  <div style={{ fontSize: '0.925rem', lineHeight: '1.6', color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
                    {selectedJob.requirements}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: 'var(--text-muted)', minHeight: '300px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '2.5rem' }}>🔍</span>
                <h3 style={{ marginTop: '1rem' }}>No job selected</h3>
                <p>Select a job from the list to view its description, requirements, and skill matching analytics.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Jobs;
