import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import StudioLayout from "./components/StudioLayout.jsx";
import MigrationPage from "./components/MigrationPage.jsx";
import SimpleLayout from "./layouts/SimpleLayout.jsx";
import { initializeApp } from "./db/operations/lifecycleOps.js";
import { createApiUrl } from "./config/api.js";

// Global eventTypeConfig - loaded once at startup
window.eventTypeConfig = {};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    const startup = async () => {
      try {
        // Check for valid session first
        const sessionCheck = await fetch('http://localhost:3002/api/auth/session', {
          credentials: 'include'
        });

        if (!sessionCheck.ok) {
          console.log('❌ No valid session - redirecting to login');
          window.location.href = 'http://localhost:3002/login.html';
          return;
        }

        const sessionData = await sessionCheck.json();
        console.log('✅ Session valid:', sessionData.email);

        // Load eventTypeConfig at startup
        await loadEventTypeConfig();

        // initializeApp() removed - no longer preload IndexedDB
        console.log('✅ Studio App: Startup complete');
      } catch (error) {
        console.error('❌ App startup failed:', error);
        window.location.href = 'http://localhost:3002/login.html';
      } finally {
        setLoading(false);
      }
    };

    startup();
  }, []);

  const loadEventTypeConfig = async () => {
    try {
      console.log('📦 Loading eventTypeConfig at startup...');
      const response = await fetch('http://localhost:3002/api/execEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eventSQLId: 'fetchEventTypeConfig', params: {} })
      });

      const result = await response.json();
      console.log('📦 fetchEventTypeConfig response:', result);

      if (result.data && result.data.length > 0) {
        const eventTypeMap = {};
        result.data.forEach(row => {
          eventTypeMap[row.eventType] = {
            styles: row.styles ? JSON.parse(row.styles) : {},
            config: row.config ? JSON.parse(row.config) : {}
          };
        });
        window.eventTypeConfig = eventTypeMap;
        console.log('✅ Loaded eventTypeConfig:', Object.keys(eventTypeMap).length, 'types');
        console.log('📦 Sample eventTypes:', Object.keys(eventTypeMap).slice(0, 5));
      } else {
        console.warn('⚠️ No eventType data returned');
      }
    } catch (error) {
      console.error('❌ Error loading eventTypeConfig:', error);
    }
  };

  const handleRunMigration = async () => {
    if (!window.confirm('Run production data migration? This will copy prod data to test database.')) {
      return;
    }

    setIsMigrating(true);
    try {
      const response = await fetch(createApiUrl('/api/util/run-migration'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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