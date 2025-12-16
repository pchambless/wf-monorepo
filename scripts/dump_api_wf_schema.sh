#!/bin/bash

# Load database credentials
if [ -f ~/.wf-db-credentials ]; then
    source ~/.wf-db-credentials
else
    echo "Error: ~/.wf-db-credentials not found"
    exit 1
fi

# Dump complete schema for api_wf
OUTPUT_DIR=~/Projects/wf-monorepo/AI/dump/api_wf

# Create output directory if needed
mkdir -p "$OUTPUT_DIR"

echo "Dumping api_wf schema from $MYSQL_HOST..."

# MySQL connection parameters
MYSQL_OPTS="-h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD"

# Dump everything (tables, views, procedures)
mysqldump $MYSQL_OPTS \
  --no-data \
  --routines \
  --triggers \
  api_wf \
  > "$OUTPUT_DIR/schema_complete.sql"

echo "✓ Complete schema dumped to schema_complete.sql"
echo "  Location: $OUTPUT_DIR/schema_complete.sql"
echo "  Size: $(du -h $OUTPUT_DIR/schema_complete.sql | cut -f1)"
