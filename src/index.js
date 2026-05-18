const SERVICE_NAME = 'notification-gateway';
const VERSION = '1.0.0';

function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

export function handleHealth() {
  return json({
    ok: true,
    service: SERVICE_NAME,
    version: VERSION,
  });
}

function isAuthorized(request, env) {
  const expectedToken = env?.NOTIFY_API_KEY;
  const authorization = request.headers.get('authorization') ?? '';

  if (!expectedToken) {
    return false;
  }

  return authorization === `Bearer ${expectedToken}`;
}

export function unauthorized() {
  return json(
    {
      ok: false,
      error: 'unauthorized',
    },
    { status: 401 },
  );
}

export function handleNotify(request, env) {
  if (!isAuthorized(request, env)) {
    return unauthorized();
  }

  return json(
    {
      ok: false,
      error: 'not_implemented',
    },
    { status: 501 },
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return handleHealth();
    }

    if (request.method === 'POST' && url.pathname === '/v1/notify') {
      return handleNotify(request, env);
    }

    return json(
      {
        ok: false,
        error: 'not_found',
      },
      { status: 404 },
    );
  },
};
