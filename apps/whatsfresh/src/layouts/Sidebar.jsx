import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ config }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const styles = {
    sidebar: {
      width: '240px',
      backgroundColor: '#f5f5f5',
      borderRight: '1px solid #ddd',
      padding: '20px',
      boxSizing: 'border-box',
      overflow: 'auto',
      height: '100%',
    },
    section: {
      marginBottom: '20px',
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#666',
      marginBottom: '8px',
      textTransform: 'uppercase',
    },
    navItem: {
      display: 'block',
      padding: '8px 12px',
      color: '#333',
      textDecoration: 'none',
      borderRadius: '4px',
      marginBottom: '4px',
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      width: '100%',
      textAlign: 'left',
      fontSize: '14px',
    },
    navItemActive: {
      backgroundColor: '#1976d2',
      color: 'white',
    },
    navItemHover: {
      backgroundColor: '#e3f2fd',
    },
  };

  const handleNavClick = (path, external = false) => {
    if (external) {
      window.open(path, '_blank', 'noopener,noreferrer');
    } else {
      navigate(path);
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  if (!config || !config.sections) {
    return null;
  }

  return (
    <div style={styles.sidebar}>
      {config.sections.map((section, idx) => (
        <div key={idx} style={styles.section}>
          {section.title && (
            <div style={styles.sectionTitle}>{section.title}</div>
          )}
          {section.items && section.items.map((item, itemIdx) => (
            <button
              key={itemIdx}
              style={{
                ...styles.navItem,
                ...(isActivePath(item.path) && styles.navItemActive),
              }}
              onClick={() => handleNavClick(item.path, item.external)}
              onMouseEnter={(e) => {
                if (!isActivePath(item.path)) {
                  e.target.style.backgroundColor = '#e3f2fd';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActivePath(item.path)) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              {item.title}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
