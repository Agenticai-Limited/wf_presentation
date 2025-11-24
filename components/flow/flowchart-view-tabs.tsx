'use client'

import type { Edge, Node } from '@xyflow/react'
import { useState } from 'react'
import { FlowRenderer } from './flow-renderer'
import { NativeMermaidRenderer } from './native-mermaid-renderer'

interface FlowchartViewTabsProps {
  title: string
  markdown: string
  nodes: Node[]
  edges: Edge[]
}

type TabType = 'rendered' | 'mermaid'

interface TabButtonProps {
  isActive: boolean
  onClick: () => void
  children: React.ReactNode
}

function TabButton({ isActive, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        py-4 px-1 border-b-2 font-medium text-sm transition-colors
        ${
    isActive
      ? 'border-blue-500 text-blue-600'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }
      `}
    >
      {children}
    </button>
  )
}

export function FlowchartViewTabs({
  title,
  markdown,
  nodes,
  edges,
}: FlowchartViewTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('rendered')

  return (
    <div className="h-screen w-screen bg-gray-50">
      <div className="h-full flex flex-col">
        <header className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>

          {/* Tab Navigation */}
          <div className="border-t border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <TabButton
                isActive={activeTab === 'rendered'}
                onClick={() => setActiveTab('rendered')}
              >
                Rendered
              </TabButton>
              <TabButton
                isActive={activeTab === 'mermaid'}
                onClick={() => setActiveTab('mermaid')}
              >
                Native Mermaid
              </TabButton>
            </nav>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'rendered'
            ? (
                <FlowRenderer initialNodes={nodes} initialEdges={edges} />
              )
            : (
                <NativeMermaidRenderer markdown={markdown} />
              )}
        </div>
      </div>
    </div>
  )
}
