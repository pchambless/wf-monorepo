import React, { useEffect, useState } from "react";
import StudioLayout from "./components/StudioLayout.jsx";
import { initializeApp } from "./db/operations/lifecycleOps.js";

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startup = async () => {
      try {
        // Load master data (eventTypes, eventSQL, triggers) from MySQL into IndexedDB
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

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading Studio...</div>;
  }

  return <StudioLayout />;
};

export default App;