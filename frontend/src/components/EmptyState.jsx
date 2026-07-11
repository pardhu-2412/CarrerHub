import React from 'react';

const EmptyState = ({ icon, title, description, actionText, onAction }) => {
  return (
    <div className="glass-panel empty-state-container">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn-primary empty-state-btn">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
