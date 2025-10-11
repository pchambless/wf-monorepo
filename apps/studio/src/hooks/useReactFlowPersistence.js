import { useEffect, useCallback, useRef } from 'react';
import { db } from '../db/studioDb';

export const useReactFlowPersistence = (canvasId, nodes, edges, viewport) => {
  const saveTimeoutRef = useRef(null);
  const lastSaveRef = useRef(null);

  const saveState = useCallback(async () => {
    if (!canvasId) return;

    const currentState = {
      canvasId,
      nodes,
      edges,
      viewport,
      timestamp: Date.now()
    };

    const stateString = JSON.stringify(currentState);
    if (stateString === lastSaveRef.current) {
      return;
    }

    try {
      await db.reactFlowState.add(currentState);
      lastSaveRef.current = stateString;
      console.log('✅ Canvas state saved to IndexedDB');
    } catch (error) {
      console.error('❌ Failed to save canvas state:', error);
    }
  }, [canvasId, nodes, edges, viewport]);

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveState();
    }, 1000);
  }, [saveState]);

  useEffect(() => {
    debouncedSave();
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, viewport, debouncedSave]);

  const loadState = useCallback(async () => {
    if (!canvasId) return null;

    try {
      const states = await db.reactFlowState
        .where('canvasId')
        .equals(canvasId)
        .reverse()
        .sortBy('timestamp');

      if (states.length > 0) {
        const latestState = states[0];
        console.log('✅ Canvas state loaded from IndexedDB');
        return {
          nodes: latestState.nodes,
          edges: latestState.edges,
          viewport: latestState.viewport
        };
      }
    } catch (error) {
      console.error('❌ Failed to load canvas state:', error);
    }
    return null;
  }, [canvasId]);

  const getHistory = useCallback(async (limit = 10) => {
    if (!canvasId) return [];

    try {
      const states = await db.reactFlowState
        .where('canvasId')
        .equals(canvasId)
        .reverse()
        .sortBy('timestamp');

      return states.slice(0, limit);
    } catch (error) {
      console.error('❌ Failed to get canvas history:', error);
      return [];
    }
  }, [canvasId]);

  const restoreSnapshot = useCallback(async (snapshotId) => {
    try {
      const snapshot = await db.reactFlowState.get(snapshotId);
      if (snapshot) {
        console.log('✅ Canvas snapshot restored');
        return {
          nodes: snapshot.nodes,
          edges: snapshot.edges,
          viewport: snapshot.viewport
        };
      }
    } catch (error) {
      console.error('❌ Failed to restore snapshot:', error);
    }
    return null;
  }, []);

  return {
    saveState,
    loadState,
    getHistory,
    restoreSnapshot
  };
};
