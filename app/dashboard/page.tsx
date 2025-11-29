import { desc } from 'drizzle-orm'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { FlowchartList } from '@/components/dashboard/flowchart-list'
import { db } from '@/lib/db'
import { flowcharts } from '@/lib/db/schema'

// Force dynamic rendering since we need real-time data
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // No need to check email domain here - middleware handles it!
  // If user reached this page, they are authenticated AND authorized

  const allFlowcharts = await db
    .select()
    .from(flowcharts)
    .orderBy(desc(flowcharts.updatedAt))

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Flowcharts</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your Mermaid flowcharts
          </p>
        </div>

        <FlowchartList initialFlowcharts={allFlowcharts} />
      </main>
    </div>
  )
}
