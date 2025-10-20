#!/bin/bash

# Test sp_module_map via curl  
# This tests the dependency mapping stored procedure directly

curl -X POST http://localhost:3001/api/execEventType \
  -H "Content-Type: application/json" \
  -d '{
    "eventSQLId": 29,
    "params": {
      "analysis_json": "[{\"from_path\":\"test/module1.js\",\"to_path\":\"test/module2.js\"}]",
      "firstName": "curl-test"
    }
  }' | jq '.'