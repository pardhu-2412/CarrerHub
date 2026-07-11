import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import PageHeader from '../components/PageHeader';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { API_URL, user } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user && user.role === 'ROLE_ADMIN';

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const statsEndpoint = isAdmin ? `${API_URL}/admin/analytics/dashboard` : `${API_URL}/analytics/dashboard`;
      const monthlyEndpoint = isAdmin ? `${API_URL}/admin/analytics/monthly-stats` : `${API_URL}/analytics/monthly-stats`;
      const statusEndpoint = isAdmin ? `${API_URL}/admin/analytics/status-stats` : `${API_URL}/analytics/status-stats`;

      const calls = [
        axios.get(statsEndpoint),
        axios.get(monthlyEndpoint),
        axios.get(statusEndpoint)
      ];

      if (!isAdmin) {
        calls.push(axios.get(`${API_URL}/notifications`));
      }

      const responses = await Promise.all(calls);

      setStats(responses[0].data);
      setMonthlyStats(responses[1].data);
      setStatusStats(responses[2].data);
      
      if (!isAdmin && responses[3]) {
        setNotifications(responses[3].data);
      }
      
      if (silent) {
        addToast('Dashboard data updated successfully.', 'success');
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      addToast('Failed to load dashboard metrics. Ensure backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      addToast('Notification marked as read', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to mark notification as read', 'error');
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const maxMonthlyCount = Math.max(...monthlyStats.map(d => d.count), 5);
  const maxStatusCount = Math.max(...statusStats.map(d => d.count), 5);

  if (isAdmin) {
    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN DASHBOARD VIEW
    // ─────────────────────────────────────────────────────────────────────────
    return (
      <div>
        <PageHeader 
          title="Placement Admin Dashboard" 
          subtitle="Monitor global platform activity, student engagement, and recruitment pipeline stats."
          actionText="Refresh Metrics"
          onAction={() => fetchData(true)}
          actionIcon="🔄"
        />

        {stats && (
          <div className="dashboard-grid">
            {/* Card 1: Total Registered Students */}
            <div className="glass-panel stat-card">
              <div className="stat-info">
                <h4>Registered Students</h4>
                <div className="stat-value">{stats.totalStudents}</div>
              </div>
              <div className="stat-icon" style={{ background: 'var(--color-primary)' }}>🎓</div>
            </div>

            {/* Card 2: Total Applications */}
            <div className="glass-panel stat-card stat-secondary">
              <div className="stat-info">
                <h4>Total Applications</h4>
                <div className="stat-value">{stats.totalApplications}</div>
              </div>
              <div className="stat-icon" style={{ background: 'var(--color-secondary)' }}>📝</div>
            </div>

            {/* Card 3: Total Interviews Scheduled */}
            <div className="glass-panel stat-card stat-warning">
              <div className="stat-info">
                <h4>Total Interviews</h4>
                <div className="stat-value">{stats.totalInterviews}</div>
              </div>
              <div className="stat-icon" style={{ background: 'var(--color-warning)' }}>📅</div>
            </div>

            {/* Card 4: Placed Students */}
            <div className="glass-panel stat-card stat-success">
              <div className="stat-info">
                <h4>Placed Students</h4>
                <div className="stat-value">{stats.placedStudents}</div>
              </div>
              <div className="stat-icon" style={{ background: 'var(--color-success)' }}>🎉</div>
            </div>
          </div>
        )}

        <div className="dashboard-charts-layout">
          {/* Chart 1: Global Monthly Applications Trend */}
          <div className="glass-panel chart-card">
            <div className="chart-header">
              <h3>Global Application Trend</h3>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Last 6 Months (All Users)</span>
            </div>

            <div className="svg-chart-container">
              {monthlyStats.length > 0 ? (
                <svg width="100%" height="100%" viewBox="0 0 500 220" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGradientAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                    <line
                      key={index}
                      x1="40"
                      y1={30 + ratio * 140}
                      x2="470"
                      y2={30 + ratio * 140}
                      className="chart-grid-line"
                    />
                  ))}

                  {/* Area under the line */}
                  <polygon
                    points={`
                      40,170 
                      ${monthlyStats.map((d, i) => {
                        const x = 40 + i * (430 / (monthlyStats.length - 1));
                        const y = 170 - (d.count / maxMonthlyCount) * 140;
                        return `${x},${y}`;
                      }).join(' ')} 
                      470,170
                    `}
                    style={{ fill: 'url(#areaGradientAdmin)' }}
                  />

                  {/* Line Path */}
                  <polyline
                    points={monthlyStats.map((d, i) => {
                      const x = 40 + i * (430 / (monthlyStats.length - 1));
                      const y = 170 - (d.count / maxMonthlyCount) * 140;
                      return `${x},${y}`;
                    }).join(' ')}
                    className="chart-line"
                  />

                  {/* Data Points */}
                  {monthlyStats.map((d, i) => {
                    const x = 40 + i * (430 / (monthlyStats.length - 1));
                    const y = 170 - (d.count / maxMonthlyCount) * 140;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="5" className="chart-point" />
                        <text x={x} y={y - 10} textAnchor="middle" fill="var(--text-main)" fontSize="10" fontWeight="bold">
                          {d.count}
                        </text>
                      </g>
                    );
                  })}

                  {/* Axes */}
                  <line x1="40" y1="170" x2="470" y2="170" className="chart-axis-line" />
                  <line x1="40" y1="30" x2="40" y2="170" className="chart-axis-line" />

                  {/* X Axis Labels */}
                  {monthlyStats.map((d, i) => {
                    const x = 40 + i * (430 / (monthlyStats.length - 1));
                    const label = d.month.split(' ')[0];
                    return (
                      <text key={i} x={x} y="190" textAnchor="middle" className="chart-axis-text">
                        {label}
                      </text>
                    );
                  })}

                  {/* Y Axis Labels */}
                  {[0, 0.5, 1].map((ratio, index) => {
                    const val = Math.round(ratio * maxMonthlyCount);
                    const y = 170 - ratio * 140;
                    return (
                      <text key={index} x="30" y={y + 3} textAnchor="end" className="chart-axis-text">
                        {val}
                      </text>
                    );
                  })}
                </svg>
              ) : (
                <div style={{ textAlign: 'center', paddingTop: '4rem', color: 'var(--text-muted)' }}>No monthly trend available</div>
              )}
            </div>
          </div>

          {/* Chart 2: Global Status Distribution */}
          <div className="glass-panel chart-card">
            <div className="chart-header">
              <h3>Global Status Distribution</h3>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Recruitment Stages (All Users)</span>
            </div>

            <div className="svg-chart-container">
              {statusStats.length > 0 ? (
                <svg width="100%" height="100%" viewBox="0 0 300 220" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="barGradientAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" />
                      <stop offset="100%" stopColor="rgba(99, 102, 241, 0.15)" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0, 0.5, 1].map((ratio, index) => (
                    <line
                      key={index}
                      x1="35"
                      y1={30 + ratio * 140}
                      x2="280"
                      y2={30 + ratio * 140}
                      className="chart-grid-line"
                    />
                  ))}

                  {/* Bars */}
                  {statusStats.map((d, i) => {
                    const width = 25;
                    const x = 50 + i * 45;
                    const height = (d.count / maxStatusCount) * 140;
                    const y = 170 - height;
                    
                    let barColor = "url(#barGradientAdmin)";
                    if (d.status === "OFFERED") barColor = "var(--color-success)";
                    if (d.status === "REJECTED") barColor = "var(--color-danger)";
                    if (d.status === "INTERVIEWING") barColor = "var(--color-warning)";

                    return (
                      <g key={i}>
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          className="chart-bar"
                          style={{ fill: barColor }}
                          rx="4"
                        />
                        <text x={x + width / 2} y={y - 5} textAnchor="middle" fill="var(--text-main)" fontSize="10" fontWeight="bold">
                          {d.count}
                        </text>
                      </g>
                    );
                  })}

                  {/* Axes */}
                  <line x1="35" y1="170" x2="280" y2="170" className="chart-axis-line" />
                  <line x1="35" y1="30" x2="35" y2="170" className="chart-axis-line" />

                  {/* X Axis Labels */}
                  {statusStats.map((d, i) => {
                    const x = 50 + i * 45 + 12;
                    let label = d.status.substring(0, 4);
                    if (d.status === "IN_PROGRESS") label = "Prog";
                    return (
                      <text key={i} x={x} y="190" textAnchor="middle" className="chart-axis-text" fontSize="9" fontWeight="600">
                        {label}
                      </text>
                    );
                  })}

                  {/* Y Axis Labels */}
                  {[0, 0.5, 1].map((ratio, index) => {
                    const val = Math.round(ratio * maxStatusCount);
                    const y = 170 - ratio * 140;
                    return (
                      <text key={index} x="28" y={y + 3} textAnchor="end" className="chart-axis-text">
                        {val}
                      </text>
                    );
                  })}
                </svg>
              ) : (
                <div style={{ textAlign: 'center', paddingTop: '4rem', color: 'var(--text-muted)' }}>No status data available</div>
              )}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem', marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Placement Platform Actions</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Access core administrative controls to monitor and manage the placement pipeline.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <Link to="/admin/students" className="resume-item clickable" style={{ padding: '1.2rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>🎓</span>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>Manage Students</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Search students, check profiles, skills, and application pipelines.</div>
              </div>
            </Link>
            <Link to="/admin" className="resume-item clickable" style={{ padding: '1.2rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>💼</span>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>Job Postings</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Publish new job roles, edit parameters, and modify deadlines.</div>
              </div>
            </Link>
            <Link to="/profile" className="resume-item clickable" style={{ padding: '1.2rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>👤</span>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>Admin Profile</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Configure your administrator account credentials.</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STUDENT DASHBOARD VIEW (EXISTING VIEW)
  // ─────────────────────────────────────────────────────────────────────────
  const unreadNotifications = notifications.filter(n => !n.read);
  const interviewAlert = notifications.find(n => !n.read && n.message.toLowerCase().includes('tomorrow'));

  return (
    <div>
      <PageHeader 
        title="Placement Dashboard" 
        subtitle="Track your recruitment analytics, interview pipeline, and active offers."
        actionText="Refresh Stats"
        onAction={() => fetchData(true)}
        actionIcon="🔄"
      />

      {interviewAlert && (
        <div className="alert alert-success" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-warning)', borderColor: 'rgba(245, 158, 11, 0.25)', marginBottom: '1.5rem', borderRadius: '12px' }}>
          <span>🔔</span>
          <div style={{ flex: 1 }}>
            <strong>Upcoming Interview:</strong> {interviewAlert.message}
          </div>
          <button 
            onClick={() => handleMarkAsRead(interviewAlert.id)} 
            className="btn-secondary" 
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          >
            Acknowledge
          </button>
        </div>
      )}

      {stats && (
        <div className="dashboard-grid">
          {/* Card 1: Total Applications */}
          <div className="glass-panel stat-card">
            <div className="stat-info">
              <h4>Applications</h4>
              <div className="stat-value">{stats.totalApplications}</div>
            </div>
            <div className="stat-icon" style={{ background: 'var(--color-primary)' }}>📝</div>
          </div>

          {/* Card 2: Interviews */}
          <div className="glass-panel stat-card stat-warning">
            <div className="stat-info">
              <h4>Interviews</h4>
              <div className="stat-value">{stats.totalInterviews}</div>
            </div>
            <div className="stat-icon" style={{ background: 'var(--color-warning)' }}>📅</div>
          </div>

          {/* Card 3: Offers */}
          <div className="glass-panel stat-card stat-success">
            <div className="stat-info">
              <h4>Offers Received</h4>
              <div className="stat-value">{stats.offeredCount}</div>
            </div>
            <div className="stat-icon" style={{ background: 'var(--color-success)' }}>🎉</div>
          </div>

          {/* Card 4: Interview Conversion Rate */}
          <div className="glass-panel stat-card stat-secondary">
            <div className="stat-info">
              <h4>Interview Rate</h4>
              <div className="stat-value">{stats.interviewRate}%</div>
            </div>
            <div className="stat-icon" style={{ background: 'var(--color-secondary)' }}>🗣️</div>
          </div>
        </div>
      )}

      <div className="dashboard-charts-layout">
        {/* Chart 1: Monthly Applications Trend */}
        <div className="glass-panel chart-card">
          <div className="chart-header">
            <h3>Monthly Application Trend</h3>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Last 6 Months</span>
          </div>

          <div className="svg-chart-container">
            {monthlyStats.length > 0 ? (
              <svg width="100%" height="100%" viewBox="0 0 500 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                  <line
                    key={index}
                    x1="40"
                    y1={30 + ratio * 140}
                    x2="470"
                    y2={30 + ratio * 140}
                    className="chart-grid-line"
                  />
                ))}

                {/* Area under the line */}
                <polygon
                  points={`
                    40,170 
                    ${monthlyStats.map((d, i) => {
                      const x = 40 + i * (430 / (monthlyStats.length - 1));
                      const y = 170 - (d.count / maxMonthlyCount) * 140;
                      return `${x},${y}`;
                    }).join(' ')} 
                    470,170
                  `}
                  className="chart-area"
                />

                {/* Line Path */}
                <polyline
                  points={monthlyStats.map((d, i) => {
                    const x = 40 + i * (430 / (monthlyStats.length - 1));
                    const y = 170 - (d.count / maxMonthlyCount) * 140;
                    return `${x},${y}`;
                  }).join(' ')}
                  className="chart-line"
                />

                {/* Data Points */}
                {monthlyStats.map((d, i) => {
                  const x = 40 + i * (430 / (monthlyStats.length - 1));
                  const y = 170 - (d.count / maxMonthlyCount) * 140;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="5" className="chart-point" />
                      <text x={x} y={y - 10} textAnchor="middle" fill="var(--text-main)" fontSize="10" fontWeight="bold">
                        {d.count}
                      </text>
                    </g>
                  );
                })}

                {/* Axes */}
                <line x1="40" y1="170" x2="470" y2="170" className="chart-axis-line" />
                <line x1="40" y1="30" x2="40" y2="170" className="chart-axis-line" />

                {/* X Axis Labels */}
                {monthlyStats.map((d, i) => {
                  const x = 40 + i * (430 / (monthlyStats.length - 1));
                  const label = d.month.split(' ')[0];
                  return (
                    <text key={i} x={x} y="190" textAnchor="middle" className="chart-axis-text">
                      {label}
                    </text>
                  );
                })}

                {/* Y Axis Labels */}
                {[0, 0.5, 1].map((ratio, index) => {
                  const val = Math.round(ratio * maxMonthlyCount);
                  const y = 170 - ratio * 140;
                  return (
                    <text key={index} x="30" y={y + 3} textAnchor="end" className="chart-axis-text">
                      {val}
                    </text>
                  );
                })}
              </svg>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: '4rem', color: 'var(--text-muted)' }}>No monthly trend available</div>
            )}
          </div>
        </div>

        {/* Chart 2: Status Distribution */}
        <div className="glass-panel chart-card">
          <div className="chart-header">
            <h3>Status Distribution</h3>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Recruitment Stages</span>
          </div>

          <div className="svg-chart-container">
            {statusStats.length > 0 ? (
              <svg width="100%" height="100%" viewBox="0 0 300 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop offset="100%" stopColor="rgba(99, 102, 241, 0.15)" />
                  </linearGradient>
                  <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-secondary)" />
                    <stop offset="100%" stopColor="var(--color-primary)" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.5, 1].map((ratio, index) => (
                  <line
                    key={index}
                    x1="35"
                    y1={30 + ratio * 140}
                    x2="280"
                    y2={30 + ratio * 140}
                    className="chart-grid-line"
                  />
                ))}

                {/* Bars */}
                {statusStats.map((d, i) => {
                  const width = 25;
                  const x = 50 + i * 45;
                  const height = (d.count / maxStatusCount) * 140;
                  const y = 170 - height;
                  
                  let barColor = "url(#barGradient)";
                  if (d.status === "OFFERED") barColor = "var(--color-success)";
                  if (d.status === "REJECTED") barColor = "var(--color-danger)";
                  if (d.status === "INTERVIEWING") barColor = "var(--color-warning)";

                  return (
                    <g key={i}>
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        className="chart-bar"
                        style={{ fill: barColor }}
                        rx="4"
                      />
                      <text x={x + width / 2} y={y - 5} textAnchor="middle" fill="var(--text-main)" fontSize="10" fontWeight="bold">
                        {d.count}
                      </text>
                    </g>
                  );
                })}

                {/* Axes */}
                <line x1="35" y1="170" x2="280" y2="170" className="chart-axis-line" />
                <line x1="35" y1="30" x2="35" y2="170" className="chart-axis-line" />

                {/* X Axis Labels */}
                {statusStats.map((d, i) => {
                  const x = 50 + i * 45 + 12;
                  let label = d.status.substring(0, 4);
                  if (d.status === "IN_PROGRESS") label = "Prog";
                  return (
                    <text key={i} x={x} y="190" textAnchor="middle" className="chart-axis-text" fontSize="9" fontWeight="600">
                      {label}
                    </text>
                  );
                })}

                {/* Y Axis Labels */}
                {[0, 0.5, 1].map((ratio, index) => {
                  const val = Math.round(ratio * maxStatusCount);
                  const y = 170 - ratio * 140;
                  return (
                    <text key={index} x="28" y={y + 3} textAnchor="end" className="chart-axis-text">
                      {val}
                    </text>
                  );
                })}
              </svg>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: '4rem', color: 'var(--text-muted)' }}>No status data available</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Notifications Pane */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.2rem' }}>System Notifications</h3>
            {unreadNotifications.length > 0 && (
              <span className="badge-default" style={{ margin: 0, padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                {unreadNotifications.length} New
              </span>
            )}
          </div>

          <div className="notifications-pane">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <p className="notification-msg">{n.message}</p>
                    {!n.read && (
                      <button 
                        onClick={() => handleMarkAsRead(n.id)} 
                        className="kanban-action-btn"
                        style={{ color: 'var(--color-primary)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem' }}
                        title="Mark as Read"
                      >
                        ✔
                      </button>
                    )}
                  </div>
                  <span className="notification-time">
                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No notifications logged. Add interviews or applications to trigger alerts.
              </div>
            )}
          </div>
        </div>

        {/* Preparation Checklists */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem' }}>Placement Prep Progress</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Maintain a current default resume under the Resumes manager and attach it to your application trackers.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.8rem 1rem', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                <strong>Profile & Experience Completeness</strong>
                <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>100% Ready</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: 'var(--color-success)' }}></div>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.8rem 1rem', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                <strong>Technical Practice (DSA)</strong>
                <span style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>80% Done</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '80%', height: '100%', background: 'var(--color-secondary)' }}></div>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.8rem 1rem', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                <strong>Core Full Stack Skills</strong>
                <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>90% Mastered</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '90%', height: '100%', background: 'var(--color-primary)' }}></div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', background: 'var(--color-primary-glow)', padding: '1rem', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '12px' }}>
            <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>💡 Quick Placement Tip</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Log notes and coding questions asked after each interview round. Building this local prep repository helps you ace subsequent rounds!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
