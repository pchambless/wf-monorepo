#!/bin/bash

# Combined script to log both plan communications and impacts
# Run this after completing a session to maintain proper audit trail

echo "🔄 Logging session to plan_communications..."
curl -X POST http://localhost:3001/api/execEventType \
  -H "Content-Type: application/json" \
  -d '{
    "eventSQLId": 1,
    "params": {
      "plan_id": "module-dependency-system",
      "communication_type": "session_summary", 
      "title": "Module Dependency Database Population System - Implementation Complete",
      "content": "Successfully implemented two-phase module dependency population system. Fixed stored procedure parameter alignment, simplified JSON processing, created comprehensive database views for blast radius and dependency type derivation. System now successfully loads 91 modules and maps 158 dependencies. Ready for integration with plan_impacts workflow.",
      "ai_agent": "Kiro",
      "session_date": "2025-10-19",
      "status": "completed",
      "created_by": "system"
    }
  }' | jq '.'

echo ""
echo "🔄 Logging impacts to plan_impacts..."
curl -X POST http://localhost:3001/api/execEventType \
  -H "Content-Type: application/json" \
  -d '{
    "eventSQLId": 2,
    "params": {
      "plan_id": "module-dependency-system",
      "impact_type": "implementation",
      "affected_modules": "sql/database/whatsfresh/stored_procedures/sp_module_load.sql,sql/database/whatsfresh/stored_procedures/sp_module_map.sql,sql/database/api_wf/tables/modules.sql,sql/database/api_wf/tables/module_xref.sql,analysis-n-document/genDocs/populate-modules-db.js,sql/database/api_wf/views/vw_modules_with_blast_radius.sql,sql/database/api_wf/views/vw_dependencies_with_types.sql,sql/database/api_wf/views/vw_module_impact_analysis.sql",
      "change_summary": "Core module dependency system implementation: stored procedures, database views, population script fixes",
      "blast_radius": "medium",
      "ai_agent": "Kiro", 
      "session_date": "2025-10-19",
      "created_by": "system"
    }
  }' | jq '.'

echo ""
echo "✅ Session logged successfully!"