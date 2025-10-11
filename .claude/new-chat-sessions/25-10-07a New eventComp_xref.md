# Schema Redesign Session - eventComp_xref Architecture

  **Date:** 2025-10-06 (Session 2)
  **Focus:** Redesigning eventType_xref → eventComp_xref for reusability

  ---

  ## 🎉 Major Accomplishments

  ### 1. Schema Redesign - True Cross-Reference Table ✅

  **Recognized fundamental issue:**
  - `eventType_xref` was trying to be both entity AND relationship
  - Not a true cross-reference table
  - Prevented component reusability

  **Created new `eventComp_xref` structure:**
  ```sql
  CREATE TABLE `eventComp_xref` (
    `xref_id` int NOT NULL AUTO_INCREMENT,
    `comp_name` varchar(30) NOT NULL,
    `parent_name` varchar(30) DEFAULT NULL,
    `comp_type` varchar(30) NOT NULL,
    `container` varchar(30) DEFAULT 'inline',
    `posOrder` varchar(25) DEFAULT '00,00,00,left',
    `title` varchar(50) DEFAULT NULL,
    `description` varchar(255) DEFAULT NULL,
    `style` text,
    -- audit fields...
    PRIMARY KEY (`xref_id`),
    KEY `parent_name_IDX` (`parent_name`),
    CONSTRAINT `eventComp_xref_comp_type_FK`
      FOREIGN KEY (`comp_type`) REFERENCES `eventType` (`name`)
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `eventComp_xref_container_FK`
      FOREIGN KEY (`container`) REFERENCES `eventType` (`name`)
      ON DELETE RESTRICT ON UPDATE CASCADE
  )

  Key changes:
  - Uses comp_name + parent_name (string-based relationships)
  - Self-referential structure (parent_name references other rows' comp_name)
  - Removed numeric parent_id (was redundant)
  - Both comp_type AND container FK to eventType.name
  - Enables component reusability across different parents

  2. Discovered MySQL Self-Referential FK Limitation ✅

  Problem identified:
  - Self-referential FK parent_name → comp_name prevents cascading updates
  - MySQL can't handle ON UPDATE CASCADE on self-referential string columns
  - Circular dependency checking prevents renames

  Attempted solutions:
  1. ✅ ON DELETE RESTRICT + ON UPDATE CASCADE - Failed
  2. ✅ ON DELETE CASCADE + ON UPDATE CASCADE - Failed
  3. ✅ Removed USI (comp_name, parent_name) - Still failed
  4. ✅ All attempts blocked by FK constraint

  Root cause:
  MySQL limitation - can't cascade updates on self-referential tables when referenced column changes.

  3. Solution: Trigger-Based Cascade ✅

  Decision: Use trigger to handle cascading renames

  Implementation needed:
  DELIMITER $$
  CREATE TRIGGER before_comp_name_update
  BEFORE UPDATE ON eventComp_xref
  FOR EACH ROW
  BEGIN
      IF OLD.comp_name != NEW.comp_name THEN
          UPDATE eventComp_xref
          SET parent_name = NEW.comp_name
          WHERE parent_name = OLD.comp_name;
      END IF;
  END$$
  DELIMITER ;

  Benefits:
  - ✅ Allows component renames
  - ✅ Automatically updates all children's parent_name
  - ✅ Maintains referential integrity
  - ✅ Keeps xref_id stable (no DELETE+INSERT)
  - ✅ No FK blocking the operation

  4. Fixed sp_hier_structure ✅

  Issues found and fixed:

  Collation error:
  -- Fixed by adding COLLATE to all UNION branches
  CAST(CONCAT(...) AS CHAR(500)) COLLATE utf8mb4_general_ci AS id_path

  id_path logic error:
  -- WRONG: Was using parent_name (duplicated nodes)
  CONCAT(p.id_path, ',', v.parent_name)

  -- CORRECT: Now uses comp_name (proper path)
  CONCAT(p.id_path, ',', v.comp_name)

  Result: Hierarchy paths now correct:
  - Before: "login,loginPage,loginPage,LoginForm" ❌
  - After: "login,loginPage,LoginForm,loginSubmit" ✅

  5. Updated vw_hier_components View ✅

  Aligned with new schema:
  CREATE OR REPLACE VIEW `api_wf`.`vw_hier_components` AS
  SELECT
      x.xref_id,
      x.parent_name,
      x.comp_name,
      CONCAT(x.parent_name, '.', x.comp_name) AS parentCompName,
      x.title,
      x.comp_type,
      x.container,
      x.posOrder,
      x.style AS override_styles,
      x.description
  FROM api_wf.eventComp_xref x
  WHERE x.active = 1
    AND x.parent_name <> x.comp_name
  ORDER BY x.parent_name, x.comp_name, x.posOrder;

  ---
  🔑 Key Architecture Decisions

  String-Based Relationships vs Numeric IDs

  Chose: String-based (comp_name + parent_name)

  Reasoning:
  - Better for Studio UI (names are meaningful)
  - Client/server already orchestrates by names
  - Enables reusability (same name under different parents)
  - IDs are generated, names are intentional

  Trade-off:
  - Renames require cascade handling (via trigger)
  - Can't use standard FK CASCADE (MySQL limitation)

  Component Reusability Model

  Pattern hierarchy notation: parent:child
  - 57:60 → ingrTypePage:crudContainer
  - 60:56 → crudContainer:ingrTypeGrid
  - 60:59 → crudContainer:ingrTypeForm

  Enables:
  - Same component pattern (crudContainer) reused across pages
  - Template cloning with preserved structure
  - Meaningful component paths

  No Separate Component Definitions Table

  Decided against: eventComps + eventComp_xref split

  Reasoning:
  - Would recreate old architecture problem
  - Each row IS both definition AND relationship
  - comp_type tells you WHAT it is (Grid, Form, etc.)
  - comp_name is the instance identifier

  ---
  📋 Current State

  Schema Migration:
  - ✅ Created eventComp_xref table
  - ✅ Migrated data from eventType_xref
  - ✅ Fixed sp_hier_structure stored procedure
  - ✅ Updated vw_hier_components view
  - ⏳ Need to create rename trigger
  - ⏳ Need to update eventProps references
  - ⏳ Need to update eventTriggers references

  What Works:
  - ✅ Hierarchy queries return correct paths
  - ✅ View shows proper relationships
  - ✅ FK constraints enforce type validity

  What Doesn't Work Yet:
  - ❌ Renaming components (blocked by FK until trigger added)
  - ⏳ Studio integration (needs schema updates)

  ---
  🚀 Next Steps (High Priority)

  1. Implement Rename Trigger

  CREATE TRIGGER before_comp_name_update
  BEFORE UPDATE ON eventComp_xref
  FOR EACH ROW
  BEGIN
      IF OLD.comp_name != NEW.comp_name THEN
          UPDATE eventComp_xref
          SET parent_name = NEW.comp_name
          WHERE parent_name = OLD.comp_name;
      END IF;
  END;

  Test:
  - Rename a component with children
  - Verify children's parent_name updates
  - Verify xref_id stays stable
  - Check cascade works multiple levels deep

  2. Decide on USI Strategy

  Options:
  1. No USI - Application validates unique names per parent
  2. UNIQUE (comp_name, parent_name) - Prevents duplicates but may conflict with trigger
  3. UNIQUE (comp_name) globally - Too restrictive

  Recommendation: Test trigger first, then add USI if it doesn't conflict.

  3. Update Related Tables

  eventProps:
  -- Already links to xref_id, should work as-is
  -- Verify FK constraint still valid

  eventTriggers:
  -- Already links to xref_id, should work as-is
  -- Verify FK constraint still valid

  4. Studio Integration

  Update queries to use new schema:
  - xrefBasicDtl - already works with view
  - xrefTriggerList - should work with xref_id
  - xrefPropList - should work with xref_id
  - sp_genFields - verify it works with new schema
  - sp_clone_component_tree - needs complete rewrite for name-based cloning

  5. Component Creation UI

  Next major feature:
  - Add "Create Component" in Studio
  - Form to set: comp_name, comp_type, parent_name, container, posOrder
  - Validate unique names under parent (application-level)
  - Auto-populate reasonable defaults

  6. Template/Clone System

  Once schema is stable:
  - Define what makes a component a "template"
  - Clone workflow with name substitution
  - Template library UI
  - Parameter replacement during clone

  ---
  💡 Open Questions for Next Session

  1. USI Decision:
    - Add back after trigger implementation?
    - Risk of trigger + USI conflict?
    - Application-level validation sufficient?
  2. Migration Path:
    - Keep old eventType_xref during transition?
    - Dual-write to both tables?
    - Hard cutover date?
  3. Naming Conventions:
    - Enforce naming patterns (camelCase)?
    - Reserved names (system components)?
    - Namespace prefixes (app-specific)?
  4. Reusability Scope:
    - Global templates vs app-specific?
    - How to browse/search reusable components?
    - Version control for templates?

  ---
  🐛 Issues Discovered

  1. ✅ MySQL can't CASCADE on self-referential string FK updates
  2. ✅ UNION collation mismatch in recursive CTE
  3. ✅ id_path logic used wrong field (parent_name vs comp_name)
  4. ✅ FK constraint on wrong column (container vs comp_type)

  ---
  📊 Session Stats

  Token Usage: ~150K/200K (75% used)Schema Changes: 1 new table, 1 view updated, 1 SP fixedKey Decision: Trigger-based cascade over numeric ID FK

  ---
  💭 Architectural Insights

  The View Was Right:
  - vw_hierarchy_xref showed the correct structure all along
  - Denormalized names revealed the normalized design
  - View-driven schema design = good intuition

  Names vs IDs Trade-off:
  - Names = meaningful, readable, Studio-friendly
  - IDs = stable, fast, no cascade issues
  - Chose names + trigger = best of both worlds

  Self-Referential Complexity:
  - String-based self-reference hits MySQL limitations
  - Triggers provide workaround without losing semantics
  - Worth the complexity for better UX

  True Cross-Reference:
  - Separating entity from relationship = key insight
  - Each row is BOTH (hybrid approach)
  - Enables reusability without extra table

  ---
  🎯 Success Criteria for Next Session

  1. ✅ Trigger implemented and tested
  2. ✅ Component rename works with cascade
  3. ✅ xref_id remains stable through renames
  4. ✅ Studio loads components from new schema
  5. ✅ All queries updated to use name-based joins
  6. ✅ USI decision finalized
