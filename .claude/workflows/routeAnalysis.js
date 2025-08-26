/**
 * Route Analysis Workflow - Deterministic route validation
 * Runs independently without LLM tokens
 * 
 * Validates: EventTypes → routes.js → App.jsx → components flow
 * Location: .claude/workflows/routeAnalysis.js
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const MONOREPO_ROOT = join(__dirname, '..', '..');

/**
 * Analyze routing architecture for a WhatsFresh app
 * @param {string} appName - App name (wf-client, wf-plan-management, wf-admin)
 * @param {Object} options - Analysis options
 * @returns {Object} Structured route analysis findings
 */
export function analyzeRoutes(appName, options = {}) {
  const appPath = join(MONOREPO_ROOT, 'apps', appName);
  
  const analysis = {
    appName,
    appPath,
    timestamp: new Date().toISOString(),
    findings: {
      passed: [],
      warnings: [],
      failures: []
    },
    routes: {},
    eventTypes: {},
    components: {},
    recommendations: []
  };

  try {
    // 1. Validate app existence
    if (!existsSync(appPath)) {
      analysis.findings.failures.push(`App does not exist at path: ${appPath}`);
      return analysis;
    }
    analysis.findings.passed.push(`App exists at ${appPath}`);

    // 2. Analyze EventTypes (app-specific + shared)
    const eventTypesAnalysis = analyzeEventTypes(appPath);
    analysis.eventTypes = eventTypesAnalysis;

    // 3. Analyze routes.js configuration
    const routesAnalysis = analyzeRoutesConfig(appPath);
    analysis.routes = routesAnalysis;

    // 4. Analyze App.jsx routing implementation
    const appAnalysis = analyzeAppRouting(appPath);
    analysis.app = appAnalysis;

    // 5. Analyze page components
    const componentsAnalysis = analyzePageComponents(appPath, routesAnalysis.definedRoutes);
    analysis.components = componentsAnalysis;

    // 6. Cross-validate routing flow
    validateRoutingFlow(analysis);

  } catch (error) {
    analysis.findings.failures.push(`Analysis error: ${error.message}`);
  }

  return analysis;
}

/**
 * Analyze EventTypes for route definitions (app-specific + shared)
 */
function analyzeEventTypes(appPath) {
  const analysis = {
    found: [],
    withRoutePaths: [],
    pageEventTypes: [],
    issues: []
  };

  try {
    // 1. Check app-specific eventTypes (NEW ARCHITECTURE)
    const appEventsPath = join(appPath, 'src', 'events');
    if (existsSync(appEventsPath)) {
      const appEvents = scanEventTypesRecursive(appEventsPath);
      analysis.found.push(...appEvents.map(event => ({
        ...event,
        source: 'app-specific'
      })));
    }

    // 2. Check shared eventTypes for routing (LEGACY + mixed)
    const sharedEventsPath = join(MONOREPO_ROOT, 'packages', 'shared-imports', 'src', 'events');
    
    // Client eventTypes (some have routes like userLogin)
    const clientEventsPath = join(sharedEventsPath, 'client', 'eventTypes');
    if (existsSync(clientEventsPath)) {
      const clientEvents = scanEventTypes(clientEventsPath);
      analysis.found.push(...clientEvents.map(event => ({
        ...event,
        source: 'shared-client'
      })));
    }

    // Admin eventTypes (some have routes like userLogin)  
    const adminEventsPath = join(sharedEventsPath, 'admin', 'eventTypes');
    if (existsSync(adminEventsPath)) {
      const adminEvents = scanEventTypes(adminEventsPath);
      analysis.found.push(...adminEvents.map(event => ({
        ...event,
        source: 'shared-admin'
      })));
    }

    // Filter events with routePaths
    analysis.withRoutePaths = analysis.found.filter(event => event.routePath);
    analysis.pageEventTypes = analysis.found.filter(event => 
      event.category === 'page' || event.eventType?.startsWith('page-')
    );

  } catch (error) {
    analysis.issues.push(`EventTypes scan error: ${error.message}`);
  }

  return analysis;
}

/**
 * Scan eventTypes directory for route definitions
 */
function scanEventTypes(dirPath) {
  const events = [];
  
  if (!existsSync(dirPath)) return events;

  try {
    const files = readdirSync(dirPath).filter(f => f.endsWith('.js'));
    
    for (const file of files) {
      try {
        const filePath = join(dirPath, file);
        const content = readFileSync(filePath, 'utf8');
        
        // Extract eventType definition using regex (safer than dynamic import)
        const routePathMatch = content.match(/routePath:\s*["']([^"']+)["']/);
        const eventTypeMatch = content.match(/eventType:\s*["']([^"']+)["']/);
        const categoryMatch = content.match(/category:\s*["']([^"']+)["']/);
        
        if (eventTypeMatch) {
          events.push({
            file,
            filePath,
            eventType: eventTypeMatch[1],
            routePath: routePathMatch?.[1],
            category: categoryMatch?.[1]
          });
        }
      } catch (fileError) {
        // Skip files that can't be read
      }
    }
  } catch (dirError) {
    // Skip directories that can't be read
  }

  return events;
}

/**
 * Recursively scan eventTypes directory structure
 */
function scanEventTypesRecursive(dirPath) {
  const events = [];
  
  if (!existsSync(dirPath)) return events;

  try {
    const items = readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory()) {
        // Recursively scan subdirectories
        events.push(...scanEventTypesRecursive(join(dirPath, item.name)));
      } else if (item.name.endsWith('.js')) {
        // Scan individual JS files
        events.push(...scanEventTypes(dirPath).filter(e => e.file === item.name));
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }

  return events;
}

/**
 * Analyze routes.js configuration file
 */
function analyzeRoutesConfig(appPath) {
  const routesPath = join(appPath, 'src', 'config', 'routes.js');
  const analysis = {
    exists: false,
    definedRoutes: {},
    importsSafeEventTypes: false,
    hasGetRoutesFunction: false,
    issues: []
  };

  try {
    if (!existsSync(routesPath)) {
      analysis.issues.push('routes.js does not exist');
      return analysis;
    }

    analysis.exists = true;
    const content = readFileSync(routesPath, 'utf8');

    // Check for getSafeEventTypes import
    analysis.importsSafeEventTypes = content.includes('getSafeEventTypes');

    // Check for getRoutes function
    analysis.hasGetRoutesFunction = content.includes('function getRoutes') || content.includes('getRoutes()');

    // Extract route definitions using regex
    const routeMatches = content.matchAll(/(\w+):\s*{\s*path:\s*["']([^"']+)["']/g);
    for (const match of routeMatches) {
      analysis.definedRoutes[match[1]] = {
        routeKey: match[1],
        path: match[2]
      };
    }

  } catch (error) {
    analysis.issues.push(`routes.js analysis error: ${error.message}`);
  }

  return analysis;
}

/**
 * Analyze App.jsx routing implementation
 */
function analyzeAppRouting(appPath) {
  const appJsxPath = join(appPath, 'src', 'App.jsx');
  const analysis = {
    exists: false,
    hasRouter: false,
    hasRoutes: false,
    hasLazyLoading: false,
    routeComponents: [],
    issues: []
  };

  try {
    if (!existsSync(appJsxPath)) {
      analysis.issues.push('App.jsx does not exist');
      return analysis;
    }

    analysis.exists = true;
    const content = readFileSync(appJsxPath, 'utf8');

    // Check for routing components
    analysis.hasRouter = content.includes('BrowserRouter') || content.includes('Router');
    analysis.hasRoutes = content.includes('<Routes>') && content.includes('<Route');
    analysis.hasLazyLoading = content.includes('lazy(') && content.includes('Suspense');

    // Extract Route components - handle both static paths and ROUTES references
    const staticRouteMatches = content.matchAll(/<Route[^>]*path=["']([^"']+)["'][^>]*element={[^}]*<([^/>]+)[^>]*>/g);
    for (const match of staticRouteMatches) {
      analysis.routeComponents.push({
        path: match[1],
        component: match[2],
        type: 'static'
      });
    }
    
    // Handle ROUTES object references like path={ROUTES.dashboard.path}
    const routesRefMatches = content.matchAll(/<Route[^>]*path={ROUTES\.(\w+)\.path}[^>]*element={[^}]*<([^/>]+)[^>]*>/g);
    for (const match of routesRefMatches) {
      analysis.routeComponents.push({
        routeKey: match[1],
        component: match[2], 
        type: 'routes-reference'
      });
    }

  } catch (error) {
    analysis.issues.push(`App.jsx analysis error: ${error.message}`);
  }

  return analysis;
}

/**
 * Analyze page components directory
 */
function analyzePageComponents(appPath, definedRoutes) {
  const pagesPath = join(appPath, 'src', 'pages');
  const analysis = {
    pagesDir: existsSync(pagesPath),
    foundComponents: [],
    missingComponents: [],
    issues: []
  };

  try {
    if (!analysis.pagesDir) {
      analysis.issues.push('src/pages directory does not exist');
      return analysis;
    }

    // Get all page directories
    const pageDirs = readdirSync(pagesPath, { withFileTypes: true })
      .filter(item => item.isDirectory())
      .map(item => item.name);

    analysis.foundComponents = pageDirs;

    // Check for missing components based on defined routes
    const expectedComponents = Object.values(definedRoutes).map(route => {
      // Convert route path to expected component folder
      return route.path.replace('/', '').replace(/[:\-]/g, '_');
    });

    analysis.missingComponents = expectedComponents.filter(expected => 
      !pageDirs.some(found => found.toLowerCase().includes(expected.toLowerCase()))
    );

  } catch (error) {
    analysis.issues.push(`Page components analysis error: ${error.message}`);
  }

  return analysis;
}

/**
 * Cross-validate the routing flow for consistency
 */
function validateRoutingFlow(analysis) {
  const { findings, eventTypes, routes, app, components } = analysis;

  // Check EventTypes → routes.js flow
  if (eventTypes.withRoutePaths.length > 0 && !routes.importsSafeEventTypes) {
    findings.warnings.push('EventTypes have routePaths but routes.js does not import getSafeEventTypes');
  }

  // Check routes.js → App.jsx flow
  const definedRouteCount = Object.keys(routes.definedRoutes).length;
  const implementedRouteCount = app.routeComponents.length;
  
  if (definedRouteCount > implementedRouteCount) {
    findings.warnings.push(`${definedRouteCount - implementedRouteCount} routes defined but not implemented in App.jsx`);
    
    // Find specific missing routes
    const definedPaths = Object.values(routes.definedRoutes).map(route => route.path);
    const implementedPaths = app.routeComponents.map(route => route.path);
    const missingRoutes = definedPaths.filter(path => !implementedPaths.includes(path));
    
    if (missingRoutes.length > 0) {
      findings.warnings.push(`Missing Route implementations: ${missingRoutes.join(', ')}`);
    }
  }

  // Check App.jsx → components flow
  const componentDirs = components.foundComponents;
  const routeComponents = app.routeComponents;
  
  for (const routeComponent of routeComponents) {
    const expectedDir = routeComponent.component.toLowerCase();
    if (!componentDirs.some(dir => dir.toLowerCase().includes(expectedDir))) {
      findings.warnings.push(`Route component ${routeComponent.component} may be missing page directory`);
    }
  }

  // Success validations
  if (routes.exists && routes.hasGetRoutesFunction) {
    findings.passed.push('routes.js has proper getRoutes function');
  }
  
  if (app.hasRouter && app.hasRoutes) {
    findings.passed.push('App.jsx has proper Router and Routes setup');
  }
  
  if (app.hasLazyLoading) {
    findings.passed.push('App.jsx implements lazy loading for performance');
  }

  // Generate recommendations
  generateRecommendations(analysis);
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(analysis) {
  const { findings, routes, app, components } = analysis;

  if (!routes.exists) {
    analysis.recommendations.push({
      priority: 'HIGH',
      type: 'MISSING_CONFIG',
      description: 'Create routes.js configuration file',
      action: 'Add src/config/routes.js with getSafeEventTypes integration'
    });
  }

  if (!app.hasRouter) {
    analysis.recommendations.push({
      priority: 'HIGH', 
      type: 'MISSING_ROUTER',
      description: 'Add React Router to App.jsx',
      action: 'Wrap app with BrowserRouter and add Routes configuration'
    });
  }

  if (components.missingComponents.length > 0) {
    analysis.recommendations.push({
      priority: 'MEDIUM',
      type: 'MISSING_COMPONENTS',
      description: `Create missing page components: ${components.missingComponents.join(', ')}`,
      action: 'Add component directories and index.jsx files'
    });
  }

  if (!app.hasLazyLoading && app.routeComponents.length > 3) {
    analysis.recommendations.push({
      priority: 'LOW',
      type: 'PERFORMANCE',
      description: 'Consider implementing lazy loading for performance',
      action: 'Use React.lazy() and Suspense for route components'
    });
  }
}

// CLI usage for testing
if (process.argv[2]) {
  const appName = process.argv[2];
  const results = analyzeRoutes(appName);
  console.log(JSON.stringify(results, null, 2));
}