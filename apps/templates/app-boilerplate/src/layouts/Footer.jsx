import React from 'react';

const Footer = ({ config }) => {
  const styles = {
    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '40px',
      backgroundColor: '#f5f5f5',
      borderTop: '1px solid #ddd',
      padding: '0 16px',
      fontSize: '12px',
      color: '#666',
    },
    links: {
      display: 'flex',
      gap: '16px',
    },
    link: {
      color: '#1976d2',
      textDecoration: 'none',
      cursor: 'pointer',
    },
  };

  if (!config) {
    return null;
  }

  return (
    <div style={styles.footer}>
      <div>{config.copyright || '© 2024 WhatsFresh'}</div>
      {config.links && (
        <div style={styles.links}>
          {config.links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              style={styles.link}
              target={link.external ? '_blank' : '_self'}
              rel={link.external ? 'noopener noreferrer' : ''}
            >
              {link.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Footer;
