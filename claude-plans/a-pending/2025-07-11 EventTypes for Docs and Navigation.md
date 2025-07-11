# User Input

Discovered a fundamental design issue with the `children` property in eventTypes. It currently serves two different purposes:

1. **Hierarchical Navigation** - Parent page feeds data to child page (e.g., `ingrTypeList` → `ingrList`)
2. **Widget Relationships** - Child page uses parent's selector widget (e.g., `brndList` provides `SelBrnd` widget for `ingrBtchList`)

Example problem:
```javascript
{
  eventType: "brndList",
  children: ["ingrBtchList"],  // Widget relationship, NOT navigation
  selWidget: "SelBrnd"         // ingrBtchList uses SelBrnd selector
}
```

Currently, the generator creates eyeball navigation from `brndList` → `ingrBtchList`, but this isn't a hierarchical data relationship - it's just indicating that `ingrBtchList` uses the `SelBrnd` widget.

The `children` array was designed for mermaid chart generation to show widget dependencies, but the navigation generator is treating it as parent→child data flow.

---

## Problem Analysis

### Current Behavior
- **Generator Logic**: `if (children.length > 0)` → create eyeball navigation
- **Mermaid Charts**: Use `children` to show widget relationship flow
- **Navigation Result**: Inappropriate navigation buttons on reference entities

### Root Cause
Single property (`children`) serving dual purposes:
1. **Data hierarchy** - actual parent→child data relationships
2. **Widget dependencies** - which entities use which selector widgets

### Impact
- **Incorrect navigation** - eyeball buttons where they shouldn't be
- **User confusion** - clicking navigation that doesn't make logical sense
- **Architecture ambiguity** - unclear relationship semantics

---

## Proposed Solutions

### **Option 1: Split into Two Properties**
```javascript
{
  eventType: "brndList",
  navChildren: [],              // Hierarchical navigation only
  widgetChildren: ["ingrBtchList"], // Widget relationship only
  selWidget: "SelBrnd"
}

{
  eventType: "ingrTypeList", 
  navChildren: ["ingrList"],    // Creates eyeball navigation
  widgetChildren: [],           // No widgets provided
  selWidget: "SelIngrType"
}
```

**Pros:**
- Clear separation of concerns
- Generator can target `navChildren` for navigation
- Mermaid can use `widgetChildren` for widget flow
- Backward compatible (keep `children` for transition)

**Cons:**
- More properties to maintain
- Need to migrate existing eventTypes
- Slightly more complex structure

### **Option 2: Navigation-Specific Property**
```javascript
{
  eventType: "brndList",
  children: ["ingrBtchList"],   // Keep for mermaid/widgets (existing)
  navigation: [],               // Only these get eyeball buttons
  selWidget: "SelBrnd"
}

{
  eventType: "ingrTypeList",
  children: ["ingrList"],       // Keep existing
  navigation: ["ingrList"],     // Explicit navigation targets
  selWidget: "SelIngrType"
}
```

**Pros:**
- Minimal changes to existing structure
- Clear navigation intent
- Preserves mermaid chart relationships
- Easy to implement

**Cons:**
- Some duplication between `children` and `navigation`
- Less semantic clarity than Option 1

### **Option 3: Relationship Type Annotations**
```javascript
{
  eventType: "brndList",
  relationships: [
    { target: "ingrBtchList", type: "widget" }
  ],
  selWidget: "SelBrnd"
}

{
  eventType: "ingrTypeList",
  relationships: [
    { target: "ingrList", type: "navigation" }
  ],
  selWidget: "SelIngrType"
}
```

**Pros:**
- Most flexible and extensible
- Clear relationship semantics
- Could support future relationship types
- Single source of truth

**Cons:**
- Major refactoring required
- More complex structure
- Significant migration effort

---

## Implementation Strategy

### **Phase 1: Analysis & Decision**
- [ ] Review all current `children` relationships in eventTypes
- [ ] Categorize as navigation vs widget relationships
- [ ] Decide on final property structure approach
- [ ] Plan migration strategy

### **Phase 2: EventTypes Migration**
- [ ] Add new relationship properties to eventTypes
- [ ] Preserve existing `children` for backward compatibility
- [ ] Test mermaid chart generation still works
- [ ] Validate new structure makes semantic sense

### **Phase 3: Generator Updates**
- [ ] Update `genPageMaps.js` to use navigation-specific property
- [ ] Test eyeball generation only appears for true navigation
- [ ] Ensure widget relationships preserved for other uses
- [ ] Update mermaid generation if needed

### **Phase 4: Cleanup & Validation**
- [ ] Remove deprecated properties if fully migrated
- [ ] Test all navigation flows work correctly
- [ ] Verify mermaid charts show correct relationships
- [ ] Document new relationship structure

---

## Expected Outcomes

### **Immediate Fixes**
- ✅ **Correct navigation** - eyeball buttons only on true parent→child relationships
- ✅ **Semantic clarity** - clear distinction between navigation and widget relationships
- ✅ **User experience** - logical navigation flow without confusion

### **Architectural Benefits**
- ✅ **Separation of concerns** - navigation vs widget dependencies clearly defined
- ✅ **Maintainable structure** - easier to understand and modify relationships
- ✅ **Extensible design** - foundation for other relationship types
- ✅ **Mermaid compatibility** - preserved widget relationship visualization

### **Future Possibilities**
- Support for other relationship types (reporting, permissions, etc.)
- More sophisticated navigation patterns
- Enhanced mermaid visualizations with relationship types
- Better tooling for relationship management

---

## Recommendation

**Start with Option 2** (navigation-specific property) for quick fix, with option to evolve to Option 1 later for better semantic clarity. This provides immediate relief while maintaining flexibility for future improvements.

**Priority:** High - affects user experience and navigation logic accuracy.