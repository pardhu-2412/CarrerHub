import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/LoadingSkeleton';

const STATUS_COLUMNS = [
  { id: 'APPLIED', title: 'Applied', color: 'var(--status-applied)' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'var(--status-inprogress)' },
  { id: 'INTERVIEWING', title: 'Interviewing', color: 'var(--status-interviewing)' },
  { id: 'OFFERED', title: 'Offered', color: 'var(--status-offered)' },
  { id: 'REJECTED', title: 'Rejected', color: 'var(--status-rejected)' }
];

const Students = () => {
  const { API_URL, user } = useAuth();
  const { addToast } = useToast();
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [placementFilter, setPlacementFilter] = useState('ALL'); // ALL, PLACED, UNPLACED
  const [skillFilter, setSkillFilter] = useState('ALL');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/students`);
      setStudents(res.data);
      if (res.data.length > 0) {
        setSelectedStudent(res.data[0]);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch students data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (user.role !== 'ROLE_ADMIN') {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-danger)' }}>
        <span style={{ fontSize: '3rem' }}>⚠️</span>
        <h3 style={{ marginTop: '1rem' }}>Access Denied</h3>
        <p style={{ color: 'var(--text-muted)' }}>You do not have administrative privileges to view student monitoring.</p>
      </div>
    );
  }

  // Get list of all unique skills for filter dropdown
  const allSkills = ['ALL', ...new Set(
    students
      .flatMap(s => s.skills ? s.skills.split(',').map(sk => sk.trim()) : [])
      .filter(Boolean)
  )];

  // Helper to compute local skill gap for student profile vs application requiredSkills
  const getLocalSkillGap = (studentSkillsCsv, requiredSkillsCsv) => {
    if (!requiredSkillsCsv) return null;
    
    const studentSet = new Set(
      (studentSkillsCsv || '')
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean)
    );
    
    const requiredSkillsArr = requiredSkillsCsv
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const matching = [];
    const missing = [];
    
    requiredSkillsArr.forEach(skill => {
      if (studentSet.has(skill.toLowerCase())) {
        matching.push(skill);
      } else {
        missing.push(skill);
      }
    });

    const total = requiredSkillsArr.length;
    const matchPercentage = total === 0 ? 0 : Math.round((matching.length * 100) / total);

    return {
      matchPercentage,
      matching,
      missing
    };
  };

  // Perform search & filters on client side
  const filteredStudents = students.filter(student => {
    // 1. Search filter
    const searchString = `${student.username} ${student.fullName || ''} ${student.skills || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    
    // 2. Placement Status filter
    const isPlaced = student.applications.some(app => app.status === 'OFFERED');
    const matchesPlacement = 
      placementFilter === 'ALL' ||
      (placementFilter === 'PLACED' && isPlaced) ||
      (placementFilter === 'UNPLACED' && !isPlaced);
      
    // 3. Skill filter
    const studentSkills = (student.skills || '').split(',').map(s => s.trim().toLowerCase());
    const matchesSkill = 
      skillFilter === 'ALL' ||
      studentSkills.includes(skillFilter.toLowerCase());

    return matchesSearch && matchesPlacement && matchesSkill;
  });

  const handleSelectStudent = (student) => {
    // Sync selection with the fresh list state in case of updates
    const currentStudent = students.find(s => s.id === student.id);
    setSelectedStudent(currentStudent || student);
  };

  return (
    <div className="jobs-page-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header and Controls */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Student Engagement Monitoring</h1>
        <p className="page-subtitle">Track registration profiles, application progression, and interview status metrics for all student candidates.</p>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search students by name, credentials, or skills..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ flex: 1, minWidth: '250px' }}
          />
          <select 
            value={placementFilter} 
            onChange={(e) => setPlacementFilter(e.target.value)}
            className="form-control"
            style={{ width: '180px' }}
          >
            <option value="ALL">All Placements</option>
            <option value="PLACED">Offered / Placed</option>
            <option value="UNPLACED">Seeking Offers</option>
          </select>
          <select 
            value={skillFilter} 
            onChange={(e) => setSkillFilter(e.target.value)}
            className="form-control"
            style={{ width: '180px' }}
          >
            <option value="ALL">Filter by Skill (All)</option>
            {allSkills.filter(s => s !== 'ALL').map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '2rem', flex: 1, minHeight: '500px' }} className="jobs-split-layout">
        
        {/* Student List Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
          {loading ? (
            <ListSkeleton count={4} />
          ) : filteredStudents.length > 0 ? (
            filteredStudents.map(student => {
              const hasOffer = student.applications.some(app => app.status === 'OFFERED');
              return (
                <div 
                  key={student.id} 
                  onClick={() => handleSelectStudent(student)}
                  className={`glass-panel clickable-job-card ${selectedStudent?.id === student.id ? 'active-job' : ''}`}
                  style={{ 
                    padding: '1.25rem', 
                    cursor: 'pointer', 
                    borderRadius: '12px',
                    border: selectedStudent?.id === student.id ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                    transition: 'all 0.2s ease',
                    background: selectedStudent?.id === student.id ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                        {student.fullName || student.username}
                      </h3>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.25rem' }}>
                        @{student.username} • {student.email}
                      </div>
                    </div>
                    {hasOffer ? (
                      <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)' }}>
                        Placed 🎉
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', color: 'var(--color-warning)' }}>
                        Active
                      </span>
                    )}
                  </div>
                  
                  {student.skills && (
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                      {student.skills.split(',').slice(0, 3).map((skill, index) => (
                        <span key={index} className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                          {skill.trim()}
                        </span>
                      ))}
                      {student.skills.split(',').length > 3 && (
                        <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                          +{student.skills.split(',').length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>📝 <strong>{student.totalApplications}</strong> Applications</span>
                    <span>📅 <strong>{student.totalInterviews}</strong> Interviews</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <h3>No students found</h3>
              <p>Try refining your search or filters.</p>
            </div>
          )}
        </div>

        {/* Student Details / Monitoring Panel */}
        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
          {selectedStudent ? (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* Profile Card Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                      {selectedStudent.fullName || selectedStudent.username}
                    </h2>
                    <div style={{ fontSize: '1rem', color: 'var(--color-primary)', marginTop: '0.25rem', fontWeight: 500 }}>
                      @{selectedStudent.username} — Candidate Student
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a href={`mailto:${selectedStudent.email}`} className="btn-primary" style={{ padding: '0.5rem 1rem', textDecoration: 'none', fontSize: '0.85rem' }}>
                      ✉️ Email Student
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                  <span>📧 {selectedStudent.email}</span>
                  {selectedStudent.githubLink && (
                    <a href={selectedStudent.githubLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-secondary)', textDecoration: 'none' }}>
                      🔗 GitHub
                    </a>
                  )}
                  {selectedStudent.linkedinLink && (
                    <a href={selectedStudent.linkedinLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-secondary)', textDecoration: 'none' }}>
                      🔗 LinkedIn
                    </a>
                  )}
                  {selectedStudent.portfolioLink && (
                    <a href={selectedStudent.portfolioLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-secondary)', textDecoration: 'none' }}>
                      🔗 Website
                    </a>
                  )}
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

              {/* Bio & Skills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Profile Bio</h3>
                  <p style={{ fontSize: '0.875rem', lineHeight: '1.5', color: 'var(--text-muted)', margin: 0 }}>
                    {selectedStudent.bio ? `"${selectedStudent.bio}"` : 'No professional summary provided.'}
                  </p>
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Skills & Preferences</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Candidate Skills:</div>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {selectedStudent.skills ? selectedStudent.skills.split(',').map((s, i) => (
                          <span key={i} className="badge" style={{ backgroundColor: 'var(--color-primary-glow)', color: 'var(--color-primary)', fontSize: '0.7rem' }}>
                            {s.trim()}
                          </span>
                        )) : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None listed</span>}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Job Target Roles:</div>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {selectedStudent.preferences ? selectedStudent.preferences.split(',').map((p, i) => (
                          <span key={i} className="badge" style={{ backgroundColor: 'rgba(14, 165, 233, 0.08)', color: 'var(--color-secondary)', fontSize: '0.7rem' }}>
                            {p.trim()}
                          </span>
                        )) : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None listed</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Applications Pipeline & Status */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📊 Manually Tracked Job Applications ({selectedStudent.applications.length})
                </h3>
                
                {selectedStudent.applications.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {selectedStudent.applications.map(app => {
                      const gapAnalysis = getLocalSkillGap(selectedStudent.skills, app.requiredSkills);
                      const statusConf = STATUS_COLUMNS.find(c => c.id === app.status);
                      
                      return (
                        <div key={app.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', background: 'rgba(255, 255, 255, 0.01)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div>
                              <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{app.role}</strong>
                              <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>at</span>
                              <strong style={{ color: 'var(--color-secondary)', fontSize: '0.95rem' }}>{app.companyName}</strong>
                            </div>
                            <span className="badge" style={{ backgroundColor: `rgba(${statusConf?.color ? '99,102,241' : '156,163,175'}, 0.12)`, color: statusConf?.color || 'var(--text-muted)' }}>
                              {statusConf?.title || app.status}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            📅 Date Logged: {app.dateApplied} {app.resume && ` | 📄 Resume Linked: ${app.resume.fileName}`}
                          </div>

                          {app.jobDescription && (
                            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '0.75rem', whiteSpace: 'pre-line' }}>
                              {app.jobDescription}
                            </div>
                          )}

                          {gapAnalysis ? (
                            <div style={{ background: 'rgba(99, 102, 241, 0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', marginTop: '0.75rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>⚡ Student Skill Gap Analysis</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: gapAnalysis.matchPercentage >= 70 ? 'var(--color-success)' : gapAnalysis.matchPercentage >= 40 ? '#f59e0b' : 'var(--color-danger)' }}>
                                  {gapAnalysis.matchPercentage}% Alignment
                                </span>
                              </div>
                              
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.75rem' }}>
                                <div>
                                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Matching: </span>
                                  {gapAnalysis.matching.length > 0 ? gapAnalysis.matching.join(', ') : 'None'}
                                </div>
                                <div>
                                  <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>Missing: </span>
                                  {gapAnalysis.missing.length > 0 ? gapAnalysis.missing.join(', ') : 'None'}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              No required skills defined for this application.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No applications manually tracked by this candidate yet.
                  </div>
                )}
              </div>

              {/* Scheduled Interviews */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                  📅 Scheduled Recruitment Interviews ({selectedStudent.interviews.length})
                </h3>
                {selectedStudent.interviews.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedStudent.interviews.map(itm => (
                      <div key={itm.id} className="resume-item" style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{itm.title}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            ⏱️ Scheduled: {new Date(itm.interviewDate).toLocaleString()} | Platform: {itm.platform}
                          </div>
                          {itm.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontStyle: 'italic' }}>Notes: {itm.notes}</div>}
                        </div>
                        {itm.link && (
                          <a href={itm.link} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                            Join Meet
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No interviews scheduled for this student.
                  </div>
                )}
              </div>

              {/* Uploaded Resumes */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                  📄 Candidate Resumes ({selectedStudent.resumes.length})
                </h3>
                {selectedStudent.resumes.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {selectedStudent.resumes.map(res => (
                      <div key={res.id} className="glass-panel" style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={res.fileName}>
                          📄 {res.fileName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Uploaded: {new Date(res.uploadedAt).toLocaleDateString()}
                        </div>
                        {res.isDefault && (
                          <span className="badge" style={{ marginTop: '0.5rem', display: 'inline-block', backgroundColor: 'var(--color-primary-glow)', color: 'var(--color-primary)', fontSize: '0.65rem' }}>
                            Default Resume
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No resumes uploaded by this student.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: 'var(--text-muted)', minHeight: '300px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '2.5rem' }}>🔍</span>
                <h3 style={{ marginTop: '1rem' }}>No student selected</h3>
                <p>Select a student candidate from the list to monitor their profile and tracker details.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Students;
