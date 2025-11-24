'use client'

import Link from 'next/link'

interface EditorHeaderProps {
  title: string
  status: string
  isSaving: boolean
  lastSaved: Date | null
  onTitleChange: (title: string) => void
  onSave: () => void
  onPublishToggle: () => void
}

export function EditorHeader({
  title,
  status,
  isSaving,
  lastSaved,
  onTitleChange,
  onSave,
  onPublishToggle,
}: EditorHeaderProps) {
  const saveStatusText = isSaving
    ? 'Saving...'
    : lastSaved
      ? `Saved ${lastSaved.toLocaleTimeString()}`
      : 'Not saved'

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            ← Back
          </Link>

          <input
            type="text"
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            className="flex-1 max-w-md text-lg font-semibold border-0 border-b-2 border-transparent focus:border-blue-500 focus:outline-none px-2 py-1"
            placeholder="Untitled Flowchart"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{saveStatusText}</span>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Save
          </button>

          <button
            onClick={onPublishToggle}
            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              status === 'published'
                ? 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500'
                : 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>
    </header>
  )
}
