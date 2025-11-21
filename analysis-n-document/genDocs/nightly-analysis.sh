#!/bin/bash
cd /home/paul/Projects/wf-monorepo
export PATH="/home/paul/.nvm/versions/node/v18.19.1/bin:$PATH"

# Source DB credentials for populate-db step
if [ -f ~/.wf-db-credentials ]; then
    source ~/.wf-db-credentials
fi

LOG_FILE="analysis-n-document/genDocs/output/cron.log"

npm run analyze:all >> "$LOG_FILE" 2>&1
npm run analyze:populate-db >> "$LOG_FILE" 2>&1
echo "Dead code analysis and DB population completed at $(date)" >> "$LOG_FILE"
