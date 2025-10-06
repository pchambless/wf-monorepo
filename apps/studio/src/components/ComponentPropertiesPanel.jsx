import React, { useState, useEffect } from 'react';
import { execEvent } from '@whatsfresh/shared-imports';
import { formatPropsForDisplay, parseProps } from '../utils/formatProps';
import ColumnSelector from './PropertyEditors/ColumnSelector';
import PreviewPane from './PropertyEditors/PreviewPane';
import OverrideEditor from './PropertyEditors/OverrideEditor';
import QuerySetup from './PropertyEditors/QuerySetup';

const ComponentPropertiesPanel = ({ selectedComponent, onSave }) => {
  const [activeTab, setActiveTab] = useState('component');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContainer, setEditedContainer] = useState('');
  const [editedProps, setEditedProps] = useState('{}');
  const [hasChanges, setHasChanges] = useState(false);

  // Column editor state (for Grids)
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [columnOverrides, setColumnOverrides] = useState({});

  // Update local state when selectedComponent changes
  useEffect(() => {
    if (selectedComponent) {
      setEditedTitle(selectedComponent.label || '');
      setEditedContainer(selectedComponent.container || '');
      setEditedProps(formatPropsForDisplay(selectedComponent.eventProps));

      // Parse column overrides for Grid components
      const parsed = parseProps(selectedComponent.eventProps);
      setColumnOverrides(parsed.columnOverrides || {});

      setHasChanges(false);
      setSelectedColumn(null);
    }
  }, [selectedComponent]);

  const handleTitleChange = (e) => {
    setEditedTitle(e.target.value);
    setHasChanges(true);
  };

  const handleContainerChange = (e) => {
    setEditedContainer(e.target.value);
    setHasChanges(true);
  };

  const handlePropsChange = (e) => {
    setEditedProps(e.target.value);
    setHasChanges(true);
  };

  const handleSave = () => {
    try {
      const parsedProps = JSON.parse(editedProps);
      onSave({
        xref_id: selectedComponent.xref_id,
        title: editedTitle,
        container: editedContainer,
        eventProps: parsedProps,
      });
      setHasChanges(false);
    } catch (error) {
      alert('Invalid JSON in props field: ' + error.message);
    }
  };

  // Column editor handlers
  const handleSaveColumn = (columnName, override) => {
    const updated = {
      ...columnOverrides,
      [columnName]: override,
    };
    setColumnOverrides(updated);
    setHasChanges(true);
    console.log('Column override saved:', columnName, override);
  };

  const handleResetColumn = (columnName) => {
    const updated = { ...columnOverrides };
    delete updated[columnName];
    setColumnOverrides(updated);
    setHasChanges(true);
    console.log('Column override reset:', columnName);
  };

  const handleGenerateFields = async () => {
    const xref_id = selectedComponent?.xref_id;

    if (!xref_id) {
      throw new Error('No component selected');
    }

    console.log('Generating fields for xref_id:', xref_id);

    try {
      const result = await execEvent('xrefFieldGen', { xref_id });

      if (!result.data) {
        throw new Error('No data returned from field generation');
      }

      // Stored procedures return: data: [[metadata], [fields], OkPacket]
      const [metadata, fields] = result.data;

      console.log('Generated fields metadata:', metadata);
      console.log('Generated fields:', fields);

      return { metadata: metadata[0], fields };

    } catch (error) {
      console.error('Field generation error:', error);
      throw error;
    }
  };

  const handleSaveFields = async (fields) => {
    const xref_id = selectedComponent?.xref_id;

    if (!xref_id) {
      throw new Error('No component selected');
    }

    try {
      // Save as JSON blob to eventProps
      const propVal = JSON.stringify(fields);

      // Use execDML to insert/update
      const response = await fetch('http://localhost:3001/api/execDML', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'INSERT',
          table: 'api_wf.eventProps',
          data: {
            xref_id,
            propName: 'columns',
            propType: 'json',
            propVal,
            created_by: 'Studio'
          },
          onDuplicateKey: {
            propVal,
            updated_at: 'NOW()',
            updated_by: 'Studio'
          }
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Save failed');
      }

      console.log('Fields saved successfully:', result);
      return result;

    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  };

  if (!selectedComponent) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>🎯</div>
        <div style={styles.emptyText}>Select a component to edit</div>
      </div>
    );
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.title}>{selectedComponent.label}</h3>
        <span style={styles.badgeLarge}>{selectedComponent.comp_type}</span>
      </div>

      <div style={styles.tabs}>
        <button
          style={activeTab === 'component' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('component')}
        >
          Component
        </button>
        {(selectedComponent.comp_type === 'Grid' || selectedComponent.comp_type === 'Form') && (
          <button
            style={activeTab === 'query' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('query')}
          >
            Query
          </button>
        )}
        <button
          style={activeTab === 'props' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('props')}
        >
          Props
        </button>
        <button
          style={activeTab === 'triggers' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('triggers')}
        >
          Triggers
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'component' && (
          <div style={styles.tabContent}>
            <div style={styles.field}>
              <label style={styles.label}>ID</label>
              <input
                type="text"
                value={selectedComponent.xref_id}
                disabled
                style={styles.inputDisabled}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Title</label>
              <input
                type="text"
                value={editedTitle}
                readOnly
                style={styles.inputDisabled}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Type</label>
              <input
                type="text"
                value={selectedComponent.comp_type}
                readOnly
                style={styles.inputDisabled}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Container</label>
              <input
                type="text"
                value={editedContainer}
                readOnly
                style={styles.inputDisabled}
              />
            </div>
          </div>
        )}

        {activeTab === 'query' && (
          <div style={styles.tabContent}>
            <QuerySetup
              component={selectedComponent}
              onGenerateFields={handleGenerateFields}
              onSaveFields={handleSaveFields}
            />
          </div>
        )}

        {activeTab === 'props' && (
          <div style={styles.tabContent}>
            {selectedComponent.comp_type === 'Grid' || selectedComponent.comp_type === 'Form' ? (
              // Grid/Form column/field editor
              (() => {
                const parsed = parseProps(selectedComponent.eventProps);
                const items = parsed.columns || parsed.fields || [];
                const fieldName = selectedColumn?.field || selectedColumn?.name;

                return (
                  <div>
                    <ColumnSelector
                      columns={items}
                      selectedColumn={selectedColumn}
                      onSelect={setSelectedColumn}
                    />

                    <OverrideEditor
                      column={selectedColumn}
                      override={fieldName ? columnOverrides[fieldName] : null}
                      onSave={handleSaveColumn}
                      onReset={handleResetColumn}
                      componentType={selectedComponent.comp_type}
                    />

                    <PreviewPane
                      column={selectedColumn}
                      override={fieldName ? columnOverrides[fieldName] : null}
                      onChange={(merged) => console.log('Preview edited:', merged)}
                    />
                  </div>
                );
              })()
            ) : (
              // Default JSON view for other component types
              <div style={styles.field}>
                <label style={styles.label}>Event Properties (JSON)</label>
                <textarea
                  value={editedProps}
                  readOnly
                  style={styles.textarea}
                  rows={15}
                  spellCheck={false}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'triggers' && (
          <div style={styles.tabContent}>
            {selectedComponent.triggers && selectedComponent.triggers.length > 0 ? (
              <div>
                {selectedComponent.triggers.map((trigger, idx) => (
                  <div key={idx} style={styles.triggerItem}>
                    <div style={styles.triggerHeader}>
                      <span style={styles.triggerClass}>{trigger.class}</span>
                      <span style={styles.triggerAction}>{trigger.action}</span>
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Content</label>
                      <textarea
                        value={trigger.content || ''}
                        style={styles.textarea}
                        rows={4}
                        readOnly
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.comingSoon}>
                <div style={styles.comingSoonIcon}>⚡</div>
                <div style={styles.comingSoonText}>No triggers defined</div>
                <div style={styles.comingSoonSubtext}>
                  Workflows: onLoad, onClick, onRefresh, etc.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save button hidden - editing disabled until orchestration is ready
      <div style={styles.footer}>
        <button
          style={{
            ...styles.saveButton,
            opacity: hasChanges ? 1 : 0.5,
            cursor: hasChanges ? 'pointer' : 'default',
          }}
          onClick={handleSave}
          disabled={!hasChanges}
        >
          {hasChanges ? '💾 Save Changes' : '✓ Saved'}
        </button>
      </div>
      */}
    </div>
  );
};

const styles = {
  panel: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    borderLeft: '1px solid #e2e8f0',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#94a3b8',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: 500,
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
  },
  badge: {
    padding: '4px 8px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
  },
  badgeLarge: {
    padding: '8px 16px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 700,
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  tab: {
    flex: 1,
    padding: '12px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
  },
  tabActive: {
    flex: 1,
    padding: '12px',
    border: 'none',
    backgroundColor: '#ffffff',
    color: '#3b82f6',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    borderBottom: '2px solid #3b82f6',
  },
  content: {
    flex: 1,
    overflow: 'auto',
  },
  tabContent: {
    padding: '20px',
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#475569',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#1e293b',
  },
  inputDisabled: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#94a3b8',
    backgroundColor: '#f8fafc',
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#1e293b',
    resize: 'vertical',
  },
  comingSoon: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#94a3b8',
  },
  comingSoonIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  comingSoonText: {
    fontSize: '16px',
    fontWeight: 500,
    marginBottom: '8px',
  },
  comingSoonSubtext: {
    fontSize: '13px',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '15px',
    fontWeight: 600,
    color: '#1e293b',
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid #e2e8f0',
  },
  saveButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  triggerItem: {
    marginBottom: '20px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  triggerHeader: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
    alignItems: 'center',
  },
  triggerClass: {
    padding: '4px 8px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
  },
  triggerAction: {
    padding: '4px 8px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
  },
};

export default ComponentPropertiesPanel;
