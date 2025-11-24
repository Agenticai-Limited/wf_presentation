'use client'

import type {
  Edge,
  Node,
} from '@xyflow/react'
import {
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react'
import { useMemo } from 'react'
import { DiamondNode, RectNode, RoundNode } from './custom-nodes'
import '@xyflow/react/dist/style.css'

interface FlowRendererProps {
  initialNodes: Node[]
  initialEdges: Edge[]
}

function FitViewButton() {
  const { fitView } = useReactFlow()

  return (
    <button
      onClick={() => fitView({ padding: 0.2, duration: 300 })}
      className="bg-white px-4 py-2 rounded-lg shadow-md border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Fit to View
    </button>
  )
}

export function FlowRenderer({
  initialNodes,
  initialEdges,
}: FlowRendererProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  // Define custom node types
  const nodeTypes = useMemo(
    () => ({
      diamond: DiamondNode,
      rect: RectNode,
      round: RoundNode,
    }),
    [],
  )

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        attributionPosition="bottom-left"
        className="reactflow-premium"
        minZoom={0.1}
        maxZoom={4}
        defaultEdgeOptions={{
          style: { strokeWidth: 2 },
          animated: false,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="#cbd5e1"
          className="bg-white/80"
        />
        <Controls
          showZoom={true}
          showFitView={true}
          showInteractive={true}
          position="bottom-left"
          className="!shadow-lg !bg-white/95 !backdrop-blur-sm !border !border-gray-200/50 !rounded-xl"
        />
        <Panel position="top-right" className="flex gap-2">
          <FitViewButton />
        </Panel>
      </ReactFlow>
    </div>
  )
}
