import { NextRequest, NextResponse } from 'next/server';

// Public read-only Edge endpoint.
export const runtime = 'edge';

// Reads must be authorised by the caller's authenticated identity, but no
// session system exists yet. Until one does, the public endpoint fails closed:
// it never forwards to /api/internal/tracking and never attaches the internal
// secret, so a client-supplied `userId` can no longer select whose data is read.
// The UI falls back to its browser-local demo mode on a non-OK response.
async function respond(request: NextRequest) {
  if (request.method !== 'GET') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405, headers: { Allow: 'GET' } },
    );
  }

  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401, headers: { 'Cache-Control': 'no-store' } },
  );
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
