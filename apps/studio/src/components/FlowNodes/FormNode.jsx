import React from "react";
import { Handle, Position } from "reactflow";
import {
  getFormNodeStyle,
  getFormHeaderStyle,
  getNodeTitleStyle,
  getNodeSubtitleStyle,
  getNodeBodyStyle,
} from "./nodeStyles.js";

const FormNode = ({ data, selected }) => {
  return (
    <div style={getFormNodeStyle(selected)}>
      <Handle type="target" position={Position.Top} />

      {/* Form Header */}
      <div style={getFormHeaderStyle(selected)}>
        <div style={getNodeTitleStyle()}>📝 {data.label}</div>
        <div style={getNodeSubtitleStyle()}>Form</div>
      </div>

      {/* Form Body - Children render here */}
      <div style={getNodeBodyStyle()} />

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default FormNode;
