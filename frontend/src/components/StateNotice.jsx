import React from 'react';

function StateNotice({
  variant = 'info',
  title,
  message,
  actionLabel,
  onAction,
}) {
  const iconMap = {
    info: '💡',
    error: '⚠️',
    success: '✅',
    loading: '⏳'
  };

  if (variant === 'loading') {
    return (
      <div className="state-notice">
        <div className="spinner mb-2"></div>
        {title && <h3 className="state-notice-title">{title}</h3>}
        {message && <p className="state-notice-message">{message}</p>}
      </div>
    );
  }

  return (
    <div className={`alert alert-${variant}`}>
      <span style={{ fontSize: '1.25rem' }}>{iconMap[variant] || '💡'}</span>
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: '700', marginBottom: '0.2rem' }}>{title}</div>}
        {message && <div style={{ opacity: 0.9 }}>{message}</div>}
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="btn btn-sm btn-ghost mt-2"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default StateNotice;

