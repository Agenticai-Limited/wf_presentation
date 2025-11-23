'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface NativeMermaidRendererProps {
  markdown: string;
}

export function NativeMermaidRenderer({ markdown }: NativeMermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

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

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev / 1.2, 0.1));
  };

  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.max(0.1, Math.min(5, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
    <div className="h-full relative bg-white">
      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-white rounded-lg shadow-md p-2 border border-gray-200">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom In"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom Out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={handleResetView}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Reset View"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Diagram Container */}
      <div
        className="h-full overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {isLoading && (
          <div className="flex items-center justify-center h-full">
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
          ref={svgWrapperRef}
          className="h-full flex items-center justify-center p-6"
          style={{
            display: isLoading ? 'none' : 'flex',
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <div ref={containerRef} className="mermaid-container" />
        </div>
      </div>
    </div>
  );
}
