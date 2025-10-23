import React, { useState, useEffect } from 'react';
import { execEvent } from '@whatsfresh/shared-imports';
import { formatPropsForDisplay, parseProps } from '../utils/formatProps';
import ColumnSelector from './PropertyEditors/ColumnSelector';
import PreviewPane from './PropertyEditors/PreviewPane';
import OverrideEditor from './PropertyEditors/OverrideEditor';
import QuerySetup from './PropertyEditors/QuerySetup';
import TriggerBuilder from './PropertyEditors/TriggerBuilder';
import { upsertPropByName } from '../db/operations/eventProps/update';
import { syncToMySQL } from '../db/operations';
import { db } from '../db/studioDb';
import { createComponent } from '../db/operations';

const ComponentPropertiesPanel = ({ selectedComponent, pageID, onSave }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('component');
  const [showTriggersModal, setShowTriggersModal] = useState(false);
  const [fullComponent, setFullComponent] = useState(null);
  const [editedCompName, setEditedCompName] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedType, setEditedType] = useState('');
  const [editedPosOrder, setEditedPosOrder] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedParentId, setEditedParentId] = useState('');
  const [editedProps, setEditedProps] = useState('{}');
  const [hasChanges, setHasChanges] = useState(false);

  // Column editor state (for Grids)
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [columnOverrides, setColumnOverrides] = useState({});
  const [previewData, setPreviewData] = useState(null);

  // Triggers from IndexedDB
  const [triggers, setTriggers] = useState([]);

  // Reference data for dropdowns - query master tables directly
  const [eventTypes, setEventTypes] = useState([]);
  const [availableParents, setAvailableParents] = useState([]);

  // Load event types on mount
  useEffect(() => {
    const loadEventTypes = async () => {
      try {
        // Query eventTypes table directly, sorted by name
        const types = await db.eventTypes
          .orderBy('name')
          .toArray();

        // Format as "Name (category)" for display
        const formatted = types.map(t => ({
          name: t.name,
          category: t.category,
          displayName: `${t.name} (${t.category})`
        }));

        setEventTypes(formatted);
      } catch (error) {
        console.error('Failed to load event types:', error);
      }
    };

    loadEventTypes();
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

    // Load from IndexedDB to get latest values
    const component = await db.eventComp_xref.where('id').equals(xref_id).first();

    setEditedCompName(component?.comp_name || selectedComponent.comp_name || selectedComponent.name || '');
    setEditedTitle(component?.title || selectedComponent.title || selectedComponent.label || '');
    setEditedType(component?.comp_type || selectedComponent.comp_type || '');
    setEditedPosOrder(component?.posOrder || selectedComponent.posOrder || '');
    setEditedDescription(component?.description || selectedComponent.description || '');
    setEditedParentId(component?.parent_id || selectedComponent.parent_id || '');

    const propsArray = await db.eventProps.where('xref_id').equals(xref_id).toArray();
    const props = {};
    propsArray.forEach(p => {
      try { props[p.paramName] = JSON.parse(p.paramVal); }
      catch { props[p.paramName] = p.paramVal; }
    });
    setEditedProps(JSON.stringify(props, null, 2));
    setColumnOverrides(props.columnOverrides || {});

    const loadedTriggers = await db.eventTriggers.where('xref_id').equals(xref_id).toArray();
    setTriggers(loadedTriggers);

    // Load available parents for dropdown
    const components = await db.eventComp_xref.toArray();
    setAvailableParents(components);

    setHasChanges(false);
    setSelectedColumn(null);
  };

  const handleCompNameChange = (e) => {
    setEditedCompName(e.target.value);
    setHasChanges(true);
  };

  const handleTitleChange = (e) => {
    setEditedTitle(e.target.value);
    setHasChanges(true);
  };

  const handleTypeChange = (e) => {
    setEditedType(e.target.value);
    setHasChanges(true);
  };

  const handlePosOrderChange = (e) => {
    setEditedPosOrder(e.target.value);
    setHasChanges(true);
  };

  const handleDescriptionChange = (e) => {
    setEditedDescription(e.target.value);
    setHasChanges(true);
  };

  const handleParentIdChange = (e) => {
    setEditedParentId(e.target.value);
    setHasChanges(true);
  };

  const handlePropsChange = async (e) => {
    setEditedProps(e.target.value);
    setHasChanges(true);
  };

  const handleNewComponent = async () => {
    if (!pageID) {
      alert('Please select a page first');
      return;
    }

    setIsCreating(true);
    setEditedCompName('');
    setEditedTitle('');
    setEditedType('');
    setEditedPosOrder('');
    setEditedDescription('');
    setEditedParentId('');
    setEditedProps('{}');
    setHasChanges(false);
    setActiveTab('component');

    const components = await db.eventComp_xref.toArray();
    setAvailableParents(components);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setEditedCompName('');
    setEditedTitle('');
    setEditedType('');
    setEditedPosOrder('');
    setEditedDescription('');
    setEditedParentId('');
  };

  const handleCreateSave = async () => {
    if (!editedType || !pageID) {
      alert('Type and Page are required');
      return;
    }

    try {
      const componentData = {
        comp_name: editedCompName || editedType.toLowerCase(),
        comp_type: editedType,
        title: editedTitle || editedType,
        posOrder: editedPosOrder || '',
        description: editedDescription || '',
        parent_id: editedParentId ? parseInt(editedParentId) : null
      };

      const result = await createComponent(componentData);
      console.log('✅ Component created:', result);

      alert(`Component created successfully! ID: ${result.id}`);

      setIsCreating(false);
      window.location.reload();
    } catch (error) {
      console.error('❌ Create error:', error);
      alert('Failed to create component: ' + error.message);
    }
  };

  const handleSave = async () => {
    console.log('🔍 handleSave called - xref_id:', selectedComponent?.xref_id);

    if (!selectedComponent?.xref_id) {
      alert('No component selected');
      return;
    }

    try {
      // Update component metadata in IndexedDB
      await db.eventComp_xref.update(selectedComponent.xref_id, {
        comp_name: editedCompName,
        title: editedTitle,
        comp_type: editedType,
        posOrder: editedPosOrder,
        description: editedDescription,
        parent_id: editedParentId ? parseInt(editedParentId) : null,
        _dmlMethod: 'UPDATE'
      });
      console.log('✅ Component metadata updated in IndexedDB');

      // Update props
      const parsedProps = JSON.parse(editedProps);
      console.log('🔍 Parsed props:', parsedProps);

      for (const [paramName, paramVal] of Object.entries(parsedProps)) {
        await upsertPropByName(selectedComponent.xref_id, paramName, paramVal);
      }
      console.log('✅ Props marked for sync');

      // Sync to MySQL
      const { syncComponents } = await import('../db/operations/eventComp_xref');
      const { syncProps } = await import('../db/operations/eventProps');

      const [compResults, propResults] = await Promise.all([
        syncComponents(),
        syncProps()
      ]);

      const allResults = [...compResults, ...propResults];
      const failed = allResults.filter(r => !r.success);

      if (failed.length > 0) {
        alert(`⚠️ Some changes failed to save:\n${failed.map(r => r.error).join('\n')}`);
      } else {
        console.log(`✅ Saved ${allResults.length} changes to MySQL`);
      }

      setHasChanges(false);
      console.log('✅ Component updated successfully');
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

        await upsertPropByName(selectedComponent.xref_id, 'columnOverrides', updated);

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

  const parsePosOrder = (posOrder) => {
    if (!posOrder || posOrder === '0,0,auto') {
      return { row: 0, order: 0, width: 'auto', align: 'left' };
    }

    const parts = posOrder.split(',').map(p => p.trim());

    if (parts.length >= 3) {
      const widthValue = parts[2];
      const width = widthValue.includes('%') ? widthValue : `${widthValue}%`;
      const align = parts[3] || 'left';

      return {
        row: parseInt(parts[0]) || 0,
        order: parseInt(parts[1]) || 0,
        width,
        align
      };
    }

    return { row: 0, order: 0, width: 'auto', align: 'left' };
  };

  const transformPreviewData = (basic, triggers, props) => {
    const position = parsePosOrder(basic.posOrder);

    const workflowTriggers = {};
    triggers.forEach(trigger => {
      if (!workflowTriggers[trigger.class]) {
        workflowTriggers[trigger.class] = [];
      }

      let params = {};
      try {
        params = JSON.parse(trigger.content || '{}');
      } catch (e) {
        params = trigger.content || {};
      }

      workflowTriggers[trigger.class].push({
        action: trigger.action,
        params
      });
    });

    triggers.forEach(cls => {
      if (workflowTriggers[cls]) {
        workflowTriggers[cls].sort((a, b) => (a.ordr || 0) - (b.ordr || 0));
      }
    });

    const componentPreview = {
      id: basic.comp_name,
      comp_type: basic.comp_type,
      xref_id: basic.xref_id,
      container: basic.container || 'inline',
      ...(position.row > 0 && { position }),
      props: { ...props },
      ...(Object.keys(workflowTriggers).length > 0 && { workflowTriggers })
    };

    return componentPreview;
  };

  const loadPreviewData = async (xref_id) => {
    try {
      console.log('Loading preview data for xref_id:', xref_id);

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

      const propsArray = propsResult.data || [];
      const props = {};
      propsArray.forEach(prop => {
        try {
          props[prop.paramName] = JSON.parse(prop.paramVal);
        } catch {
          props[prop.paramName] = prop.paramVal;
        }
      });

      const componentPreview = transformPreviewData(basic, triggers, props);
      console.log('Transformed component preview:', componentPreview);
      setPreviewData(componentPreview);
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
      const propsArray = await db.eventProps.where('xref_id').equals(xref_id).toArray();
      const props = {};
      propsArray.forEach(p => {
        try { props[p.paramName] = JSON.parse(p.paramVal); }
        catch { props[p.paramName] = p.paramVal; }
      });

      // Ensure columns is actually an array
      if (props.columns && Array.isArray(props.columns)) {
        return props.columns;
      }

      return null;
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
      await upsertPropByName(xref_id, 'columns', fields);
      console.log('✅ columns marked with _dmlMethod in IndexedDB');

      await loadComponentData(xref_id);
      console.log('✅ Component data reloaded');

      return { success: true, count: fields.length };

    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  };

  const handleAddDeleteAction = async () => {
    const xref_id = selectedComponent?.xref_id;

    if (!xref_id) {
      alert('No component selected');
      return;
    }

    try {
      const props = JSON.parse(editedProps);
      const rowActions = props.rowActions || [];

      // Check if delete action already exists
      if (rowActions.some(a => a.id === 'delete')) {
        alert('Delete action already exists');
        return;
      }

      // Add delete action to rowActions array
      const deleteAction = {
        id: 'delete',
        type: 'button',
        icon: 'Delete',
        color: 'error',
        tooltip: 'Delete',
        trigger: {
          action: 'execDML',
          content: {
            method: 'DELETE',
            confirm: true,
            confirmMessage: 'Are you sure you want to delete this item?'
          }
        }
      };

      rowActions.push(deleteAction);
      props.rowActions = rowActions;

      // Update props
      setEditedProps(JSON.stringify(props, null, 2));

      // Save to IndexedDB
      await upsertPropByName(xref_id, 'rowActions', rowActions);

      console.log('✅ Delete action added to rowActions');
      setHasChanges(true);

    } catch (error) {
      console.error('❌ Failed to add delete action:', error);
      alert('Failed to add delete action: ' + error.message);
    }
  };

  const handleRemoveRowAction = async (index) => {
    const xref_id = selectedComponent?.xref_id;

    if (!xref_id) {
      return;
    }

    try {
      const props = JSON.parse(editedProps);
      const rowActions = props.rowActions || [];

      rowActions.splice(index, 1);
      props.rowActions = rowActions;

      // Update props
      setEditedProps(JSON.stringify(props, null, 2));

      // Save to IndexedDB
      await upsertPropByName(xref_id, 'rowActions', rowActions);

      console.log('✅ Row action removed');
      setHasChanges(true);

    } catch (error) {
      console.error('❌ Failed to remove row action:', error);
      alert('Failed to remove row action: ' + error.message);
    }
  };

  if (!selectedComponent && !isCreating) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>🎯</div>
        <div style={styles.emptyText}>Select a component to edit</div>
        <button
          style={styles.newButton}
          onClick={handleNewComponent}
          disabled={!pageID}
        >
          + New Component
        </button>
        {!pageID && (
          <div style={styles.hint}>Select a page first</div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        {isCreating ? (
          <>
            <h3 style={styles.title}>New Component</h3>
            <button style={styles.cancelButton} onClick={handleCancelCreate}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <h3 style={styles.title}>{selectedComponent.label}</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={styles.badgeLarge}>{selectedComponent.comp_type}</span>
              <button style={styles.newButtonSmall} onClick={handleNewComponent} disabled={!pageID}>
                + New
              </button>
            </div>
          </>
        )}
      </div>

      <div style={styles.tabs}>
        <button
          style={activeTab === 'component' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('component')}
        >
          Component
        </button>
        {!isCreating && (selectedComponent?.comp_type === 'Grid' || selectedComponent?.comp_type === 'Form') && (
          <button
            style={activeTab === 'query' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('query')}
          >
            Query
          </button>
        )}
        {!isCreating && (
          <>
            <button
              style={activeTab === 'props' ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab('props')}
            >
              Props
            </button>
            <button
              style={activeTab === 'triggers' ? styles.tabActive : styles.tab}
              onClick={() => setShowTriggersModal(true)}
            >
              Triggers
            </button>
            <button
              style={activeTab === 'preview' ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab('preview')}
            >
              Event Preview
            </button>
          </>
        )}
      </div>

      <div style={styles.content}>
        {activeTab === 'component' && (
          <div style={styles.tabContent}>
            <div style={{display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
              {!isCreating && (
                <div style={{...styles.field, flex: '0 0 60px'}}>
                  <label style={styles.label}>ID</label>
                  <input
                    type="text"
                    value={selectedComponent?.xref_id || ''}
                    disabled
                    style={{...styles.inputDisabled, fontSize: '12px', padding: '6px 8px', textAlign: 'center'}}
                  />
                </div>
              )}
              <div style={{...styles.field, flex: 1}}>
                <label style={styles.label}>Component Name</label>
                <input
                  type="text"
                  value={editedCompName}
                  onChange={handleCompNameChange}
                  placeholder="Component name (e.g., ingrTypeGrid)"
                  style={styles.input}
                />
              </div>
              <div style={{...styles.field, flex: '0 0 140px'}}>
                <label style={styles.label}>Position Order</label>
                <input
                  type="text"
                  value={editedPosOrder}
                  onChange={handlePosOrderChange}
                  placeholder="row,col,width"
                  style={styles.input}
                />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Title</label>
              <input
                type="text"
                value={editedTitle}
                onChange={handleTitleChange}
                placeholder="Display title"
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                value={editedDescription}
                onChange={handleDescriptionChange}
                placeholder="Component description (optional)"
                style={{...styles.input, minHeight: '60px', resize: 'vertical'}}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Type</label>
              <select
                value={editedType}
                onChange={handleTypeChange}
                style={styles.input}
              >
                <option value="">Select type...</option>
                {eventTypes.map((type) => (
                  <option key={type.name} value={type.name}>
                    {type.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Parent Component</label>
              <select
                value={editedParentId}
                onChange={handleParentIdChange}
                style={styles.input}
              >
                <option value="">None (top-level)</option>
                {availableParents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.comp_name || parent.title} ({parent.comp_type})
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

                    {selectedComponent.comp_type === 'Grid' && (
                      <div style={styles.actionSection}>
                        <h4 style={styles.actionTitle}>⚡ Row Actions</h4>
                        {(() => {
                          const props = JSON.parse(editedProps);
                          const rowActions = props.rowActions || [];

                          return (
                            <>
                              {rowActions.length > 0 ? (
                                <div style={styles.actionList}>
                                  <div style={styles.actionLabel}>Current Actions:</div>
                                  {rowActions.map((action, idx) => (
                                    <div key={idx} style={styles.actionItem}>
                                      <span style={styles.actionItemText}>
                                        {action.icon || '🔘'} {action.tooltip || action.id} ({action.trigger?.action || 'unknown'})
                                      </span>
                                      <button
                                        style={styles.actionRemove}
                                        onClick={() => handleRemoveRowAction(idx)}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p style={styles.actionHint}>No row actions configured</p>
                              )}

                              <button
                                style={styles.actionButton}
                                onClick={handleAddDeleteAction}
                              >
                                + Add Delete Action
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    )}

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

        {showTriggersModal && (() => {
          console.log('🔍 Triggers Modal - selectedComponent:', selectedComponent);
          return (
          <div style={styles.modalOverlay} onClick={() => setShowTriggersModal(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  Triggers - {(() => {
                    const name = editedCompName || selectedComponent?.comp_name || selectedComponent?.label || 'Unknown';
                    const title = editedTitle || selectedComponent?.title;
                    return title && title !== name ? `${name} (${title})` : name;
                  })()}
                </h2>
                <button
                  style={styles.modalClose}
                  onClick={() => setShowTriggersModal(false)}
                >
                  ✕
                </button>
              </div>
              <div style={styles.modalBody}>
                <TriggerBuilder component={selectedComponent} />
              </div>
            </div>
          </div>
          );
        })()}

        {activeTab === 'preview' && (
          <div style={styles.tabContent}>
            <div style={styles.previewSection}>
              <h4 style={styles.previewSectionTitle}>📋 PageConfig Component Format</h4>
              {previewData ? (
                <>
                  <pre style={styles.previewJsonBlock}>
                    {JSON.stringify(previewData, null, 2)}
                  </pre>
                  <div style={styles.previewHint}>
                    This component format matches genPageConfig output and can be used directly in pageConfig.json
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
        {isCreating ? (
          <button
            style={styles.saveButton}
            onClick={handleCreateSave}
          >
            ✨ Create Component
          </button>
        ) : (
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
        )}
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
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '90vw',
    maxWidth: '1400px',
    height: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
  },
  modalClose: {
    padding: '8px 12px',
    fontSize: '18px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: '#64748b',
    borderRadius: '4px',
  },
  modalBody: {
    flex: 1,
    overflow: 'auto',
    padding: '0',
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
  actionSection: {
    margin: '16px 0',
    padding: '16px',
    backgroundColor: '#fef3c7',
    border: '1px solid #fbbf24',
    borderRadius: '8px',
  },
  actionTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#92400e',
  },
  actionHint: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#78350f',
  },
  actionButton: {
    width: '100%',
    padding: '10px 16px',
    backgroundColor: '#f59e0b',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '12px',
  },
  actionInfo: {
    fontSize: '12px',
    color: '#78350f',
    lineHeight: '1.6',
  },
  actionList: {
    marginBottom: '12px',
  },
  actionLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#78350f',
    marginBottom: '8px',
  },
  actionItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#ffffff',
    border: '1px solid #fbbf24',
    borderRadius: '4px',
    marginBottom: '6px',
  },
  actionItemText: {
    fontSize: '13px',
    color: '#78350f',
  },
  actionRemove: {
    padding: '2px 8px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    lineHeight: 1,
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
  newButton: {
    marginTop: '24px',
    padding: '12px 24px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  newButtonSmall: {
    padding: '6px 12px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '6px 16px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  hint: {
    marginTop: '12px',
    fontSize: '13px',
    color: '#94a3b8',
  },
};

export default ComponentPropertiesPanel;
