import React from "react";
import { SelectWidget } from "./SelectWidget.jsx";
import { Box } from "@mui/material";
import contextStore from "../../stores/contextStore.js";

/**
 * Plan selector widget
 * Uses SelPlan eventType for data source (eventID 101.1)
 * Auto-detection: 1st column (id) as value, 2nd column (label) as display
 *
 * Sets planID parameter in contextStore for universal use across the page
 * Part of Plan 0019: Database-First Planning System
 */
const SelPlan = ({ fullWidth, onChange, ...props }) => {
  const handleChange = (value, item) => {
    // Set planID parameter for universal use
    if (value) {
      contextStore.setParameter("planID", value);
    }

    // Call original onChange if provided
    if (onChange) {
      onChange(value, item);
    }
  };

  const widget = (
    <SelectWidget
      id="selPlan"
      eventName="SelPlan"
      onChange={handleChange}
      {...props}
    />
  );

  if (fullWidth) {
    return <Box sx={{ width: "100%" }}>{widget}</Box>;
  }

  return widget;
};

export default SelPlan;
