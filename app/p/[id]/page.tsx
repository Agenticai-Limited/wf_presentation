import { db } from '@/lib/db';
import { flowcharts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { convertMermaidToReactFlow } from '@/lib/mermaid-converter';
import { FlowRenderer } from '@/components/flow/flow-renderer';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const flowchartId = parseInt(id, 10);

  if (isNaN(flowchartId)) {
    return {
      title: 'Not Found',
    };
  }

  const flowchart = await db
    .select()
    .from(flowcharts)
    .where(eq(flowcharts.id, flowchartId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!flowchart || flowchart.status !== 'published') {
    return {
      title: 'Not Found',
    };
  }

  return {
    title: flowchart.title,
    description: `Interactive flowchart: ${flowchart.title}`,
  };
}

export default async function PublicFlowchartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const flowchartId = parseInt(id, 10);

  if (isNaN(flowchartId)) {
    notFound();
  }

  const flowchart = await db
    .select()
    .from(flowcharts)
    .where(eq(flowcharts.id, flowchartId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!flowchart || flowchart.status !== 'published') {
    notFound();
  }

  // Convert Mermaid to React Flow
  let flowData;
  try {
    flowData = convertMermaidToReactFlow(flowchart.markdown);
  } catch (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error Rendering Flowchart
          </h1>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-50">
      <div className="h-full flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{flowchart.title}</h1>
        </header>

        <div className="flex-1">
          <FlowRenderer
            initialNodes={flowData.nodes}
            initialEdges={flowData.edges}
          />
        </div>
      </div>
    </div>
  );
}
