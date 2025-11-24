import type { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
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
 */
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const allFlowcharts = await db
      .select()
      .from(flowcharts)
      .orderBy(desc(flowcharts.updatedAt))

    return NextResponse.json(allFlowcharts)
  }
  catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/flowcharts
 * Create a new flowchart
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
