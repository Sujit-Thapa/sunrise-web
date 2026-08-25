const IMAGE_PROXY_PATH = '/api/image-proxy';

export function resolveImageSrc(src?: string | null, fallback = '/images/sunrise.png'): string {
  const value = src?.trim();

  if (!value) {
    return fallback;
  }

  if (
    value.startsWith('/') ||
    value.startsWith('data:') ||
    value.startsWith('blob:') ||
    value.startsWith(IMAGE_PROXY_PATH)
  ) {
    return value;
  }

  try {
    const url = new URL(value);

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return `${IMAGE_PROXY_PATH}?url=${encodeURIComponent(url.toString())}`;
    }
  } catch {
    return fallback;
  }

  return fallback;
}
