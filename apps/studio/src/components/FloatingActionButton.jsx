import React from 'react';

const FloatingActionButton = ({ onClick }) => {
  const styles = {
    fab: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      backgroundColor: '#2196F3',
      border: 'none',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      transition: 'all 0.3s ease',
      zIndex: 1000
    },
    fabHover: {
      backgroundColor: '#1976D2',
      boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
      transform: 'scale(1.05)'
    }
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      style={{
        ...styles.fab,
        ...(isHovered ? styles.fabHover : {})
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Create GitHub Issue"
    >
      📝
    </button>
  );
};

export default FloatingActionButton;
