import React from "react";
import { groupByRow, getRowAlignment } from "../utils/layoutUtils.js";

export const renderContainer = (component, renderComponent) => {
  const { id, components = [] } = component;

  if (components.length === 0) {
    return null;
  }

  const childRows = groupByRow(components);
  const sortedChildRowKeys = Object.keys(childRows).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  return sortedChildRowKeys.map((rowKey) => {
    const rowComponents = childRows[rowKey];
    const justifyContent = getRowAlignment(rowComponents);

    return (
      <div
        key={`container-row-${id}-${rowKey}`}
        style={{
          display: "flex",
          gap: "16px",
          width: "100%",
          justifyContent,
        }}
      >
        {rowComponents.map((child) => renderComponent(child))}
      </div>
    );
  });
};
