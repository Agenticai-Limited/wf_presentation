import { Node, Edge, MarkerType } from '@xyflow/react';
import dagre from '@dagrejs/dagre';

export interface MermaidNode {
  id: string;
  text: string;
  shape: 'rect' | 'round' | 'diamond' | 'stadium';
}

export interface MermaidEdge {
  from: string;
  to: string;
  label?: string;
}

/**
 * Parse Mermaid markdown and convert to React Flow nodes and edges
 * Supports flowchart TD, LR, TB, RL with proper node shapes and labels
 */
export function convertMermaidToReactFlow(mermaidMarkdown: string): {
  nodes: Node[];
  edges: Edge[];
} {
  const lines = mermaidMarkdown
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('%%'));

  // Check if it's a flowchart
  const firstLine = lines[0];
  if (!firstLine?.match(/^flowchart\s+(TD|LR|TB|RL)/i)) {
    throw new Error('Only flowchart TD, LR, TB, and RL are supported');
  }

  const direction = firstLine.match(/flowchart\s+(\w+)/i)?.[1]?.toUpperCase() || 'TD';

  const nodeMap = new Map<string, MermaidNode>();
  const edges: MermaidEdge[] = [];

  // Parse lines
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Parse edges with labels: A -->|label| B
    // Also handles: A[text] -->|label| B[text]
    const edgePattern = /([A-Za-z0-9_]+)(?:\[([^\]]+)\]|\{([^}]+)\}|\(([^)]+)\))?[\s]*(-+>|-+)[\s]*(?:\|([^|]+)\|)?[\s]*([A-Za-z0-9_]+)(?:\[([^\]]+)\]|\{([^}]+)\}|\(([^)]+)\))?/;
    const edgeMatch = line.match(edgePattern);

    if (edgeMatch) {
      const [, fromId, fromRect, fromDiamond, fromRound, , edgeLabel, toId, toRect, toDiamond, toRound] = edgeMatch;

      // Add source node
      if (!nodeMap.has(fromId)) {
        const text = fromRect || fromDiamond || fromRound || fromId;
        const shape = fromDiamond ? 'diamond' : fromRound ? 'round' : fromRect ? 'rect' : 'rect';
        nodeMap.set(fromId, { id: fromId, text, shape });
      }

      // Add target node
      if (!nodeMap.has(toId)) {
        const text = toRect || toDiamond || toRound || toId;
        const shape = toDiamond ? 'diamond' : toRound ? 'round' : toRect ? 'rect' : 'rect';
        nodeMap.set(toId, { id: toId, text, shape });
      }

      // Add edge
      edges.push({
        from: fromId,
        to: toId,
        label: edgeLabel?.trim(),
      });
    } else {
      // Single node definition: A[text] or A{text} or A(text)
      const nodePattern = /^([A-Za-z0-9_]+)(?:\[([^\]]+)\]|\{([^}]+)\}|\(([^)]+)\))$/;
      const nodeMatch = line.match(nodePattern);

      if (nodeMatch) {
        const [, nodeId, rectText, diamondText, roundText] = nodeMatch;
        if (!nodeMap.has(nodeId)) {
          const text = rectText || diamondText || roundText || nodeId;
          const shape = diamondText ? 'diamond' : roundText ? 'round' : 'rect';
          nodeMap.set(nodeId, { id: nodeId, text, shape });
        }
      }
    }
  }

  // Use dagre for automatic layout with optimized spacing
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Set graph direction with generous spacing for clarity
  const isHorizontal = direction === 'LR' || direction === 'RL';
  dagreGraph.setGraph({
    rankdir: direction === 'RL' ? 'RL' : direction === 'LR' ? 'LR' : 'TB',
    nodesep: 120,  // Increased horizontal spacing between nodes
    ranksep: 180,  // Increased vertical spacing between ranks
    align: 'UL',   // Align nodes to upper-left for straighter edges
    edgesep: 40,   // Space between edges
  });

  // Add nodes to dagre
  nodeMap.forEach((node) => {
    const width = node.text.length * 10 + 40;
    const height = node.shape === 'diamond' ? 80 : 50;
    dagreGraph.setNode(node.id, { width, height });
  });

  // Add edges to dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.from, edge.to);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Convert to React Flow format
  const nodes: Node[] = Array.from(nodeMap.values()).map((node) => {
    const dagreNode = dagreGraph.node(node.id);

    // Determine node type based on shape
    let type = 'rect';
    if (node.shape === 'diamond') {
      type = 'diamond';
    } else if (node.shape === 'round') {
      type = 'round';
    }

    return {
      id: node.id,
      type,
      data: {
        label: node.text,
      },
      position: {
        x: dagreNode.x - dagreNode.width / 2,
        y: dagreNode.y - dagreNode.height / 2,
      },
    };
  });

  // Professional edge styling with harmonious colors
  const reactFlowEdges: Edge[] = edges.map((edge, index) => {
    // Determine edge color based on source node type and label
    const sourceNode = nodeMap.get(edge.from);
    const isDecisionEdge = sourceNode?.shape === 'diamond';
    const isYesPath = edge.label?.toLowerCase().includes('yes');
    const isNoPath = edge.label?.toLowerCase().includes('no');

    // Harmonious color scheme
    let edgeColor = '#3b82f6'; // Default: blue (process flow)
    let edgeStrokeWidth = 2;

    if (isDecisionEdge) {
      if (isYesPath) {
        edgeColor = '#10b981'; // Green for affirmative path
        edgeStrokeWidth = 2.5;
      } else if (isNoPath) {
        edgeColor = '#f59e0b'; // Amber for alternative path
        edgeStrokeWidth = 2.5;
      } else {
        edgeColor = '#0891b2'; // Cyan for decision paths
        edgeStrokeWidth = 2;
      }
    }

    return {
      id: `e${index}-${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
      label: edge.label,
      type: 'default', // Straighter edges for cleaner flow
      animated: isDecisionEdge, // Animate decision edges for visual interest
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 24,
        height: 24,
        color: edgeColor,
      },
      style: {
        stroke: edgeColor,
        strokeWidth: edgeStrokeWidth,
        strokeLinecap: 'round' as const,
      },
      labelStyle: {
        fill: edgeColor,
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: '0.3px',
        textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
      },
      labelBgStyle: {
        fill: '#ffffff',
        fillOpacity: 0.95,
        rx: 6,
        ry: 6,
      },
      labelBgPadding: [8, 12] as [number, number],
      labelBgBorderRadius: 6,
    };
  });

  return {
    nodes,
    edges: reactFlowEdges,
  };
}
