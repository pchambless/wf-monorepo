# IndexedDB Usage Examples

## 1. React Flow State Persistence

### Basic Usage in PageFlowCanvas

```javascript
import React, { useState, useEffect } from 'react';
import ReactFlow, { useNodesState, useEdgesState } from 'reactflow';
import { useReactFlowPersistence } from '../hooks/useReactFlowPersistence';

const PageFlowCanvas = ({ pageConfig }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });

  const canvasId = `page-${pageConfig?.pageID || 'default'}`;
  const { loadState, getHistory, restoreSnapshot } = useReactFlowPersistence(
    canvasId,
    nodes,
    edges,
    viewport
  );

  // Load saved state on mount
  useEffect(() => {
    const initializeCanvas = async () => {
      const savedState = await loadState();
      if (savedState) {
        setNodes(savedState.nodes);
        setEdges(savedState.edges);
        setViewport(savedState.viewport);
        console.log('✅ Canvas state restored from IndexedDB');
      } else {
        // Initialize from pageConfig
        const initialNodes = buildNodesFromConfig(pageConfig);
        setNodes(initialNodes);
      }
    };

    initializeCanvas();
  }, [pageConfig?.pageID]);

  // Auto-saves on changes (debounced to 1 second)
  // Handled automatically by the hook

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onMove={(_, viewport) => setViewport(viewport)}
      fitView
    />
  );
};
```

### Undo/Redo with History

```javascript
const UndoRedoControls = ({ canvasId }) => {
  const [history, setHistory] = useState([]);
  const { getHistory, restoreSnapshot } = useReactFlowPersistence(canvasId);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const snapshots = await getHistory(20);
    setHistory(snapshots);
  };

  const handleUndo = async () => {
    if (history.length < 2) return;
    const previousSnapshot = history[1]; // [0] is current, [1] is previous
    const restored = await restoreSnapshot(previousSnapshot.id);
    if (restored) {
      // Apply restored state to your React Flow instance
      console.log('✅ Undo applied');
    }
  };

  return (
    <button onClick={handleUndo} disabled={history.length < 2}>
      Undo
    </button>
  );
};
```

## 2. Component Xref Sync Workflow

### Queue Changes as User Edits

```javascript
import { updateComponentXref, createComponentXref } from '../utils/syncWorkflow';

const ComponentPropertiesPanel = ({ selectedComponent, onSave }) => {
  const [properties, setProperties] = useState({});

  const handlePropertyChange = async (key, value) => {
    setProperties(prev => ({ ...prev, [key]: value }));

    // Queue change in IndexedDB (not MySQL yet)
    await updateComponentXref(
      selectedComponent.eventID,
      selectedComponent.compID,
      { [key]: value }
    );

    console.log('✅ Change queued locally');
  };

  return (
    <div>
      <input
        value={properties.label || ''}
        onChange={(e) => handlePropertyChange('label', e.target.value)}
      />
      {/* Changes are queued but not synced to MySQL */}
    </div>
  );
};
```

### Sync All Changes with "Save" Button

```javascript
import { syncToMySQL, getPendingSummary } from '../utils/syncWorkflow';

const StudioToolbar = () => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const checkPending = async () => {
      const summary = await getPendingSummary();
      setPendingCount(summary.total);
    };

    checkPending();
    const interval = setInterval(checkPending, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = async () => {
    const result = await syncToMySQL();

    if (result.failed > 0) {
      alert(`Sync had errors: ${result.failed} failed`);
      console.error(result.errors);
    } else {
      console.log(`✅ Synced ${result.success} changes to MySQL`);
    }
  };

  return (
    <div>
      <span>{pendingCount} pending changes</span>
      <button onClick={handleSave} disabled={pendingCount === 0}>
        Save to MySQL
      </button>
    </div>
  );
};
```

### Batch Xref Updates

```javascript
import { queueChange } from '../utils/syncWorkflow';

const handleDragDrop = async (draggedComponent, newParent) => {
  // Queue multiple changes at once
  await queueChange('api_wf.eventComp_xref', 'UPDATE', {
    eventID: draggedComponent.eventID,
    compID: draggedComponent.compID,
    parentCompID: newParent.compID,
    sequence: newParent.children.length + 1
  });

  // User can keep dragging, all changes queued locally
  // Sync to MySQL only when they click "Save"
};
```

## 3. Component Metadata Cache

### Cache Frequently Accessed Components

```javascript
import { db } from '../db/studioDb';

const fetchComponentWithCache = async (componentId) => {
  // Check cache first
  const cached = await db.componentCache.get(componentId);

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  if (cached && (Date.now() - cached.lastFetched < CACHE_DURATION)) {
    console.log('✅ Using cached component metadata');
    return JSON.parse(cached.metadata);
  }

  // Cache miss or expired - fetch from MySQL
  const response = await fetch(`http://localhost:3001/api/components/${componentId}`);
  const data = await response.json();

  // Update cache
  await db.componentCache.put({
    componentId,
    metadata: JSON.stringify(data),
    lastFetched: Date.now()
  });

  console.log('✅ Component cached');
  return data;
};
```

## 4. Layout Drafts

### Save Draft Layouts Before Generating pageConfig

```javascript
import { db } from '../db/studioDb';

const saveLayoutDraft = async (pageId, layoutData) => {
  await db.layoutDrafts.add({
    pageId,
    layout: JSON.stringify(layoutData),
    timestamp: Date.now()
  });

  console.log('✅ Layout draft saved');
};

const loadLatestDraft = async (pageId) => {
  const drafts = await db.layoutDrafts
    .where('pageId')
    .equals(pageId)
    .reverse()
    .sortBy('timestamp');

  if (drafts.length > 0) {
    return JSON.parse(drafts[0].layout);
  }

  return null;
};

// Usage in Studio
const StudioCanvasWrapper = ({ pageId }) => {
  useEffect(() => {
    const loadDraft = async () => {
      const draft = await loadLatestDraft(pageId);
      if (draft && window.confirm('Restore unsaved draft?')) {
        applyLayout(draft);
      }
    };

    loadDraft();
  }, [pageId]);
};
```

## 5. Integration with StudioLayout

### Add SyncControls to Studio Header

```javascript
// components/StudioLayout.jsx
import SyncControls from './SyncControls';

const StudioLayout = () => {
  return (
    <div style={styles.layout}>
      <div style={styles.header}>
        <h1>Studio</h1>
        <SyncControls />
      </div>
      <div style={styles.content}>
        <StudioCanvasWrapper />
      </div>
    </div>
  );
};
```

## Benefits Summary

1. **Offline Editing**: Users can work without constant MySQL writes
2. **Undo/Redo**: Full canvas history in IndexedDB
3. **Performance**: Cache reduces redundant MySQL queries
4. **Batch Operations**: Queue many changes, sync once
5. **Draft Safety**: Auto-save drafts prevent data loss
6. **Debugging**: View all queued changes in `/db-browser`

## Workflow Pattern

```
User Action → IndexedDB (instant) → User clicks "Save" → MySQL (batch sync)
          ↓
    Auto-persist canvas state
          ↓
    View in /db-browser
```
