import { NextRequest, NextResponse } from 'next/server';

// Public read-only Edge proxy to the internal Node handler.
export const runtime = 'edge';

const INTERNAL_SECRET_HEADER = 'x-internal-secret';
const INTERNAL_PATH = '/api/internal/tracking';

async function forward(request: NextRequest) {
  if (request.method !== 'GET') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405, headers: { Allow: 'GET' } },
    );
  }

  const url = new URL(request.url);
  const origin = url.origin;
  const target = new URL(INTERNAL_PATH, origin);
  target.search = url.search; // preserve query

  // Build headers and attach secret
  const headers = new Headers(request.headers);
  headers.set(INTERNAL_SECRET_HEADER, process.env.INTERNAL_API_SECRET ?? '');

  const res = await fetch(target.toString(), {
    method: request.method,
    headers,
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
