# Automation

Generates reusable app artifacts like pageMaps and route configs.

## 📁 Artifact Source

Artifacts are generated from:

- `packages/devtools/src/docs/sections/automation/source/genCode/genAutomation.js`

To rebuild this section:

```bash
yarn workspace @whatsfresh/devtools genAutomation
```

## 📄 Artifacts

- [graphData.json](./output/graphData.json) — Metadata used for relationships
- [graph.mmd](./output/graph.mmd) — Mermaid graph
- [graph.dot](./output/graph.dot) — Graphviz format
