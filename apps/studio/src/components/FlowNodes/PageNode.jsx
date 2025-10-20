import React from "react";
import { Handle, Position } from "reactflow";
import {
  getPageNodeStyle,
  getPageHeaderStyle,
  getPageNodeTitleStyle,
  getNodeSubtitleStyle,
  getPageNodeBodyStyle,
} from "./nodeStyles.js";

const PageNode = ({ data, selected }) => {
  return (
    <div style={getPageNodeStyle(selected)}>
      <Handle type="target" position={Position.Top} />

      {/* Page Header */}
      <div style={getPageHeaderStyle(selected)}>
        <div style={getPageNodeTitleStyle()}>📄 {data.label}</div>
        <div style={getNodeSubtitleStyle()}>Page</div>
      </div>

      {/* Page Body - Children render here */}
      <div style={getPageNodeBodyStyle()} />

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default PageNode;
