import { UserButton } from '@clerk/nextjs';

interface AccessDeniedPageProps {
  searchParams: Promise<{
    reason?: string;
    email?: string;
  }>;
}

export default async function AccessDeniedPage({ searchParams }: AccessDeniedPageProps) {
  const params = await searchParams;
  const reason = params.reason;
  const email = params.email;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Your account does not have access to this application.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-2">Reason:</h2>
          {reason === 'not_allowed' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                Your email domain is not in the allowed list.
              </p>
              {email && (
                <p className="text-sm text-gray-600">
                  Current email: <span className="font-mono">{email}</span>
                </p>
              )}
              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>To gain access:</strong>
                </p>
                <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                  <li>Upgrade to a paid subscription, or</li>
                  <li>Contact your administrator to add your email domain to the allowed list</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-center">
            <UserButton afterSignOutUrl="/" />
          </div>
          <p className="text-xs text-center text-gray-500">
            Sign out and try with a different account
          </p>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Need help? Contact support for assistance.</p>
      </div>
    </div>
  );
}
