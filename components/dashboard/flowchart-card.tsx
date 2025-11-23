'use client';

import Link from 'next/link';
import { Flowchart } from '@/lib/db/schema';

interface FlowchartCardProps {
  flowchart: Flowchart;
  onDelete: (id: number) => void;
  onPublishToggle: (id: number, currentStatus: string) => void;
}

export function FlowchartCard({
  flowchart,
  onDelete,
  onPublishToggle,
}: FlowchartCardProps) {
  const formattedDate = flowchart.updatedAt
    ? new Date(flowchart.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
            {flowchart.title}
          </h3>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              flowchart.status === 'published'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {flowchart.status}
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-4">Updated {formattedDate}</p>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/editor/${flowchart.id}`}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit
          </Link>

          <button
            onClick={() => onPublishToggle(flowchart.id, flowchart.status)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {flowchart.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>

          {flowchart.status === 'published' && (
            <Link
              href={`/p/${flowchart.id}`}
              target="_blank"
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              View
            </Link>
          )}

          <button
            onClick={() => onDelete(flowchart.id)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
