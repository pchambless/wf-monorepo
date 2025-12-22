#!/bin/bash
# Import all workflow files from .n8n/workflows/ into n8n database

WORKFLOWS_DIR="/home/paul/Projects/wf-monorepo/.n8n/workflows"
N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZThiZGY5YS03MWFhLTQ3YmYtYWEyYS1kZjE1MDcyNzJhZDciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2MjY5NDY0fQ.94YOL4eFnRdRTZWyW05buufHIZ-ykxvPqeBEX7SXDes"
N8N_URL="http://localhost:5678"

echo "Importing workflows from $WORKFLOWS_DIR"
echo "=========================================="

for workflow_file in "$WORKFLOWS_DIR"/*.json; do
    filename=$(basename "$workflow_file")
    echo -n "Importing $filename... "

    response=$(curl -s -X POST "$N8N_URL/api/v1/workflows" \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        -H "Content-Type: application/json" \
        --data-binary @"$workflow_file")

    name=$(echo "$response" | jq -r '.name // empty')
    error=$(echo "$response" | jq -r '.message // empty')

    if [ -n "$name" ]; then
        echo "✓ $name"
    elif [ -n "$error" ]; then
        echo "✗ $error"
    else
        echo "✗ Unknown error"
    fi
done

echo "=========================================="
echo "Import complete!"
