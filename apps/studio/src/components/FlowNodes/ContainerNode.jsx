import React from "react";
import { Handle, Position } from "reactflow";
import {
  getContainerNodeStyle,
  getContainerHeaderStyle,
  getNodeTitleStyle,
  getNodeSubtitleStyle,
  getNodeBodyStyle,
} from "./nodeStyles.js";

const ContainerNode = ({ data, selected }) => {
  return (
    <div style={getContainerNodeStyle(selected)}>
      <Handle type="target" position={Position.Top} />

      {/* Container Header */}
      <div style={getContainerHeaderStyle(selected)}>
        <div style={getNodeTitleStyle()}>📦 {data.label}</div>
        <div style={getNodeSubtitleStyle()}>Container</div>
      </div>

      {/* Container Body - Children render here */}
      <div style={getNodeBodyStyle()} />

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default ContainerNode;
