import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Navbar = ({ theme, onToggleTheme }) => {
  const { user, logout, API_URL } = useAuth();
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (user) {
      // Check if user has an uploaded profile image
      axios.get(`${API_URL}/profiles/me/image`, { responseType: 'blob' })
        .then(response => {
          if (response.data.size > 0) {
            setProfileImage(URL.createObjectURL(response.data));
          }
        })
        .catch(() => {
          // No image uploaded, fallback to initial letters
          setProfileImage(null);
        });
    }
  }, [user, API_URL]);

  if (!user) return null;

  const isAdmin = user.role === 'ROLE_ADMIN';

  return (
    <nav className="sidebar">
      <NavLink to="/" className="sidebar-brand">
        🚀 CareerHub
      </NavLink>
      
      <ul className="sidebar-menu">
        {isAdmin ? (
          <>
            <li>
              <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
                <span className="nav-icon">📊</span> Admin Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/students" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">🎓</span> Students
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
                <span className="nav-icon">💼</span> Job Postings
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">👤</span> My Profile
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
                <span className="nav-icon">📊</span> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/applications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">📋</span> Applications
              </NavLink>
            </li>
            <li>
              <NavLink to="/jobs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">🔍</span> Job Discovery
              </NavLink>
            </li>
            <li>
              <NavLink to="/resumes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">📄</span> Resumes
              </NavLink>
            </li>
            <li>
              <NavLink to="/interviews" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">📅</span> Interviews
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">👤</span> My Profile
              </NavLink>
            </li>
          </>
        )}
      </ul>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Theme Mode</span>
          <button onClick={onToggleTheme} className="theme-toggle-btn" title="Toggle color scheme">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {profileImage ? (
              <img src={profileImage} alt="User Avatar" className="user-avatar-img" />
            ) : (
              user.username.substring(0, 2).toUpperCase()
            )}
          </div>
          <div className="user-details">
            <div className="user-name" title={user.username}>{user.username}</div>
            <div className="user-role">{user.role === 'ROLE_ADMIN' ? 'Admin User' : 'Student'}</div>
          </div>
        </div>
        
        <button onClick={logout} className="btn-logout">
          🚪 Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
