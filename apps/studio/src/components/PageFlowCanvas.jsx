import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { execEvent, setVals } from '@whatsfresh/shared-imports';

import GridNode from './FlowNodes/GridNode';
import FormNode from './FlowNodes/FormNode';
import ContainerNode from './FlowNodes/ContainerNode';
import PageNode from './FlowNodes/PageNode';
import DefaultNode from './FlowNodes/DefaultNode';
import { pageConfigToFlow } from '../utils/pageConfigToFlow';

const nodeTypes = {
  app: PageNode,
  crud: PageNode,      // CRUD template uses PageNode
  grid: GridNode,
  form: FormNode,
  container: ContainerNode,
  page: PageNode,
  button: DefaultNode,
  select: DefaultNode,
  default: DefaultNode,
};

const PageFlowCanvas = ({ pageConfig, onNodeSelect }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [appName, setAppName] = useState('');

  useEffect(() => {
    if (pageConfig) {
      const { nodes: flowNodes, edges: flowEdges, appInfo } = pageConfigToFlow(pageConfig);

      const enhancedEdges = flowEdges.map(edge => ({
        ...edge,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        style: { strokeWidth: 2, stroke: '#94a3b8' },
      }));

      setNodes(flowNodes);
      setEdges(enhancedEdges);
      setAppName(appInfo?.title || '');
    }
  }, [pageConfig, setNodes, setEdges]);

  const onNodeClick = useCallback(
    async (event, node) => {
      if (!onNodeSelect) return;

      const xref_id = node.data.xref_id;

      try {
        // Set xrefID in context
        await setVals([{ paramName: 'xrefID', paramVal: xref_id }]);

        // Fetch props and triggers in parallel
        const [propsResult, triggersResult] = await Promise.all([
          execEvent('xrefPropList', { xrefID: xref_id }),
          execEvent('xrefTriggerList', { xrefID: xref_id })
        ]);

        // Transform props array to object
        const propsObj = {};
        if (propsResult.data) {
          propsResult.data.forEach(prop => {
            propsObj[prop.paramName] = prop.paramVal;
          });
        }

        onNodeSelect({
          xref_id,
          comp_type: node.data.comp_type,
          label: node.data.label,
          container: node.data.container,
          eventProps: propsObj,
          triggers: triggersResult.data || [],
        });
      } catch (error) {
        console.error('Failed to fetch node details:', error);
        // Still show basic info even if fetch fails
        onNodeSelect({
          xref_id,
          comp_type: node.data.comp_type,
          label: node.data.label,
          container: node.data.container,
          eventProps: {},
          triggers: [],
        });
      }
    },
    [onNodeSelect]
  );

  const onNodeDragStop = useCallback(
    (event, node) => {
      console.log('Node dragged:', node.id, 'to position:', node.position);
    },
    []
  );

  return (
    <div style={{ width: '100%' }}>
      {appName && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f8fafc',
          borderBottom: '2px solid #e2e8f0',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          fontWeight: 600,
          fontSize: '16px',
          color: '#1e293b'
        }}>
          📱 {appName}
        </div>
      )}
      <div style={{
        width: '100%',
        height: '600px',
        border: '1px solid #e2e8f0',
        borderTop: appName ? 'none' : '1px solid #e2e8f0',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        borderTopLeftRadius: appName ? '0' : '8px',
        borderTopRightRadius: appName ? '0' : '8px'
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#94a3b8" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default PageFlowCanvas;
