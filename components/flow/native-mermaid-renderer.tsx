'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface NativeMermaidRendererProps {
  markdown: string;
}

export function NativeMermaidRenderer({ markdown }: NativeMermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initializedRef.current) {
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
      initializedRef.current = true;
    }

    let isMounted = true;

    const renderDiagram = async () => {
      if (!containerRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        containerRef.current.innerHTML = '';
        const uniqueId = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, markdown);

        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setIsLoading(false);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [markdown]);

  if (error) {
    return (
      <div className="h-full overflow-auto bg-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
            <p className="font-semibold">Error rendering diagram</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-500">
              <svg
                className="animate-spin h-8 w-8 mx-auto mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm">Rendering diagram...</p>
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className="mermaid-container flex items-center justify-center min-h-[400px]"
          style={{ display: isLoading ? 'none' : 'flex' }}
        />
      </div>
    </div>
  );
}
