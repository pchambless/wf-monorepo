import React from "react";

/**
 * SketchPad Page
 * Embedded Asciip ASCII diagram editor with save functionality
 */
export default function SketchPad() {
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [sketchName, setSketchName] = React.useState("");
  const [asciiContent, setAsciiContent] = React.useState("");

  // Save sketch to plan folder
  const handleSaveSketch = async () => {
    if (!sketchName.trim()) {
      alert("Please enter a sketch name");
      return;
    }

    try {
      const fileName = `${sketchName.toLowerCase().replace(/\s+/g, '-')}.txt`;
      const response = await fetch("http://localhost:3001/api/execCreateDoc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          targetPath: "claude-plans/current", // or get current plan ID
          fileName: fileName,
          content: asciiContent,
        }),
      });

      if (response.ok) {
        alert(`Sketch saved as ${fileName}!`);
        setShowSaveDialog(false);
        setSketchName("");
        setAsciiContent("");
      } else {
        alert("Failed to save sketch");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving sketch");
    }
  };

  // Copy ASCII to clipboard
  const handleCopyToClipboard = () => {
    if (!asciiContent.trim()) {
      alert("Please paste ASCII content first");
      return;
    }
    
    navigator.clipboard.writeText(asciiContent).then(() => {
      alert("ASCII copied to clipboard!");
    }).catch(() => {
      alert("Failed to copy to clipboard");
    });
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
    },
    toolbar: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "12px 16px",
      backgroundColor: "#f8f9fa",
      borderBottom: "1px solid #dee2e6",
    },
    button: {
      padding: "8px 16px",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
    },
    buttonSecondary: {
      padding: "8px 16px",
      backgroundColor: "#6c757d",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
    },
    iframe: {
      flex: 1,
      border: "none",
      width: "100%",
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: "white",
      padding: "24px",
      borderRadius: "8px",
      width: "600px",
      maxWidth: "90vw",
      maxHeight: "80vh",
      overflow: "auto",
    },
    textarea: {
      width: "100%",
      height: "200px",
      fontFamily: "monospace",
      fontSize: "12px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      padding: "8px",
      resize: "vertical",
    },
    input: {
      width: "100%",
      padding: "8px 12px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: "14px",
    },
    formGroup: {
      marginBottom: "16px",
    },
    label: {
      display: "block",
      marginBottom: "4px",
      fontWeight: "600",
      fontSize: "14px",
    },
  };

  return (
    <div style={styles.container}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <h3 style={{ margin: 0, color: "#333" }}>📝 ASCII Sketch Pad</h3>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <button
            style={styles.buttonSecondary}
            onClick={() => setShowSaveDialog(true)}
          >
            💾 Save Sketch
          </button>
          <button
            style={styles.button}
            onClick={handleCopyToClipboard}
          >
            📋 Copy ASCII
          </button>
          <button
            style={styles.buttonSecondary}
            onClick={() => window.open("https://asciiflow.com", "_blank")}
          >
            🔗 Open in New Tab
          </button>
        </div>
      </div>

      {/* Embedded AsciiFlow */}
      <iframe
        src="https://asciiflow.com"
        style={styles.iframe}
        title="ASCII Flow Diagram Editor"
      />

      {/* Save Dialog */}
      {showSaveDialog && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h4 style={{ marginTop: 0 }}>Save ASCII Sketch</h4>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Sketch Name:</label>
              <input
                type="text"
                style={styles.input}
                value={sketchName}
                onChange={(e) => setSketchName(e.target.value)}
                placeholder="e.g., appbar-layout, dashboard-design"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>ASCII Content:</label>
              <textarea
                style={styles.textarea}
                value={asciiContent}
                onChange={(e) => setAsciiContent(e.target.value)}
                placeholder="Paste your ASCII diagram here..."
              />
            </div>

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                style={styles.buttonSecondary}
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </button>
              <button
                style={styles.button}
                onClick={handleSaveSketch}
              >
                Save to Plan Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}