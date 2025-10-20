#!/bin/bash

# Update plan_communications table with session summary
# Run this after /summary command to log the session work

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