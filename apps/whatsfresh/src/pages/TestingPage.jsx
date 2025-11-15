import React, { useState, useEffect } from 'react';
// TODO: Move to apps/templates/rendering/ per Plan 60
import DirectRenderer from '../../../studio/src/rendering/DirectRenderer';

/**
 * Testing Page - DB-Driven Config Demo
 * Fetches pageConfig from database instead of static import
 * This demonstrates Plan 62: Config-Driven Page/Layout System
 */
const TestingPage = () => {
  const [pageConfig, setPageConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPageConfig();
  }, []);

  const loadPageConfig = async () => {
    try {
      setLoading(true);
      
      // Fetch pageConfig from database
      const response = await fetch('http://localhost:3002/api/execEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventSQLId: 'getPageConfig',
          params: { pageID: 18 }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch pageConfig: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.data && result.data[0] && result.data[0].pageConfig) {
        // Parse the JSON string from database
        const config = JSON.parse(result.data[0].pageConfig);
        setPageConfig(config);
        console.log('✅ PageConfig loaded from database:', config);
      } else {
        throw new Error('No pageConfig found in response');
      }
    } catch (err) {
      console.error('❌ Failed to load pageConfig:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading page configuration from database...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h3>Error Loading Page</h3>
        <p>{error}</p>
        <button onClick={loadPageConfig}>Retry</button>
      </div>
    );
  }

  if (!pageConfig) {
    return (
      <div style={{ padding: '20px' }}>
        <p>No page configuration available</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        backgroundColor: '#e3f2fd', 
        padding: '10px', 
        marginBottom: '20px',
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        🎉 <strong>DB-Driven Page!</strong> This page loaded its configuration from the database (pageID: 18)
      </div>
      <DirectRenderer config={pageConfig} />
    </div>
  );
};

export default TestingPage;
