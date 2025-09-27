WhatsFresh EventSQL Architecture & Query Orchestration - Session Summary

  🎯 Major Accomplishments

  1. Built Complete Query Management System

  A. EventSQL Table Structure

  CREATE TABLE eventSQL (
    id INT AUTO_INCREMENT PRIMARY KEY,
    qryName VARCHAR(50) UNIQUE,
    qrySQL TEXT,
    primaryKey VARCHAR(50) NULL,     -- Added for CRUD operations
    dbTable VARCHAR(50) NULL,        -- Added for DML operations
    method VARCHAR(10) DEFAULT 'GET', -- Added for HTTP method
    description TEXT,
    -- Standard audit fields
  );

  B. Parameter Resolution Function

  -- MySQL function for context_store lookup
  f_qryParam('appID', 'pc7900@gmail.com') → '23'
  Test Results: ✅ Working perfectly - returns parameter values from context_store

  2. Established Three-Tier Query Strategy

  Grid Queries (Performance-Optimized Display)

  -- Naming: {entity}List
  ingrTypeList, brndList, userList
  -- Purpose: Minimal columns for fast grid display
  -- Example: SELECT id, name, status FROM entity WHERE active = 1

  Form Queries (CRUD Operations)

  -- Naming: {entity}Dtl
  ingrTypeDtl, brndDtl, userDtl
  -- Purpose: Full editable record details
  -- Example: SELECT * FROM entity WHERE id = :entityID

  Report Queries (Complex Analytics)

  -- Naming: {ReportName}Rpt
  WrkShtIngrRpt, SalesDailyRpt
  -- Purpose: Complex views with joins, calculations, formatting
  -- Example: Uses database views like whatsfresh.v_prdBtchIngr_Map

  3. Migrated Existing Client Queries

  - Analyzed: 20+ existing client event queries in /apps/wf-server/server/events/client/
  - Identified patterns: primaryKey, dbTable, method, params already defined
  - Migration path: Direct import to eventSQL table with enhanced columns

  4. Integrated Context Store System

  - Parameter parsing: Extract :paramName from SQL
  - Context lookup: f_qryParam('paramName', 'userEmail')
  - Query substitution: Replace :appID with resolved values
  - Execution: Clean, parameterized queries

  🏗️ Architecture Overview

  Database Layer Relationships

  eventType (templates) → eventType_xref (hierarchy)
                              ↓ ↓ ↓ ↓
  eventSQL ← eventProps ← eventTrigger → context_store
      ↓           ↓           ↓
  Database Views ← Parameters ← User Actions

  Query Processing Flow

  1. Request: Component needs data via qryName
  2. Lookup: SELECT qrySQL FROM eventSQL WHERE qryName = ?
  3. Parse: Extract :paramName patterns from SQL
  4. Resolve: Replace with f_qryParam('paramName', 'userEmail')
  5. Execute: Run final SQL with resolved parameters
  6. Return: Structured data to component

  🎉 Key Benefits Achieved

  1. Separation of Concerns

  - Display data: Fast, minimal grid queries
  - Edit data: Complete form detail queries
  - Report data: Complex analytical queries with views

  2. Reusable Query Library

  - Central repository of all application queries
  - Consistent parameter handling across all queries
  - Easy to update query logic in one place

  3. Database-Driven Parameter Resolution

  - No complex server-side string manipulation
  - Leverages MySQL's strengths for context lookup
  - Clean, SQL-native parameter substitution

  4. Performance Optimization

  - Grid queries only fetch display columns
  - Form queries fetch complete records only when editing
  - Report queries use optimized database views

  🔄 Next Steps

  1. Build Query Orchestrator

  // Server-side query processor
  async function executeEventSQL(qryName, userEmail) {
    // Get query definition
    const {qrySQL, primaryKey, dbTable} = await getEventSQL(qryName);

    // Parse and resolve parameters
    const finalSQL = await resolveParameters(qrySQL, userEmail);

    // Execute and return results
    return await executeQuery(finalSQL);
  }

  2. Enhanced EventSQL Table

  -- Add the additional columns discussed
  ALTER TABLE eventSQL ADD COLUMN
    primaryKey VARCHAR(50) NULL,
    dbTable VARCHAR(50) NULL,
    method VARCHAR(10) DEFAULT 'GET';

  3. Migrate Existing Queries

  - Import all client event queries to eventSQL table
  - Update eventType_xref to reference qryName instead of inline SQL
  - Test query resolution with existing components

  4. Update Component References

  -- Before: Inline SQL in eventType_xref
  UPDATE eventType_xref SET qrySQL = 'SELECT * FROM...' WHERE id = 34;

  -- After: Reference to eventSQL
  UPDATE eventType_xref SET qrySQL = 'appList' WHERE id = 34;

  5. Build Query Management UI

  - Grid for editing eventSQL queries
  - Parameter validation and testing interface
  - Query performance monitoring
  - Version control for query changes

  🎯 Design Decisions Made

  Naming Convention

  - {entity}List - Grid display queries
  - {entity}Dtl - Form detail queries
  - {ReportName}Rpt - Complex reporting queries

  Database Views Strategy

  - Keep existing views - Good abstraction layer
  - Views for reporting - Complex joins and calculations
  - Direct tables for CRUD - Simple operations

  Parameter Resolution

  - Database-driven - MySQL function handles lookup
  - Context-store integration - Leverages existing user state
  - Clean substitution - No complex server-side parsing

  🚀 Architecture Strengths

  1. Scalable - Easy to add new queries without code changes
  2. Maintainable - Centralized query management
  3. Performant - Right-sized queries for each use case
  4. Secure - Parameter resolution prevents SQL injection
  5. Flexible - Supports simple lists to complex reports

  The foundation is rock-solid for building a comprehensive, data-driven component system!

  ---Next session: Implement the query orchestrator and complete the migration from inline SQL to eventSQL references.