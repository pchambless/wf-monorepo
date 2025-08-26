/**
 * TreeView Component
 * Collapsible tree view for hierarchical data display
 */

import React from "react";

export default function TreeView({ 
  title, 
  children, 
  defaultExpanded = true,
  icon = "📁",
  expandedIcon = "📂",
  level = 0,
  onClick,
  className = "",
  itemType = "folder" // "folder", "item", "layout", "query"
}) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const hasChildren = React.Children.count(children) > 0;
  const currentIcon = hasChildren ? (isExpanded ? expandedIcon : icon) : icon;

  const handleClick = (e) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else {
      // Only call onClick for leaf nodes (no children)
      onClick?.(e);
    }
  };

  const styles = {
    container: {
      marginBottom: "1px",
    },
    itemContainer: {
      display: "flex",
      alignItems: "center",
      padding: "2px 6px",
      paddingLeft: `${6 + (level * 12)}px`,
      cursor: "pointer",
      borderRadius: "2px",
      fontSize: "12px",
      transition: "background-color 0.15s ease",
      backgroundColor: "transparent",
      border: "none",
      width: "100%",
      textAlign: "left",
    },
    itemContainerHover: {
      backgroundColor: "#e3f2fd",
    },
    layoutItem: {
      borderLeft: "3px solid #28a745",
      backgroundColor: "#fff",
      border: "1px solid #dee2e6",
    },
    queryItem: {
      borderLeft: "3px solid #6c757d",
      backgroundColor: "#fff",
      border: "1px solid #dee2e6",
      opacity: 0.8,
    },
    icon: {
      marginRight: "4px",
      fontSize: "12px",
      flexShrink: 0,
      width: "14px",
      textAlign: "center",
    },
    expandIcon: {
      marginRight: "2px",
      fontSize: "8px",
      color: "#666",
      width: "10px",
      textAlign: "center",
      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
      transition: "transform 0.15s ease",
    },
    title: {
      flexGrow: 1,
      fontWeight: level === 0 ? "600" : "500",
      color: level === 0 ? "#333" : "#555",
      lineHeight: "1.2",
    },
    children: {
      display: isExpanded ? "block" : "none",
      marginLeft: "6px",
    },
  };

  // Apply item type specific styles
  let itemStyles = { ...styles.itemContainer };
  if (itemType === "layout") {
    itemStyles = { ...itemStyles, ...styles.layoutItem };
  } else if (itemType === "query") {
    itemStyles = { ...itemStyles, ...styles.queryItem };
  }

  return (
    <div style={styles.container} className={className}>
      <button
        style={itemStyles}
        onClick={handleClick}
        onMouseEnter={(e) => {
          if (itemType === "folder" || itemType === "item") {
            e.target.style.backgroundColor = styles.itemContainerHover.backgroundColor;
          }
        }}
        onMouseLeave={(e) => {
          if (itemType === "folder" || itemType === "item") {
            e.target.style.backgroundColor = "transparent";
          }
        }}
      >
        {hasChildren && (
          <span style={styles.expandIcon}>
            ▶
          </span>
        )}
        <span style={styles.icon}>
          {currentIcon}
        </span>
        <span style={styles.title}>
          {title}
        </span>
      </button>
      
      {hasChildren && (
        <div style={styles.children}>
          {children}
        </div>
      )}
    </div>
  );
}

// TreeItem component for leaf nodes
export function TreeItem({ 
  title, 
  icon = "📄", 
  level = 0, 
  onClick,
  itemType = "item",
  selected = false
}) {
  const styles = {
    itemContainer: {
      display: "flex",
      alignItems: "center",
      padding: "2px 6px",
      paddingLeft: `${18 + (level * 12)}px`, // Extra indent for leaf items
      cursor: "pointer",
      borderRadius: "2px",
      fontSize: "11px",
      transition: "all 0.15s ease",
      backgroundColor: selected ? "#1976d2" : "transparent",
      color: selected ? "white" : "#555",
      border: "none",
      width: "100%",
      textAlign: "left",
      marginBottom: "1px",
      lineHeight: "1.3",
    },
    layoutItem: {
      borderLeft: "3px solid #28a745",
      backgroundColor: selected ? "#1976d2" : "#fff",
      border: "1px solid #dee2e6",
    },
    queryItem: {
      borderLeft: "3px solid #6c757d", 
      backgroundColor: selected ? "#1976d2" : "#fff",
      border: "1px solid #dee2e6",
      opacity: selected ? 1 : 0.8,
    },
    icon: {
      marginRight: "4px",
      fontSize: "11px",
      flexShrink: 0,
    },
    title: {
      flexGrow: 1,
      fontWeight: "500",
      lineHeight: "1.2",
    },
  };

  // Apply item type specific styles
  let itemStyles = { ...styles.itemContainer };
  if (itemType === "layout") {
    itemStyles = { ...itemStyles, ...styles.layoutItem };
  } else if (itemType === "query") {
    itemStyles = { ...itemStyles, ...styles.queryItem };
  }

  return (
    <button
      style={itemStyles}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!selected) {
          e.target.style.backgroundColor = itemType === "layout" ? "#e8f5e8" : 
                                         itemType === "query" ? "#f8f9fa" : "#e3f2fd";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.target.style.backgroundColor = itemType === "layout" || itemType === "query" ? "#fff" : "transparent";
        }
      }}
    >
      <span style={styles.icon}>
        {icon}
      </span>
      <span style={styles.title}>
        {title}
      </span>
    </button>
  );
}