#!/bin/bash
# Cleanup logs older than 7 days
# This ensures logs get cleaned up even if server doesn't run continuously

LOG_DIR="/home/paul/projects/github/wf-monorepo/apps/server/server/logs"
DAYS_TO_KEEP=7

echo "Cleaning up logs older than ${DAYS_TO_KEEP} days in ${LOG_DIR}..."

# Calculate cutoff date (7 days ago)
CUTOFF_DATE=$(date -d "${DAYS_TO_KEEP} days ago" +%Y-%m-%d)

# Find and delete log files with dates older than cutoff
find "${LOG_DIR}" -name "*.log" -type f | while read logfile; do
    # Extract date from filename (format: *-YYYY-MM-DD.log)
    FILE_DATE=$(echo "$logfile" | grep -oP '\d{4}-\d{2}-\d{2}(?=\.log)')

    if [ ! -z "$FILE_DATE" ]; then
        # Compare dates
        if [[ "$FILE_DATE" < "$CUTOFF_DATE" ]]; then
            echo "Deleting old log: $logfile (${FILE_DATE})"
            rm -f "$logfile"
        fi
    fi
done

echo "Log cleanup complete!"
du -sh "${LOG_DIR}"
