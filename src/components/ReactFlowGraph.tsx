import { useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Point } from '../utils/graph-generator';

interface ReactFlowGraphProps {
  points: Point[];
  path?: number[];
  highlightEdges?: Array<{ from: number; to: number }>;
  highlightEdge?: { from: number; to: number };
  currentNode?: number;
  visitedNodes?: number[];
}

export function ReactFlowGraph({
  points,
  path = [],
  highlightEdges = [],
  highlightEdge,
  currentNode,
  visitedNodes = []
}: ReactFlowGraphProps) {
  const initialNodes: Node[] = useMemo(() => 
    points.map((point) => ({
      id: String(point.id),
      type: 'default',
      position: { x: point.x, y: point.y },
      data: { 
        label: String(point.id),
      },
      style: {
        background: point.id === 0 ? '#ef4444' : 
                   currentNode === point.id ? '#10b981' :
                   visitedNodes.includes(point.id) ? '#3b82f6' : '#6b7280',
        color: 'white',
        border: currentNode === point.id ? '3px solid #059669' : '2px solid white',
        borderRadius: '50%',
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
      },
      draggable: false,
    })), 
    [points, currentNode, visitedNodes]
  );

  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];

    // Draw all possible edges in light gray
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const isInPath = path.length > 0 && (
          (path.includes(i) && path.includes(j) && 
           Math.abs(path.indexOf(i) - path.indexOf(j)) === 1) ||
          (path[0] === i && path[path.length - 1] === j) ||
          (path[0] === j && path[path.length - 1] === i)
        );

        const isHighlighted = highlightEdges.some(
          e => (e.from === i && e.to === j) || (e.from === j && e.to === i)
        );

        const isCurrentHighlight = highlightEdge && (
          (highlightEdge.from === i && highlightEdge.to === j) ||
          (highlightEdge.from === j && highlightEdge.to === i)
        );

        if (!isInPath && !isHighlighted && !isCurrentHighlight) {
          edges.push({
            id: `e${i}-${j}`,
            source: String(i),
            target: String(j),
            style: { stroke: '#e5e7eb', strokeWidth: 1 },
            animated: false,
          });
        }
      }
    }

    // Draw highlight edges (for algorithm exploration)
    highlightEdges.forEach((edge, idx) => {
      edges.push({
        id: `highlight-${idx}`,
        source: String(edge.from),
        target: String(edge.to),
        style: { stroke: '#fbbf24', strokeWidth: 2 },
        animated: false,
      });
    });

    // Draw current highlight edge (current step)
    if (highlightEdge) {
      edges.push({
        id: `current-highlight`,
        source: String(highlightEdge.from),
        target: String(highlightEdge.to),
        style: { stroke: '#10b981', strokeWidth: 4 },
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#10b981',
        },
      });
    }

    // Draw the solution path with arrows
    if (path.length > 0) {
      for (let i = 0; i < path.length; i++) {
        const from = path[i];
        const to = i < path.length - 1 ? path[i + 1] : path[0];
        
        edges.push({
          id: `path-${i}`,
          source: String(from),
          target: String(to),
          style: { stroke: '#6366f1', strokeWidth: 3 },
          animated: false,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#6366f1',
          },
          label: String(i + 1),
          labelStyle: { fill: '#6366f1', fontWeight: 600 },
        });
      }
    }

    return edges;
  }, [points, path, highlightEdges, highlightEdge]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.5}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            if (node.id === '0') return '#ef4444';
            if (currentNode === Number(node.id)) return '#10b981';
            if (visitedNodes.includes(Number(node.id))) return '#3b82f6';
            return '#6b7280';
          }}
        />
      </ReactFlow>
    </div>
  );
}
