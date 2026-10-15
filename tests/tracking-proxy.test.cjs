const assert = require('node:assert/strict');
const fs = require('node:fs');
const { afterEach, beforeEach, test } = require('node:test');
const { NextRequest } = require('next/server');
const { loadRoute } = require('./helpers/load-route.cjs');

// The session is whatever the test sets; nothing from the request can change it.
let session = null;
const { routePath, route } = loadRoute('src/app/api/tracking/route.ts', {
  'next-auth': { getServerSession: async () => session },
  '@/lib/auth': { authOptions: {} },
});

const ENV_KEYS = ['INTERNAL_API_SECRET', 'INTERNAL_API_ORIGIN', 'NEXTAUTH_URL', 'VERCEL_URL'];
const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
const originalFetch = global.fetch;
let fetchCalls = [];

beforeEach(() => {
  session = null;
  fetchCalls = [];
  for (const key of ENV_KEYS) delete process.env[key];
  process.env.INTERNAL_API_SECRET = 'test-only-internal-secret';
  process.env.NEXTAUTH_URL = 'https://tracking.example.test';
  global.fetch = async (url, init) => {
    fetchCalls.push({ url: new URL(url), init });
    return new Response('[{"id":"own"}]', { status: 200 });
  };
});

afterEach(() => {
  global.fetch = originalFetch;
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

const signInAs = (id) => { session = { user: { id }, expires: '2999-01-01T00:00:00.000Z' }; };

for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS']) {
  test(`${method} is refused with 405 before session, body or upstream access`, async () => {
    signInAs('user-a');
    const request = new NextRequest('http://localhost/api/tracking?userId=user-a', {
      method,
      headers: { 'x-internal-secret': 'test-only-internal-secret', 'x-http-method-override': 'GET' },
    });
    request.text = async () => { throw new Error('A refused request must not read its body'); };
    const response = await route[method](request);
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('allow'), 'GET');
    assert.equal(fetchCalls.length, 0);
  });
}

test('the GET export also refuses a non-GET request', async () => {
  signInAs('user-a');
  for (const method of ['POST', 'HEAD']) {
    const response = await route.GET(new NextRequest('http://localhost/api/tracking', { method }));
    assert.equal(response.status, 405);
  }
  assert.equal(fetchCalls.length, 0);
});

for (const [name, url, headers] of [
  ['anonymous GET', 'http://localhost/api/tracking', {}],
  ['anonymous GET naming another user', 'http://localhost/api/tracking?userId=user-b', {}],
  ['anonymous GET with a forged internal secret, cookie and userId', 'http://localhost/api/tracking?userId=user-b', {
    'x-internal-secret': 'test-only-internal-secret',
    cookie: 'next-auth.session-token=untrusted',
    authorization: 'Bearer untrusted',
  }],
  ['anonymous GET naming the old UI demo user', 'http://localhost/api/tracking?userId=mock-user-id', {}],
]) {
  test(`${name} is refused with 401 and never reaches the internal route`, async () => {
    const response = await route.GET(new NextRequest(url, { headers }));
    assert.equal(response.status, 401);
    assert.match(response.headers.get('cache-control'), /no-store/);
    assert.deepEqual(await response.json(), { error: 'Unauthorized' });
    assert.equal(fetchCalls.length, 0);
  });
}

test('a session without a user id is treated as anonymous', async () => {
  session = { user: { email: 'a@example.test' } };
  const response = await route.GET(new NextRequest('http://localhost/api/tracking'));
  assert.equal(response.status, 401);
  assert.equal(fetchCalls.length, 0);
});

for (const query of ['userId=user-b', 'userId=user-a&userId=user-b', 'userId=']) {
  test(`user A requesting ${query} is refused with 403 and never forwarded`, async () => {
    signInAs('user-a');
    const response = await route.GET(new NextRequest(`http://localhost/api/tracking?${query}`));
    assert.equal(response.status, 403);
    assert.equal(fetchCalls.length, 0);
  });
}

test('own read forwards only the session user id, filters and the secret', async () => {
  signInAs('user-a');
  const response = await route.GET(new NextRequest(
    'http://localhost/api/tracking?userId=user-a&category=ANIME&search=x&evil=1',
    { headers: { cookie: 'next-auth.session-token=abc', authorization: 'Bearer t' } },
  ));
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /private, no-store/);
  assert.deepEqual(await response.json(), [{ id: 'own' }]);
  assert.equal(fetchCalls.length, 1);
  const { url, init } = fetchCalls[0];
  assert.equal(url.origin, 'https://tracking.example.test');
  assert.equal(url.pathname, '/api/internal/tracking');
  assert.deepEqual(url.searchParams.getAll('userId'), ['user-a']);
  assert.equal(url.searchParams.get('category'), 'ANIME');
  assert.equal(url.searchParams.get('search'), 'x');
  assert.equal(url.searchParams.has('evil'), false);
  assert.deepEqual(Object.keys(init.headers).sort(), ['accept', 'x-internal-secret']);
  assert.equal(init.headers['x-internal-secret'], 'test-only-internal-secret');
  assert.equal(init.redirect, 'manual');
});

test('a forged Host header cannot redirect the internal secret', async () => {
  signInAs('user-a');
  await route.GET(new NextRequest('https://attacker.example/api/tracking', { headers: { host: 'attacker.example' } }));
  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0].url.origin, 'https://tracking.example.test');
});

test('INTERNAL_API_ORIGIN takes precedence, then VERCEL_URL is the fallback', async () => {
  signInAs('user-a');
  process.env.INTERNAL_API_ORIGIN = 'http://127.0.0.1:3000';
  await route.GET(new NextRequest('http://localhost/api/tracking'));
  delete process.env.INTERNAL_API_ORIGIN;
  delete process.env.NEXTAUTH_URL;
  process.env.VERCEL_URL = 'tracking-preview.vercel.app';
  await route.GET(new NextRequest('http://localhost/api/tracking'));
  assert.deepEqual(fetchCalls.map(({ url }) => url.origin), ['http://127.0.0.1:3000', 'https://tracking-preview.vercel.app']);
});

for (const origin of ['http://tracking.example.test', 'http://10.0.0.5:3000', 'ftp://tracking.example.test', 'not a url']) {
  test(`origin ${origin} is refused with 503 so the secret never travels in clear`, async () => {
    signInAs('user-a');
    process.env.INTERNAL_API_ORIGIN = origin;
    const response = await route.GET(new NextRequest('http://localhost/api/tracking'));
    assert.equal(response.status, 503);
    assert.equal(fetchCalls.length, 0);
  });
}

test('plain HTTP is allowed only for a loopback origin', async () => {
  signInAs('user-a');
  for (const origin of ['http://localhost:3000', 'http://[::1]:3000']) {
    process.env.INTERNAL_API_ORIGIN = origin;
    assert.equal((await route.GET(new NextRequest('http://localhost/api/tracking'))).status, 200);
  }
  assert.deepEqual(fetchCalls.map(({ url }) => url.origin), ['http://localhost:3000', 'http://[::1]:3000']);
});

for (const missing of ['INTERNAL_API_SECRET', 'origin']) {
  test(`a missing ${missing} fails closed with 503 and never forwards`, async () => {
    signInAs('user-a');
    if (missing === 'origin') delete process.env.NEXTAUTH_URL;
    else delete process.env[missing];
    const response = await route.GET(new NextRequest('http://localhost/api/tracking'));
    assert.equal(response.status, 503);
    assert.equal(fetchCalls.length, 0);
  });
}

test('an upstream redirect or network failure becomes 502', async () => {
  signInAs('user-a');
  global.fetch = async () => new Response(null, { status: 307, headers: { location: 'https://elsewhere.test' } });
  assert.equal((await route.GET(new NextRequest('http://localhost/api/tracking'))).status, 502);
  global.fetch = async () => { throw new TypeError('fetch failed'); };
  assert.equal((await route.GET(new NextRequest('http://localhost/api/tracking'))).status, 502);
});

test('public route never trusts the request origin for forwarding', () => {
  const source = fs.readFileSync(routePath, 'utf8');
  assert.doesNotMatch(source, /request\.url/);
  assert.doesNotMatch(source, /nextUrl\.origin/);
  assert.doesNotMatch(source, /headers\.get\(['"]host/i);
});
