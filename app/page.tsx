import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default function HomePage() {
  return (
    <>
      <SignedIn>
        {/* Redirect authenticated users to dashboard */}
        {redirect('/dashboard')}
      </SignedIn>
      <SignedOut>
        {/* Landing page for unauthenticated users */}
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-xl">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                AgenticAI ReactFlow Platform
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Create and publish interactive flowcharts
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <SignInButton mode="modal">
                <button className="w-full rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2">
                  Sign Up
                </button>
              </SignUpButton>
            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
              Secure authentication powered by Clerk
            </p>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
