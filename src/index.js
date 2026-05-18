const SERVICE_NAME = 'notification-gateway';
const VERSION = '1.0.0';
const LEVELS = new Set(['debug', 'info', 'success', 'warning', 'critical']);

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

async function parseJson(request) {
  try {
    return {
      ok: true,
      value: await request.json(),
    };
  } catch {
    return {
      ok: false,
      response: json(
        {
          ok: false,
          error: 'invalid_json',
        },
        { status: 400 },
      ),
    };
  }
}

function validatePayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return ['payload must be a JSON object'];
  }

  for (const field of ['source', 'level', 'title', 'message']) {
    if (typeof payload[field] !== 'string' || payload[field].trim() === '') {
      errors.push(`${field} is required`);
    }
  }

  if (typeof payload.level === 'string' && !LEVELS.has(payload.level)) {
    errors.push('level is invalid');
  }

  return errors;
}

function invalidPayload(errors) {
  return json(
    {
      ok: false,
      error: 'invalid_payload',
      details: errors,
    },
    { status: 400 },
  );
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

export function formatTelegramMessage(payload) {
  const lines = [
    `[${payload.source.trim()}] ${payload.level.trim().toUpperCase()}`,
    payload.title.trim(),
    '',
  ];

  const hasContext = nonEmptyString(payload.project) || nonEmptyString(payload.event);

  if (nonEmptyString(payload.project)) {
    lines.push(`project: ${payload.project.trim()}`);
  }

  if (nonEmptyString(payload.event)) {
    lines.push(`event: ${payload.event.trim()}`);
  }

  if (hasContext) {
    lines.push(`message: ${payload.message.trim()}`);
  } else {
    lines.push(payload.message.trim());
  }

  if (Array.isArray(payload.tags)) {
    const tags = payload.tags
      .filter(nonEmptyString)
      .map((tag) => tag.trim());

    if (tags.length > 0) {
      lines.push('', `tags: ${tags.join(', ')}`);
    }
  }

  if (nonEmptyString(payload.url)) {
    const previousLine = lines.at(-1);
    if (previousLine !== '') {
      lines.push('');
    }
    lines.push(`url: ${payload.url.trim()}`);
  }

  return lines.join('\n');
}

export async function deliverTelegram(message, env, fetchImpl = globalThis.fetch) {
  if (!env?.TELEGRAM_BOT_TOKEN || !env?.TELEGRAM_CHAT_ID) {
    return json(
      {
        ok: false,
        error: 'telegram_not_configured',
      },
      { status: 500 },
    );
  }

  const response = await fetchImpl(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: message,
    }),
  });

  let result = null;
  try {
    result = await response.json();
  } catch {
    // Telegram normally returns JSON, but status still determines failure here.
  }

  if (!response.ok || result?.ok === false) {
    return json(
      {
        ok: false,
        error: 'telegram_delivery_failed',
      },
      { status: 502 },
    );
  }

  return json({
    ok: true,
    channel: 'telegram',
  });
}

export async function handleNotify(request, env) {
  if (!isAuthorized(request, env)) {
    return unauthorized();
  }

  const parsed = await parseJson(request);
  if (!parsed.ok) {
    return parsed.response;
  }

  const errors = validatePayload(parsed.value);
  if (errors.length > 0) {
    return invalidPayload(errors);
  }

  const message = formatTelegramMessage(parsed.value);
  return deliverTelegram(message, env);
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
