import React from "react";
import { observer } from "mobx-react-lite";
import { DataGrid } from "@mui/x-data-grid";
import { Box, CircularProgress, IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import createLogger from "@utils/logger";
import { safeProp } from "@utils/mobxHelpers";
import { contextStore } from "@whatsfresh/shared-imports"; // Adjusted import path

const log = createLogger("Table.Component");

const Table = observer(({ pageMap, eventData }) => {
  const navigate = useNavigate();

  // Unified action cell renderer - eliminates duplicate logic
  const renderActionCell = React.useCallback(
    (params) => (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          "& button": {
            m: 0.5,
            p: 0.5,
          },
        }}
      >
        {pageMap.uiConfig.actions.rowActions.map((action) => (
          <Tooltip key={action.id} title={action.tooltip || ""}>
            <IconButton
              color={action.color || "primary"}
              size="small"
              onClick={(e) => {
                e.stopPropagation();

                if (action.route) {
                  const path = action.route.replace(/:(\w+)/g, (_, param) => {
                    const value = params.row[param];
                    // Convert to number if it looks like a numeric ID
                    return param.endsWith("ID") && !isNaN(value)
                      ? Number(value)
                      : value || "";
                  });
                  navigate(path);

                  // ALSO set the parameter in contextStore for DML operations
                  if (action.paramField) {
                    const paramValue = params.row[action.paramField];
                    contextStore.setParameter(action.paramField, paramValue);
                  }
                } else if (action.handler === "handleDelete") {
                  eventData.onDeleteClick(params.row);
                }
              }}
            >
              {(() => {
                switch (action.icon) {
                  case "Delete":
                    return <DeleteIcon />;
                  case "Visibility":
                    return <VisibilityIcon />;
                  case "Edit":
                    return <EditIcon />;
                  case "Add":
                    return <AddIcon />;
                  default:
                    return <MoreVertIcon />;
                }
              })()}
            </IconButton>
          </Tooltip>
        ))}
      </Box>
    ),
    [pageMap.uiConfig.actions.rowActions, eventData.onDeleteClick, navigate]
  );

  // Create columns configuration with unified action handling
  const columns = React.useMemo(() => {
    // Check if an actions column already exists in the pageMap
    const hasActionsColumn = pageMap.tableConfig.columns.some(
      (col) => col.field === "actions" && !col.hidden
    );

    // Process all columns from pageMap
    const baseColumns = pageMap.tableConfig.columns
      .filter((col) => !col.hidden)
      .map((col) => ({
        field: col.field,
        headerName: col.headerName || col.label,
        width: parseInt(col.width) || 150,
        ...(col.flex && { flex: col.flex }),
        // If this is an actions column from pageMap, use our unified renderer
        ...(col.field === "actions" &&
          pageMap.uiConfig.actions.rowActions?.length > 0
          ? {
            renderCell: renderActionCell,
          }
          : {}),
      }));

    // Only add our own actions column if pageMap doesn't already have one
    if (!hasActionsColumn && pageMap.uiConfig.actions.rowActions?.length > 0) {
      baseColumns.push({
        field: "actions",
        headerName: "Actions",
        sortable: false,
        filterable: false,
        width: 150,
        renderCell: renderActionCell,
      });
    }

    return baseColumns;
  }, [
    pageMap.tableConfig.columns,
    pageMap.uiConfig.actions.rowActions,
    renderActionCell,
  ]);

  // Log current state
  log.info("Table rendering with data:", {
    hasData: eventData.data?.length > 0,
    count: eventData.data?.length || 0,
    columnCount: columns.length,
  });

  // Display loading state
  if (eventData.loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Convert MobX observables to plain JS
  const safeData = safeProp(eventData.data);

  // Main table render
  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={safeData}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 25]}
        disableSelectionOnClick
        onRowClick={eventData.onRowClick}
        getRowId={(row) =>
          row[pageMap.systemConfig?.primaryKey || eventData.idField || "id"]
        }
      />
    </div>
  );
});

export default Table;
