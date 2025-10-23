import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Simple vanilla React layout - shared across apps
 * Clean, no MUI dependencies
 */
const SimpleLayout = ({ children, navigationSections, appName, appBarConfig, onLogout }) => {
  const navigate = useNavigate();
  const [isMigrating, setIsMigrating] = useState(false);

  const handleNavClick = (path, external = false) => {
    if (external) {
      window.open(path, '_blank', 'noopener,noreferrer');
    } else {
      navigate(path);
    }
  };

  const handleRunMigration = async () => {
    if (!window.confirm('Run production data migration? This will copy prod data to test database.')) {
      return;
    }

    setIsMigrating(true);
    try {
      const response = await fetch('http://localhost:3001/api/util/run-migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (result.success) {
        alert('Migration completed successfully!');
      } else {
        alert(`Migration failed: ${result.message}`);
      }
    } catch (error) {
      alert(`Migration error: ${error.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
    },
    appbar: {
      display: "flex",
      alignItems: "center",
      height: "64px",
      backgroundColor: "#1976d2",
      color: "white",
      padding: "0 16px",
      borderBottom: "1px solid #ddd",
      gap: "16px",
    },
    appbarTitle: {
      fontSize: "20px",
      fontWeight: "600",
      flexGrow: 1,
    },
    appDropdown: {
      padding: "6px 12px",
      borderRadius: "4px",
      border: "1px solid rgba(255,255,255,0.3)",
      backgroundColor: "rgba(255,255,255,0.1)",
      color: "white",
      fontSize: "14px",
      cursor: "pointer",
    },
    logoutButton: {
      padding: "8px 16px",
      backgroundColor: "rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.3)",
      color: "white",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
    },
    migrationButton: {
      padding: "8px 16px",
      backgroundColor: "#ff9800",
      border: "1px solid rgba(255,255,255,0.3)",
      color: "white",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
    },
    migrationButtonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
    body: {
      display: "flex",
      flex: 1,
      overflow: "hidden",
    },
    sidebar: {
      width: "280px",
      backgroundColor: "#f5f5f5",
      borderRight: "1px solid #ddd",
      padding: "20px",
      boxSizing: "border-box",
      overflow: "auto",
    },
    main: {
      flex: 1,
      padding: "20px",
      backgroundColor: "#fff",
      overflow: "auto",
    },
    header: {
      backgroundColor: "#1976d2",
      color: "white",
      padding: "16px 20px",
      marginBottom: "20px",
      borderRadius: "4px",
    },
    navSection: {
      marginBottom: "20px",
    },
    sectionTitle: {
      fontSize: "14px",
      fontWeight: "bold",
      color: "#666",
      marginBottom: "8px",
      textTransform: "uppercase",
    },
    navItem: {
      display: "block",
      padding: "8px 12px",
      color: "#333",
      textDecoration: "none",
      borderRadius: "4px",
      marginBottom: "4px",
      cursor: "pointer",
      border: "none",
      background: "none",
      width: "100%",
      textAlign: "left",
    },
    navItemHover: {
      backgroundColor: "#e3f2fd",
    },
  };

  return (
    <div style={styles.container}>
      {/* Appbar */}
      <div style={styles.appbar}>
        <div style={{ fontSize: "24px" }}>🎨</div>
        <div style={styles.appbarTitle}>
          {appBarConfig?.title || appName || "WhatsFresh"}
        </div>

        {appBarConfig?.showAppSelector && appBarConfig?.availableApps && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>App:</span>
            <select style={styles.appDropdown}>
              {appBarConfig.availableApps.map((app) => (
                <option key={app.key} value={app.key} style={{ color: "black" }}>
                  {app.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          style={{
            ...styles.migrationButton,
            ...(isMigrating && styles.migrationButtonDisabled)
          }}
          onClick={handleRunMigration}
          disabled={isMigrating}
        >
          {isMigrating ? "Migrating..." : "Run Migration"}
        </button>

        {appBarConfig?.showUserMenu && (
          <button
            style={styles.logoutButton}
            onClick={onLogout || (() => console.log("Logout"))}
          >
            Logout
          </button>
        )}
      </div>

      <div style={styles.body}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.header}>
            <h3 style={{ margin: 0 }}>{appName || "WhatsFresh"}</h3>
          </div>

          {navigationSections?.map((section, sectionIndex) => (
            <div key={sectionIndex} style={styles.navSection}>
              <div style={styles.sectionTitle}>{section.title}</div>
              {section.items?.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  style={{
                    ...styles.navItem,
                    ...(item.external && {
                      fontStyle: "italic",
                      color: "#666"
                    })
                  }}
                  onClick={() => handleNavClick(item.path, item.external)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = styles.navItemHover.backgroundColor;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                  title={item.external ? "Opens in new tab" : ""}
                >
                  {item.icon && `${item.icon} `}{item.title}
                  {item.external && " ↗"}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={styles.main}>{children}</div>
      </div>
    </div>
  );
};

export default SimpleLayout;