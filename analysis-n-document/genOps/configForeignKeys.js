// Foreign Key Mappings - Unified config for all apps
// Supports both selectVals-based (plan-management) and database FK relationships

export const foreignKeyMappings = {
    // Plans app - selectVals-based lookups (future DB table)
    plans: {
        type: 'selectVals',
        mappings: {
            'status': 'planStatus',
            'priority': 'priority', 
            'cluster': 'cluster',
            'complexity': 'complexity',
            'phase': 'workflowPhases',
            'impact_type': 'workflowImpactTypes',
            'change_type': 'workflowImpactTypes',
            'agent': 'workflowAgents',
            'from_agent': 'workflowAgents',
            'to_agent': 'workflowAgents',
            'error_handling': 'workflowErrorHandling',
            'retry_policy': 'workflowRetryPolicies'
        }
    },
    
    // Client app - traditional database FK relationships  
    client: {
        type: 'database',
        mappings: {
            'measID': { entity: 'measurements', dispField: 'name' },
            'vndrID': { entity: 'vendors', dispField: 'name' },
            'ingrID': { entity: 'ingredients', dispField: 'name' },
            'prodID': { entity: 'products', dispField: 'name' },
            'brndID': { entity: 'brands', dispField: 'name' },
            'wrkrID': { entity: 'workers', dispField: 'name' }
        }
    }
};

// Helper function to get mapping for specific app and field
export function getForeignKeyMapping(appName, fieldName) {
    const appConfig = foreignKeyMappings[appName];
    if (!appConfig) return null;
    
    const mapping = appConfig.mappings[fieldName];
    if (!mapping) return null;
    
    return {
        type: appConfig.type,
        mapping: mapping
    };
}

// Helper to check if field is a foreign key in any app
export function isForeignKey(fieldName, appName = null) {
    if (appName) {
        return foreignKeyMappings[appName]?.mappings[fieldName] !== undefined;
    }
    
    // Check all apps if no specific app provided
    return Object.values(foreignKeyMappings).some(app => 
        app.mappings[fieldName] !== undefined
    );
}