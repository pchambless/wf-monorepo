**This is a new file.**  I'm not sure what happenned to the old one.

**Composites table strategy**
This is totally open to discussion and agent opinions:  I'm thinking that, if we are going to have reuseable composites, they should be base components.  I'm thinking that these base-components would be the only composites where triggers are defined.  Any complex composites (made up of one or more base-components) would inherit the triggers (and props) from the base-components.  what I have not wrapped my mind around is, how does this manifest itself in the sp_pageStructure download, or does it have to?  

**we are loading** the composites table into the server at startup.  
- /home/paul/Projects/wf-monorepo/apps/server/server/loaders/compositeLoader.js
- should we be leveraging this more strategically in our processing?
- I've created plan_communication id = 330 that will be an evolving guide to our strategy.  I'm thinking, as we discover different working patterns we can keep updating this communication.    

**Opinions/Responses/Elaborations**

## Claude's Analysis & Recommendations

**Agreement: Base-component triggers only** ✅
- This eliminates massive duplication and maintenance burden
- We've discovered 9 trigger sources - only 5 are truly base-components
- Complex composites (GridActions, AppNavigation, LoginForm) should NOT define their own triggers

**Current State Analysis:**
- **True base-components with triggers:** CRUDGrid, ModalForm, selApp, selAppPages, pageContent
- **Complex composites incorrectly defining triggers:** GridActions (should inherit Button), AppNavigation (should inherit Select), LoginForm (should inherit Form), AuthAppList (Authentication composite)
- **Inheritance needed but not implemented yet**

**Immediate Action (High Impact):**
1. **Keep triggers ONLY on 5 base-components** - fix their format
2. **Remove triggers from complex composites** - they'll inherit from base
3. **Add inheritance metadata to composites table:**
   - GridActions → inherits from Button
   - AppNavigation → inherits from Select + Select
   - LoginForm → inherits from Form
   - AuthAppList → inherits from Form

**CompositeLoader Leverage Opportunity:**
- Currently loads all composites at startup
- Could enhance to pre-compute trigger inheritance
- Build inheritance map: complexComposite → [baseComponents] → triggers
- Make triggers available at render-time without extra queries

**How triggers manifest in sp_pageStructure:**
- sp_pageStructure returns page-specific component instances
- When rendering, htmxBuilder looks up component's triggers
- If complex composite: resolve to base-component triggers via inheritance map
- Result: clean triggers without duplication in database

**Practical Win:**
- Fix 5 base-components properly → all dependent composites get correct triggers
- Build triggerBuilt for those 5 → all 9 entries benefit
- Document inheritance → clear for future composites

**Next Step Recommendation:**
1. Document base-component → complex-composite inheritance mappings
2. Remove triggers from the 4 complex composites (they'll inherit)
3. Fix + populate triggerBuilt for the 5 base-components
4. Enhance compositeLoader to handle inheritance (or sp_pageStructure query)
5. Update plan_communication 330 with this strategy

This transforms "fix 9 entries" → "fix 5 entries + document inheritance" 

**DevNote**:  
