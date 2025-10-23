/**
 * layoutUtils - Layout helper functions for DirectRenderer
 *
 * Provides utilities for component grouping, alignment, and type separation
 */

export const groupByRow = (components) => {
  const rows = {};
  components.forEach((comp) => {
    const row = comp.position?.row || 0;
    if (!rows[row]) rows[row] = [];
    rows[row].push(comp);
  });

  Object.keys(rows).forEach((rowKey) => {
    rows[rowKey].sort(
      (a, b) => (a.position?.order || 0) - (b.position?.order || 0)
    );
  });

  return rows;
};

export const getRowAlignment = (components) => {
  const firstAlign = components[0]?.position?.align || "left";
  const alignMap = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };
  return alignMap[firstAlign] || "flex-start";
};

export const separateComponentsByType = (components) => {
  const appBarComponent = components?.find((c) => c.comp_type === "AppBar");
  const sidebarComponent = components?.find((c) => c.comp_type === "Sidebar");
  const modalComponents = components?.filter((c) => c.container === "Modal") || [];
  const regularComponents =
    components?.filter(
      (c) => c.container !== "Modal" && c.comp_type !== "AppBar" && c.comp_type !== "Sidebar"
    ) || [];

  return {
    appBarComponent,
    sidebarComponent,
    modalComponents,
    regularComponents,
  };
};
