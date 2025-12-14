import React from "react";
import { groupByRow, getRowAlignment } from "../utils/layoutUtils.js";
import { createLogger } from "../../utils/logger.js";

const log = createLogger('ContainerRenderer', 'info');

export const renderContainer = (component, renderComponent) => {
  const { id, components = [], comp_type } = component;

  log.debug(`ContainerRenderer: Rendering ${comp_type} "${id}" with ${components.length} children:`, components.map(c => `${c.comp_type}:${c.id}`));

  if (components.length === 0) {
    log.warn(`Container "${id}" has no children`);
    return null;
  }

  const childRows = groupByRow(components);
  const sortedChildRowKeys = Object.keys(childRows).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  // Check if this is a Form with colSpan fields
  const isForm = comp_type === 'Form';
  const hasColSpan = isForm && components.some(c => c.props?.colSpan && c.props.colSpan > 1);

  if (isForm && hasColSpan) {
    // Use CSS Grid for Forms with colSpan
    return sortedChildRowKeys.map((rowKey) => {
      const rowComponents = childRows[rowKey];
      
      // Calculate grid columns needed for this row
      const maxCol = Math.max(...rowComponents.map(c => {
        const col = parseInt(c.props?.col || 1);
        const span = parseInt(c.props?.colSpan || 1);
        return col + span - 1;
      }));
      
      return (
        <div
          key={`container-row-${id}-${rowKey}`}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${maxCol}, 1fr)`,
            gap: "16px",
            width: "100%",
          }}
        >
          {rowComponents.map((child) => {
            const colSpan = parseInt(child.props?.colSpan || 1);
            const col = parseInt(child.props?.col || 1);
            
            return (
              <div
                key={child.id}
                style={{
                  gridColumn: `${col} / span ${colSpan}`,
                }}
              >
                {renderComponent(child)}
              </div>
            );
          })}
        </div>
      );
    });
  }

  // Default flexbox layout for non-Form or Forms without colSpan
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
