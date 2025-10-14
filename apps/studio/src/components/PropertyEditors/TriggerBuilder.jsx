import React, { useState, useEffect } from 'react';
import { db } from '../../db/studioDb';

const TriggerBuilder = ({ component }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [actions, setActions] = useState([]);
  const [availableTriggers, setAvailableTriggers] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [workflowPreview, setWorkflowPreview] = useState({});
  const [showClassDropdown, setShowClassDropdown] = useState(false);

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
    const triggers = await db.eventTriggers
      .where('xref_id').equals(component.xref_id)
      .toArray();

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

    // Create first empty action for new class
    await db.eventTriggers.add({
      id: null,
      xref_id: component.xref_id,
      class: className,
      action: '',
      ordr: 1,
      content: '{}',
      _dmlMethod: 'INSERT'
    });

    await loadTriggers();
    setShowClassDropdown(false);
    setSelectedClass(className);
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

  if (!component) {
    return <div style={styles.empty}>Select a component to edit triggers</div>;
  }

  return (
    <div style={styles.container}>
      {/* Class Grid */}
      <div style={styles.section}>
        <div style={styles.header}>
          <h3 style={styles.sectionTitle}>Classes</h3>
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
            <button style={styles.addButton}>+ Add Action</button>
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
                  <button style={styles.iconButton}>✎</button>
                  <button style={styles.iconButton}>×</button>
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
