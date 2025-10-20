/**
 * Shared style constants for ReactFlow nodes in Studio canvas
 * Reduces code duplication across FlowNode components
 */

export const COLORS = {
  // Base colors
  textPrimary: "#1e293b",
  textSecondary: "#64748b",

  // Default node
  defaultBorder: "#94a3b8",
  defaultBorderSelected: "#64748b",
  defaultBg: "#ffffff",
  defaultBgSelected: "#f1f5f9",

  // Container node (amber theme)
  containerBorder: "#f97316",
  containerBorderSelected: "#f59e0b",
  containerBg: "rgba(255, 255, 255, 0.8)",
  containerBgSelected: "rgba(254, 243, 199, 0.3)",
  containerHeader: "#ffedd5",
  containerHeaderSelected: "#fef3c7",
  containerHeaderBorder: "#fb923c",
  containerHeaderBorderSelected: "#fbbf24",

  // Page node (purple theme)
  pageBorder: "#a855f7",
  pageBorderSelected: "#8b5cf6",
  pageBg: "rgba(255, 255, 255, 0.9)",
  pageBgSelected: "rgba(243, 232, 255, 0.3)",
  pageHeader: "#ede9fe",
  pageHeaderSelected: "#f3e8ff",
  pageHeaderBorder: "#c4b5fd",
  pageHeaderBorderSelected: "#a78bfa",

  // Form node (green theme)
  formBorder: "#14b8a6",
  formBorderSelected: "#10b981",
  formBg: "rgba(255, 255, 255, 0.8)",
  formBgSelected: "rgba(236, 253, 245, 0.3)",
  formHeader: "#f0fdfa",
  formHeaderSelected: "#ecfdf5",
  formHeaderBorder: "#5eead4",
  formHeaderBorderSelected: "#6ee7b7",

  // Grid node (blue theme)
  gridBorder: "#6366f1",
  gridBorderSelected: "#3b82f6",
  gridBg: "rgba(255, 255, 255, 0.8)",
  gridBgSelected: "rgba(239, 246, 255, 0.3)",
  gridHeader: "#eef2ff",
  gridHeaderSelected: "#eff6ff",
  gridHeaderBorder: "#a5b4fc",
  gridHeaderBorderSelected: "#93c5fd",
};

export const getNodeBaseStyle = (selected) => ({
  borderRadius: "8px",
  border: "2px solid",
  boxShadow: selected
    ? "0 4px 12px rgba(0, 0, 0, 0.2)"
    : "0 2px 4px rgba(0,0,0,0.1)",
  position: "relative",
});

export const getDefaultNodeStyle = (selected) => ({
  ...getNodeBaseStyle(selected),
  padding: "12px 16px",
  borderRadius: "6px",
  minWidth: "180px",
  borderColor: selected ? COLORS.defaultBorderSelected : COLORS.defaultBorder,
  backgroundColor: selected ? COLORS.defaultBgSelected : COLORS.defaultBg,
  boxShadow: selected
    ? "0 4px 12px rgba(100, 116, 139, 0.3)"
    : "0 2px 4px rgba(0,0,0,0.1)",
});

export const getContainerNodeStyle = (selected) => ({
  ...getNodeBaseStyle(selected),
  width: "100%",
  height: "100%",
  borderColor: selected
    ? COLORS.containerBorderSelected
    : COLORS.containerBorder,
  backgroundColor: selected ? COLORS.containerBgSelected : COLORS.containerBg,
  boxShadow: selected
    ? "0 4px 12px rgba(245, 158, 11, 0.3)"
    : "0 2px 4px rgba(0,0,0,0.1)",
});

export const getPageNodeStyle = (selected) => ({
  ...getNodeBaseStyle(selected),
  width: "100%",
  height: "100%",
  borderColor: selected ? COLORS.pageBorderSelected : COLORS.pageBorder,
  backgroundColor: selected ? COLORS.pageBgSelected : COLORS.pageBg,
  boxShadow: selected
    ? "0 4px 12px rgba(139, 92, 246, 0.3)"
    : "0 2px 4px rgba(0,0,0,0.1)",
});

export const getFormNodeStyle = (selected) => ({
  ...getNodeBaseStyle(selected),
  width: "100%",
  height: "100%",
  borderColor: selected ? COLORS.formBorderSelected : COLORS.formBorder,
  backgroundColor: selected ? COLORS.formBgSelected : COLORS.formBg,
  boxShadow: selected
    ? "0 4px 12px rgba(16, 185, 129, 0.3)"
    : "0 2px 4px rgba(0,0,0,0.1)",
});

export const getGridNodeStyle = (selected) => ({
  ...getNodeBaseStyle(selected),
  width: "100%",
  height: "100%",
  borderColor: selected ? COLORS.gridBorderSelected : COLORS.gridBorder,
  backgroundColor: selected ? COLORS.gridBgSelected : COLORS.gridBg,
  boxShadow: selected
    ? "0 4px 12px rgba(59, 130, 246, 0.3)"
    : "0 2px 4px rgba(0,0,0,0.1)",
});

export const getNodeHeaderStyle = (selected) => ({
  padding: "8px 12px",
  borderBottom: "1px solid",
  borderTopLeftRadius: "6px",
  borderTopRightRadius: "6px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
});

export const getPageHeaderStyle = (selected) => ({
  ...getNodeHeaderStyle(selected),
  padding: "10px 14px",
  borderBottomColor: selected
    ? COLORS.pageHeaderBorderSelected
    : COLORS.pageHeaderBorder,
  backgroundColor: selected ? COLORS.pageHeaderSelected : COLORS.pageHeader,
});

export const getContainerHeaderStyle = (selected) => ({
  ...getNodeHeaderStyle(selected),
  borderBottomColor: selected
    ? COLORS.containerHeaderBorderSelected
    : COLORS.containerHeaderBorder,
  backgroundColor: selected
    ? COLORS.containerHeaderSelected
    : COLORS.containerHeader,
});

export const getFormHeaderStyle = (selected) => ({
  ...getNodeHeaderStyle(selected),
  borderBottomColor: selected
    ? COLORS.formHeaderBorderSelected
    : COLORS.formHeaderBorder,
  backgroundColor: selected ? COLORS.formHeaderSelected : COLORS.formHeader,
});

export const getGridHeaderStyle = (selected) => ({
  ...getNodeHeaderStyle(selected),
  borderBottomColor: selected
    ? COLORS.gridHeaderBorderSelected
    : COLORS.gridHeaderBorder,
  backgroundColor: selected ? COLORS.gridHeaderSelected : COLORS.gridHeader,
});

export const getNodeTitleStyle = () => ({
  fontWeight: 600,
  fontSize: "13px",
  color: COLORS.textPrimary,
});

export const getDefaultNodeTitleStyle = () => ({
  fontWeight: 600,
  fontSize: "14px",
  color: COLORS.textPrimary,
  marginBottom: "4px",
});

export const getPageNodeTitleStyle = () => ({
  fontWeight: 600,
  fontSize: "14px",
  color: COLORS.textPrimary,
});

export const getNodeSubtitleStyle = () => ({
  fontSize: "11px",
  color: COLORS.textSecondary,
  marginLeft: "auto",
});

export const getDefaultNodeSubtitleStyle = () => ({
  fontSize: "12px",
  color: COLORS.textSecondary,
});

export const getNodeBodyStyle = () => ({
  padding: "12px",
  minHeight: "60px",
});

export const getPageNodeBodyStyle = () => ({
  padding: "12px",
  minHeight: "80px",
});
