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

const STATUS_FALLBACK_MESSAGES: Record<number, string> = {
  400: 'Please check the entered information and try again.',
  401: 'Your email or password is incorrect.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  408: 'The request timed out. Please try again.',
  409: 'This request could not be completed because of a conflict.',
  422: 'Please check the entered information and try again.',
  429: 'Too many requests were sent. Please wait a moment and try again.',
  500: 'The server encountered an error. Please try again later.',
  502: 'The server is temporarily unavailable. Please try again later.',
  503: 'The service is temporarily unavailable. Please try again later.',
  504: 'The server took too long to respond. Please try again later.',
};

async function readResponseBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text().catch(() => '');

  if (!text) {
    return null;
  }

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getBodyMessage(body: unknown): string | null {
  if (!body) return null;

  if (typeof body === 'string') {
    const trimmed = body.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (Array.isArray(body)) {
    const parts = body
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  }

  if (typeof body === 'object') {
    const candidate = body as {
      message?: unknown;
      error?: unknown;
      detail?: unknown;
      title?: unknown;
      details?: unknown;
    };

    return (
      getBodyMessage(candidate.message) ||
      getBodyMessage(candidate.error) ||
      getBodyMessage(candidate.detail) ||
      getBodyMessage(candidate.title) ||
      getBodyMessage(candidate.details)
    );
  }

  return null;
}

function getFriendlyHttpErrorMessage(status: number): string {
  return STATUS_FALLBACK_MESSAGES[status] || `The request could not be completed (${status}).`;
}

function isSafeBackendMessage(message: string | null): message is string {
  if (!message) return false;

  const normalized = message.toLowerCase();
  return ![
    'internal_server_error',
    'unexpected error',
    'stack trace',
    'requestid',
    'request id:',
    'prisma',
    'postgres',
    'sql error',
  ].some((fragment) => normalized.includes(fragment));
}

function getUserFacingError(status: number, body: unknown): string {
  if (status === 401) return STATUS_FALLBACK_MESSAGES[401];
  if (status === 400 || status === 422) return STATUS_FALLBACK_MESSAGES[status];
  if (status >= 500) return getFriendlyHttpErrorMessage(status);

  const message = getBodyMessage(body);
  return isSafeBackendMessage(message) ? message : getFriendlyHttpErrorMessage(status);
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
    const body = await readResponseBody(res);
    throw new Error(getUserFacingError(res.status, body));
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
      const errorCode =
        payload.error && typeof payload.error === 'object'
          ? (payload.error as { code?: unknown }).code
          : undefined;
      const status = errorCode === 'INTERNAL_SERVER_ERROR' ? 500 : res.status;
      throw new Error(getUserFacingError(status, payload));
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
