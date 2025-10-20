import React from "react";
import { Handle, Position } from "reactflow";
import {
  getGridNodeStyle,
  getGridHeaderStyle,
  getNodeTitleStyle,
  getNodeSubtitleStyle,
  getNodeBodyStyle,
} from "./nodeStyles.js";

const GridNode = ({ data, selected }) => {
  return (
    <div style={getGridNodeStyle(selected)}>
      <Handle type="target" position={Position.Top} />

      {/* Grid Header */}
      <div style={getGridHeaderStyle(selected)}>
        <div style={getNodeTitleStyle()}>📊 {data.label}</div>
        <div style={getNodeSubtitleStyle()}>Grid</div>
      </div>

      {/* Grid Body */}
      <div style={getNodeBodyStyle()} />

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default GridNode;
