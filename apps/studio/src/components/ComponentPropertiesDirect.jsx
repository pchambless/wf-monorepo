import React, { useState, useEffect } from 'react';
import { upsertProp } from '../utils/propHelpers';
import { execDml, execEvent } from '../utils/api';
import QuerySetup from './PropertyEditors/QuerySetup';
import ColumnSelector from './PropertyEditors/ColumnSelector';
import OverrideEditor from './PropertyEditors/OverrideEditor';
import ColumnManager from './PropertyEditors/ColumnManager';

const ComponentPropertiesDirect = ({ selectedComponent, pageID, eventTypes, triggers }) => {
  const [componentProps, setComponentProps] = useState([]);
  const [componentTriggers, setComponentTriggers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('component');
  const [editingProp, setEditingProp] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const [newPropValue, setNewPropValue] = useState('');
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [columnOverrides, setColumnOverrides] = useState({});
  const [availableParents, setAvailableParents] = useState([]);
  const [editingComponent, setEditingComponent] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedType, setEditedType] = useState('');
  const [editedParentId, setEditedParentId] = useState('');
  const [editedPosOrder, setEditedPosOrder] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (selectedComponent?.id && pageID) {
      loadComponentData();
    }
  }, [selectedComponent?.id, pageID]); // Only reload when component or page changes

  const loadComponentData = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading component data for:', selectedComponent.id);

      // Load props for this component
      const propsResponse = await fetch('http://localhost:3002/api/execEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventSQLId: 'pageProps',
          params: { pageID }
        })
      });
      const propsResult = await propsResponse.json();
      const props = (propsResult.data || []).filter(p => p.xref_id === selectedComponent.id);
      setComponentProps(props);
      console.log('✅ Loaded props:', props.length);

      // Load columnOverrides for Grid/Form
      const overridesProp = props.find(p => p.paramName === 'columnOverrides');
      if (overridesProp) {
        try {
          setColumnOverrides(JSON.parse(overridesProp.paramVal));
        } catch (e) {
          setColumnOverrides({});
        }
      } else {
        setColumnOverrides({});
      }

      // Load available parents (all components on this page)
      const parentsResponse = await fetch('http://localhost:3002/api/execEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventSQLId: 'xrefHierarchy',
          params: { pageID }
        })
      });
      const parentsResult = await parentsResponse.json();
      setAvailableParents(parentsResult.data || []);

      // Initialize edit state
      setEditedName(selectedComponent.comp_name || '');
      setEditedType(selectedComponent.comp_type || '');
      setEditedParentId(selectedComponent.parent_id || '');
      setEditedPosOrder(selectedComponent.posOrder || '');

      // Load triggers for this component
      const triggersResponse = await fetch('http://localhost:3002/api/execEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventSQLId: 'pageTriggers',
          params: { pageID }
        })
      });
      const triggersResult = await triggersResponse.json();
      const compTriggers = (triggersResult.data || []).filter(t => t.xref_id === selectedComponent.id);
      setComponentTriggers(compTriggers);
      console.log('✅ Loaded triggers:', compTriggers.length);
    } catch (error) {
      console.error('❌ Error loading component data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProp = (prop) => {
    setEditingProp(prop.prop_id);
    // Pretty-print JSON if it's valid JSON
    let displayValue = prop.paramVal;
    try {
      const parsed = JSON.parse(prop.paramVal);
      displayValue = JSON.stringify(parsed, null, 2);
    } catch (e) {
      // Not JSON, use as-is
      displayValue = prop.paramVal;
    }
    setEditValue(displayValue);
  };

  const handleCancelEdit = () => {
    setEditingProp(null);
    setEditValue('');
  };

  const handleSaveProp = async (prop) => {
    try {
      setSaving(true);
      await upsertProp(selectedComponent.id, prop.paramName, editValue);
      console.log('✅ Prop saved:', prop.paramName);
      setEditingProp(null);
      setEditValue('');
      await loadComponentData();
    } catch (error) {
      console.error('❌ Failed to save prop:', error);
      alert('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProp = async (prop) => {
    if (!confirm(`Delete prop "${prop.paramName}"?`)) return;

    try {
      setSaving(true);
      await execDml({
        method: 'DELETE',
        table: 'api_wf.eventProps',
        data: { id: prop.prop_id },
        primaryKey: { id: prop.prop_id }
      });
      console.log('✅ Prop deleted:', prop.paramName);
      await loadComponentData();
    } catch (error) {
      console.error('❌ Failed to delete prop:', error);
      alert('Failed to delete: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = () => {
    setAddingNew(true);
    setNewPropName('');
    setNewPropValue('');
  };

  const handleCancelAdd = () => {
    setAddingNew(false);
    setNewPropName('');
    setNewPropValue('');
  };

  const handleSaveNew = async () => {
    if (!newPropName.trim()) {
      alert('Prop name is required');
      return;
    }

    try {
      setSaving(true);
      await upsertProp(selectedComponent.id, newPropName, newPropValue);
      console.log('✅ New prop added:', newPropName);
      setAddingNew(false);
      setNewPropName('');
      setNewPropValue('');
      await loadComponentData();
    } catch (error) {
      console.error('❌ Failed to add prop:', error);
      alert('Failed to add: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveColumn = async (columnName, override) => {
    const updated = {
      ...columnOverrides,
      [columnName]: override,
    };
    console.log('💾 Saving columnOverrides:', columnName, override, 'updated:', updated);
    setColumnOverrides(updated);

    try {
      // Find the columnOverrides prop_id from loaded props
      const overridesProp = componentProps.find(p => p.paramName === 'columnOverrides');
      
      if (overridesProp) {
        // Direct update using prop_id
        await execDml({
          method: 'UPDATE',
          table: 'api_wf.eventProps',
          data: {
            id: overridesProp.prop_id,
            paramVal: JSON.stringify(updated)
          },
          primaryKey: { id: overridesProp.prop_id }
        });
        console.log('✅ Column override saved directly to prop_id:', overridesProp.prop_id);
      } else {
        // Insert new prop if it doesn't exist
        await execDml({
          method: 'INSERT',
          table: 'api_wf.eventProps',
          data: {
            xref_id: selectedComponent.id,
            paramName: 'columnOverrides',
            paramVal: JSON.stringify(updated)
          }
        });
        console.log('✅ Column override inserted as new prop');
      }
      
      await loadComponentData();
    } catch (error) {
      console.error('❌ Failed to save column override:', error);
      alert('Failed to save: ' + error.message);
    }
  };

  const handleResetColumn = async (columnName) => {
    const updated = { ...columnOverrides };
    delete updated[columnName];
    setColumnOverrides(updated);

    try {
      await upsertProp(selectedComponent.id, 'columnOverrides', updated);
      console.log('✅ Column override reset:', columnName);
      await loadComponentData();
    } catch (error) {
      console.error('❌ Failed to reset column override:', error);
      alert('Failed to reset: ' + error.message);
    }
  };

  const handleEditComponent = () => {
    setEditingComponent(true);
  };

  const handleCancelComponentEdit = () => {
    setEditedName(selectedComponent.comp_name || '');
    setEditedType(selectedComponent.comp_type || '');
    setEditedParentId(selectedComponent.parent_id || '');
    setEditedPosOrder(selectedComponent.posOrder || '');
    setEditingComponent(false);
  };

  const handleSaveComponent = async () => {
    try {
      setSaving(true);
      await execDml({
        method: 'UPDATE',
        table: 'api_wf.eventComp_xref',
        data: {
          id: selectedComponent.id,
          comp_name: editedName,
          comp_type: editedType,
          parent_id: editedParentId || null,
          posOrder: editedPosOrder
        },
        primaryKey: { id: selectedComponent.id }
      });
      console.log('✅ Component updated');
      setEditingComponent(false);
      await loadComponentData();
    } catch (error) {
      console.error('❌ Failed to save component:', error);
      alert('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateFields = async () => {
    const xref_id = selectedComponent?.id;

    if (!xref_id) {
      throw new Error('No component selected');
    }

    console.log('🔘 handleGenerateFields called for xref_id:', xref_id);

    try {
      // Set xrefID in context before calling execEvent
      await fetch('http://localhost:3002/api/setVals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          values: [{ paramName: 'xrefID', paramVal: xref_id }]
        })
      });

      console.log('🔘 Calling xrefFieldGen with xrefID:', xref_id);
      const result = await execEvent('xrefFieldGen', { xrefID: xref_id });

      if (!result.data) {
        throw new Error('No data returned from field generation');
      }

      // Stored procedures return: data: [[metadata], [fields], OkPacket]
      const [metadata, fields] = result.data;

      console.log('✅ Generated fields metadata:', metadata);
      console.log('✅ Generated fields:', fields);

      // Load existing saved fields to preserve overrides
      const existingFields = await loadExistingFields(xref_id);

      // Merge: schema properties from generated, overrides from existing
      const mergedFields = mergeFields(fields, existingFields);

      console.log('✅ Merged fields (schema + overrides):', mergedFields);

      return { metadata: metadata[0], fields: mergedFields };

    } catch (error) {
      console.error('❌ Field generation error:', error);
      throw error;
    }
  };

  const loadExistingFields = async (xref_id) => {
    try {
      const result = await execEvent('pageProps', { xrefID: xref_id });

      if (!result.data || result.data.length === 0) {
        return null;
      }

      const props = {};
      result.data.forEach(p => {
        try { props[p.paramName] = JSON.parse(p.paramVal); }
        catch { props[p.paramName] = p.paramVal; }
      });

      if (props.columns && Array.isArray(props.columns)) {
        return props.columns;
      }

      return null;
    } catch (error) {
      console.log('ℹ️ No existing fields found, using generated only');
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
    const xref_id = selectedComponent?.id;

    if (!xref_id) {
      throw new Error('No component selected');
    }

    try {
      await upsertProp(xref_id, 'columns', fields);
      console.log('✅ columns saved to MySQL');

      await loadComponentData();
      console.log('✅ Component data reloaded');

      return { success: true, count: fields.length };

    } catch (error) {
      console.error('❌ Save error:', error);
      throw error;
    }
  };

  if (!selectedComponent) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🎯</div>
          <div style={styles.emptyText}>Select a component to edit</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>{selectedComponent.comp_name}</h3>
        <span style={styles.subtitle}>({selectedComponent.comp_type})</span>
      </div>

      {/* Tabs */}
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
          Props ({componentProps.length})
        </button>
        <button
          style={activeTab === 'triggers' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('triggers')}
        >
          Triggers ({componentTriggers.length})
        </button>
      </div>

      {/* Tab Content */}
      <div style={styles.content}>
        {loading && <div style={styles.loading}>Loading...</div>}

        {!loading && activeTab === 'component' && (
          <div style={styles.section}>
            {!editingComponent && (
              <div style={styles.propsHeader}>
                <button style={styles.addButton} onClick={handleEditComponent} disabled={saving}>
                  ✏️ Edit Component
                </button>
              </div>
            )}

            <div style={styles.field}>
              <label style={styles.label}>ID</label>
              <input style={styles.input} value={selectedComponent.id} readOnly />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Name</label>
              <input
                style={editingComponent ? styles.inputEditable : styles.input}
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                readOnly={!editingComponent}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Type</label>
              <input
                style={editingComponent ? styles.inputEditable : styles.input}
                value={editedType}
                onChange={(e) => setEditedType(e.target.value)}
                readOnly={!editingComponent}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Parent Component</label>
              {editingComponent ? (
                <select
                  style={styles.inputEditable}
                  value={editedParentId}
                  onChange={(e) => setEditedParentId(e.target.value)}
                >
                  <option value="">None (top-level)</option>
                  {availableParents
                    .filter(p => p.id !== selectedComponent.id)
                    .map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.comp_name} ({parent.comp_type})
                      </option>
                    ))}
                </select>
              ) : (
                <input
                  style={styles.input}
                  value={
                    selectedComponent.parent_id
                      ? `${availableParents.find(p => p.id === selectedComponent.parent_id)?.comp_name || selectedComponent.parent_id} (${availableParents.find(p => p.id === selectedComponent.parent_id)?.comp_type || ''})`
                      : 'None (top-level)'
                  }
                  readOnly
                />
              )}
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Position Order</label>
              <input
                style={editingComponent ? styles.inputEditable : styles.input}
                value={editedPosOrder}
                onChange={(e) => setEditedPosOrder(e.target.value)}
                readOnly={!editingComponent}
                placeholder="row,col,width,align"
              />
            </div>

            {editingComponent && (
              <div style={styles.propActions}>
                <button style={styles.saveButton} onClick={handleSaveComponent} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button style={styles.cancelButton} onClick={handleCancelComponentEdit} disabled={saving}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === 'query' && (
          <div style={styles.section}>
            <QuerySetup
              component={selectedComponent}
              onGenerateFields={handleGenerateFields}
              onSaveFields={handleSaveFields}
            />
          </div>
        )}

        {!loading && activeTab === 'props' && (
          <div style={styles.section}>
            {/* Column Manager for Grid/Form */}
            {(selectedComponent.comp_type === 'Grid' || selectedComponent.comp_type === 'Form') && (() => {
              const columnsProp = componentProps.find(p => p.paramName === 'columns');
              const columns = columnsProp ? (typeof columnsProp.paramVal === 'string' ? JSON.parse(columnsProp.paramVal) : columnsProp.paramVal) : [];
              
              return columns.length > 0 ? (
                <div>
                  <ColumnManager
                    columns={columns}
                    selectedColumn={selectedColumn}
                    onSelect={setSelectedColumn}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => setIsDragging(false)}
                    onReorder={async (newColumns) => {
                      try {
                        setSaving(true);
                        setIsDragging(false);
                        const columnsProp = componentProps.find(p => p.paramName === 'columns');
                        console.log('💾 Saving new column order for component:', {
                          id: selectedComponent.id,
                          name: selectedComponent.comp_name,
                          type: selectedComponent.comp_type,
                          prop_id: columnsProp?.prop_id
                        });
                        
                        // Direct UPDATE without re-fetching
                        await execDml({
                          method: 'UPDATE',
                          table: 'api_wf.eventProps',
                          data: {
                            id: columnsProp.prop_id,
                            paramVal: JSON.stringify(newColumns)
                          },
                          primaryKey: 'id'
                        });
                        
                        console.log('✅ Columns reordered and saved');
                        // Small delay to ensure DB transaction commits
                        await new Promise((resolve) => setTimeout(resolve, 100));
                        await loadComponentData();
                      } catch (error) {
                        console.error('❌ Failed to reorder columns:', error);
                        alert('Failed to reorder: ' + error.message);
                      } finally {
                        setSaving(false);
                      }
                    }}
                  />
                  {selectedColumn && (
                    <div style={styles.columnEditorSection}>
                      <OverrideEditor
                        column={selectedColumn}
                        override={columnOverrides[selectedColumn.name]}
                        onSave={handleSaveColumn}
                        onReset={handleResetColumn}
                        componentType={selectedComponent.comp_type}
                      />
                    </div>
                  )}
                  <div style={styles.divider}></div>
                </div>
              ) : null;
            })()}

            {/* Prop Selector and Editor */}
            <div style={styles.propSelectorRow}>
              <select 
                style={styles.propDropdown}
                value={editingProp || ''}
                onChange={(e) => {
                  const propId = parseInt(e.target.value);
                  if (propId) {
                    const prop = componentProps.find(p => p.prop_id === propId);
                    if (prop) {
                      handleEditProp(prop);
                    }
                  } else {
                    setEditingProp(null);
                    setEditValue('');
                  }
                }}
              >
                <option value="">Select a prop to edit...</option>
                {componentProps.map(prop => (
                  <option key={prop.prop_id} value={prop.prop_id}>
                    {prop.paramName} (id: {prop.prop_id})
                  </option>
                ))}
              </select>
              <button style={styles.addButton} onClick={handleAddNew} disabled={saving}>
                + Add New
              </button>
            </div>

            {/* Single Editor Area */}
            {addingNew ? (
              <div style={styles.editorSection}>
                <div style={styles.editorHeader}>
                  <input
                    style={styles.propNameInput}
                    value={newPropName}
                    onChange={(e) => setNewPropName(e.target.value)}
                    placeholder="Prop name (e.g., dataSource)"
                    autoFocus
                  />
                </div>
                <textarea
                  style={styles.editorTextarea}
                  value={newPropValue}
                  onChange={(e) => setNewPropValue(e.target.value)}
                  placeholder="Prop value (JSON or string)"
                  rows={20}
                />
                <div style={styles.propActions}>
                  <button style={styles.saveButton} onClick={handleSaveNew} disabled={saving}>
                    {saving ? 'Saving...' : '💾 Save New Prop'}
                  </button>
                  <button style={styles.cancelButton} onClick={handleCancelAdd} disabled={saving}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : editingProp ? (
              <div style={styles.editorSection}>
                <div style={styles.editorHeader}>
                  <span style={styles.editorTitle}>
                    {componentProps.find(p => p.prop_id === editingProp)?.paramName}
                  </span>
                  <span style={styles.propId}>
                    (id: {editingProp})
                  </span>
                </div>
                <textarea
                  style={styles.editorTextarea}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={20}
                  autoFocus
                />
                <div style={styles.propActions}>
                  <button 
                    style={styles.saveButton} 
                    onClick={() => handleSaveProp(componentProps.find(p => p.prop_id === editingProp))} 
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : '💾 Save Changes'}
                  </button>
                  <button 
                    style={styles.deleteButton} 
                    onClick={() => handleDeleteProp(componentProps.find(p => p.prop_id === editingProp))} 
                    disabled={saving}
                  >
                    🗑️ Delete Prop
                  </button>
                  <button style={styles.cancelButton} onClick={handleCancelEdit} disabled={saving}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.emptyEditor}>
                <div style={styles.emptyIcon}>📝</div>
                <div style={styles.emptyText}>Select a prop from the dropdown to edit</div>
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === 'triggers' && (
          <div style={styles.section}>
            {componentTriggers.length === 0 ? (
              <div style={styles.emptySection}>No triggers defined</div>
            ) : (
              componentTriggers.map((trigger, idx) => (
                <div key={idx} style={styles.triggerItem}>
                  <div style={styles.triggerHeader}>
                    <span style={styles.triggerClass}>{trigger.class}</span>
                    <span style={styles.triggerAction}>{trigger.action}</span>
                  </div>
                  <div style={styles.triggerContent}>{String(trigger.content).substring(0, 100)}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  header: {
    padding: '16px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginLeft: '8px',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fafafa',
  },
  tab: {
    padding: '12px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#666',
    borderBottom: '2px solid transparent',
  },
  tabActive: {
    padding: '12px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#1976d2',
    fontWeight: '600',
    borderBottom: '2px solid #1976d2',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '16px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  input: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#f9f9f9',
  },
  inputEditable: {
    padding: '8px',
    border: '2px solid #3b82f6',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#ffffff',
  },
  columnEditorSection: {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
  },
  columnEditorTitle: {
    margin: '0 0 16px 0',
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '24px 0',
  },
  propsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    gap: '16px',
  },
  propSelectorRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  propDropdown: {
    flex: 1,
    padding: '10px',
    border: '2px solid #3b82f6',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: '#fff',
  },
  editorSection: {
    padding: '16px',
    border: '2px solid #3b82f6',
    borderRadius: '8px',
    backgroundColor: '#fff',
  },
  editorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  editorTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  editorTextarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: 'monospace',
    resize: 'vertical',
    marginBottom: '12px',
    lineHeight: '1.5',
  },
  emptyEditor: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    color: '#999',
  },
  addButton: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  propItem: {
    padding: '12px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    backgroundColor: '#fafafa',
  },
  propEditItem: {
    padding: '12px',
    border: '2px solid #1976d2',
    borderRadius: '4px',
    backgroundColor: '#fff',
  },
  propHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  propEditHeader: {
    marginBottom: '8px',
  },
  propNameWithId: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  propName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
  },
  propId: {
    fontSize: '11px',
    color: '#999',
    fontFamily: 'monospace',
  },
  propNameInput: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
  },
  propValue: {
    fontSize: '12px',
    color: '#666',
    fontFamily: 'monospace',
    wordBreak: 'break-all',
    whiteSpace: 'pre-wrap',
  },
  propEditTextarea: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    resize: 'vertical',
    marginBottom: '8px',
  },
  propButtons: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    padding: '4px 12px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '4px 12px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  propActions: {
    display: 'flex',
    gap: '8px',
  },
  saveButton: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#6b7280',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  triggerItem: {
    padding: '12px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    backgroundColor: '#fafafa',
  },
  triggerHeader: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
  },
  triggerClass: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1976d2',
    backgroundColor: '#e3f2fd',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  triggerAction: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#388e3c',
    backgroundColor: '#e8f5e9',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  triggerContent: {
    fontSize: '12px',
    color: '#666',
    fontFamily: 'monospace',
    wordBreak: 'break-all',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#999',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '16px',
  },
  emptySection: {
    padding: '20px',
    textAlign: 'center',
    color: '#999',
  },
  loading: {
    padding: '20px',
    textAlign: 'center',
    color: '#666',
  },
};

export default ComponentPropertiesDirect;
