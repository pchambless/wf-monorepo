/**
 * Universal App Health Check System
 * Validates dependencies and system integrity on startup
 */

import { execEvent, setVals } from './api';

export const runHealthChecks = async () => {
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };

  console.log('🏥 Universal App Health Check Starting...');

  // Check 1: Database Connection
  try {
    const response = await execEvent('fetchEventTypeConfig');
    
    if (response.data) {
      results.passed++;
      results.details.push('✅ Database connection: OK');
    } else {
      results.failed++;
      results.details.push('❌ Database connection: FAILED');
    }
  } catch (e) {
    results.failed++;
    results.details.push(`❌ Database connection: ERROR - ${e.message}`);
  }

  // Check 2: Template System (sp_pageStructure)
  try {
    await setVals([{ paramName: 'pageID', paramVal: 1 }]);
    const response = await execEvent('fetchPageStructure');
    
    if (response.data && response.data.length >= 10) {
      results.passed++;
      results.details.push(`✅ Template system: OK (${response.data.length} components)`);
    } else {
      results.warnings++;
      results.details.push(`⚠️ Template system: WARNING (${response.data?.length || 0} components, expected 10+)`);
    }
  } catch (e) {
    results.failed++;
    results.details.push(`❌ Template system: ERROR - ${e.message}`);
  }

  // Check 3: Authentication
  try {
    const response = await fetch('http://localhost:3002/api/auth/session', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const session = await response.json();
      results.passed++;
      results.details.push(`✅ Authentication: OK (${session.email})`);
    } else {
      results.failed++;
      results.details.push('❌ Authentication: FAILED');
    }
  } catch (e) {
    results.failed++;
    results.details.push(`❌ Authentication: ERROR - ${e.message}`);
  }

  // Check 4: Required Components
  const requiredComponents = [
    'GridComponent',
    'triggerEngine',
    'fetchPageStructure',
    'renderDataGrid'
  ];

  try {
    // These should be available if imports worked
    const { GridComponent } = await import('../rendering/renderers/GridRenderer.jsx');
    const { triggerEngine } = await import('../rendering/WorkflowEngine/TriggerEngine.js');
    const { fetchPageStructure } = await import('./fetchConfig.js');
    
    if (GridComponent && triggerEngine && fetchPageStructure) {
      results.passed++;
      results.details.push('✅ Required components: OK');
    } else {
      results.failed++;
      results.details.push('❌ Required components: MISSING');
    }
  } catch (e) {
    results.failed++;
    results.details.push(`❌ Required components: ERROR - ${e.message}`);
  }

  // Check 5: Page Registry Cache
  try {
    const response = await execEvent('fetchPageAnalysis');
    
    if (response.data && response.data.length > 0) {
      results.passed++;
      results.details.push(`✅ Page registry: OK (${response.data.length} pages)`);
    } else {
      results.warnings++;
      results.details.push('⚠️ Page registry: WARNING (no pages found)');
    }
  } catch (e) {
    results.failed++;
    results.details.push(`❌ Page registry: ERROR - ${e.message}`);
  }

  // Check 6: EventType Configuration
  try {
    const response = await execEvent('fetchEventTypeConfig');
    
    if (response.data && response.data.length > 0) {
      results.passed++;
      results.details.push(`✅ EventType config: OK (${response.data.length} types)`);
    } else {
      results.warnings++;
      results.details.push('⚠️ EventType config: WARNING (no types found)');
    }
  } catch (e) {
    results.failed++;
    results.details.push(`❌ EventType config: ERROR - ${e.message}`);
  }

  // Summary
  const total = results.passed + results.failed + results.warnings;
  console.log(`🏥 Health Check Complete: ${results.passed}/${total} passed, ${results.failed} failed, ${results.warnings} warnings`);
  
  results.details.forEach(detail => console.log(detail));

  if (results.failed > 0) {
    console.error('🚨 CRITICAL: Universal App has failed health checks!');
    console.error('🔧 Troubleshooting:');
    console.error('  1. Check server is running on port 3002');
    console.error('  2. Verify database connection');
    console.error('  3. Ensure sp_pageStructure exists');
    console.error('  4. Check authentication session');
  } else if (results.warnings > 0) {
    console.warn('⚠️ Universal App has warnings but should function');
  } else {
    console.log('🎉 Universal App is healthy and ready!');
  }

  return results;
};

export const validatePageStructure = (pageStructure) => {
  const issues = [];
  
  if (!pageStructure) {
    issues.push('Page structure is null/undefined');
    return issues;
  }

  if (!pageStructure.components || !Array.isArray(pageStructure.components)) {
    issues.push('Page structure missing components array');
    return issues;
  }

  if (pageStructure.components.length === 0) {
    issues.push('Page structure has no components');
  }

  // Check for required CRUD components
  const componentTypes = pageStructure.components.map(c => c.comp_type);
  const hasContainer = componentTypes.includes('Container');
  const hasGrid = componentTypes.some(c => c.comp_type === 'Grid');
  
  if (!hasContainer) {
    issues.push('Missing Container component (required for CRUD pages)');
  }
  
  if (!hasGrid) {
    issues.push('Missing Grid component (expected for CRUD pages)');
  }

  // Check Grid component has required props
  const gridComponent = pageStructure.components.find(c => c.comp_type === 'Grid');
  if (gridComponent) {
    if (!gridComponent.props?.columns) {
      issues.push('Grid component missing columns prop');
    }
    if (!gridComponent.workflowTriggers?.onRefresh) {
      issues.push('Grid component missing onRefresh triggers');
    }
  }

  return issues;
};

export default { runHealthChecks, validatePageStructure };