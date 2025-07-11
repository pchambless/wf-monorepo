## User Input
Restructure DevTools documentation architecture. Implement the new folder structure (automation/, documentation/, configuration/, utils/), move files to appropriate locations, and create unified HTML generation system. Focus on separating code generation from documentation generation.

**Key folder restructure:**
- Move sample data files to `/automation/data/samples/` 
- Consolidate automation tools in `/automation/generators/`
- Separate documentation generation to `/documentation/`
- Create `/configuration/` for registries and events.json