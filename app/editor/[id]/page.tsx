import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { FlowchartEditor } from '@/components/editor/flowchart-editor'
import { db } from '@/lib/db'
import { flowcharts } from '@/lib/db/schema'

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const flowchartId = Number.parseInt(id, 10)

  if (isNaN(flowchartId)) {
    notFound()
  }

  const flowchart = await db
    .select()
    .from(flowcharts)
    .where(eq(flowcharts.id, flowchartId))
    .limit(1)
    .then(rows => rows[0])

  if (!flowchart) {
    notFound()
  }

  return <FlowchartEditor flowchart={flowchart} />
}
