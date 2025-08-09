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

### Complexity Levels

- **low** → `gemini-flash` (1500-4000 tokens)
  - SQL parsing, template creation, file I/O
  - Mechanical work with clear patterns
- **medium** → `gpt-4o` (3000-8000 tokens)
  - Business logic integration, state management
  - Configuration generation, testing
- **high** → `claude-sonnet` (6000-15000 tokens)
  - Architectural decisions, UI integration
  - Cross-app analysis, sophisticated reasoning

### Task Metadata Format

Tasks in `.kiro/{plan}/tasks.md` should include:

```markdown
- [ ] 2.1 Create database table schema parser
  - Write parser for SQL table definition files
  - Extract field types, constraints, and relationships
  - _Requirements: 2.4_
  - _Complexity: low_
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
