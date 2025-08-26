import React from "react";
import { useNavigate } from "react-router-dom";
import StudioSidebar from "./StudioSidebar";
import CanvasSidebar from "./CanvasSidebar";

/**
 * Studio-specific layout with integrated appbar and sidebar
 * Based on appbar.js eventType structure
 */
const StudioLayout = ({ 
  children, 
  navigationSections, 
  appName,
  currentApp,
  setCurrentApp,
  selectedPage,
  onPageSelect,
  onLayoutSelect,
  onQuerySelect,
  onAddWidget,
  activeSection,
  onSectionChange
}) => {
  const navigate = useNavigate();

  const availableApps = ["plans", "admin", "client"];

  const handleNavClick = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    // Add logout logic here
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
    },
    // Appbar based on appbar.js structure
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
    appbarIcon: {
      fontSize: "24px",
      flexShrink: 0,
    },
    appbarTitle: {
      fontSize: "20px",
      fontWeight: "600",
      flexGrow: 1,
    },
    appSelector: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
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
      display: "flex",
      flexDirection: "column",
    },
    sidebarHeader: {
      backgroundColor: "#1976d2",
      color: "white",
      padding: "16px 20px",
      borderBottom: "1px solid #ddd",
    },
    sidebarContent: {
      flex: 1,
      overflow: "auto",
    },
    navigation: {
      padding: "20px",
      borderBottom: "1px solid #ddd",
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
    studioControls: {
      flex: 1,
      padding: "16px",
      borderBottom: "1px solid #ddd",
    },
    widgetPalette: {
      padding: "16px",
    },
    main: {
      flex: 1,
      backgroundColor: "#fff",
      overflow: "auto",
    },
  };

  return (
    <div style={styles.container}>
      {/* Appbar - Based on appbar.js structure */}
      <div style={styles.appbar}>
        <div style={styles.appbarIcon}>
          🎨
        </div>
        <div style={styles.appbarTitle}>
          Plan Manager Studio
        </div>
        <div style={styles.appSelector}>
          <span style={{ fontSize: "14px" }}>App:</span>
          <select
            style={styles.appDropdown}
            value={currentApp}
            onChange={(e) => setCurrentApp(e.target.value)}
          >
            {availableApps.map((app) => (
              <option key={app} value={app} style={{ color: "black" }}>
                {app}
              </option>
            ))}
          </select>
        </div>
        <button style={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div style={styles.body}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h3 style={{ margin: 0 }}>{appName || "Plan Management"}</h3>
          </div>

          <div style={styles.sidebarContent}>
            {/* Navigation */}
            <div style={styles.navigation}>
              {navigationSections?.map((section, sectionIndex) => (
                <div key={sectionIndex} style={styles.navSection}>
                  <div style={styles.sectionTitle}>{section.title}</div>
                  {section.items?.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      style={styles.navItem}
                      onClick={() => handleNavClick(item.path)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#e3f2fd";
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

            {/* Studio Controls */}
            <div style={styles.studioControls}>
              <StudioSidebar
                currentApp={currentApp}
                selectedPage={selectedPage}
                onPageSelect={onPageSelect}
                onLayoutSelect={onLayoutSelect}
                onQuerySelect={onQuerySelect}
              />
            </div>

            {/* Widget Palette */}
            <div style={styles.widgetPalette}>
              <CanvasSidebar
                onAddWidget={onAddWidget}
                activeSection={activeSection}
                onSectionChange={onSectionChange}
                currentApp={currentApp}
                currentPage={selectedPage}
                onLayoutSelect={() => {}} // Not used in this context
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.main}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default StudioLayout;