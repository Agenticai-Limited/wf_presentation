'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface NativeMermaidRendererProps {
  markdown: string;
}

let mermaidInitialized = false;

export function NativeMermaidRenderer({ markdown }: NativeMermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderCountRef = useRef(0);

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis',
        },
      });
      mermaidInitialized = true;
    }

    const renderDiagram = async () => {
      if (containerRef.current) {
        try {
          containerRef.current.innerHTML = '';
          renderCountRef.current += 1;
          const uniqueId = `mermaid-diagram-${Date.now()}-${renderCountRef.current}`;
          const { svg } = await mermaid.render(uniqueId, markdown);
          containerRef.current.innerHTML = svg;
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          containerRef.current.innerHTML = `
            <div class="p-4 bg-red-50 border border-red-200 rounded text-red-800">
              Error rendering diagram: ${error instanceof Error ? error.message : 'Unknown error'}
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [markdown]);

  return (
    <div className="h-full overflow-auto bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <div
          ref={containerRef}
          className="mermaid-container flex items-center justify-center min-h-[400px]"
        />
      </div>
    </div>
  );
}
