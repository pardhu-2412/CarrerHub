import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Profile = () => {
  const { API_URL, user } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [linkedinLink, setLinkedinLink] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [preferences, setPreferences] = useState('');
  
  // Image Upload state
  const [profileImage, setProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchProfileImage = async () => {
    try {
      const response = await axios.get(`${API_URL}/profiles/me/image`, { responseType: 'blob' });
      if (response.data.size > 0) {
        setProfileImage(URL.createObjectURL(response.data));
      }
    } catch (err) {
      // Image doesn't exist yet, ignore
      setProfileImage(null);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/profiles/me`);
      const data = res.data;
      setProfile(data);
      setFullName(data.fullName || '');
      setBio(data.bio || '');
      setSkills(data.skills || '');
      setGithubLink(data.githubLink || '');
      setLinkedinLink(data.linkedinLink || '');
      setPortfolioLink(data.portfolioLink || '');
      setPreferences(data.preferences || '');
      await fetchProfileImage();
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fullName,
        bio,
        skills,
        githubLink,
        linkedinLink,
        portfolioLink,
        preferences
      };

      const res = await axios.put(`${API_URL}/profiles/me`, payload);
      setProfile(res.data);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to update profile settings.', 'error');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type (images only)
    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      addToast('Profile image must be less than 2MB.', 'error');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${API_URL}/profiles/me/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      addToast('Profile avatar uploaded!', 'success');
      await fetchProfileImage();
      // Force reload navbar image if necessary (handled by browser caching / state generally)
      window.location.reload(); // Simple solution to sync navbar and profile card avatars
    } catch (err) {
      console.error(err);
      addToast('Failed to upload profile avatar.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-wrapper" style={{ flexDirection: 'column', gap: '1.5rem' }}>
        <div className="skeleton-line skeleton-circle" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
        <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Loading profile preferences...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Configure your personal information, skills chips, and career preference tags.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', alignItems: 'start' }}>
        {/* Profile Card Summary */}
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 1.5rem auto' }}>
            <div className="user-avatar" style={{ width: '90px', height: '90px', fontSize: '2.2rem', margin: 0 }}>
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="user-avatar-img" />
              ) : (
                user.username.substring(0, 2).toUpperCase()
              )}
            </div>
            <label 
              htmlFor="profile-image-input" 
              style={{
                position: 'absolute',
                bottom: '-5px',
                right: '-5px',
                background: 'var(--color-primary)',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1rem',
                border: '2px solid var(--bg-main)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                transition: 'var(--transition-fast)'
              }}
              title="Change profile avatar"
            >
              📷
            </label>
            <input 
              id="profile-image-input" 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              style={{ display: 'none' }} 
              disabled={uploadingImage}
            />
          </div>
          
          <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            {fullName || user.username}
          </h2>
          <div style={{ color: 'var(--color-secondary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
            🎓 {user.role === 'ROLE_ADMIN' ? 'Placement Admin' : 'Student Candidate'}
          </div>

          {bio && (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.5rem', fontStyle: 'italic', padding: '0 0.5rem' }}>
              "{bio}"
            </p>
          )}

          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <div>
              <span className="form-label" style={{ marginBottom: '0.25rem' }}>Email Address</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{user.email}</div>
            </div>

            {user.role !== 'ROLE_ADMIN' && skills && (
              <div>
                <span className="form-label" style={{ marginBottom: '0.5rem' }}>Skills Chipset</span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {skills.split(',').map((skill, index) => (
                    <span key={index} className="job-tag" style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.role !== 'ROLE_ADMIN' && preferences && (
              <div>
                <span className="form-label" style={{ marginBottom: '0.5rem' }}>Career Preferences</span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {preferences.split(',').map((pref, index) => (
                    <span key={index} className="job-tag" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--color-secondary)', borderColor: 'rgba(14, 165, 233, 0.2)' }}>
                      {pref.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.role !== 'ROLE_ADMIN' && (githubLink || linkedinLink || portfolioLink) && (
              <div>
                <span className="form-label" style={{ marginBottom: '0.5rem' }}>Web Links</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {linkedinLink && (
                    <a href={linkedinLink} target="_blank" rel="noopener noreferrer" className="auth-link" style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}>
                      🔗 LinkedIn Profile
                    </a>
                  )}
                  {githubLink && (
                    <a href={githubLink} target="_blank" rel="noopener noreferrer" className="auth-link" style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}>
                      🔗 GitHub Repository
                    </a>
                  )}
                  {portfolioLink && (
                    <a href={portfolioLink} target="_blank" rel="noopener noreferrer" className="auth-link" style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}>
                      🔗 Personal Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '1.15rem' }}>Edit Personal Details</h3>
          
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="E.g. G Parda saradi Reddy"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Profile Bio / Summary</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Write a brief professional summary about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {user.role !== 'ROLE_ADMIN' && (
              <>
                <div className="form-group">
                  <label className="form-label">Technical Skills (Comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="E.g. Java, Spring Boot, React, SQL, HTML, CSS"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Career Preferences (Comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="E.g. Full Stack Developer, Software Engineer"
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GitHub URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://github.com/your-username"
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">LinkedIn URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://linkedin.com/in/your-username"
                    value={linkedinLink}
                    onChange={(e) => setLinkedinLink(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Portfolio Website URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://yourportfolio.com"
                    value={portfolioLink}
                    onChange={(e) => setPortfolioLink(e.target.value)}
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>
              Save Profile Details
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
