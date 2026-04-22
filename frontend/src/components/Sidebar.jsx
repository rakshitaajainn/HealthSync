import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  {
    section: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: '🏠', end: true },
    ],
  },
  {
    section: 'Health',
    items: [
      { to: '/reports',   label: 'My Reports',    icon: '📄' },
      { to: '/upload',    label: 'Upload Report',  icon: '⬆️' },
      { to: '/predict',   label: 'Risk Predict',   icon: '🔮' },
    ],
  },
  {
    section: 'Account',
    items: [
      { to: '/profile',   label: 'Profile',        icon: '👤' },
      { to: '/emergency', label: 'Emergency Info',  icon: '🚨' },
    ],
  },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      {navItems.map(({ section, items }) => (
        <div key={section}>
          <p className="sidebar-section-label">{section}</p>
          {items.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `sidebar-item${isActive ? ' active' : ''}`
              }
            >
              <span className="sidebar-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  );
}

export default Sidebar;
