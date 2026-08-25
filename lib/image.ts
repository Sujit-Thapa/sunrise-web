const IMAGE_PROXY_PATH = '/api/image-proxy';

type ImageSourceLike = unknown;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function firstNonEmptyString(values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function extractCandidateFromValue(value: ImageSourceLike): string | null {
  if (typeof value === 'string') {
    return value.trim() || null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const candidate = extractCandidateFromValue(item);
      if (candidate) return candidate;
    }
    return null;
  }

  if (isRecord(value)) {
    return firstNonEmptyString([
      value.url,
      value.src,
      value.href,
      value.publicUrl,
      value.imageUrl,
      value.thumbnailUrl,
      value.coverImageUrl,
      value.fileUrl,
      value.path,
    ]) || extractCandidateFromValue(value.images);
  }

  return null;
}

export function getImageSourceCandidate(source: ImageSourceLike): string | null {
  return extractCandidateFromValue(source);
}

export function getPropertyImageSource(property: ImageSourceLike): string | null {
  if (!isRecord(property)) {
    return getImageSourceCandidate(property);
  }

  return (
    getImageSourceCandidate(property.images) ||
    getImageSourceCandidate(property.image) ||
    getImageSourceCandidate(property.imageUrl) ||
    getImageSourceCandidate(property.thumbnailUrl) ||
    getImageSourceCandidate(property.coverImageUrl) ||
    getImageSourceCandidate(property.featuredImageUrl) ||
    null
  );
}

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

export function resolveImageSrcFromProperty(
  property: ImageSourceLike,
  fallback = '/images/sunrise.png',
): string {
  return resolveImageSrc(getPropertyImageSource(property), fallback);
}
