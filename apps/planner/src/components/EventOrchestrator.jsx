/**
 * Event Orchestrator - Connects user interactions to WorkflowEngine
 * Renders eventTypes and handles user actions via workflow triggers
 */

import React, { useEffect, useState } from 'react';
import { useContextStore } from '@whatsfresh/shared-imports';
import { workflowEngine } from '../../../../packages/shared-imports/src/workflows/WorkflowEngine.js';
import PageRenderer from './PageRenderer.jsx';

const EventOrchestrator = ({ eventTypes, primaryEventType }) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const contextStore = useContextStore();

  useEffect(() => {
    console.log('🔧 EventOrchestrator initializing with', eventTypes.length, 'eventTypes');
    workflowEngine.initialize(contextStore);
    workflowEngine.registerEventTypes(eventTypes);
    console.log('✅ EventTypes registered:', eventTypes.map(et => et.name || et.eventType));

    // Set default planStatus if not already set
    if (!contextStore.getVal('planStatus')) {
      contextStore.setVal('planStatus', 'pending');
    }
  }, [eventTypes, contextStore]);

  useEffect(() => {
    const loadInitialData = async () => {
      console.log('🔍 All eventTypes:', eventTypes.map(et => ({ name: et.name || et.eventType, entryPoint: et.config?.entryPoint, hasOnLoad: !!et.config?.workflowTriggers?.onLoad })));

      const dataPromises = eventTypes
        .filter(et => et.config?.entryPoint && et.config?.workflowTriggers?.onLoad)
        .map(async et => {
          console.log('📥 Loading data for:', et.name);
          try {
            // Use workflow triggers instead of direct execEvent
            const result = await workflowEngine.executeTrigger({ ...et.config, name: et.name }, 'onLoad');
            console.log('📥 Result for', et.name, ':', result);
            return { eventType: et.name, data: result };
          } catch (error) {
            console.error(`Failed to load data for ${et.name}:`, error);
            return { eventType: et.name, data: null };
          }
        });

      const results = await Promise.all(dataPromises);
      const dataMap = {};

      results.forEach(({ eventType, data }) => {
        dataMap[eventType] = data;
      });

      console.log('📊 Final dataMap:', dataMap);
      setData(dataMap);
      setLoading(false);
    };

    loadInitialData();
  }, [eventTypes]);

  const handleRowClick = async (eventType, rowData) => {
    try {
      console.log(`🖱️ Row clicked in ${eventType.name}:`, rowData);
      await workflowEngine.executeTrigger(eventType, 'onRowSelect', rowData);
    } catch (error) {
      console.error('Row click workflow failed:', error);
    }
  };

  const handleSelectionChange = async (eventType, selectedValue) => {
    try {
      console.log(`🔄 EventOrchestrator received selection change in ${eventType.name}:`, selectedValue);
      console.log(`🔄 Executing workflow triggers:`, eventType.config?.workflowTriggers?.onSelectionChange);
      await workflowEngine.executeTrigger({ ...eventType.config, eventType: eventType.name, name: eventType.name }, 'onSelectionChange', selectedValue);
    } catch (error) {
      console.error('Selection change workflow failed:', error);
    }
  };

  if (loading) return <div>Loading eventTypes...</div>;

  // Sort eventTypes: entryPoint controls first, then page, then others
  const sortedEventTypes = [...eventTypes].sort((a, b) => {
    if (a.config?.entryPoint && !b.config?.entryPoint) return -1;
    if (!a.config?.entryPoint && b.config?.entryPoint) return 1;
    if (a.config?.category === 'page' && b.config?.category !== 'page') return -1;
    if (a.config?.category !== 'page' && b.config?.category === 'page') return 1;
    return 0;
  });

  return (
    <div>
      {sortedEventTypes.map((eventType, index) => (
        <PageRenderer
          key={eventType.name || index}
          eventType={{ ...eventType.config, name: eventType.name }}
          data={data[eventType.name]}
          onRowClick={(rowData) => handleRowClick(eventType, rowData)}
          onSelectionChange={(selectedValue) => handleSelectionChange(eventType, selectedValue)}
        />
      ))}
    </div>
  );
};


export default EventOrchestrator;