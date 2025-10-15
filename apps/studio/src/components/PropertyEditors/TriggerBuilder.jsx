import React, { useState, useEffect } from 'react';
import { db } from '../../db/studioDb';
import ParamEditor from './ParamEditor';
import { execDml } from '@whatsfresh/shared-imports';

const TriggerBuilder = ({ component }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [actions, setActions] = useState([]);
  const [availableTriggers, setAvailableTriggers] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [workflowPreview, setWorkflowPreview] = useState({});
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [editingAction, setEditingAction] = useState(null);

  useEffect(() => {
    loadAvailableTriggers();
    if (component?.xref_id) {
      loadTriggers();
    }
  }, [component?.xref_id]);

  const loadAvailableTriggers = async () => {
    const actionTriggers = await db.triggers
      .where('trigType').equals('action')
      .toArray();
    const classTriggers = await db.triggers
      .where('trigType').equals('class')
      .toArray();

    setAvailableTriggers(actionTriggers);
    setAvailableClasses(classTriggers);
  };

  const loadTriggers = async () => {
    const allTriggers = await db.eventTriggers
      .where('xref_id').equals(component.xref_id)
      .toArray();

    // Filter out deleted items
    const triggers = allTriggers.filter(t => t._dmlMethod !== 'DELETE' && !t.deleted_at);

    // Group by class
    const grouped = {};
    triggers.forEach(t => {
      if (!grouped[t.class]) grouped[t.class] = [];
      grouped[t.class].push(t);
    });

    // Sort by ordr within each class
    Object.keys(grouped).forEach(cls => {
      grouped[cls].sort((a, b) => (a.ordr || 0) - (b.ordr || 0));
    });

    setClasses(Object.keys(grouped));
    buildWorkflowPreview(grouped);
  };

  const buildWorkflowPreview = (grouped) => {
    const workflow = {};
    Object.keys(grouped).forEach(cls => {
      workflow[cls] = grouped[cls].map(t => {
        let params = {};
        try {
          params = JSON.parse(t.content || '{}');
        } catch (e) {
          // If content is not valid JSON, use raw string
          params = t.content || {};
        }
        return {
          action: t.action,
          params
        };
      });
    });
    setWorkflowPreview(workflow);
  };

  const handleAddClass = async (className) => {
    if (!className) return;

    // Just add to classes list and select it (no trigger created yet)
    if (!classes.includes(className)) {
      setClasses([...classes, className]);
    }

    setShowClassDropdown(false);
    setSelectedClass(className);
    setActions([]); // Empty actions for new class
  };

  const handleSelectClass = async (className) => {
    setSelectedClass(className);
    const classActions = await db.eventTriggers
      .where('xref_id').equals(component.xref_id)
      .filter(t => t.class === className)
      .toArray();

    classActions.sort((a, b) => (a.ordr || 0) - (b.ordr || 0));
    setActions(classActions);
  };

  const handleAddAction = async (actionName) => {
    if (!selectedClass || !actionName) return;

    const maxOrder = actions.length > 0
      ? Math.max(...actions.map(a => a.ordr || 0))
      : 0;

    const newTrigger = {
      xref_id: component.xref_id,
      class: selectedClass,
      action: actionName,
      ordr: maxOrder + 1,
      content: '{}'
    };

    try {
      console.log('🔨 Adding trigger to MySQL:', newTrigger);

      // Save to MySQL first
      const response = await execDml('INSERT', {
        method: 'INSERT',
        table: 'api_wf.eventTrigger',
        data: newTrigger
      });

      console.log('✅ MySQL INSERT response:', response);

      // Then save to IndexedDB with MySQL id
      await db.eventTriggers.add({
        ...newTrigger,
        id: response.insertId
      });

      console.log('✅ Saved to IndexedDB with id:', response.insertId);

      await loadTriggers();
      await handleSelectClass(selectedClass);
      setShowActionDropdown(false);
    } catch (error) {
      console.error('❌ Add action failed:', error);
      alert(`❌ Failed to add action: ${error.message}`);
    }
  };

  const handleEditAction = (action) => {
    setEditingAction(action);
  };

  const handleSaveParams = async (newContent) => {
    if (!editingAction) return;

    try {
      // Check if record exists in MySQL
      if (!editingAction.id) {
        throw new Error('Cannot update trigger: Missing MySQL id. Record may not exist in database yet.');
      }

      // Save to MySQL
      await execDml('UPDATE', {
        method: 'UPDATE',
        table: 'api_wf.eventTrigger',
        data: { content: newContent },
        primaryKey: { id: editingAction.id }
      });

      // Update IndexedDB
      await db.eventTriggers.update(editingAction.idbID, {
        content: newContent
      });

      await loadTriggers();
      await handleSelectClass(selectedClass);
      setEditingAction(null);
    } catch (error) {
      console.error('Save params error:', error);
      alert(`❌ Failed to save params: ${error.message}`);
    }
  };

  const handleDeleteAction = async (action) => {
    if (!confirm(`Delete action "${action.action}"?`)) return;

    try {
      // Delete from MySQL
      await execDml('DELETE', {
        method: 'DELETE',
        table: 'api_wf.eventTrigger',
        primaryKey: { id: action.id }
      });

      // Delete from IndexedDB
      await db.eventTriggers.delete(action.idbID);

      await loadTriggers();
      await handleSelectClass(selectedClass);
    } catch (error) {
      alert(`❌ Failed to delete action: ${error.message}`);
    }
  };

  const handleClearBadTriggers = async () => {
    if (!confirm('Delete all triggers for this component from IndexedDB? This will help reset corrupted data.')) return;

    try {
      // Delete all triggers for this component from IndexedDB
      const triggersToDelete = await db.eventTriggers
        .where('xref_id').equals(component.xref_id)
        .toArray();

      for (const trigger of triggersToDelete) {
        await db.eventTriggers.delete(trigger.idbID);
      }

      alert(`✅ Cleared ${triggersToDelete.length} triggers from IndexedDB`);

      await loadTriggers();
      setSelectedClass(null);
      setActions([]);
    } catch (error) {
      alert(`❌ Failed to clear triggers: ${error.message}`);
    }
  };

  const handleMoveAction = async (action, direction) => {
    const currentIndex = actions.findIndex(a => a.idbID === action.idbID);
    if (currentIndex === -1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= actions.length) return;

    const swapAction = actions[swapIndex];

    try {
      // Update both in MySQL
      await execDml('UPDATE', {
        method: 'UPDATE',
        table: 'api_wf.eventTrigger',
        data: { ordr: swapAction.ordr },
        primaryKey: { id: action.id }
      });

      await execDml('UPDATE', {
        method: 'UPDATE',
        table: 'api_wf.eventTrigger',
        data: { ordr: action.ordr },
        primaryKey: { id: swapAction.id }
      });

      // Update IndexedDB
      await db.eventTriggers.update(action.idbID, {
        ordr: swapAction.ordr
      });

      await db.eventTriggers.update(swapAction.idbID, {
        ordr: action.ordr
      });

      await loadTriggers();
      await handleSelectClass(selectedClass);
    } catch (error) {
      alert(`❌ Failed to reorder actions: ${error.message}`);
    }
  };

  if (!component) {
    return <div style={styles.empty}>Select a component to edit triggers</div>;
  }

  return (
    <div style={styles.container}>
      {/* Class Grid */}
      <div style={styles.section}>
        <div style={styles.header}>
          <h3 style={styles.sectionTitle}>Classes</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleClearBadTriggers} style={{...styles.addButton, backgroundColor: '#ef4444'}}>
              🗑️ Clear All Triggers
            </button>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowClassDropdown(!showClassDropdown)} style={styles.addButton}>
                + Add Class
              </button>
              {showClassDropdown && (
                <div style={styles.dropdown}>
                  {availableClasses
                    .filter(c => !classes.includes(c.name))
                    .map(cls => (
                      <div
                        key={cls.id}
                        onClick={() => handleAddClass(cls.name)}
                        style={styles.dropdownItem}
                        title={cls.description}
                      >
                        <span style={styles.dropdownName}>{cls.name}</span>
                        {cls.is_dom_event === 1 && <span style={styles.domBadge}>DOM</span>}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={styles.classGrid}>
          {classes.map(cls => (
            <div
              key={cls}
              onClick={() => handleSelectClass(cls)}
              style={{
                ...styles.classRow,
                ...(selectedClass === cls ? styles.classRowSelected : {})
              }}
            >
              <span style={styles.className}>{cls}</span>
              <span style={styles.actionCount}>
                {workflowPreview[cls]?.length || 0} actions
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Builder - shown when class selected */}
      {selectedClass && (
        <div style={styles.section}>
          <div style={styles.header}>
            <h3 style={styles.sectionTitle}>Actions for: {selectedClass}</h3>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowActionDropdown(!showActionDropdown)} style={styles.addButton}>
                + Add Action
              </button>
              {showActionDropdown && (
                <div style={styles.dropdown}>
                  {availableTriggers.map(trigger => (
                    <div
                      key={trigger.id}
                      onClick={() => handleAddAction(trigger.name)}
                      style={styles.dropdownItem}
                      title={trigger.description}
                    >
                      <span style={styles.dropdownName}>{trigger.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={styles.actionGrid}>
            <div style={styles.actionHeader}>
              <span style={styles.colOrdr}>Order</span>
              <span style={styles.colAction}>Action</span>
              <span style={styles.colParams}>Params</span>
              <span style={styles.colControls}></span>
            </div>
            {actions.map(action => (
              <div key={action.idbID} style={styles.actionRow}>
                <span style={styles.colOrdr}>{action.ordr}</span>
                <span style={styles.colAction}>{action.action}</span>
                <span style={styles.colParams}>
                  {(() => {
                    try {
                      return action.content ? JSON.stringify(JSON.parse(action.content), null, 0).substring(0, 40) + '...' : '{}';
                    } catch (e) {
                      return action.content ? String(action.content).substring(0, 40) + '...' : '{}';
                    }
                  })()}
                </span>
                <span style={styles.colControls}>
                  <button
                    onClick={() => handleMoveAction(action, 'up')}
                    style={styles.iconButton}
                    disabled={actions.indexOf(action) === 0}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveAction(action, 'down')}
                    style={styles.iconButton}
                    disabled={actions.indexOf(action) === actions.length - 1}
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button onClick={() => handleEditAction(action)} style={styles.iconButton} title="Edit">✎</button>
                  <button onClick={() => handleDeleteAction(action)} style={styles.iconButton} title="Delete">×</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WorkflowTriggers Preview */}
      {Object.keys(workflowPreview).length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>WorkflowTriggers Preview</h3>
          <pre style={styles.preview}>
{`{
  "workflowTriggers": {
${Object.entries(workflowPreview).map(([cls, acts]) =>
  `    "${cls}": [\n` +
  acts.map(a => `      { "action": "${a.action}", "params": ${JSON.stringify(a.params)} }`).join(',\n') +
  '\n    ]'
).join(',\n')}
  }
}`}
          </pre>
        </div>
      )}

      {/* Param Editor Modal */}
      {editingAction && (
        <div style={styles.modalOverlay} onClick={() => setEditingAction(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <ParamEditor
              action={editingAction.action}
              currentParams={editingAction.content}
              onSave={handleSaveParams}
              onCancel={() => setEditingAction(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
  },
  section: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
  },
  addButton: {
    padding: '6px 12px',
    fontSize: '13px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  classGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  classRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  classRowSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  className: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1e293b',
  },
  actionCount: {
    fontSize: '13px',
    color: '#64748b',
  },
  actionGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  actionHeader: {
    display: 'grid',
    gridTemplateColumns: '60px 1fr 2fr 80px',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#475569',
  },
  actionRow: {
    display: 'grid',
    gridTemplateColumns: '60px 1fr 2fr 80px',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '13px',
    alignItems: 'center',
  },
  colOrdr: {},
  colAction: {},
  colParams: {
    fontSize: '12px',
    color: '#64748b',
    fontFamily: 'monospace',
  },
  colControls: {
    display: 'flex',
    gap: '4px',
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
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  iconButton: {
    padding: '4px 8px',
    fontSize: '14px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  preview: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    padding: '12px',
    fontSize: '12px',
    fontFamily: 'monospace',
    overflow: 'auto',
    maxHeight: '300px',
  },
  empty: {
    padding: '32px',
    textAlign: 'center',
    color: '#94a3b8',
  },
  saveButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '16px',
  },
  saveButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    minWidth: '200px',
    zIndex: 10,
  },
  dropdownItem: {
    padding: '10px 14px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s',
  },
  dropdownName: {
    fontSize: '14px',
    color: '#1e293b',
  },
  domBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '4px',
    fontWeight: 600,
  },
};

export default TriggerBuilder;
