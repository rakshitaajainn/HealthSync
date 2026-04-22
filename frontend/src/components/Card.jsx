import React from 'react';

function Card({ 
  title, 
  subtitle, 
  value, 
  icon, 
  iconColor = 'blue', 
  children, 
  className = '', 
  ...props 
}) {
  return (
    <div className={`card ${className}`} {...props}>
      {icon && (
        <div className={`card-icon card-icon-${iconColor}`}>
          {icon}
        </div>
      )}
      {title && <h3 className="card-title">{title}</h3>}
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
      {value !== undefined && <div className="card-value">{value}</div>}
      {children}
    </div>
  );
}

export default Card;
