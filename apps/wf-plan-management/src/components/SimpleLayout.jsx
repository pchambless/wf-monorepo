import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Simple vanilla React layout for Plan 0039 testing
 * Avoids MUI dependency issues while testing modal functionality
 */
const SimpleLayout = ({ children, navigationSections, appName }) => {
  const navigate = useNavigate();

  const handleNavClick = (path) => {
    navigate(path);
  };

  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
    },
    sidebar: {
      width: "240px",
      backgroundColor: "#f5f5f5",
      borderRight: "1px solid #ddd",
      padding: "20px",
      boxSizing: "border-box",
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
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>{appName || "Plan Management"}</h3>
        </div>

        {navigationSections?.map((section, sectionIndex) => (
          <div key={sectionIndex} style={styles.navSection}>
            <div style={styles.sectionTitle}>{section.title}</div>
            {section.items?.map((item, itemIndex) => (
              <button
                key={itemIndex}
                style={styles.navItem}
                onClick={() => handleNavClick(item.path)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor =
                    styles.navItemHover.backgroundColor;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                {item.title}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={styles.main}>{children}</div>
    </div>
  );
};

export default SimpleLayout;
