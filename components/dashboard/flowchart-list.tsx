'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flowchart } from '@/lib/db/schema';
import { FlowchartCard } from './flowchart-card';
import { apiClient } from '@/lib/api-client';

interface FlowchartListProps {
  initialFlowcharts: Flowchart[];
}

export function FlowchartList({ initialFlowcharts }: FlowchartListProps) {
  const router = useRouter();
  const [flowcharts, setFlowcharts] = useState(initialFlowcharts);
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreateNew() {
    setIsCreating(true);

    try {
      const response = await apiClient('/api/flowcharts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Untitled Flowchart',
          markdown: 'flowchart TD\n    Start --> End',
        }),
      });

      if (response.ok) {
        const newFlowchart = await response.json();
        router.push(`/editor/${newFlowchart.id}`);
      } else {
        console.error('Failed to create flowchart:', response.statusText);
      }
    } catch (error) {
      // Error already handled by apiClient (401 redirect)
      if (error instanceof Error && !error.message.includes('Unauthorized')) {
        console.error('Failed to create flowchart:', error);
      }
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this flowchart?')) {
      return;
    }

    try {
      const response = await apiClient(`/api/flowcharts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFlowcharts((prev) => prev.filter((f) => f.id !== id));
      } else {
        console.error('Failed to delete flowchart:', response.statusText);
      }
    } catch (error) {
      // Error already handled by apiClient (401 redirect)
      if (error instanceof Error && !error.message.includes('Unauthorized')) {
        console.error('Failed to delete flowchart:', error);
      }
    }
  }

  async function handlePublishToggle(id: number, currentStatus: string) {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';

    try {
      const response = await apiClient(`/api/flowcharts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updated = await response.json();
        setFlowcharts((prev) =>
          prev.map((f) => (f.id === id ? updated : f))
        );
      } else {
        console.error('Failed to update flowchart:', response.statusText);
      }
    } catch (error) {
      // Error already handled by apiClient (401 redirect)
      if (error instanceof Error && !error.message.includes('Unauthorized')) {
        console.error('Failed to update flowchart:', error);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={handleCreateNew}
          disabled={isCreating}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Creating...' : '+ New Flowchart'}
        </button>
      </div>

      {flowcharts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No flowcharts yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {flowcharts.map((flowchart) => (
            <FlowchartCard
              key={flowchart.id}
              flowchart={flowchart}
              onDelete={handleDelete}
              onPublishToggle={handlePublishToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
