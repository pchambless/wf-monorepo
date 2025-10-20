#!/bin/bash

echo "🔄 Logging plan impacts for all modified files..."

# 1. sp_module_load.sql
curl -X POST http://localhost:3001/api/execDML -H "Content-Type: application/json" -d '{
  "method": "INSERT",
  "table": "api_wf.plan_impacts", 
  "data": {
    "plan_id": 0,
    "impact_type": "implementation",
    "affected_module": "sql/database/whatsfresh/stored_procedures/sp_module_load.sql",
    "change_description": "Fixed parameter alignment (p_modules, firstName), simplified JSON processing, added last_detected_at support",
    "blast_radius": "medium",
    "change_type": "modified",
    "ai_agent": "kiro",
    "session_date": "2025-10-19",
    "userID": "Paul"
  }
}'

# 2. sp_module_map.sql  
curl -X POST http://localhost:3001/api/execDML -H "Content-Type: application/json" -d '{
  "method": "INSERT",
  "table": "api_wf.plan_impacts",
  "data": {
    "plan_id": 0,
    "impact_type": "implementation", 
    "affected_module": "sql/database/whatsfresh/stored_procedures/sp_module_map.sql",
    "change_description": "Replaced JSON_TABLE with manual parsing, fixed column name alignment (module_id/parent_id), parameter fixes",
    "blast_radius": "medium",
    "change_type": "modified",
    "ai_agent": "kiro",
    "session_date": "2025-10-19",
    "userID": "Paul"
  }
}'

# 3. modules.sql
curl -X POST http://localhost:3001/api/execDML -H "Content-Type: application/json" -d '{
  "method": "INSERT",
  "table": "api_wf.plan_impacts",
  "data": {
    "plan_id": 0,
    "impact_type": "implementation",
    "affected_module": "sql/database/api_wf/tables/modules.sql", 
    "change_description": "Added last_detected_at column and index for filesystem sync detection",
    "blast_radius": "low",
    "change_type": "modified",
    "ai_agent": "kiro",
    "session_date": "2025-10-19",
    "userID": "Paul"
  }
}'

# 4. module_xref.sql
curl -X POST http://localhost:3001/api/execDML -H "Content-Type: application/json" -d '{
  "method": "INSERT",
  "table": "api_wf.plan_impacts",
  "data": {
    "plan_id": 0,
    "impact_type": "implementation",
    "affected_module": "sql/database/api_wf/tables/module_xref.sql",
    "change_description": "Added last_detected_at column and index for filesystem sync detection", 
    "blast_radius": "low",
    "change_type": "modified",
    "ai_agent": "kiro",
    "session_date": "2025-10-19",
    "userID": "Paul"
  }
}'

# 5. populate-modules-db.js
curl -X POST http://localhost:3001/api/execDML -H "Content-Type: application/json" -d '{
  "method": "INSERT",
  "table": "api_wf.plan_impacts",
  "data": {
    "plan_id": 0,
    "impact_type": "implementation",
    "affected_module": "analysis-n-document/genDocs/populate-modules-db.js",
    "change_description": "Fixed parameter passing, removed blast_radius/type from JSON, added detailed logging, simplified API calls",
    "blast_radius": "medium", 
    "change_type": "modified",
    "ai_agent": "kiro",
    "session_date": "2025-10-19",
    "userID": "Paul"
  }
}'

# 6. vw_modules_with_blast_radius.sql
curl -X POST http://localhost:3001/api/execDML -H "Content-Type: application/json" -d '{
  "method": "INSERT",
  "table": "api_wf.plan_impacts",
  "data": {
    "plan_id": 0,
    "impact_type": "implementation",
    "affected_module": "sql/database/api_wf/views/vw_modules_with_blast_radius.sql",
    "change_description": "Created view for calculated blast radius based on dependent counts with configurable thresholds",
    "blast_radius": "low",
    "change_type": "created",
    "ai_agent": "kiro", 
    "session_date": "2025-10-19",
    "userID": "Paul"
  }
}'

# 7. vw_dependencies_with_types.sql
curl -X POST http://localhost:3001/api/execDML -H "Content-Type: application/json" -d '{
  "method": "INSERT",
  "table": "api_wf.plan_impacts",
  "data": {
    "plan_id": 0,
    "impact_type": "implementation",
    "affected_module": "sql/database/api_wf/views/vw_dependencies_with_types.sql",
    "change_description": "Created view for derived dependency types (internal/external) based on package comparison",
    "blast_radius": "low",
    "change_type": "created",
    "ai_agent": "kiro",
    "session_date": "2025-10-19", 
    "userID": "Paul"
  }
}'

# 8. vw_module_impact_analysis.sql
curl -X POST http://localhost:3001/api/execDML -H "Content-Type: application/json" -d '{
  "method": "INSERT", 
  "table": "api_wf.plan_impacts",
  "data": {
    "plan_id": 0,
    "impact_type": "implementation",
    "affected_module": "sql/database/api_wf/views/vw_module_impact_analysis.sql",
    "change_description": "Created comprehensive impact analysis view with module classifications, impact scores, and detailed breakdowns",
    "blast_radius": "medium",
    "change_type": "created",
    "ai_agent": "kiro",
    "session_date": "2025-10-19",
    "userID": "Paul"
  }
}'

echo ""
echo "✅ All plan impacts logged successfully!"