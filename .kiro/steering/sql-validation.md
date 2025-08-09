---
inclusion: fileMatch
fileMatchPattern: "packages/shared-imports/src/events/*/eventTypes/*.js"
---

# SQL Query Validation

When working with eventTypes containing SQL queries:

## SQL Validation Rules

- Validate parameter binding format (`:paramName`)
- Check table names exist and follow naming conventions
- Ensure `deleted_at IS NULL` is included where appropriate
- Validate column names match database schema

## Security Checks

- Ensure all user inputs use parameter binding
- Flag potential SQL injection vulnerabilities
- Validate proper escaping and sanitization
- Check for exposed sensitive data in SELECT statements

## Performance Optimization

- Suggest proper indexing for WHERE clauses
- Flag potentially slow queries (missing indexes, full table scans)
- Recommend query optimization opportunities
- Validate efficient JOIN patterns

## Common Fixes

- Auto-add `deleted_at IS NULL` to queries
- Suggest proper parameter binding for user inputs
- Recommend column aliases for better readability
- Flag missing ORDER BY clauses for consistent results
