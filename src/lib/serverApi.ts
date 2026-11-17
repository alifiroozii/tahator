const BACKEND_BASE =
  (process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:4000').replace(/\/$/, '') + '/api/v1';

export async function fetchBackendPublic<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
