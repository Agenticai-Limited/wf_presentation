/**
 * Unified API client with automatic 401 handling
 */

interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

/**
 * Fetch wrapper that automatically redirects to login on 401 Unauthorized
 */
export async function apiClient(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Automatically redirect to login page on 401 Unauthorized
  if (response.status === 401) {
    // Use window.location for immediate redirect
    window.location.href = '/login?error=SessionExpired';
    // Throw error to prevent further processing
    throw new Error('Unauthorized: Session expired');
  }

  return response;
}

/**
 * Type-safe JSON API call with automatic 401 handling
 */
export async function apiCall<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<{ data: T | null; error: string | null; response: Response }> {
  try {
    const response = await apiClient(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        data: null,
        error: errorText || `HTTP ${response.status}: ${response.statusText}`,
        response,
      };
    }

    const data = await response.json();
    return { data, error: null, response };
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized: Session expired') {
      // Already redirecting, don't return error
      throw error;
    }

    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      response: new Response(null, { status: 500 }),
    };
  }
}
