'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidPreviewProps {
  markdown: string;
}

export function MermaidPreview({ markdown }: MermaidPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function renderMermaid() {
      if (!containerRef.current || !markdown.trim()) {
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
        setError(null);
        return;
      }

      try {
        const mermaid = (await import('mermaid')).default;

        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
        });

        const id = `mermaid-${Date.now()}`;
        const { svg, bindFunctions } = await mermaid.render(id, markdown);

        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          if (bindFunctions) {
            bindFunctions(containerRef.current);
          }
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid Mermaid syntax');
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      }
    }

    renderMermaid();
  }, [markdown]);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Live Preview</h3>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {error ? (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        ) : markdown.trim() ? (
          <div ref={containerRef} className="flex items-center justify-center" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Start typing Mermaid syntax to see preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
