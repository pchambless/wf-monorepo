import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import GridNode from './FlowNodes/GridNode';
import FormNode from './FlowNodes/FormNode';
import ContainerNode from './FlowNodes/ContainerNode';
import PageNode from './FlowNodes/PageNode';
import DefaultNode from './FlowNodes/DefaultNode';
import { pageConfigToFlow } from '../utils/pageConfigToFlow';

const nodeTypes = {
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

  useEffect(() => {
    if (pageConfig) {
      const { nodes: flowNodes, edges: flowEdges } = pageConfigToFlow(pageConfig);

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
    }
  }, [pageConfig, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (event, node) => {
      if (onNodeSelect) {
        onNodeSelect({
          xref_id: node.data.xref_id,
          comp_type: node.data.comp_type,
          label: node.data.label,
          eventProps: node.data.eventProps,
          container: node.data.container,
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
    <div style={{ width: '100%', height: '600px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
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
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'grid': return '#6366f1';
              case 'form': return '#14b8a6';
              case 'container': return '#f97316';
              case 'page': return '#a855f7';
              default: return '#94a3b8';
            }
          }}
          position="bottom-right"
          style={{ backgroundColor: '#f8fafc' }}
        />
      </ReactFlow>
    </div>
  );
};

export default PageFlowCanvas;
