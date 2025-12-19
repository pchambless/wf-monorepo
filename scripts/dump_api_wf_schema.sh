#!/bin/bash

# Load database credentials
if [ -f ~/.wf-db-credentials ]; then
    source ~/.wf-db-credentials
else
    echo "Error: ~/.wf-db-credentials not found"
    exit 1
fi


# Set schema to dump (default: api_wf, override with SCHEMA=whatsfresh ./dump_api_wf_schema.sh)
SCHEMA="${SCHEMA:-api_wf}"
OUTPUT_DIR=~/Projects/wf-monorepo/db/dump/$SCHEMA

# List of known broken views to skip (add more as needed)
declare -A BROKEN_VIEWS_MAP
# Example: BROKEN_VIEWS_MAP[api_wf]="_old_vw_eventComp_xref vw_eventComponent vw_hier_components"
# Add more schemas as needed
BROKEN_VIEWS_MAP[api_wf]="_old_vw_eventComp_xref vw_eventComponent vw_hier_components"
BROKEN_VIEWS_MAP[whatsfresh]=""  # Add broken views for whatsfresh if any

# Create output directory if needed
mkdir -p "$OUTPUT_DIR"

echo "Dumping $SCHEMA schema from $MYSQL_HOST..."

# MySQL connection parameters
MYSQL_OPTS="-h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD"

# Build --ignore-table options for mysqldump
IGNORE_TABLES=""
for view in ${BROKEN_VIEWS_MAP[$SCHEMA]}; do
  IGNORE_TABLES+=" --ignore-table=$SCHEMA.$view"
  echo "⚠️  Skipping broken view: $SCHEMA.$view"
done

# Dump everything (tables, views, procedures), skipping broken views
eval mysqldump $MYSQL_OPTS \
  --no-data \
  --routines \
  --triggers \
  $IGNORE_TABLES \
  $SCHEMA \
  > "$OUTPUT_DIR/schema_complete.sql"

echo "✓ Complete schema dumped to schema_complete.sql"
echo "  Location: $OUTPUT_DIR/schema_complete.sql"
echo "  Size: $(du -h $OUTPUT_DIR/schema_complete.sql | cut -f1)"
