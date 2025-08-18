import React from "react";
import WidgetCanvas from "./WidgetCanvas";
import WidgetPalette from "./WidgetPalette";
import { useCanvasState } from "./useCanvasState";
import "./studio.css";

export default function StudioApp() {
  const {
    layout,
    setLayout,
    addWidget,
    moveWidget,
    resizeWidget,
    removeWidget,
    selectedId,
    setSelectedId,
    activeSection,
    setActiveSection,
    regenerateAllIds,
  } = useCanvasState();

  // Studio configuration with contextStore integration
  const [currentApp, setCurrentApp] = React.useState("plans");
  const [currentPage, setCurrentPage] = React.useState("plan-manager");
  const [selectedPage, setSelectedPage] = React.useState("pagePlanManager");

  // Update contextStore when app changes
  React.useEffect(() => {
    // Set app in contextStore for other components to use
    if (typeof window !== "undefined" && window.contextStore) {
      window.contextStore.set("app", currentApp);
      console.log("🏪 ContextStore app set to:", currentApp);
    }
  }, [currentApp]);

  // Load layout from eventType files directly (no more studio JSON files)
  const loadLayoutDirect = React.useCallback(
    async (appName, pageName) => {
      console.log("🚀 loadLayoutDirect called with:", { appName, pageName });
      
      // For now, start with empty canvas - Studio should load eventTypes individually when clicked
      // This removes the 404 errors for non-existent studio files
      setLayout([]);
      
      console.log("📂 Canvas cleared for Studio editing");
    },
    [setLayout]
  );

  // Auto-load when app or page changes
  React.useEffect(() => {
    console.log("🔄 App/Page changed:", { currentApp, currentPage });
    loadLayoutDirect(currentApp, currentPage);
  }, [currentApp, currentPage, loadLayoutDirect]);


  // Studio actions for save/load/export
  React.useEffect(() => {
    window.studioActions = {
      saveLayout: async () => {
        const timestamp = new Date().toISOString();

        // Separate sections for individual saving
        const appbarComponents = layout.filter(
          (item) => item.section === "appbar"
        );
        const sidebarComponents = layout.filter(
          (item) => item.section === "sidebar"
        );
        const pageComponents = layout.filter((item) => item.section === "page");

        // Create section-specific design files
        const appbarDesign = {
          appName: currentApp,
          pageName: currentPage,
          section: "appbar",
          version: "1.0.0",
          lastModified: timestamp,
          components: appbarComponents,
          metadata: {
            componentCount: appbarComponents.length,
            purpose: "Application header and navigation",
          },
        };

        const sidebarDesign = {
          appName: currentApp,
          pageName: currentPage,
          section: "sidebar",
          version: "1.0.0",
          lastModified: timestamp,
          components: sidebarComponents,
          metadata: {
            componentCount: sidebarComponents.length,
            purpose: "Side navigation and menu structure",
          },
        };

        const pageDesign = {
          appName: currentApp,
          pageName: currentPage,
          section: "page",
          version: "1.0.0",
          lastModified: timestamp,
          components: pageComponents,
          metadata: {
            componentCount: pageComponents.length,
            purpose: "Main page content and functionality",
          },
        };

        // Complete design file
        const completeDesign = {
          appName: currentApp,
          pageName: currentPage,
          version: "1.0.0",
          lastModified: timestamp,
          sections: {
            appbar: appbarComponents,
            sidebar: sidebarComponents,
            page: pageComponents,
          },
          metadata: {
            totalComponents: layout.length,
            activeSection: activeSection,
            targetPath: `analysis-n-document/genOps/studio/${currentApp}/`,
          },
        };

        console.log("💾 Saving Studio Designs:", {
          app: currentApp,
          page: currentPage,
          appbar: appbarDesign,
          sidebar: sidebarDesign,
          page: pageDesign,
          complete: completeDesign,
        });

        // Use server-side execCreateDoc API to save files with new architecture
        try {
          const savePromises = [];

          // Save app-level sections (shared across all pages) only if they have components
          if (appbarComponents.length > 0) {
            savePromises.push(
              fetch("http://localhost:3001/api/execCreateDoc", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  targetPath: `analysis-n-document/genOps/studio/${currentApp}`,
                  fileName: `${currentApp}-appbar.json`,
                  content: JSON.stringify(appbarDesign, null, 2),
                }),
              })
            );
          }

          if (sidebarComponents.length > 0) {
            savePromises.push(
              fetch("http://localhost:3001/api/execCreateDoc", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  targetPath: `analysis-n-document/genOps/studio/${currentApp}`,
                  fileName: `${currentApp}-sidebar.json`,
                  content: JSON.stringify(sidebarDesign, null, 2),
                }),
              })
            );
          }

          // Always save page-level content (unique per page)
          savePromises.push(
            fetch("http://localhost:3001/api/execCreateDoc", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                targetPath: `analysis-n-document/genOps/studio/${currentApp}`,
                fileName: `${currentPage}-page.json`,
                content: JSON.stringify(pageDesign, null, 2),
              }),
            })
          );

          // Save/update smart index file
          const indexDesign = {
            appName: currentApp,
            version: "1.0.0",
            lastModified: timestamp,
            structure: {
              appLevel: {
                appbar:
                  appbarComponents.length > 0
                    ? `${currentApp}-appbar.json`
                    : null,
                sidebar:
                  sidebarComponents.length > 0
                    ? `${currentApp}-sidebar.json`
                    : null,
              },
              pages: {
                [currentPage]: `${currentPage}-page.json`,
              },
            },
            metadata: {
              lastEditedPage: currentPage,
              appbarComponents: appbarComponents.length,
              sidebarComponents: sidebarComponents.length,
              pageComponents: pageComponents.length,
              totalComponents: layout.length,
            },
          };

          savePromises.push(
            fetch("http://localhost:3001/api/execCreateDoc", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                targetPath: `analysis-n-document/genOps/studio/${currentApp}`,
                fileName: `index.json`,
                content: JSON.stringify(indexDesign, null, 2),
              }),
            })
          );

          const results = await Promise.all(savePromises);

          // Check for HTTP errors and get response details
          const responses = await Promise.all(
            results.map(async (r) => {
              const responseText = await r.text();
              console.log(`Response status: ${r.status}, body:`, responseText);

              if (!r.ok) {
                return {
                  success: false,
                  error: `HTTP ${r.status}`,
                  details: responseText,
                };
              }

              try {
                return JSON.parse(responseText);
              } catch (e) {
                return {
                  success: false,
                  error: "Invalid JSON response",
                  details: responseText,
                };
              }
            })
          );

          const successCount = responses.filter((r) => r.success).length;
          const failedCount = responses.length - successCount;

          if (successCount === responses.length) {
            alert(
              `✅ Successfully saved ${layout.length} components for ${currentApp}/${currentPage}!\n\n📁 Files saved to:\nanalysis-n-document/genOps/studio/${currentApp}/\n\n📄 Files created:\n- ${currentPage}-appbar.json\n- ${currentPage}-sidebar.json\n- ${currentPage}-page.json\n- ${currentPage}-complete.json\n\n🎉 Ready for eventType generation!`
            );
          } else {
            alert(
              `⚠️ Partial save: ${successCount} succeeded, ${failedCount} failed.\n\nCheck console for details.`
            );
            console.error(
              "Save failures:",
              responses.filter((r) => !r.success)
            );
          }
        } catch (error) {
          console.error("Save error:", error);
          alert(
            `❌ Save failed: ${error.message}\n\nFalling back to download...`
          );

          // Fallback to download if server save fails
          const downloads = [
            {
              data: appbarDesign,
              filename: `${currentApp}-${currentPage}-appbar.json`,
            },
            {
              data: sidebarDesign,
              filename: `${currentApp}-${currentPage}-sidebar.json`,
            },
            {
              data: pageDesign,
              filename: `${currentApp}-${currentPage}-page.json`,
            },
            {
              data: completeDesign,
              filename: `${currentApp}-${currentPage}-complete.json`,
            },
          ];

          downloads.forEach(({ data, filename }) => {
            const blob = new Blob([JSON.stringify(data, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
          });
        }
      },

      exportEventTypes: () => {
        const eventTypes = layout.map((item) => {
          // Generate eventType data from component
          const baseEventType = {
            eventID: Math.floor(Math.random() * 1000) + 100,
            eventType: `${item.section}${item.type}`,
            category: item.section === "page" ? "component" : item.section,
            title: `${item.type} Component`,
            cluster: currentApp.toUpperCase(),
            purpose: `Generated from Studio ${item.type} component`,
          };

          // Add type-specific properties
          if (item.type === "DataGrid") {
            return {
              ...baseEventType,
              eventType: `grid${
                currentApp.charAt(0).toUpperCase() + currentApp.slice(1)
              }`,
              category: "grid",
              dbTable: `api_wf.${currentApp}`,
              qrySQL: `SELECT id, name, status FROM api_wf.${currentApp} WHERE status = :status ORDER BY id DESC`,
              params: [":status"],
              workflows: [
                `create${
                  currentApp.charAt(0).toUpperCase() + currentApp.slice(1)
                }`,
              ],
              navChildren: [
                `form${
                  currentApp.charAt(0).toUpperCase() + currentApp.slice(1)
                }`,
              ],
            };
          }

          if (item.type === "Form") {
            return {
              ...baseEventType,
              eventType: `form${
                currentApp.charAt(0).toUpperCase() + currentApp.slice(1)
              }`,
              category: "form",
              dbTable: `api_wf.${currentApp}`,
              qrySQL: `SELECT * FROM api_wf.${currentApp} WHERE id = :id`,
              params: [":id"],
              workflows: [
                `create${
                  currentApp.charAt(0).toUpperCase() + currentApp.slice(1)
                }`,
                `update${
                  currentApp.charAt(0).toUpperCase() + currentApp.slice(1)
                }`,
              ],
            };
          }

          return baseEventType;
        });

        console.log("📤 Generated EventTypes:", eventTypes);

        // Download eventTypes as JSON
        const blob = new Blob([JSON.stringify(eventTypes, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${currentApp}-${currentPage}-eventTypes.json`;
        a.click();
        URL.revokeObjectURL(url);

        alert(
          `📤 EventTypes exported for ${currentApp}/${currentPage}! Check your downloads folder.`
        );
      },

      previewApp: () => {
        alert(
          `👁️ App Preview for ${currentApp}/${currentPage} coming soon! This will show how the generated app will look.`
        );
      },

      clearSection: (section) => {
        if (confirm(`🧹 Clear all components from ${section} section?`)) {
          const itemsToRemove = layout.filter(
            (item) => item.section === section
          );
          itemsToRemove.forEach((item) => removeWidget(item.id));
          alert(
            `✅ Cleared ${itemsToRemove.length} components from ${section} section.`
          );
        }
      },

      generateFromEventTypes: async () => {
        console.log("🏗️ Generating Studio from existing eventTypes...");
        try {
          const { saveGeneratedStudio } = await import(
            "./eventTypeToStudio.js"
          );
          const success = await saveGeneratedStudio();
          if (success) {
            // Reload the current page to show generated components
            loadLayoutDirect(currentApp, currentPage);
            alert("✅ Studio design generated from eventTypes!");
          } else {
            alert("❌ Failed to generate Studio design");
          }
        } catch (error) {
          console.error("❌ Error generating from eventTypes:", error);
          alert("❌ Error generating from eventTypes");
        }
      },

      loadLayout: async (appName, pageName) => {
        console.log("🚀 loadLayout called with:", { appName, pageName });
        try {
          const loadPromises = [];
          console.log("📡 Preparing to fetch files...");

          // Try to load app-level sections (shared)
          const appbarUrl = `http://localhost:3001/api/getDoc?path=analysis-n-document/genOps/studio/${appName}/${appName}-appbar.json`;
          console.log("📡 Fetching appbar:", appbarUrl);
          loadPromises.push(
            fetch(appbarUrl)
              .then((r) => {
                console.log("📡 Appbar response:", r.status, r.ok);
                return r.ok ? r.json() : { components: [] };
              })
              .catch((err) => {
                console.log("❌ Appbar fetch error:", err);
                return { components: [] };
              })
          );

          loadPromises.push(
            fetch(
              `http://localhost:3001/api/getDoc?path=analysis-n-document/genOps/studio/${appName}/${appName}-sidebar.json`
            )
              .then((r) => (r.ok ? r.json() : { components: [] }))
              .catch(() => ({ components: [] }))
          );

          // Load page-specific content
          loadPromises.push(
            fetch(
              `http://localhost:3001/api/getDoc?path=analysis-n-document/genOps/studio/${appName}/${pageName}-page.json`
            )
              .then((r) => (r.ok ? r.json() : { components: [] }))
              .catch(() => ({ components: [] }))
          );

          const [appbarData, sidebarData, pageData] = await Promise.all(
            loadPromises
          );

          // Merge all components into layout
          const mergedLayout = [
            ...(appbarData.components || []),
            ...(sidebarData.components || []),
            ...(pageData.components || []),
          ];

          setLayout(mergedLayout);
          setCurrentApp(appName);
          setCurrentPage(pageName);

          console.log("📂 Loaded Studio Design:", {
            app: appName,
            page: pageName,
            appbar: appbarData.components?.length || 0,
            sidebar: sidebarData.components?.length || 0,
            page: pageData.components?.length || 0,
            total: mergedLayout.length,
          });
        } catch (error) {
          console.error("Failed to load layout:", error);
        }
      },
    };

    return () => {
      delete window.studioActions;
    };
  }, [
    layout,
    activeSection,
    removeWidget,
    currentApp,
    currentPage,
    setLayout,
    loadLayoutDirect,
  ]);

  // Make Studio state available globally for SimpleLayout to use
  React.useEffect(() => {
    window.studioState = {
      currentApp,
      setCurrentApp,
      selectedPage,
      setSelectedPage: (pageId) => {
        console.log("🎯 Page selected:", pageId);
        setSelectedPage(pageId);
        // Map pageId to currentPage format if needed
        const pageName = pageId.replace(/^page/, "").toLowerCase().replace(/([A-Z])/g, '-$1');
        setCurrentPage(pageName);
      },
      onLayoutSelect: async (eventType) => {
        console.log("🎯 Layout selected:", eventType);
        try {
          // Use the filePath from graph data (much cleaner!)
          const eventTypePath = eventType.meta?.filePath;
          
          if (!eventTypePath) {
            console.error("❌ No filePath found in eventType meta");
            return;
          }
          
          console.log("📂 Loading from path:", eventTypePath);
          const response = await fetch(`http://localhost:3001/api/getDoc?path=${eventTypePath}`);
          
          if (response.ok) {
            const content = await response.text();
            console.log("📂 Loaded eventType content:", content.substring(0, 200) + "...");
            
            // Parse the eventType structure and convert to studio components
            try {
              // For now, show success message and clear canvas for new layout
              setLayout([]);
              setActiveSection("page");
              
              // Add a placeholder component to show it's loaded
              const placeholderComponent = {
                id: `loaded-${Date.now()}`,
                type: "Text",
                section: "page",
                position: { x: 50, y: 50 },
                size: { width: 300, height: 60 },
                props: {
                  text: `Loaded: ${eventType.meta.title || eventType.id}`,
                  style: { fontSize: "14px", padding: "12px", backgroundColor: "#e8f5e8", border: "2px solid #28a745" }
                }
              };
              
              setLayout([placeholderComponent]);
              console.log("✅ Layout eventType loaded for editing");
              
            } catch (parseError) {
              console.error("❌ Failed to parse eventType:", parseError);
            }
          } else {
            console.warn("⚠️ EventType file not found, creating placeholder");
            // Show that we're ready to create this eventType
            setLayout([]);
            const newComponent = {
              id: `new-${Date.now()}`,
              type: "Text", 
              section: "page",
              position: { x: 50, y: 50 },
              size: { width: 300, height: 60 },
              props: {
                text: `New Layout: ${eventType.meta.title || eventType.id}`,
                style: { fontSize: "14px", padding: "12px", backgroundColor: "#fff3cd", border: "2px solid #ffc107" }
              }
            };
            setLayout([newComponent]);
          }
        } catch (error) {
          console.error("❌ Failed to load layout eventType:", error);
        }
      },
      onQuerySelect: (eventType) => {
        console.log("🔍 Query selected:", eventType);
        // For query eventTypes, show info in a clean way
        const info = [
          `Query: ${eventType.meta.title || eventType.id}`,
          `Category: ${eventType.category}`,
          eventType.meta.purpose ? `Purpose: ${eventType.meta.purpose}` : "",
          eventType.meta.dbTable ? `Table: ${eventType.meta.dbTable}` : "",
        ].filter(Boolean).join("\n");
        
        console.log("🔍 Query EventType Info:", info);
        
        // Add query info to canvas as a non-editable display
        const queryDisplay = {
          id: `query-${Date.now()}`,
          type: "Text",
          section: "page", 
          position: { x: 50, y: 150 },
          size: { width: 350, height: 120 },
          props: {
            text: info,
            style: { 
              fontSize: "12px", 
              padding: "12px", 
              backgroundColor: "#f8f9fa", 
              border: "2px solid #6c757d",
              whiteSpace: "pre-line",
              fontFamily: "monospace"
            }
          }
        };
        
        // Add to existing layout instead of replacing
        setLayout(prev => [...prev, queryDisplay]);
      },
      addWidget,
      activeSection,
      setActiveSection,
    };

    return () => {
      delete window.studioState;
    };
  }, [currentApp, setCurrentApp, selectedPage, setSelectedPage, addWidget, activeSection, setActiveSection]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Studio Header */}
      <div style={{ 
        height: "64px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "0 24px",
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #dee2e6",
      }}>
        <h2 style={{ margin: 0, color: "#495057" }}>
          🎨 Studio: {currentApp}/{selectedPage}
        </h2>
        <div style={{ marginLeft: "auto", fontSize: "14px", color: "#6c757d" }}>
          {layout.length} components • {activeSection} section active
        </div>
      </div>

      {/* Two-Column Layout: Widget Palette + Canvas */}
      <div style={{ 
        flex: 1, 
        display: "flex",
        overflow: "hidden"
      }}>
        <WidgetPalette 
          onAddWidget={addWidget}
          activeSection={activeSection}
        />
        <div style={{ flex: 1, padding: "16px" }}>
          <WidgetCanvas
            layout={layout}
            selectedId={selectedId}
            onSelectItem={setSelectedId}
            onMoveItem={moveWidget}
            onResizeItem={resizeWidget}
            activeSection={activeSection}
          />
        </div>
      </div>
    </div>
  );
}
