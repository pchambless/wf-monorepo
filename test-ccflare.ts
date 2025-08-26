🧭 Guidance for Claude: Replacing the Graph Generator with Babel Parser
🧱 Goal
Replace the legacy graph generator with a Babel-based parser that:
- Extracts layout and workflow metadata from eventType files
- Emits both Mermaid and Studio-compatible JSON artifacts
- Supports folder-aware grouping and modular edge generation

🔍 Step 1: Parse EventType Files with Babel
Use Babel to extract:
- components[]: nested layout elements (forms, grids, tabs, etc.)
- position, container, inline, tab, etc.: layout semantics
- workflowTriggers: e.g. onSubmit, onClick, onChange
- props.title: for node labels
- filePath: for folder grouping
Each parsed file should emit a node like:
{
  id: "formPlan",
  category: "form",
  title: "Plan Detail",
  label: "form<br>formPlan<br>[Plan Detail]",
  meta: {
    filePath: "...",
    pageFolder: "PlanManager/forms",
    components: [...],
    workflowTriggers: {...}
  }
}

🧩 Step 2: Generate Edges Declaratively
From each node’s components[] and workflowTriggers, emit edges:
Layout edges:
{
  source: "tabPlan",
  target: "formPlan",
  type: "layout",
  label: "inline"
}

Workflow edges:
{
  source: "formPlan",
  target: "workflowSavePlan",
  type: "workflow",
  label: "onSubmit"
}

Navigation edges (if applicable):
{
  source: "pageDashboard",
  target: "pagePlanManager",
  type: "navigation",
  label: "link"
}

🧬 Step 3: Emit Mermaid Graph
Group nodes by pageFolder or inferred domain:
subgraph PlanManager/forms
  formPlan["form<br>formPlan<br>[Plan Detail]"]
end
Use classDef for styling by category.

📦 Step 4: Emit Studio JSON Artifact
Structure should match:
{
  app: "plans",
  nodes: [...],
  edges: [...],
  navigationEdges: [...],
  componentEdges: [...],
  workflowEdges: [...],
  meta: {
    generated: new Date().toISOString(),
    nodeCount: ...,
    workflowNodeCount: ...,
    ...
  }
}

Make sure componentEdges and workflowEdges are populated—Studio depends on them.

🧪 Step 5: Validate Output
Use one known-good file (e.g. pagePlanManager.js) to:
- Confirm components[] are parsed
- Validate Mermaid output matches current graph
- Ensure Studio JSON has correct edges and metadata

🛡️ Bonus: Modularize the Generator
Split into:
- parseEventType(filePath) → returns node
- generateEdges(node) → returns edges
- emitMermaid(nodes, edges) → returns Mermaid string
- emitStudioJson(nodes, edges) → returns JSON artifact
This will make it easier to test, patch, and extend later.

Let me know if you want this wrapped into a .plan.md or scaffolded as a CLI tool. 
I can help you build a resilient, teachable pipeline that future collaborators will love.

I've installed babel-parser at the root... I don't know if this might even help some of our agents...













