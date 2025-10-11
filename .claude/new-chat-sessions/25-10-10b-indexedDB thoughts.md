# Indexed.DB proposal for redesign
At the risk of great token usage, I'm wondering if the indexed.db tables should mirror the names of the mysql tables:
## current structures
    componentDrafts
    triggerDrafts
    propDrafts
    eventTypeDrafts
    eventSQLDrafts
    triggerReference
    eventSQLReference
    eventTypeReference
    Pending Syncs

## proposed structures and naming

    db.version(6).stores({
    // Remove legacy tables (set to null to delete)
    componentDrafts: null,
    triggerDrafts: null,
    propDrafts: null,
    eventTypeDrafts: null,
    eventSQLDrafts: null,
    triggerReference: null,
    eventSQLReference: null,
    eventTypeReference: null

    // Keep active normalized tables that mirror the MySQL structures
    eventComp_xref: '++id, pageID, id, comp_name, parent_id, comp_type, container, posOrder, title, description, style, _dmlMethod',
    eventTrigger: '++id, id, xref_id, class, action, ordr, content, _dmlMethod',
    eventProps: '++id, id, xref_id, paramName, paramVal,_dmlMethod',
    eventType: '++id, id, Hier, name, category, title, style, config, purpose,_dmlMethod',
    eventSQL: '++id, id, qryName,qrySQL, description, _dmlMethod',
    triggers: ''++id, id, trigType, is_dom_event, name, description, param_schema, example, _dmlMethod',
    refSQL: 'id, qryName',
    refEventType: 'id, name, category'
    });

I'm not sure about keeping the refSQL separate, or if they could reference the other index tables:  refSQL => eventSQL; refEventType => eventType.

## Possible enhancement for reference tables
    1. eventSQL entries:
        - we can create views to load component types and containers from the eventTypes tables current eventSQL (containerList, componentList)
        - Other helper or reference (trigger: class / action) can be created for the studio.  

These are the beginning of my thoughts to help streamline the studio processes.  I'm ready for pushback.  