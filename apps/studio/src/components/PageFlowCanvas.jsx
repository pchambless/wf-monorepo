import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { execEvent, setVals } from "@whatsfresh/shared-imports";

import GridNode from "./FlowNodes/GridNode";
import FormNode from "./FlowNodes/FormNode";
import ContainerNode from "./FlowNodes/ContainerNode";
import PageNode from "./FlowNodes/PageNode";
import DefaultNode from "./FlowNodes/DefaultNode";
import { pageConfigToFlow } from "../utils/pageConfigToFlow";
import { db } from "../db/studioDb";

// Specialized node types for specific components
const specializedTypes = {
  grid: GridNode,
  form: FormNode,
  container: ContainerNode,
  page: PageNode,
  app: PageNode,
  crud: PageNode,
  default: DefaultNode,
};

// Static nodeTypes - built once at module load, never changes
let nodeTypes = { ...specializedTypes };
let nodeTypesInitialized = false;

// Initialize nodeTypes from eventTypes (called once)
const initializeNodeTypes = async () => {
  if (nodeTypesInitialized) return;

  try {
    const eventTypes = await db.eventTypes.toArray();

    eventTypes.forEach((et) => {
      const typeName = et.name.toLowerCase();
      if (!nodeTypes[typeName]) {
        nodeTypes[typeName] = DefaultNode;
      }
    });

    nodeTypesInitialized = true;
    console.log(
      `📦 Initialized ${Object.keys(nodeTypes).length
      } node types from eventTypes`
    );
  } catch (error) {
    console.error("Failed to load eventTypes:", error);
  }
};

// Start initialization immediately
initializeNodeTypes();

const PageFlowCanvas = ({ pageConfig, onNodeSelect }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [appName, setAppName] = useState("");

  useEffect(() => {
    const loadFlow = async () => {
      if (pageConfig) {
        // Load flat component array from IndexedDB for React Flow
        const components = await db.eventComp_xref.toArray();

        const {
          nodes: flowNodes,
          edges: flowEdges,
          appInfo,
        } = pageConfigToFlow(components);

        const enhancedEdges = flowEdges.map((edge) => ({
          ...edge,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
          style: { strokeWidth: 2, stroke: "#94a3b8" },
        }));

        setNodes(flowNodes);
        setEdges(enhancedEdges);
        setAppName(appInfo?.title || pageConfig.props?.title || "");
      }
    };

    loadFlow();
  }, [pageConfig, setNodes, setEdges]);

  const onNodeClick = useCallback(
    async (event, node) => {
      if (!onNodeSelect) return;

      const xref_id = node.data.xref_id;

      try {
        // Set xrefID in context
        await setVals([{ paramName: "xrefID", paramVal: xref_id }]);

        // Fetch props and triggers in parallel
        const [propsResult, triggersResult] = await Promise.all([
          execEvent("pageProps", { xrefID: xref_id }),
          execEvent("pageTriggers", { xrefID: xref_id }),
        ]);

        // Transform props array to object
        const propsObj = {};
        if (propsResult.data) {
          propsResult.data.forEach((prop) => {
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
        console.error("Failed to fetch node details:", error);
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

  const onNodeDragStop = useCallback((event, node) => {
    console.log("Node dragged:", node.id, "to position:", node.position);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        padding: "0", // No padding - maximize canvas space
        boxSizing: "border-box",
      }}
    >
      {appName && (
        <div
          style={{
            padding: "6px 8px",
            backgroundColor: "#f8fafc",
            borderBottom: "2px solid #e2e8f0",
            borderTopLeftRadius: "4px",
            borderTopRightRadius: "4px",
            fontWeight: 600,
            fontSize: "14px",
            color: "#1e293b",
            flexShrink: 0,
          }}
        >
          📱 {appName}
        </div>
      )}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          border: "1px solid #e2e8f0",
          borderTop: appName ? "none" : "1px solid #e2e8f0",
          borderRadius: appName ? "0 0 4px 4px" : "4px",
          overflow: "hidden",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.05 }}
          attributionPosition="bottom-left"
          minZoom={0.1}
          maxZoom={4}
          defaultZoom={1}
          zoomOnScroll={true}
          zoomOnPinch={true}
          panOnScroll={false}
          panOnScrollMode="free"
        >
          <Background color="#94a3b8" gap={16} />
          <Controls
            showZoom={true}
            showFitView={true}
            showInteractive={true}
            position="top-left"
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default PageFlowCanvas;
