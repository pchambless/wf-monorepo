import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StudioSidebar from "../studio/StudioSidebar";
import CanvasSidebar from "../studio/CanvasSidebar";

/**
 * Simple vanilla React layout for Plan 0039 testing
 * Avoids MUI dependency issues while testing modal functionality
 */
const SimpleLayout = ({ children, navigationSections, appName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStudioPage = location.pathname === "/studio";

  const handleNavClick = (path, external = false) => {
    if (external) {
      window.open(path, '_blank', 'noopener,noreferrer');
    } else {
      navigate(path);
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

  const availableApps = ["plans", "admin", "client"];

  return (
    <div style={styles.container}>
      {/* Appbar */}
      <div style={styles.appbar}>
        <div style={{ fontSize: "24px" }}>🎨</div>
        <div style={styles.appbarTitle}>
          {isStudioPage ? "Plan Manager Studio" : (appName || "Plan Management")}
        </div>
        {isStudioPage && window.studioState && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px" }}>App:</span>
              <select
                style={styles.appDropdown}
                value={window.studioState.currentApp}
                onChange={(e) => window.studioState.setCurrentApp(e.target.value)}
              >
                {availableApps.map((app) => (
                  <option key={app} value={app} style={{ color: "black" }}>
                    {app}
                  </option>
                ))}
              </select>
            </div>
            <button style={styles.logoutButton} onClick={() => console.log("Logout")}>
              Logout
            </button>
          </>
        )}
      </div>

      <div style={styles.body}>
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
                style={{
                  ...styles.navItem,
                  // Visual indicator for external links
                  ...(item.external && {
                    fontStyle: "italic",
                    color: "#666"
                  })
                }}
                onClick={() => handleNavClick(item.path, item.external)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor =
                    styles.navItemHover.backgroundColor;
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

        {/* Studio Controls - Only show when on Studio page */}
        {isStudioPage && window.studioState && (
          <>
            <div style={{ borderTop: "1px solid #ddd", margin: "20px 0" }}></div>
            <div style={{ padding: "0 0 20px 0" }}>
              <StudioSidebar
                currentApp={window.studioState.currentApp}
                selectedPage={window.studioState.selectedPage}
                onPageSelect={window.studioState.setSelectedPage}
                onLayoutSelect={window.studioState.onLayoutSelect}
                onQuerySelect={window.studioState.onQuerySelect}
              />
            </div>
            <div style={{ borderTop: "1px solid #ddd", padding: "20px 0 0 0" }}>
              <CanvasSidebar
                onAddWidget={window.studioState.addWidget}
                activeSection={window.studioState.activeSection}
                onSectionChange={window.studioState.setActiveSection}
                currentApp={window.studioState.currentApp}
                currentPage={window.studioState.selectedPage}
                onLayoutSelect={() => {}} // Not used
              />
            </div>
          </>
        )}
      </div>

        {/* Main Content */}
        <div style={styles.main}>{children}</div>
      </div>
    </div>
  );
};

export default SimpleLayout;
