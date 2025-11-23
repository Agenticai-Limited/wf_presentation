'use client';

import { UserButton } from '@clerk/nextjs';

export function DashboardHeader() {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            AgenticAI ReactFlow Platform
          </h2>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
