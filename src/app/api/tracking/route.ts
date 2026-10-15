import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Public read-only endpoint. Database sessions need Prisma, so this runs on
// the Node.js runtime rather than the Edge.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const INTERNAL_SECRET_HEADER = 'x-internal-secret';
const INTERNAL_PATH = '/api/internal/tracking';
// Only these filters are passed through; `userId` is always set server-side.
const FORWARDED_FILTERS = ['category', 'status', 'isFavorite', 'search'];
const NO_STORE = { 'Cache-Control': 'private, no-store' };

function json(body: unknown, status: number, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

// The internal route is reached through a configured origin, never the
// request's Host header, so a forged Host cannot redirect the internal secret.
function internalOrigin(): string | null {
  const configured = process.env.INTERNAL_API_ORIGIN || process.env.NEXTAUTH_URL;
  if (configured) return new URL(configured).origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return null;
}

async function respond(request: NextRequest) {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405, { Allow: 'GET' });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return json({ error: 'Unauthorized' }, 401);

  // A client may still send `userId` (older UI builds); it must name the caller.
  const requested = request.nextUrl.searchParams.getAll('userId');
  if (requested.some((id) => id !== userId)) {
    return json({ error: 'Forbidden' }, 403);
  }

  const secret = process.env.INTERNAL_API_SECRET;
  const origin = internalOrigin();
  if (!secret || !origin) {
    console.error('Tracking reads are not configured: INTERNAL_API_SECRET or internal origin missing');
    return json({ error: 'Service unavailable' }, 503);
  }

  const target = new URL(INTERNAL_PATH, origin);
  for (const key of FORWARDED_FILTERS) {
    const value = request.nextUrl.searchParams.get(key);
    if (value !== null) target.searchParams.set(key, value);
  }
  target.searchParams.set('userId', userId);

  // Only the internal secret is sent: no client cookies or authorization.
  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: 'GET',
      headers: { [INTERNAL_SECRET_HEADER]: secret, accept: 'application/json' },
      redirect: 'manual',
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Error reaching internal tracking route:', error);
    return json({ error: 'Bad gateway' }, 502);
  }
  // A redirect means the origin is misconfigured; never follow or relay it.
  if (upstream.status >= 300 && upstream.status < 400) {
    return json({ error: 'Bad gateway' }, 502);
  }

  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json', ...NO_STORE },
  });
}

export async function GET(request: NextRequest) {
  return respond(request);
}
export async function POST(request: NextRequest) {
  return respond(request);
}
export async function PUT(request: NextRequest) {
  return respond(request);
}
export async function DELETE(request: NextRequest) {
  return respond(request);
}
export async function OPTIONS(request: NextRequest) {
  return respond(request);
}
