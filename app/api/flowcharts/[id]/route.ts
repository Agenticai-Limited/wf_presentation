import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { flowcharts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateFlowchartSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  markdown: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
})

/**
 * GET /api/flowcharts/[id]
 * Get a single flowchart by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const flowchartId = Number.parseInt(id, 10)

    if (isNaN(flowchartId)) {
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

/**
 * PUT /api/flowcharts/[id]
 * Update a flowchart
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const flowchartId = Number.parseInt(id, 10)

    if (isNaN(flowchartId)) {
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/flowcharts/[id]
 * Delete a flowchart
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const flowchartId = Number.parseInt(id, 10)

    if (isNaN(flowchartId)) {
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
