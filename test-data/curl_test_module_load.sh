#!/bin/bash

# Test sp_module_load via curl
# This tests the module loading stored procedure directly

curl -X POST http://localhost:3001/api/execEventType \
  -H "Content-Type: application/json" \
  -d '{
    "eventSQLId": 27,
    "params": {
      "p_modules": "[{\"file_path\":\"test/module1.js\"},{\"file_path\":\"test/module2.js\"}]",
      "firstName": "curl-test"
    }
  }' | jq '.'