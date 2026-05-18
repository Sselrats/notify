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

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return handleHealth();
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

