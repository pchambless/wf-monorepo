import React, { useState, useRef, useEffect } from 'react';

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '8px',
  },
  description: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '16px',
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#334155',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    boxSizing: 'border-box',
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  primaryButton: {
    backgroundColor: '#ff9800',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  logContainer: {
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    padding: '16px',
    borderRadius: '6px',
    fontFamily: 'monospace',
    fontSize: '13px',
    height: '500px',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  warning: {
    backgroundColor: '#fef3c7',
    border: '1px solid #fbbf24',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '16px',
    fontSize: '14px',
    color: '#92400e',
  },
};

const MigrationPage = () => {
  const [password, setPassword] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const logEndRef = useRef(null);
  const pollInterval = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  const pollMigrationStatus = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/util/migration-status', {
        credentials: 'include'
      });
      const result = await response.json();

      if (result.running) {
        setStatusMessage('🔄 Migration in progress...');
        setLogs(result.logs);
      } else if (result.complete) {
        setStatusMessage('✅ Migration completed!');
        setLogs(result.logs);
        setIsRunning(false);
        if (pollInterval.current) {
          clearInterval(pollInterval.current);
          pollInterval.current = null;
        }
      } else {
        // No migration running and no complete logs - stop polling
        if (pollInterval.current) {
          clearInterval(pollInterval.current);
          pollInterval.current = null;
          setIsRunning(false);
        }
      }
    } catch (error) {
      console.error('Error polling status:', error);
    }
  };

  const handleRunInTerminal = async () => {
    if (!window.confirm('Open terminal and run migration? You will be prompted for SSH password.')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/api/util/open-terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          directory: '/home/paul/a-wf-migration',
          command: './migration/run.sh'
        }),
      });

      const result = await response.json();
      if (result.success) {
        setLogs('Migration started in terminal. Check terminal window for progress and password prompts.\n');
      } else {
        alert(`Failed to open terminal: ${result.message}`);
      }
    } catch (error) {
      alert(`Error opening terminal: ${error.message}`);
    }
  };

  const handleStartMigration = async () => {
    if (!window.confirm('Start production data migration? Ensure SSH tunnels are running first. This will copy prod data to test database.')) {
      return;
    }

    setIsRunning(true);
    setStatusMessage('🚀 Starting migration...');
    setLogs('');

    try {
      const response = await fetch('http://localhost:3002/api/util/run-migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (result.success) {
        setStatusMessage('🔄 Migration running - polling for updates...');
        pollInterval.current = setInterval(pollMigrationStatus, 2000);
      } else {
        setStatusMessage('❌ Failed to start migration');
        setIsRunning(false);
        alert(`Migration failed: ${result.message}`);
      }
    } catch (error) {
      setStatusMessage('❌ Error starting migration');
      setIsRunning(false);
      alert(`Migration error: ${error.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Production to Test Migration</h1>
        <p style={styles.description}>
          Copy production WhatsFresh data to test database with automatic structure mapping
        </p>
      </div>

      <div style={styles.warning}>
        ⚠️ <strong>Warning:</strong> This process will overwrite all data in the test database.
        The migration includes 14 steps: SSH tunnels, bulk copy, and data transformation.
      </div>

      <div style={styles.card}>
        <h3 style={{margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b'}}>
          🚀 Run Complete Migration
        </h3>
        <p style={{margin: '0 0 12px 0', fontSize: '14px', color: '#64748b'}}>
          <strong>One-Click Process:</strong> Opens terminal for SSH password → Starts tunnels → Runs migration automatically
        </p>
        <button
          style={{
            ...styles.button,
            ...styles.primaryButton,
            ...(isRunning && styles.disabledButton),
          }}
          onClick={handleRunInTerminal}
          disabled={isRunning}
        >
          {isRunning ? '🔄 Migration Running...' : '🖥️ Start Migration (Terminal)'}
        </button>
        <p style={{margin: '12px 0 0 0', fontSize: '12px', color: '#64748b', fontStyle: 'italic'}}>
          A terminal will open - just enter your SSH password when prompted. The migration will run automatically.
        </p>

        <div style={{margin: '16px 0', borderTop: '1px solid #e2e8f0', paddingTop: '16px'}}>
          <p style={{margin: '0 0 8px 0', fontSize: '13px', color: '#64748b'}}>
            <strong>Alternative:</strong> If tunnels are already running, use direct migration:
          </p>
          <button
            style={{
              ...styles.button,
              backgroundColor: '#64748b',
              color: '#fff',
              ...(isRunning && styles.disabledButton),
            }}
            onClick={handleStartMigration}
            disabled={isRunning}
          >
            Run Migration Only (Tunnels Required)
          </button>
        </div>

        {statusMessage && (
          <p style={{margin: '12px 0 0 0', fontSize: '14px', fontWeight: 600, color: '#1e293b'}}>
            {statusMessage}
          </p>
        )}
      </div>

      {logs && (
        <div style={styles.card}>
          <label style={styles.label}>Migration Logs</label>
          <div style={styles.logContainer}>
            {logs}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MigrationPage;
