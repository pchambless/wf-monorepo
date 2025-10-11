import React, { useState, useEffect } from 'react';
import { execEvent } from '@whatsfresh/shared-imports';
import { formatPropsForDisplay, parseProps } from '../utils/formatProps';
import ColumnSelector from './PropertyEditors/ColumnSelector';
import PreviewPane from './PropertyEditors/PreviewPane';
import OverrideEditor from './PropertyEditors/OverrideEditor';
import QuerySetup from './PropertyEditors/QuerySetup';
import { loadPropsForComponent, updatePropValue, updateAllProps } from '../utils/propUpdater';
import { loadTriggersForComponent } from '../utils/triggerUpdater';
import { savePropsToMySQL } from '../utils/propSaver';
import { db } from '../db/studioDb';

const ComponentPropertiesPanel = ({ selectedComponent, pageID, onSave }) => {
  const [activeTab, setActiveTab] = useState('component');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedType, setEditedType] = useState('');
  const [editedContainer, setEditedContainer] = useState('');
  const [editedProps, setEditedProps] = useState('{}');
  const [hasChanges, setHasChanges] = useState(false);

  // Column editor state (for Grids)
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [columnOverrides, setColumnOverrides] = useState({});
  const [previewData, setPreviewData] = useState(null);

  // Triggers from IndexedDB
  const [triggers, setTriggers] = useState([]);

  // Reference data for dropdowns
  const [refComponents, setRefComponents] = useState([]);
  const [refContainers, setRefContainers] = useState([]);

  // Load reference data on mount
  useEffect(() => {
    const loadReferences = async () => {
      try {
        const components = await db.refComponents.toArray();
        const containers = await db.refContainers.toArray();
        setRefComponents(components);
        setRefContainers(containers);
      } catch (error) {
        console.error('Failed to load references:', error);
      }
    };

    loadReferences();
  }, []);

  // Load props and triggers from IndexedDB when selectedComponent changes
  useEffect(() => {
    if (selectedComponent?.xref_id) {
      loadComponentData(selectedComponent.xref_id);
    }
  }, [selectedComponent?.xref_id]);

  const loadComponentData = async (xref_id) => {
    console.log('🔍 ComponentPropertiesPanel selectedComponent:', selectedComponent);
    console.log('🔍 comp_type:', selectedComponent?.comp_type);

    setEditedTitle(selectedComponent.title || selectedComponent.label || '');
    setEditedType(selectedComponent.comp_type || '');
    setEditedContainer(selectedComponent.container || '');

    const props = await loadPropsForComponent(xref_id);
    setEditedProps(JSON.stringify(props, null, 2));
    setColumnOverrides(props.columnOverrides || {});

    const loadedTriggers = await loadTriggersForComponent(xref_id);
    setTriggers(loadedTriggers);

    setHasChanges(false);
    setSelectedColumn(null);
  };

  const handleTitleChange = (e) => {
    setEditedTitle(e.target.value);
    setHasChanges(true);
  };

  const handleTypeChange = (e) => {
    setEditedType(e.target.value);
    setHasChanges(true);
  };

  const handleContainerChange = (e) => {
    setEditedContainer(e.target.value);
    setHasChanges(true);
  };

  const handlePropsChange = async (e) => {
    setEditedProps(e.target.value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    console.log('🔍 handleSave called - xref_id:', selectedComponent?.xref_id);

    if (!selectedComponent?.xref_id) {
      alert('No component selected');
      return;
    }

    try {
      const parsedProps = JSON.parse(editedProps);
      console.log('🔍 Parsed props:', parsedProps);

      await updateAllProps(selectedComponent.xref_id, parsedProps);
      console.log('✅ Props marked with _dmlMethod in IndexedDB');

      await savePropsToMySQL(selectedComponent.xref_id);
      console.log('✅ Props saved to MySQL');

      setHasChanges(false);
      console.log('✅ Component props updated');
    } catch (error) {
      console.error('❌ Save error:', error);
      alert('Failed to save: ' + error.message);
    }
  };

  // Column editor handlers
  const handleSaveColumn = async (columnName, override) => {
    const updated = {
      ...columnOverrides,
      [columnName]: override,
    };
    setColumnOverrides(updated);
    setHasChanges(true);
    console.log('Column override saved:', columnName, override);

    if (selectedComponent?.xref_id) {
      try {
        const currentProps = JSON.parse(editedProps);
        currentProps.columnOverrides = updated;

        await updatePropValue(selectedComponent.xref_id, 'columnOverrides', updated);

        setEditedProps(JSON.stringify(currentProps, null, 2));
        console.log('✅ Column override marked with _dmlMethod in IndexedDB');
      } catch (error) {
        console.error('❌ Failed to save column override:', error);
      }
    }
  };

  const handleResetColumn = (columnName) => {
    const updated = { ...columnOverrides };
    delete updated[columnName];
    setColumnOverrides(updated);
    setHasChanges(true);
    console.log('Column override reset:', columnName);
  };

  const loadPreviewData = async (xref_id) => {
    try {
      console.log('Loading preview data for xref_id:', xref_id);

      // Fetch complete data using the 3 queries
      const [basicResult, triggersResult, propsResult] = await Promise.all([
        execEvent('xrefBasicDtl', { xrefID: xref_id }),
        execEvent('xrefTriggerList', { xrefID: xref_id }),
        execEvent('xrefPropList', { xrefID: xref_id })
      ]);

      console.log('Basic result:', basicResult);
      console.log('Triggers result:', triggersResult);
      console.log('Props result:', propsResult);

      const basic = basicResult.data?.[0] || {};
      const triggers = triggersResult.data || [];

      // Convert props array to object
      const propsArray = propsResult.data || [];
      const props = {};
      propsArray.forEach(prop => {
        try {
          props[prop.paramName] = JSON.parse(prop.paramVal);
        } catch {
          props[prop.paramName] = prop.paramVal;
        }
      });

      const preview = { basic, triggers, props };
      console.log('Setting preview data:', preview);
      setPreviewData(preview);
    } catch (error) {
      console.error('Failed to load preview data:', error);
      setPreviewData({ error: error.message });
    }
  };

  useEffect(() => {
    if (activeTab === 'preview' && selectedComponent?.xref_id) {
      loadPreviewData(selectedComponent.xref_id);
    }
  }, [activeTab, selectedComponent?.xref_id]);

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

      // Load existing saved fields to preserve overrides
      const existingFields = await loadExistingFields(xref_id);

      // Merge: schema properties from generated, overrides from existing
      const mergedFields = mergeFields(fields, existingFields);

      console.log('Merged fields (schema + overrides):', mergedFields);

      return { metadata: metadata[0], fields: mergedFields };

    } catch (error) {
      console.error('Field generation error:', error);
      throw error;
    }
  };

  const loadExistingFields = async (xref_id) => {
    try {
      const props = await loadPropsForComponent(xref_id);
      return props.columns || null;
    } catch (error) {
      console.log('No existing fields found, using generated only');
      return null;
    }
  };

  const mergeFields = (generatedFields, existingFields) => {
    if (!existingFields || existingFields.length === 0) {
      return generatedFields;
    }

    const existingMap = {};
    existingFields.forEach(field => {
      existingMap[field.name] = field;
    });

    return generatedFields.map(genField => {
      const existing = existingMap[genField.name];

      if (!existing) {
        return genField;
      }

      return {
        ...genField,
        label: existing.label,
        width: existing.width,
        hidden: existing.hidden,
        required: existing.required,
        sortable: existing.sortable,
        filterable: existing.filterable,
        placeholder: existing.placeholder,
      };
    });
  };

  const handleSaveFields = async (fields) => {
    const xref_id = selectedComponent?.xref_id;

    if (!xref_id) {
      throw new Error('No component selected');
    }

    try {
      await updatePropValue(xref_id, 'columns', fields);
      console.log('✅ columns marked with _dmlMethod in IndexedDB');

      await loadComponentData(xref_id);
      console.log('✅ Component data reloaded');

      return { success: true, count: fields.length };

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
        <button
          style={activeTab === 'preview' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('preview')}
        >
          Event Preview
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'component' && (
          <div style={styles.tabContent}>
            <div style={{display: 'flex', gap: '16px', alignItems: 'flex-start'}}>
              <div style={{...styles.field, flex: '0 0 80px'}}>
                <label style={styles.label}>ID</label>
                <input
                  type="text"
                  value={selectedComponent.xref_id}
                  disabled
                  style={{...styles.inputDisabled, fontSize: '12px', padding: '6px 8px'}}
                />
              </div>
              <div style={{...styles.field, flex: 1}}>
                <label style={styles.label}>Title</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={handleTitleChange}
                  placeholder="Component title"
                  style={styles.input}
                />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Type</label>
              <select
                value={editedType}
                onChange={handleTypeChange}
                style={styles.input}
              >
                <option value="">Select type...</option>
                {refComponents.map((comp) => (
                  <option key={comp.name} value={comp.name}>
                    {comp.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Container</label>
              <select
                value={editedContainer}
                onChange={handleContainerChange}
                style={styles.input}
              >
                <option value="">Select container...</option>
                {refContainers.map((cont) => (
                  <option key={cont.name} value={cont.name}>
                    {cont.name}
                  </option>
                ))}
              </select>
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
              // Grid/Form: Show column editor + full JSON view
              (() => {
                const parsed = JSON.parse(editedProps);
                const items = parsed.columns || [];
                const fieldName = selectedColumn?.name;

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

                    <div style={styles.divider}></div>

                    <div style={styles.field}>
                      <label style={styles.label}>All Props (JSON)</label>
                      <textarea
                        value={editedProps}
                        onChange={handlePropsChange}
                        style={styles.textarea}
                        rows={12}
                        spellCheck={false}
                      />
                    </div>
                  </div>
                );
              })()
            ) : (
              // Default JSON view for other component types
              <div style={styles.field}>
                <label style={styles.label}>Event Properties (JSON)</label>
                <textarea
                  value={editedProps}
                  onChange={handlePropsChange}
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
            {triggers && triggers.length > 0 ? (
              <div>
                {triggers.map((trigger, idx) => (
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

        {activeTab === 'preview' && (
          <div style={styles.tabContent}>
            <div style={styles.previewSection}>
              <h4 style={styles.previewSectionTitle}>📋 Event Preview (JSON)</h4>
              {previewData ? (
                <>
                  <pre style={styles.previewJsonBlock}>
                    {JSON.stringify(previewData, null, 2)}
                  </pre>
                  <div style={styles.previewHint}>
                    Complete configuration loaded from database queries
                  </div>
                </>
              ) : (
                <div style={styles.previewEmpty}>
                  Loading preview data...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
    backgroundColor: '#4cfce7',
    color: '#0f766e',
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
  previewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  previewSection: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  previewSectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '15px',
    fontWeight: 600,
    color: '#1e293b',
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },
  previewItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  previewLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  previewValue: {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: 500,
  },
  previewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  previewTrigger: {
    padding: '12px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  previewTriggerHeader: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
    alignItems: 'center',
  },
  previewTriggerClass: {
    padding: '4px 8px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
  previewTriggerAction: {
    padding: '4px 8px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
  },
  previewTriggerOrder: {
    padding: '4px 8px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
  },
  previewCode: {
    margin: 0,
    padding: '12px',
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: 'monospace',
    overflow: 'auto',
    maxHeight: '200px',
  },
  previewEmpty: {
    textAlign: 'center',
    padding: '24px',
    color: '#94a3b8',
    fontSize: '14px',
  },
  previewJsonBlock: {
    margin: 0,
    padding: '16px',
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'monospace',
    overflow: 'auto',
    maxHeight: '70vh',
    lineHeight: '1.6',
  },
  previewHint: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '6px',
    fontSize: '13px',
    textAlign: 'center',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '24px 0',
  },
};

export default ComponentPropertiesPanel;
