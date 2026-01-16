import { NextRequest, NextResponse } from 'next/server';

// Public Edge proxy — forwards requests to internal Node handler
export const runtime = 'edge';

const INTERNAL_SECRET_HEADER = 'x-internal-secret';
const INTERNAL_PATH = '/api/internal/tracking';

async function forward(request: NextRequest) {
  const url = new URL(request.url);
  const origin = url.origin;
  const target = new URL(INTERNAL_PATH, origin);
  target.search = url.search; // preserve query

  // Build headers and attach secret
  const headers = new Headers(request.headers);
  headers.set(INTERNAL_SECRET_HEADER, process.env.INTERNAL_API_SECRET ?? '');

  // Read body if present
  let body: BodyInit | null = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.text();
    } catch (e) {
      body = null;
    }
  }

  const res = await fetch(target.toString(), {
    method: request.method,
    headers,
    body: body || undefined,
    redirect: 'manual',
  });

  const text = await res.text();
  const responseHeaders = new Headers(res.headers);

  return new NextResponse(text, { status: res.status, headers: responseHeaders });
}

export async function GET(request: NextRequest) {
  return forward(request);
}
export async function POST(request: NextRequest) {
  return forward(request);
}
export async function PUT(request: NextRequest) {
  return forward(request);
}
export async function DELETE(request: NextRequest) {
  return forward(request);
}
export async function OPTIONS(request: NextRequest) {
  return forward(request);
}
