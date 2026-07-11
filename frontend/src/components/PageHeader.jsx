import React from 'react';

const PageHeader = ({ title, subtitle, actionText, onAction, actionIcon }) => {
  return (
    <div className="page-header-container">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actionText && onAction && (
        <button onClick={onAction} className="btn-primary page-header-btn">
          {actionIcon && <span className="btn-icon">{actionIcon}</span>}
          {actionText}
        </button>
      )}
    </div>
  );
};

export default PageHeader;
