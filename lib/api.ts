const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';

interface ApiOptions extends RequestInit {
  /**
   * Next.js fetch cache behavior. Pass 'no-store' for anything that must
   * always be fresh (auth, reservations, admin views). Defaults to
   * 'no-store' since most of this API is user/session specific.
   */
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
}

async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
  token?: string
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // NestJS validation errors return `message` as an array of strings,
    // e.g. ["email must be a valid email", "phoneNumber should not be empty"]
    const message = Array.isArray(err.message)
      ? err.message.join(', ')
      : err.message;
    throw new Error(message || `Request failed: ${res.status}`);
  }

  // DELETE endpoints often return 204 No Content — guard against
  // calling .json() on an empty body.
  const contentLength = res.headers.get('content-length');
  if (res.status === 204 || contentLength === '0') {
    return undefined as T;
  }

  const payload = await res.json().catch(() => ({}));

  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    'data' in payload
  ) {
    if (payload.success === false) {
      const message = Array.isArray(payload.message)
        ? payload.message.join(', ')
        : payload.message;
      throw new Error(message || 'Request failed');
    }
    return payload.data as T;
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, token?: string, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'GET' }, token),
  post: <T>(path: string, body: unknown, token?: string, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) }, token),
  patch: <T>(path: string, body: unknown, token?: string, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body: JSON.stringify(body) }, token),
  delete: <T>(path: string, token?: string, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }, token),
};