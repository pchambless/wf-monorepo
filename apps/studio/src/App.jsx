import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import StudioLayout from "./components/StudioLayout.jsx";
import MigrationPage from "./components/MigrationPage.jsx";
import SimpleLayout from "./layouts/SimpleLayout.jsx";
import { initializeApp } from "./db/operations/lifecycleOps.js";
import { createApiUrl } from "./config/api.js";

const App = () => {
  const [loading, setLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    const startup = async () => {
      try {
        await initializeApp();
        console.log('✅ Studio App: Startup complete');
      } catch (error) {
        console.error('❌ App startup failed:', error);
      } finally {
        setLoading(false);
      }
    };

    startup();
  }, []);

  const handleRunMigration = async () => {
    if (!window.confirm('Run production data migration? This will copy prod data to test database.')) {
      return;
    }

    setIsMigrating(true);
    try {
      const response = await fetch(createApiUrl('/api/util/run-migration'), {
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

  const navigationSections = [
    {
      title: "Studio",
      items: [
        { title: "Component Canvas", path: "/" },
        { title: "Data Migration", path: "/migration" },
      ]
    },
    {
      title: "Apps",
      items: [
        { title: "Admin", path: "http://localhost:5002", external: true },
        { title: "WhatsFresh Client", path: "http://localhost:5003", external: true },
        { title: "Planner", path: "http://localhost:5004", external: true },
      ]
    },
    {
      title: "Developer Tools",
      items: [
        { title: "Server Logs", path: `${createApiUrl('/health')}`, external: true },
      ]
    }
  ];

  const appBarConfig = {
    title: "Studio - Component Builder",
    showUserMenu: false,
    customActions: (
      <button
        style={{
          padding: "8px 16px",
          backgroundColor: "#ff9800",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "white",
          borderRadius: "4px",
          cursor: isMigrating ? "not-allowed" : "pointer",
          fontSize: "14px",
          fontWeight: "600",
          opacity: isMigrating ? 0.6 : 1
        }}
        onClick={handleRunMigration}
        disabled={isMigrating}
      >
        {isMigrating ? "Migrating..." : "Run Migration"}
      </button>
    )
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading Studio...</div>;
  }

  return (
    <SimpleLayout
      navigationSections={navigationSections}
      appName="Studio"
      appBarConfig={appBarConfig}
    >
      <Routes>
        <Route path="/" element={<StudioLayout />} />
        <Route path="/migration" element={<MigrationPage />} />
      </Routes>
    </SimpleLayout>
  );
};

export default App;