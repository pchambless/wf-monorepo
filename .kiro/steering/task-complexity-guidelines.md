# Task Complexity Guidelines

## Required Metadata for All Tasks

When creating tasks.md files, ALWAYS include complexity metadata using the 4-tier system:

```markdown
- [ ] X.X Task Name
  - Task description
  - _Requirements: X.X, Y.Y_
  - _Complexity: 1-simple|2-structured|3-analytical|4-architectural_
```

## 4-Tier Complexity System

### 1-simple → gemini-flash (1500-3000 tokens)

**Keywords**: parsing, extraction, file I/O, basic templates, setup

- Pure mechanical work with clear patterns
- SQL parsing, schema extraction
- Basic file operations
- Simple template creation

### 2-structured → gemini-flash (2000-4000 tokens)

**Keywords**: configuration, validation, mapping, transformation, pattern-based

- Pattern-based work with some logic
- Configuration generation
- Data validation and transformation
- Rule-based processing

### 3-analytical → gpt-4o (3000-8000 tokens)

**Keywords**: analysis, workflow, integration, business logic, reasoning

- Business logic analysis
- Workflow design and mapping
- Integration planning
- Multi-step problem solving

### 4-architectural → claude-sonnet (6000-15000 tokens)

**Keywords**: architecture, cross-app, UI integration, sophisticated, system design

- System architecture decisions
- Complex UI integration
- Cross-application analysis
- Sophisticated reasoning tasks

## Classification Guidelines

### Look for these indicators:

**1-simple indicators:**

- "create file", "setup directory", "copy files"
- Direct file operations
- Clear input/output patterns

**2-structured indicators:**

- "parse SQL", "extract data", "generate config", "validate data", "map relationships"
- Template processing with variables
- Rule-based transformations

**3-analytical indicators:**

- "analyze requirements", "design workflow", "integration mapping"
- Business context required
- Multi-step reasoning

**4-architectural indicators:**

- "system design", "cross-app analysis", "UI integration"
- Complex system interactions
- Sophisticated reasoning required

## Additional Metadata (Optional)

For complex tasks, consider adding:

```markdown
- [ ] X.X Complex Task Name
  - _Requirements: X.X_
  - _Complexity: 4-architectural_
  - _Reasoning: cross-app-analysis_ <!-- Why this complexity -->
  - _Dependencies: 2.1, 2.2, 3.1_ <!-- Task dependencies -->
  - _EstimatedTokens: 8000-12000_ <!-- Custom estimate -->
```

## Quality Assurance

- **Review complexity assignments** before finalizing tasks.md
- **Err on the side of higher complexity** if uncertain
- **Consider dependencies** - tasks that depend on complex work are often complex themselves
- **Think about context required** - more context = higher complexity

## Cost Optimization

Target distribution:

- **50% → 1-simple & 2-structured** (gemini-flash)
- **30% → 3-analytical** (gpt-4o)
- **20% → 4-architectural** (claude-sonnet)

This achieves optimal cost/quality balance.
