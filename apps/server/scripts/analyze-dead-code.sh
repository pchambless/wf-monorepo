#!/bin/bash
# Dead Code Analysis - Daily at 2am Central
cd /home/paul/projects/github/wf-monorepo
/usr/bin/npm run analyze:all >> /home/paul/projects/github/wf-monorepo/analysis-n-document/genDocs/output/cron.log 2>&1
/usr/bin/npm run analyze:populate-db >> /home/paul/projects/github/wf-monorepo/analysis-n-document/genDocs/output/cron.log 2>&1
echo "Dead code analysis and DB population completed at $(date)" >> /home/paul/projects/github/wf-monorepo/analysis-n-document/genDocs/output/cron.log
