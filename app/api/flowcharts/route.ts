import type { NextRequest } from 'next/server'
import { desc } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { flowcharts } from '@/lib/db/schema'

const createFlowchartSchema = z.object({
  title: z.string().min(1).max(255),
  markdown: z.string().optional().default(''),
})

/**
 * GET /api/flowcharts
 * List all flowcharts
 * Note: Authentication is handled by middleware
 */
export async function GET() {
  try {
    const allFlowcharts = await db
      .select()
      .from(flowcharts)
      .orderBy(desc(flowcharts.updatedAt))

    return NextResponse.json(allFlowcharts)
  }
  catch (error) {
    console.error('[API /flowcharts GET] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/flowcharts
 * Create a new flowchart
 * Note: Authentication is handled by middleware
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createFlowchartSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error },
        { status: 400 },
      )
    }

    const { title, markdown } = parsed.data

    const newFlowchart = await db
      .insert(flowcharts)
      .values({
        title,
        markdown,
        status: 'draft',
      })
      .returning()

    return NextResponse.json(newFlowchart[0], { status: 201 })
  }
  catch (error) {
    console.error('[API /flowcharts POST] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
