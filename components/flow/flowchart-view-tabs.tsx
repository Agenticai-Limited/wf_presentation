'use client';

import { useState } from 'react';
import { FlowRenderer } from './flow-renderer';
import type { Node, Edge } from 'reactflow';

interface FlowchartViewTabsProps {
  title: string;
  markdown: string;
  nodes: Node[];
  edges: Edge[];
}

type TabType = 'rendered' | 'source';

export function FlowchartViewTabs({
  title,
  markdown,
  nodes,
  edges,
}: FlowchartViewTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('rendered');

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
              <button
                onClick={() => setActiveTab('rendered')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'rendered'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Rendered
              </button>
              <button
                onClick={() => setActiveTab('source')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'source'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Source
              </button>
            </nav>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'rendered' ? (
            <FlowRenderer initialNodes={nodes} initialEdges={edges} />
          ) : (
            <div className="h-full overflow-auto bg-gray-50 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">
                      Mermaid Source
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(markdown);
                      }}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="p-6 overflow-x-auto">
                    <code className="text-sm text-gray-800 font-mono">
                      {markdown}
                    </code>
                  </pre>
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    About Mermaid Syntax
                  </h3>
                  <p className="text-sm text-blue-700">
                    This flowchart uses{' '}
                    <a
                      href="https://mermaid.js.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-900"
                    >
                      Mermaid
                    </a>{' '}
                    syntax. You can copy this code and use it in any tool that
                    supports Mermaid diagrams, such as GitHub, GitLab, Notion,
                    or VS Code.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
