# Design Document

## Overview

The Agent-Based Task Assignment System replaces the current complexity-based task routing (1,2,3,4) with an expertise-based agent assignment system. The design leverages a clean slate approach with no backward compatibility requirements, focusing on optimal task-expert matching through specialized domain knowledge.

The system consists of three main components: Agent Registry (configuration-based), Routing Engine (intelligent assignment), and Integration Layer (workflow engine interface).

## Architecture

### High-Level Architecture

```mermaid
graph TB
    A[Task Submission] --> B[AgentRouter.js]
    B --> C[Agent Registry]
    C --> D[Expertise Matching]
    D --> E[Context Optimization]
    E --> F[Agent Assignment]
    F --> G[Task Execution]

    H[/.claude/config/registry.json] --> C
    I[/.claude/agents/*.md] --> C

    G --> J[Quality Metrics]
    J --> K[Performance Tracking]
```

### Directory Structure

```
/.claude/
├── agents/              (existing .md files)
├── config/
│   └── registry.json   (agent definitions with domains, capabilities, expertise)
└── routing/
    ├── AgentRouter.js  (routing engine)
    └── test-agent-system.js (validation tests)
```

## Components and Interfaces

### 1. Agent Registry System

**Location:** `/.claude/config/registry.json`

**Purpose:** Central configuration for agent capabilities, expertise domains, and routing rules.

**Structure:**

```json
{
  "agents": {
    "eventParser": {
      "expertise": {
        "eventTypes": 95,
        "layoutParsing": 90,
        "queryParsing": 85
      },
      "domains": ["events", "eventTypes", "layout", "query"],
      "contextLimits": {
        "maxTokens": 8000,
        "optimalTokens": 4000
      },
      "capabilities": ["parsing", "validation", "transformation"],
      "fallbackAgents": ["generalDeveloper", "architecturalAnalyst"]
    }
  },
  "domainMappings": {
    "eventTypes": ["eventParser", "layoutParser"],
    "database": ["databaseSpecialist", "queryParser"],
    "ui": ["uiSpecialist", "componentBuilder"]
  }
}
```

### 2. Routing Engine

**Location:** `/.claude/routing/AgentRouter.js`

**Purpose:** Intelligent agent selection based on task domain and expertise matching.

**Key Methods:**

- `routeTask(taskMetadata)` - Primary routing logic
- `calculateExpertiseMatch(task, agent)` - Scoring algorithm
- `optimizeContext(task, agent)` - Context trimming
- `handleFallback(task, unavailableAgents)` - Fallback strategies

### 3. Task Metadata Enhancement

**New Task Structure:**

```javascript
{
  taskId: "unique-identifier",
  domain: "eventTypes", // replaces complexity scoring
  expertise: ["parsing", "validation"],
  context: {
    files: ["path/to/relevant/files"],
    requirements: ["specific requirements"],
    dependencies: ["other-task-ids"]
  },
  assignedAgent: "eventParser",
  priority: "medium",
  estimatedTokens: 4000
}
```

## Data Models

### Agent Definition Model

```javascript
class Agent {
  constructor(id, config) {
    this.id = id;
    this.expertise = config.expertise; // domain -> score mapping
    this.domains = config.domains; // array of domain strings
    this.contextLimits = config.contextLimits;
    this.capabilities = config.capabilities;
    this.fallbackAgents = config.fallbackAgents;
    this.availability = true; // runtime status
  }

  calculateMatch(taskDomain, taskExpertise) {
    // Expertise matching algorithm
  }

  optimizeContext(taskContext) {
    // Context trimming logic
  }
}
```

### Task Model

```javascript
class Task {
  constructor(metadata) {
    this.id = metadata.taskId;
    this.domain = metadata.domain;
    this.expertise = metadata.expertise;
    this.context = metadata.context;
    this.assignedAgent = null;
    this.status = "pending";
    this.metrics = {
      routingTime: null,
      executionTime: null,
      qualityScore: null,
    };
  }
}
```

## Error Handling

### Routing Failures

1. **No Available Agent:** Use fallback chain defined in registry
2. **Context Too Large:** Intelligent trimming based on agent limits
3. **Domain Mismatch:** Route to general-purpose agent with warning
4. **Agent Unavailable:** Queue task or route to secondary agent

### Fallback Strategies

```javascript
const fallbackStrategies = {
  noExpertMatch: "route-to-general-agent",
  agentUnavailable: "use-fallback-chain",
  contextOverflow: "trim-and-retry",
  systemFailure: "emergency-routing",
};
```

## Testing Strategy

### Unit Tests

- Agent registry loading and validation
- Expertise matching algorithms
- Context optimization logic
- Fallback strategy execution

### Integration Tests

- End-to-end task routing
- Agent availability handling
- Performance under load
- Quality metrics collection

### Test Implementation

**Location:** `/.claude/routing/test-agent-system.js`

**Test Scenarios:**

- Perfect expertise match routing
- Fallback chain execution
- Context optimization effectiveness
- Performance benchmarking

## Quality Metrics and Performance Tracking

### Metrics Collection

```javascript
class QualityMetrics {
  trackRouting(taskId, agentId, routingTime) {
    // Track routing decision time and accuracy
  }

  trackExecution(taskId, executionTime, qualityScore) {
    // Track task completion metrics
  }

  trackExpertiseMatch(taskDomain, agentExpertise, outcome) {
    // Track effectiveness of expertise matching
  }

  generateOptimizationReport() {
    // Provide recommendations for agent assignments
  }
}
```

### Performance Optimization

- **Caching:** Agent registry loaded once, cached in memory
- **Lazy Loading:** Agent definitions loaded on-demand
- **Parallel Processing:** Multiple routing decisions can occur simultaneously
- **Context Trimming:** Intelligent reduction of context size per agent limits

## Integration Points

### Workflow Engine Integration

The system integrates with existing workflow infrastructure through clean APIs:

```javascript
// Replace existing complexity-based routing
const oldRouting = {
  complexity: 1 - 4,
  model: "gemini-flash|gpt-4o|claude-sonnet",
};

// New expertise-based routing
const newRouting = {
  domain: "eventTypes",
  expertise: ["parsing", "validation"],
  agent: "eventParser",
};
```

### Existing Agent Infrastructure

Leverages current `.claude/agents/*.md` files as agent definitions while adding structured configuration through `registry.json`.

### Future Workflow Engine Compatibility

Provides clean APIs for:

- Task submission with metadata
- Agent status queries
- Performance metrics retrieval
- Configuration updates

## Proposed Agent Specializations

Based on current system analysis, the following specialized agents are recommended:

### EventTypes Domain

- **layoutParser:** Specializes in layout eventTypes (page*, tab*, container\*)
- **queryParser:** Specializes in query eventTypes (grid*, form*, select\*)

### Database Domain

- **schemaAnalyst:** Database schema analysis and migration
- **queryOptimizer:** SQL query optimization and performance

### UI Domain

- **componentBuilder:** React component generation and optimization
- **studioIntegrator:** Studio-specific UI integration

## Migration Strategy

### Phase 1: Registry Setup

1. Create `/.claude/config/registry.json` with initial agent definitions
2. Implement `AgentRouter.js` with basic routing logic
3. Create validation tests

### Phase 2: Integration

1. Replace complexity-based routing in workflow engine
2. Update task metadata structure
3. Implement quality metrics collection

### Phase 3: Optimization

1. Analyze routing effectiveness
2. Add specialized agents based on performance data
3. Optimize context trimming algorithms

## Success Criteria

- **Routing Accuracy:** >90% of tasks routed to appropriate specialized agents
- **Performance:** Routing decisions completed in <100ms
- **Quality Improvement:** Measurable improvement in task outcomes compared to complexity-based system
- **Scalability:** System handles addition of new agents without performance degradation
- **Context Optimization:** Average context size reduced by 30% while maintaining task quality
