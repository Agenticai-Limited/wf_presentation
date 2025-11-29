import type { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { flowcharts } from '@/lib/db/schema'

const updateFlowchartSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  markdown: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
})

/**
 * GET /api/flowcharts/[id]
 * Get a single flowchart by ID
 * Note: Authentication is handled by middleware
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const flowchartId = Number.parseInt(id, 10)

    if (Number.isNaN(flowchartId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const flowchart = await db
      .select()
      .from(flowcharts)
      .where(eq(flowcharts.id, flowchartId))
      .limit(1)
      .then(rows => rows[0])

    if (!flowchart) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(flowchart)
  }
  catch (error) {
    console.error('[API /flowcharts/[id] GET] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

/**
 * PUT /api/flowcharts/[id]
 * Update a flowchart
 * Note: Authentication is handled by middleware
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const flowchartId = Number.parseInt(id, 10)

    if (Number.isNaN(flowchartId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = updateFlowchartSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error },
        { status: 400 },
      )
    }

    const updates = parsed.data

    // Check if flowchart exists
    const existing = await db
      .select()
      .from(flowcharts)
      .where(eq(flowcharts.id, flowchartId))
      .limit(1)
      .then(rows => rows[0])

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Set publishedAt if status is being changed to published
    const publishedAt
      = updates.status === 'published' && existing.status !== 'published'
        ? new Date()
        : existing.publishedAt

    const updated = await db
      .update(flowcharts)
      .set({
        ...updates,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(flowcharts.id, flowchartId))
      .returning()

    return NextResponse.json(updated[0])
  }
  catch (error) {
    console.error('[API /flowcharts/[id] PUT] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/flowcharts/[id]
 * Delete a flowchart
 * Note: Authentication is handled by middleware
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const flowchartId = Number.parseInt(id, 10)

    if (Number.isNaN(flowchartId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    // Check if flowchart exists
    const existing = await db
      .select()
      .from(flowcharts)
      .where(eq(flowcharts.id, flowchartId))
      .limit(1)
      .then(rows => rows[0])

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await db.delete(flowcharts).where(eq(flowcharts.id, flowchartId))

    return NextResponse.json({ success: true })
  }
  catch (error) {
    console.error('[API /flowcharts/[id] DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
