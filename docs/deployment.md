# Deployment

This project is a Cloudflare Workers Notification Gateway for the documented `notify.mugeon.kim` endpoint.

## Runtime

- Platform: Cloudflare Workers
- Worker name: `notification-gateway`
- Worker entrypoint: `src/index.js`
- Production endpoint: `POST /v1/notify`
- Health endpoint: `GET /health`
- Telegram test endpoint: `POST /admin/telegram/test`

## Required Secrets

Set these values as Cloudflare Worker secrets. Do not commit real values to the repository.

```sh
wrangler secret put NOTIFY_API_KEY
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_CHAT_ID
```

The code expects:

- `NOTIFY_API_KEY`: Bearer token required by `/v1/notify` and `/admin/telegram/test`.
- `TELEGRAM_BOT_TOKEN`: Telegram Bot API token used only by the gateway.
- `TELEGRAM_CHAT_ID`: Telegram group/channel/chat id used only by the gateway.

## Optional Variables

`wrangler.toml` currently defines:

```toml
[vars]
SERVICE_NAME = "notification-gateway"
```

The code also supports:

- `MIN_LEVEL`: Optional. One of `debug`, `info`, `success`, `warning`, or `critical`. When set, lower-severity notifications return a JSON skipped response and are not sent to Telegram.

The design document also proposes this future variable:

- `ENVIRONMENT`: PROPOSED. Environment-specific behavior is not implemented yet.

## Local Development

Install dependencies when needed:

```sh
npm install
```

Run tests:

```sh
npm test
```

Run the Worker locally:

```sh
wrangler dev
```

For local manual testing, use `.dev.vars` and never commit it:

```env
NOTIFY_API_KEY=local-test-key
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

## Deployment

Deploy only after Cloudflare account, domain routing, and Worker secrets are configured by a human operator:

```sh
wrangler deploy
```

Actual domain binding for `notify.mugeon.kim` is an infrastructure step and is not performed by this repository.
