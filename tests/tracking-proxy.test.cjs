const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const { afterEach, test } = require('node:test');
const ts = require('typescript');
const { NextRequest } = require('next/server');

// Exercise the actual Edge route without a database or a second test compiler.
const routePath = path.resolve(__dirname, '../src/app/api/tracking/route.ts');
const compiled = ts.transpileModule(fs.readFileSync(routePath, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const routeModule = new Module(routePath, module);
routeModule.filename = routePath;
routeModule.paths = Module._nodeModulePaths(path.dirname(routePath));
routeModule._compile(compiled, routePath);
const route = routeModule.exports;
const originalFetch = global.fetch;
const originalSecret = process.env.INTERNAL_API_SECRET;

afterEach(() => {
  global.fetch = originalFetch;
  if (originalSecret === undefined) delete process.env.INTERNAL_API_SECRET;
  else process.env.INTERNAL_API_SECRET = originalSecret;
});

for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS']) {
  test(`${method} refuses anonymous forwarding before body or upstream access`, async () => {
    process.env.INTERNAL_API_SECRET = 'test-only-internal-secret';
    let calls = 0;
    global.fetch = async () => { calls += 1; return new Response('{}'); };
    const request = new NextRequest('http://localhost/api/tracking?userId=other-user', {
      method,
      headers: {
        'x-internal-secret': 'test-only-internal-secret',
        'x-http-method-override': 'GET',
        cookie: 'session=untrusted',
      },
    });
    let bodyReads = 0;
    request.text = async () => {
      bodyReads += 1;
      throw new Error('A refused request must not read its body');
    };
    const response = await route[method](request);
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('allow'), 'GET');
    assert.deepEqual(await response.json(), { error: 'Method not allowed' });
    assert.equal(bodyReads, 0);
    assert.equal(calls, 0);
  });
}

test('shared forwarding guard refuses a non-GET request through the GET export too', async () => {
  global.fetch = async () => { throw new Error('No non-GET request may reach upstream'); };
  for (const method of ['POST', 'HEAD']) {
    const response = await route.GET(new NextRequest('http://localhost/api/tracking', { method }));
    assert.equal(response.status, 405);
  }
});

for (const [name, url, headers] of [
  ['anonymous GET', 'http://localhost/api/tracking', {}],
  ['anonymous GET naming another user', 'http://localhost/api/tracking?userId=user-b', {}],
  ['GET with a forged internal secret, cookie and userId', 'http://localhost/api/tracking?userId=user-b', {
    'x-internal-secret': 'test-only-internal-secret',
    cookie: 'next-auth.session-token=untrusted; session=untrusted',
    authorization: 'Bearer untrusted',
  }],
  ['GET naming the UI demo user', 'http://localhost/api/tracking?userId=mock-user-id', {}],
]) {
  test(`${name} is refused with 401 and never reaches the internal route`, async () => {
    process.env.INTERNAL_API_SECRET = 'test-only-internal-secret';
    let calls = 0;
    global.fetch = async () => { calls += 1; return new Response('[{"id":"leak"}]'); };
    const response = await route.GET(new NextRequest(url, { headers }));
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { error: 'Unauthorized' });
    assert.equal(calls, 0);
  });
}

test('public route source no longer reads or forwards the internal secret', () => {
  const source = fs.readFileSync(routePath, 'utf8');
  assert.doesNotMatch(source, /INTERNAL_API_SECRET/);
  assert.doesNotMatch(source, /x-internal-secret/);
  assert.doesNotMatch(source, /fetch\(/);
});
