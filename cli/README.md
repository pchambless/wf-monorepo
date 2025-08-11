# Task Router CLI

Routes development tasks to appropriate AI models based on complexity metadata.

## Usage

### Basic Task Routing

```bash
# Route a specific task
npm run route-task 0040 2.1

# Direct CLI usage
./cli/route-task.js 0040 2.1
```

### Example Output

```json
{
  "plan": "0040",
  "taskId": "2.1",
  "taskName": "Create database table schema parser",
  "model": "gemini-flash",
  "complexity": "low",
  "estimatedTokens": "1500-4000",
  "reasoning": "complexity metadata",
  "completed": false,
  "requirements": "2.4"
}
```

## Model Routing

## Proposed Complexity Tiers:

### 1-simple → gemini-flash (1500-3000 tokens)

- Pure mechanical work: SQL parsing, file I/O, basic templates
- Current "low" complexity tasks

### 2-structured → gemini-flash (2000-4000 tokens)

- Pattern-based work: Config generation, validation, structured extraction
- The "gemini-capable medium" tasks we discussed

### 3-analytical → gpt-4o (3000-8000 tokens)

- Business logic analysis, workflow design, integration mapping
- Tasks requiring some reasoning but not architectural decisions

### 4-architectural → claude-sonnet (6000-15000 tokens)

- Complex reasoning, UI integration, system design, error strategies
- True architectural and sophisticated reasoning work

### Benefits:

- Better cost distribution: 2 tiers on cheap Gemini, 1 on mid-tier GPT-4o, 1 on expensive Claude
- Clearer boundaries: Easier to classify tasks appropriately
- Scalable: Can adjust tier boundaries based on actual performance

### Folder Structure:

cli/toolsets/
├── 1-simple/ # gemini-flash
├── 2-structured/ # gemini-flash
├── 3-analytical/ # gpt-4o
└── 4-architectural/ # claude-sonnet

This would let you route maybe 70% of tasks to Gemini-Flash across tiers 1+2, saving significant costs while preserving quality for complex work.

### Task Metadata Format

Tasks in `.kiro/{plan}/tasks.md` should include:

```markdown
- [ ] 2.1 Create database table schema parser
  - Write parser for SQL table definition files
  - Extract field types, constraints, and relationships
  - _Requirements: 2.4_
  - _Complexity: 1-simple_
```

## Integration

### Package.json Script

```json
{
  "scripts": {
    "route-task": "node cli/route-task.js"
  }
}
```

### Programmatic Usage

```javascript
const TaskRouter = require("./cli/TaskRouter.js");

const router = new TaskRouter();
const routing = router.routeTask("0040", "2.1");
console.log(`Route task to: ${routing.model}`);
```

## File Structure

```
/cli/
├── route-task.js      # Main CLI script
├── TaskRouter.js      # Core routing logic
└── README.md          # This file
```

## Development Workflow

1. **Create Plan**: Add requirements, design, tasks to `.kiro/{plan}/`
2. **Add Complexity**: Include `_Complexity: low|medium|high_` in tasks
3. **Route Tasks**: Use `npm run route-task {plan} {taskId}`
4. **Execute**: Use suggested model for implementation
5. **Track Progress**: Mark tasks complete with `[x]`

This enables cost-effective development by routing simple tasks to cheaper models while ensuring complex work goes to capable models.

## Advanced Usage

### Get All Tasks for a Plan

```javascript
const TaskRouter = require("./cli/TaskRouter.js");
const router = new TaskRouter();

// Get all tasks in a plan
const allTasks = router.getAllTasks("0040");
console.log(`Found ${allTasks.length} tasks`);

// Get next available task by complexity
const nextLowTask = router.getNextTask("0040", "low");
const nextHighTask = router.getNextTask("0040", "high");
```

### Batch Processing

```bash
# Process all low complexity tasks
for task in $(npm run route-task 0040 --list-by-complexity low); do
  echo "Processing $task with gemini-flash"
done
```

## Error Handling

The CLI handles common error scenarios:

- **Missing tasks.md file**: Clear error message with expected path
- **Task not found**: Lists available tasks in the plan
- **Invalid plan number**: Suggests valid plan directories
- **Malformed metadata**: Falls back to content analysis

## Complexity Detection

### Automatic Inference

If no `_Complexity:` metadata is found, the router analyzes task content:

**High Complexity Indicators:**

- architecture, integration, cross-app, analyzer, context
- sophisticated, complex, ui integration, plan context

**Low Complexity Indicators:**

- sql, database, template, file generation, parser, schema
- create, setup, configuration, migration

**Default**: Medium complexity if no clear indicators

### Override Patterns

```markdown
- [ ] 2.1 Custom task
  - _Requirements: 2.4_
  - _Model: claude-sonnet_ <!-- Explicit model override -->
  - _EstimatedTokens: 8000-12000_ <!-- Custom estimate -->
```

## Integration with Development Tools

### VS Code Integration

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Route Task",
      "type": "shell",
      "command": "npm run route-task ${input:plan} ${input:taskId}",
      "group": "build"
    }
  ],
  "inputs": [
    {
      "id": "plan",
      "description": "Plan number (e.g., 0040)",
      "default": "0040"
    },
    {
      "id": "taskId",
      "description": "Task ID (e.g., 2.1)",
      "default": "2.1"
    }
  ]
}
```

### Git Hooks Integration

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Check if any tasks.md files are missing complexity metadata
find .kiro -name "tasks.md" -exec grep -L "_Complexity:" {} \; | while read file; do
  echo "Warning: $file missing complexity metadata"
done
```

## Troubleshooting

### Common Issues

**"Tasks file not found"**

- Ensure plan directory exists: `.kiro/0040/`
- Check tasks.md file exists in plan directory
- Verify plan number format (4 digits: 0040, not 40)

**"Task X.X not found"**

- Check task numbering in tasks.md
- Ensure task follows format: `- [ ] X.X Task Name`
- Verify task is not already completed `[x]`

**"No complexity metadata"**

- Add `_Complexity: low|medium|high_` to task
- Router will fall back to content analysis
- Check reasoning field in output for detection method

### Debug Mode

```bash
# Enable debug logging
DEBUG=TaskRouter npm run route-task 0040 2.1

# Verbose output with analysis details
npm run route-task 0040 2.1 --verbose
```

## Contributing

### Adding New Models

Edit `TaskRouter.js` to add new model mappings:

```javascript
this.modelMapping = {
  low: "gemini-flash",
  medium: "gpt-4o",
  high: "claude-sonnet",
  experimental: "gpt-4o-mini", // New model
};
```

### Extending Complexity Detection

Add new patterns to `inferComplexityFromContent()`:

```javascript
const highPatterns = [
  "architecture",
  "integration",
  "cross-app",
  "your-new-pattern", // Add here
];
```

## Best Practices

1. **Always add complexity metadata** to new tasks
2. **Use consistent task numbering** (X.X format)
3. **Include requirements references** for dependency tracking
4. **Test routing** before starting implementation
5. **Update roadmap** when adding new tasks
6. **Document model choices** in task descriptions

## Cost Optimization Tips

- **Batch similar complexity tasks** to minimize context switching
- **Use low complexity models** for mechanical work (parsing, templates)
- **Reserve high complexity models** for architectural decisions
- **Estimate tokens** before starting to budget costs
- **Track actual usage** vs estimates to improve future planning
