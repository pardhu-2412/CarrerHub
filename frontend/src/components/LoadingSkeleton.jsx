import React from 'react';

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-panel skeleton-card">
          <div className="skeleton-line skeleton-title" style={{ width: '60%', height: '20px', marginBottom: '10px' }} />
          <div className="skeleton-line skeleton-subtitle" style={{ width: '40%', height: '14px', marginBottom: '20px' }} />
          <div className="skeleton-line" style={{ width: '100%', height: '12px', marginBottom: '8px' }} />
          <div className="skeleton-line" style={{ width: '85%', height: '12px', marginBottom: '20px' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="skeleton-line skeleton-btn" style={{ width: '60px', height: '32px', borderRadius: '8px' }} />
            <div className="skeleton-line skeleton-btn" style={{ width: '80px', height: '32px', borderRadius: '8px' }} />
          </div>
        </div>
      ))}
    </>
  );
};

export const TableSkeleton = ({ rows = 4, cols = 4 }) => {
  return (
    <div className="glass-panel skeleton-table-container" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div className="skeleton-line" style={{ width: '200px', height: '24px' }} />
        <div className="skeleton-line" style={{ width: '100px', height: '32px', borderRadius: '8px' }} />
      </div>
      <div className="skeleton-table">
        <div className="skeleton-table-header" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="skeleton-line" style={{ flex: 1, height: '16px' }} />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="skeleton-table-row" style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="skeleton-line" style={{ flex: 1, height: '14px' }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ListSkeleton = ({ count = 3 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="resume-item skeleton-list-item" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <div className="skeleton-line skeleton-circle" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton-line" style={{ width: '40%', height: '16px', marginBottom: '6px' }} />
              <div className="skeleton-line" style={{ width: '25%', height: '12px' }} />
            </div>
          </div>
          <div className="skeleton-line" style={{ width: '80px', height: '32px', borderRadius: '8px' }} />
        </div>
      ))}
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <div className="skeleton-line" style={{ width: '250px', height: '36px', marginBottom: '8px' }} />
          <div className="skeleton-line" style={{ width: '380px', height: '16px' }} />
        </div>
      </div>
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-panel stat-card skeleton-stat-card" style={{ padding: '1.5rem', minHeight: '100px' }}>
            <div style={{ flex: 1 }}>
              <div className="skeleton-line" style={{ width: '60px', height: '12px', marginBottom: '8px' }} />
              <div className="skeleton-line" style={{ width: '40px', height: '32px' }} />
            </div>
            <div className="skeleton-line skeleton-circle" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
          </div>
        ))}
      </div>
      <div className="dashboard-charts-layout">
        <div className="glass-panel chart-card" style={{ height: '300px', padding: '1.75rem' }}>
          <div className="skeleton-line" style={{ width: '150px', height: '20px', marginBottom: '20px' }} />
          <div className="skeleton-line" style={{ width: '100%', height: '180px', borderRadius: '8px' }} />
        </div>
        <div className="glass-panel chart-card" style={{ height: '300px', padding: '1.75rem' }}>
          <div className="skeleton-line" style={{ width: '120px', height: '20px', marginBottom: '20px' }} />
          <div className="skeleton-line" style={{ width: '100%', height: '180px', borderRadius: '8px' }} />
        </div>
      </div>
    </div>
  );
};
