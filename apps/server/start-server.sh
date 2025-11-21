#!/bin/bash
# Load database credentials from secure location
if [ -f ~/.wf-db-credentials ]; then
    source ~/.wf-db-credentials
    
    # Export as DB_* variables for the server
    export DB_HOST=$MYSQL_HOST
    export DB_PORT=$MYSQL_PORT
    export DB_USER=$MYSQL_USER
    export DB_PASSWORD=$MYSQL_PASSWORD
    export DB_NAME=$MYSQL_DATABASE
    
    echo "✅ Loaded database credentials from ~/.wf-db-credentials"
else
    echo "⚠️  Warning: ~/.wf-db-credentials not found, using .env file"
fi

# Start the server
npm run dev
