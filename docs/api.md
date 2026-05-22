# Notification Gateway API

Use this document when integrating another project with the shared Notification Gateway.

## Base URL

```txt
https://notify.mugeon.kim
```

## Required Project Environment Variables

Each caller should configure:

```env
NOTIFY_ENDPOINT=https://notify.mugeon.kim/v1/notify
NOTIFY_API_KEY=...
```

Callers must not know or store:

```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

Those values belong only to the gateway.

## Health Check

```http
GET /health
```

Example:

```sh
curl https://notify.mugeon.kim/health
```

Expected response:

```json
{
  "ok": true,
  "service": "notification-gateway",
  "version": "1.0.0"
}
```

## Send Notification

```http
POST /v1/notify
Authorization: Bearer <NOTIFY_API_KEY>
Content-Type: application/json
```

Minimum payload:

```json
{
  "source": "distill",
  "level": "warning",
  "title": "Cluster count low",
  "message": "selected_briefs=2, minimum_required=3"
}
```

Recommended payload:

```json
{
  "source": "agentforge",
  "project": "distill",
  "level": "critical",
  "event": "worker_failed",
  "title": "Worker execution failed",
  "message": "distill project build failed after retry.",
  "tags": ["build", "worker", "human_review_required"],
  "url": "https://github.com/...",
  "image_url": "https://example.com/chart.png",
  "metadata": {
    "attempt": 2,
    "max_retries": 1,
    "queue": "human_review_queue"
  }
}
```

## Fields

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `source` | yes | string | Sending system, such as `distill`, `agentforge`, `airdrop`, or `arbitrage` |
| `level` | yes | string | One of `debug`, `info`, `success`, `warning`, `critical` |
| `title` | yes | string | Short notification title |
| `message` | yes | string | Main detail text |
| `project` | no | string | Related project name |
| `event` | no | string | Machine-readable event name |
| `tags` | no | string[] | Search/classification tags |
| `url` | no | string | Related PR, dashboard, log, report, or run URL |
| `image_url` | no | string | HTTP or HTTPS image URL to deliver as a Telegram photo |
| `metadata` | no | object | Extra structured values appended as key/value lines |

When `image_url` is present, the gateway sends a Telegram photo with the formatted notification text as the caption. Telegram photo captions are limited to 1024 characters, so longer formatted messages are truncated in the caption.

## Level Policy

Current gateway behavior:

- Valid levels: `debug`, `info`, `success`, `warning`, `critical`
- If `MIN_LEVEL` is not configured, all valid levels are delivered.
- If `MIN_LEVEL` is configured, lower-severity notifications are accepted but skipped with a JSON response.

Recommended caller behavior:

- Use `critical` for immediate human attention.
- Use `warning` for things that need review.
- Use `success` for important successful completions.
- Use `info` for useful normal events.
- Avoid `debug` in production unless explicitly needed.

## Curl Examples

Minimum notification:

```sh
curl -X POST "$NOTIFY_ENDPOINT" \
  -H "Authorization: Bearer $NOTIFY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "distill",
    "level": "warning",
    "title": "Cluster count low",
    "message": "selected_briefs=2, minimum_required=3"
  }'
```

AgentForge-style notification:

```sh
curl -X POST "$NOTIFY_ENDPOINT" \
  -H "Authorization: Bearer $NOTIFY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "agentforge",
    "project": "distill",
    "level": "critical",
    "event": "worker_failed",
    "title": "Worker execution failed",
    "message": "distill project build failed after retry.",
    "tags": ["build", "worker", "human_review_required"],
    "url": "https://github.com/...",
    "metadata": {
      "attempt": 2,
      "max_retries": 1
    }
  }'
```

Image notification:

```sh
curl -X POST "$NOTIFY_ENDPOINT" \
  -H "Authorization: Bearer $NOTIFY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "distill",
    "level": "warning",
    "title": "Daily chart threshold warning",
    "message": "selected_briefs=2, minimum_required=3",
    "image_url": "https://example.com/chart.png"
  }'
```

## JavaScript Example

```js
export async function notify(event) {
  const response = await fetch(process.env.NOTIFY_ENDPOINT, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.NOTIFY_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  const body = await response.json();

  if (!response.ok || body.ok !== true) {
    throw new Error(`Notification failed: ${JSON.stringify(body)}`);
  }

  return body;
}

await notify({
  source: 'distill',
  level: 'warning',
  title: 'Cluster count low',
  message: 'selected_briefs=2, minimum_required=3',
});
```

## Python Example

```python
import os
import requests


def notify(event):
    response = requests.post(
        os.environ["NOTIFY_ENDPOINT"],
        headers={
            "Authorization": f"Bearer {os.environ['NOTIFY_API_KEY']}",
            "Content-Type": "application/json",
        },
        json=event,
        timeout=10,
    )
    body = response.json()
    if not response.ok or body.get("ok") is not True:
        raise RuntimeError(f"Notification failed: {body}")
    return body


notify({
    "source": "distill",
    "level": "warning",
    "title": "Cluster count low",
    "message": "selected_briefs=2, minimum_required=3",
})
```

## Responses

Success:

```json
{
  "ok": true,
  "channel": "telegram"
}
```

Image success:

```json
{
  "ok": true,
  "channel": "telegram",
  "media": "photo"
}
```

Skipped by level policy:

```json
{
  "ok": true,
  "skipped": true,
  "reason": "below_min_level"
}
```

Unauthorized:

```json
{
  "ok": false,
  "error": "unauthorized"
}
```

Invalid JSON:

```json
{
  "ok": false,
  "error": "invalid_json"
}
```

Invalid payload:

```json
{
  "ok": false,
  "error": "invalid_payload",
  "details": ["title is required"]
}
```

Telegram configuration or delivery failure:

```json
{
  "ok": false,
  "error": "telegram_not_configured"
}
```

```json
{
  "ok": false,
  "error": "telegram_delivery_failed"
}
```

## Security Rules

Do not send these values in notification payloads:

- private keys
- seed phrases
- full API tokens
- full session cookies
- OAuth refresh tokens
- raw personal information
- sensitive financial information
- payment method details

The gateway masks common sensitive patterns before Telegram delivery, but callers should still avoid sending secrets.

Preferred masking at the caller:

```txt
wallet: 0x1234...abcd
api_key: sk-...9f3a
email: a***@example.com
```

## Admin Telegram Test

This endpoint is for gateway operators only:

```http
POST /admin/telegram/test
Authorization: Bearer <NOTIFY_API_KEY>
```

Example:

```sh
curl -X POST https://notify.mugeon.kim/admin/telegram/test \
  -H "Authorization: Bearer $NOTIFY_API_KEY"
```

Production projects should not call this endpoint.
