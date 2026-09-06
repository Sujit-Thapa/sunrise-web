import { type NextRequest } from 'next/server';

export const runtime = 'nodejs';

function getImageContentType(url: URL, upstreamType: string | null): string {
  if (upstreamType?.toLowerCase().startsWith('image/')) {
    return upstreamType;
  }

  switch (url.pathname.toLowerCase().split('.').pop()) {
    case 'avif':
      return 'image/avif';
    case 'gif':
      return 'image/gif';
    case 'jpeg':
    case 'jpg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    default:
      return upstreamType || 'application/octet-stream';
  }
}

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get('url');

  if (!target) {
    return new Response('Missing image url.', { status: 400 });
  }

  let url: URL;

  try {
    url = new URL(target);
  } catch {
    return new Response('Invalid image url.', { status: 400 });
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return new Response('Unsupported image url protocol.', { status: 400 });
  }

  try {
    const upstream = await fetch(url.toString(), { redirect: 'follow' });

    if (!upstream.ok || !upstream.body) {
      return new Response('Unable to load image.', { status: 502 });
    }

    const headers = new Headers();
    headers.set('content-type', getImageContentType(url, upstream.headers.get('content-type')));

    headers.set('cache-control', 'public, max-age=86400, stale-while-revalidate=604800');

    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch {
    return new Response('Unable to load image.', { status: 502 });
  }
}
