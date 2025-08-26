# Batch Mapping

Describes the steps for batch mapping.

## 📁 Artifact Source

Artifacts are generated from:

- `packages/devtools/src/docs/sections/batchMapping/source/genCode/genBatchMapping.js`

To rebuild this section:

```bash
yarn workspace @whatsfresh/devtools genBatchMapping
```

## 📄 Artifacts

- [graphData.json](./output/graphData.json) — Metadata used for relationships
- [graph.mmd](./output/graph.mmd) — Mermaid graph
- [graph.dot](./output/graph.dot) — Graphviz format
