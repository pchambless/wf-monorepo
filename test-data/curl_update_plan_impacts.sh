#!/bin/bash

# Update plan_impacts table with modules modified in this session
# Logs all the files we changed during implementation

curl -X POST http://localhost:3001/api/execEventType \
  -H "Content-Type: application/json" \
  -d '{
    "eventSQLId": 2,
    "params": {
      "plan_id": "module-dependency-system",
      "impact_type": "implementation",
      "affected_modules": [
        "sql/database/whatsfresh/stored_procedures/sp_module_load.sql",
        "sql/database/whatsfresh/stored_procedures/sp_module_map.sql", 
        "sql/database/api_wf/tables/modules.sql",
        "sql/database/api_wf/tables/module_xref.sql",
        "analysis-n-document/genDocs/populate-modules-db.js",
        "sql/database/api_wf/views/vw_modules_with_blast_radius.sql",
        "sql/database/api_wf/views/vw_dependencies_with_types.sql",
        "sql/database/api_wf/views/vw_module_impact_analysis.sql"
      ],
      "change_summary": "Core module dependency system implementation: stored procedures, database views, population script fixes",
      "blast_radius": "medium",
      "ai_agent": "Kiro",
      "session_date": "2025-10-19",
      "created_by": "system"
    }
  }' | jq '.'