import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';

// Public tracking endpoint, scoped to the signed-in user. Database sessions
// need Prisma, so this runs on the Node.js runtime rather than the Edge.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const INTERNAL_SECRET_HEADER = 'x-internal-secret';
const INTERNAL_PATH = '/api/internal/tracking';
const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE'];
const WRITE_METHODS = new Set(['POST', 'PUT', 'DELETE']);
// Only these filters are passed through; `userId` is always set server-side.
const FORWARDED_FILTERS = ['category', 'status', 'isFavorite', 'search'];
const MAX_BODY_BYTES = 16 * 1024;
const NO_STORE = { 'Cache-Control': 'private, no-store' };

function json(body: unknown, status: number, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

// The internal route is reached through a configured origin, never the
// request's Host header, so a forged Host cannot redirect the internal secret.
// The secret is only ever sent over HTTPS, or plain HTTP to a loopback host.
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function parseOrigin(value: string | undefined): URL | null {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function internalOrigin(): string | null {
  const url = parseOrigin(process.env.INTERNAL_API_ORIGIN || process.env.NEXTAUTH_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''));
  if (!url) return null;
  if (url.protocol === 'https:') return url.origin;
  if (url.protocol === 'http:' && LOOPBACK_HOSTS.has(url.hostname)) return url.origin;
  return null;
}

// Browser origins allowed to write. Like the internal origin, these come from
// configuration and never from the request, so a forged Host cannot add one.
function appOrigins(): Set<string> {
  const origins = new Set<string>();
  for (const value of [process.env.NEXTAUTH_URL, process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '']) {
    const url = parseOrigin(value);
    if (url && (url.protocol === 'https:' || LOOPBACK_HOSTS.has(url.hostname))) origins.add(url.origin);
  }
  return origins;
}

// CSRF: NextAuth's cookie is SameSite=Lax, which already stops cross-site
// POST/PUT/DELETE in current browsers. As defence in depth a write must also
// come from a configured app origin (browsers always send Origin on these
// methods), must not be marked cross-site by Fetch Metadata, and must be JSON,
// which a plain HTML form cannot send.
function csrfCheck(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const site = request.headers.get('sec-fetch-site');
  if (!origin || !appOrigins().has(origin) || (site && site !== 'same-origin')) {
    return json({ error: 'Cross-origin write refused' }, 403);
  }
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return json({ error: 'Content-Type must be application/json' }, 415);
  }
  return null;
}

const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();
const count = z.number().int().min(0).max(1_000_000).nullable().optional();
// Stored links are rendered as hrefs, so only http(s) is accepted.
const link = z.string().max(2048).url().refine((value) => /^https?:\/\//i.test(value), 'Only http(s) links are allowed')
  .nullable().optional();
const date = z.string().max(64).refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date').nullable().optional();
const category = z.enum(['ANIME', 'MANGA', 'MOVIE', 'TV_SHOW', 'BOOK', 'WEBSITE', 'PODCAST', 'GAME', 'OTHER']);
const status = z.enum(['PLAN_TO_WATCH', 'WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED']).optional();
const rating = z.enum(['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN']).nullable().optional();
const priority = z.number().int().min(1).max(5).nullable().optional();
const itemId = text(64);

// Exactly the fields each write may set. Unknown keys are rejected, so a
// client can never reach columns such as another user's id or timestamps.
const WRITE_SCHEMAS: Record<string, z.ZodTypeAny> = {
  POST: z.object({
    title: text(300),
    category,
    description: optionalText(5000),
    imageUrl: link,
    externalUrl: link,
    author: optionalText(300),
    year: z.number().int().min(0).max(9999).nullable().optional(),
    genres: z.array(text(60)).max(20).optional(),
    totalEpisodes: count,
    totalChapters: count,
    totalBooks: count,
    status,
    rating,
    progress: count,
    priority,
    isFavorite: z.boolean().optional(),
  }).strict(),
  PUT: z.object({
    itemId,
    status,
    rating,
    progress: count,
    startDate: date,
    finishDate: date,
    priority,
    isFavorite: z.boolean().optional(),
  }).strict(),
  DELETE: z.object({ itemId }).strict(),
};

async function readWriteBody(request: NextRequest, userId: string): Promise<NextResponse | Record<string, unknown>> {
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return json({ error: 'Request body too large' }, 413);
  }
  const raw = await request.text();
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) return json({ error: 'Request body too large' }, 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Invalid JSON body' }, 400);

  // A client may still send `userId` (older UI builds); it must name the caller.
  const { userId: claimed, ...fields } = body as Record<string, unknown>;
  if ('userId' in body && claimed !== userId) return json({ error: 'Forbidden' }, 403);

  const parsed = WRITE_SCHEMAS[request.method].safeParse(fields);
  if (!parsed.success) {
    return json({ error: 'Invalid request body', fields: parsed.error.issues.map((issue) => issue.path.join('.') || '(body)') }, 400);
  }
  return parsed.data as Record<string, unknown>;
}

// Each export handles only its own method, so a mismatched or unknown method
// (HEAD, OPTIONS, an override) is refused before any session or body access.
async function respond(request: NextRequest, expected: string | null) {
  const method = request.method;
  if (method !== expected || !ALLOWED_METHODS.includes(method)) {
    return json({ error: 'Method not allowed' }, 405, { Allow: ALLOWED_METHODS.join(', ') });
  }
  const isWrite = WRITE_METHODS.has(method);

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return json({ error: 'Unauthorized' }, 401);

  // The query may name the caller and nobody else, on reads and writes alike.
  const requested = request.nextUrl.searchParams.getAll('userId');
  if (requested.some((id) => id !== userId)) {
    return json({ error: 'Forbidden' }, 403);
  }

  let fields: Record<string, unknown> = {};
  if (isWrite) {
    const refused = csrfCheck(request);
    if (refused) return refused;
    const body = await readWriteBody(request, userId);
    if (body instanceof NextResponse) return body;
    fields = body;
  }

  const secret = process.env.INTERNAL_API_SECRET;
  const origin = internalOrigin();
  if (!secret || !origin) {
    console.error('Tracking API is not configured: INTERNAL_API_SECRET missing or internal origin missing/not HTTPS');
    return json({ error: 'Service unavailable' }, 503);
  }

  const target = new URL(INTERNAL_PATH, origin);
  const headers: Record<string, string> = { [INTERNAL_SECRET_HEADER]: secret, accept: 'application/json' };
  let body: string | undefined;
  if (method === 'GET') {
    for (const key of FORWARDED_FILTERS) {
      const value = request.nextUrl.searchParams.get(key);
      if (value !== null) target.searchParams.set(key, value);
    }
    target.searchParams.set('userId', userId);
  } else if (method === 'DELETE') {
    target.searchParams.set('userId', userId);
    target.searchParams.set('itemId', String(fields.itemId));
  } else {
    // The session user id is set last, so nothing in the body can replace it.
    body = JSON.stringify({ ...fields, userId });
    headers['content-type'] = 'application/json';
  }

  // Only the internal secret is sent: no client cookies or authorization.
  let upstream: Response;
  try {
    upstream = await fetch(target, { method, headers, body, redirect: 'manual', cache: 'no-store' });
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
  return respond(request, 'GET');
}
export async function POST(request: NextRequest) {
  return respond(request, 'POST');
}
export async function PUT(request: NextRequest) {
  return respond(request, 'PUT');
}
export async function DELETE(request: NextRequest) {
  return respond(request, 'DELETE');
}
export async function OPTIONS(request: NextRequest) {
  return respond(request, null);
}
