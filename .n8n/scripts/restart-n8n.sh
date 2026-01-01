#!/bin/bash
# Restart n8n to pick up new workflow files

echo "🔄 Restarting n8n..."
docker restart n8n-whatsfresh

echo "⏳ Waiting for n8n to start..."
sleep 5

# Wait for n8n to respond
echo "🏥 Checking health..."
until curl -f http://localhost:5678 > /dev/null 2>&1; do
  echo "   Still starting..."
  sleep 2
done

echo "✅ n8n is ready!"
echo "🌐 Access n8n: http://localhost:5678"
