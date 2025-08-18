---
inclusion: always
---

# UI Component Strategy - Vanilla React First

## Core Philosophy: Progressive Enhancement

Based on real-world experience with MUI causing theme context conflicts, bundle bloat, and complexity issues, this monorepo follows a **Vanilla React First** approach.

## Architecture Levels

### Level 1: Vanilla React + CSS (Foundation) ✅

**Use for:** All basic layouts, navigation, forms, simple components

```javascript
// Preferred approach - reliable, fast, maintainable
const styles = {
  container: { display: "flex", height: "100vh" },
  sidebar: { width: "240px", backgroundColor: "#f5f5f5" },
  button: { padding: "8px 16px", border: "none", borderRadius: "4px" },
};

return <div style={styles.container}>...</div>;
```

**Benefits:**

- No dependency conflicts
- Fast development cycle
- Easy debugging
- Consistent styling
- Better performance

### Level 2: Lightweight Libraries (When Needed)

**Use for:** Specific functionality that vanilla can't handle efficiently

```javascript
// Data tables
import { useReactTable } from "@tanstack/react-table";

// Forms with validation
import { useForm } from "react-hook-form";

// Icons
import { FiEdit, FiTrash } from "react-icons/fi";

// Date handling
import { format } from "date-fns";
```

### Level 3: Specialized Tools (Specific Use Cases)

**Use for:** Complex interactions that require specialized libraries

```javascript
// Charts and data visualization
import { LineChart } from "recharts";

// Rich text editing
import { Editor } from "slate-react";

// Complex animations
import { motion } from "framer-motion";
```

## ❌ Avoid Heavy UI Frameworks

### MUI/Material-UI Issues:

- Theme context requirements cause conflicts
- Large bundle size (~300KB+ minified)
- Frequent breaking changes
- Over-engineered for simple use cases
- Difficult to customize

### Other Heavy Frameworks to Avoid:

- Ant Design (similar issues to MUI)
- Chakra UI (theme dependency)
- Mantine (complexity overhead)

## ✅ Recommended Alternatives

### For Common Needs:

**Data Grids:**

- `@tanstack/react-table` (headless, lightweight)
- `react-window` (virtualization)
- Custom CSS Grid layouts

**Forms:**

- `react-hook-form` (tiny, performant)
- Vanilla controlled components
- Custom validation functions

**UI Primitives:**

- `@headlessui/react` (unstyled, accessible)
- `@radix-ui/react-*` (unstyled primitives)
- Custom components with CSS modules

**Styling:**

- CSS Modules
- Styled-components (if needed)
- CSS-in-JS with emotion (minimal usage)
- Plain CSS with BEM methodology

## Implementation Guidelines

### 1. Start Simple

```javascript
// Always try vanilla first
const Button = ({ variant, children, onClick }) => {
  const baseStyle = {
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
  };
  const variantStyle =
    variant === "primary"
      ? { background: "#1976d2", color: "white" }
      : { background: "#f5f5f5", color: "#333" };

  return (
    <button style={{ ...baseStyle, ...variantStyle }} onClick={onClick}>
      {children}
    </button>
  );
};
```

### 2. Build Reusable Components

```javascript
// Create your own design system
const theme = {
  colors: { primary: "#1976d2", secondary: "#f5f5f5" },
  spacing: { sm: "8px", md: "16px", lg: "24px" },
  borderRadius: "4px",
};
```

### 3. Use CSS Variables

```css
:root {
  --color-primary: #1976d2;
  --color-secondary: #f5f5f5;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --border-radius: 4px;
}
```

## Decision Tree

When adding UI functionality:

1. **Can vanilla React + CSS handle this?** → Use vanilla
2. **Do I need complex data handling?** → Consider headless libraries
3. **Is this a one-off complex interaction?** → Evaluate specialized tools
4. **Am I reaching for a heavy framework?** → Stop and reconsider

## Success Examples

### Working Well:

- `SimpleLayout` component (vanilla React + CSS)
- Studio components (converted from MUI to vanilla)
- Navigation systems
- Form layouts
- Grid displays

### Avoid:

- MUI ThemeProvider conflicts
- Heavy component libraries
- Over-engineered solutions for simple problems

## Maintenance Benefits

This approach provides:

- **Reliability** - No theme context issues
- **Performance** - Smaller bundles, faster loading
- **Maintainability** - Less complexity, easier debugging
- **Consistency** - Your own design system
- **Flexibility** - Easy to customize exactly what you need

## Migration Strategy

When encountering MUI components:

1. Assess if vanilla React can replace it
2. Convert to vanilla with equivalent styling
3. Add CSS classes for reusability
4. Document the pattern for future use

This strategy has proven successful in resolving dependency conflicts while maintaining development velocity and code quality.
