import React from "react";
import { Handle, Position } from "reactflow";
import {
  getDefaultNodeStyle,
  getDefaultNodeTitleStyle,
  getDefaultNodeSubtitleStyle,
} from "./nodeStyles.js";

const DefaultNode = ({ data, selected }) => {
  return (
    <div style={getDefaultNodeStyle(selected)}>
      <Handle type="target" position={Position.Top} />
      <div style={getDefaultNodeTitleStyle()}>
        {data.comp_type === "Button" ? "🔘" : "📌"} {data.label}
      </div>
      <div style={getDefaultNodeSubtitleStyle()}>{data.comp_type}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default DefaultNode;
