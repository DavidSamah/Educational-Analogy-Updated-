import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import NodeDetailsPanel from "../components/NodeDetailsPanel";
import knowledgeGraph from "../knowledge/graph";
import "./KnowledgeMapPage.css";

const initialNodes = Object.keys(knowledgeGraph).map((key, index) => ({
  id: key,
  type: "default",
  position: { x: 100 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 200 },
  data: { label: key, category: knowledgeGraph[key].category },
  style: {
    background: "var(--bg-surface)",
    color: "var(--text-h)",
    border: "2px solid var(--accent)",
    borderRadius: "var(--radius-lg)",
    padding: "10px 14px",
    fontWeight: 600,
    fontSize: "0.875rem",
  },
}));

const initialEdges = Object.entries(knowledgeGraph).flatMap(([source, data]) =>
  data.related.map((rel, i) => ({
    id: `${source}-${rel.concept}-${i}`,
    source,
    target: rel.concept,
    label: rel.relationship,
    type: "smoothstep",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
    style: { stroke: "var(--accent)", strokeWidth: 1.5 },
    labelStyle: { fill: "var(--text-secondary)", fontSize: "0.75rem" },
    labelBgStyle: { fill: "var(--bg-surface)", fillOpacity: 0.9 },
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
  }))
);

export default function KnowledgeMapPage() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [search, setSearch] = useState("");

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const filteredNodes = useMemo(() => {
    if (!search.trim()) return nodes;
    return nodes.filter((n) =>
      n.data.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [nodes, search]);

  return (
    <div className="knowledge-map">
      <div className="knowledge-map__header">
        <div>
          <h2 className="knowledge-map__title">Knowledge Map</h2>
          <p className="knowledge-map__subtitle">
            Explore how concepts influence and depend on one another.
          </p>
        </div>
        <div className="knowledge-map__search">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="knowledge-map__search-icon">
            <circle cx="7" cy="7" r="5" />
            <line x1="11" y1="11" x2="16" y2="16" />
          </svg>
          <input
            type="search"
            placeholder="Search for a node…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="knowledge-map__search-input"
          />
        </div>
      </div>

      <div className="knowledge-map__canvas">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="var(--border)" gap={20} />
          <Controls />
          <MiniMap
            nodeStrokeColor="var(--accent)"
            nodeColor="var(--bg-surface)"
            maskColor="var(--bg)"
          />
        </ReactFlow>

        {selectedNode && (
          <NodeDetailsPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}
