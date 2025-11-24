'use client'

import type { Flowchart } from '@/lib/db/schema'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { EditorHeader } from './editor-header'
import { MarkdownEditor } from './markdown-editor'
import { MermaidPreview } from './mermaid-preview'

interface FlowchartEditorProps {
  flowchart: Flowchart
}

export function FlowchartEditor({ flowchart }: FlowchartEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(flowchart.title)
  const [markdown, setMarkdown] = useState(flowchart.markdown)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const debouncedMarkdown = useDebounce(markdown, 500)
  const debouncedTitle = useDebounce(title, 500)

  // Auto-save when title or markdown changes
  useEffect(() => {
    async function autoSave() {
      if (
        (debouncedTitle !== flowchart.title
          || debouncedMarkdown !== flowchart.markdown)
        && (debouncedTitle || debouncedMarkdown)
      ) {
        await handleSave()
      }
    }

    autoSave()
  }, [debouncedTitle, debouncedMarkdown])

  const handleSave = useCallback(async () => {
    setIsSaving(true)

    try {
      const response = await apiClient(`/api/flowcharts/${flowchart.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, markdown }),
      })

      if (response.ok) {
        setLastSaved(new Date())
      }
      else {
        console.error('Failed to save:', response.statusText)
      }
    }
    catch (error) {
      // Error already handled by apiClient (401 redirect)
      if (error instanceof Error && !error.message.includes('Unauthorized')) {
        console.error('Failed to save:', error)
      }
    }
    finally {
      setIsSaving(false)
    }
  }, [flowchart.id, title, markdown])

  async function handlePublishToggle() {
    const newStatus = flowchart.status === 'published' ? 'draft' : 'published'

    try {
      const response = await apiClient(`/api/flowcharts/${flowchart.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        router.refresh()
        if (newStatus === 'published') {
          // Optionally open the published page
          window.open(`/p/${flowchart.id}`, '_blank')
        }
      }
      else {
        console.error('Failed to publish:', response.statusText)
      }
    }
    catch (error) {
      // Error already handled by apiClient (401 redirect)
      if (error instanceof Error && !error.message.includes('Unauthorized')) {
        console.error('Failed to publish:', error)
      }
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <EditorHeader
        title={title}
        status={flowchart.status}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onTitleChange={setTitle}
        onSave={handleSave}
        onPublishToggle={handlePublishToggle}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r border-gray-300 bg-white">
          <MarkdownEditor value={markdown} onChange={setMarkdown} />
        </div>
        <div className="w-1/2 bg-white overflow-auto">
          <MermaidPreview markdown={markdown} />
        </div>
      </div>
    </div>
  )
}
