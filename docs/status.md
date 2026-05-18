# Implementation Status

This document maps the Notification Gateway design requirements to the current repository state.

The canonical goal document is `docs/goal/root_goal.md`. `docs/goals/root_goal.md` is a compatibility pointer for goal runners that use the plural path.

## MVP Requirements

| Requirement | Status | Evidence |
| --- | --- | --- |
| `GET /health` | IMPLEMENTED | `src/index.js`, `test/health.test.js` |
| `POST /v1/notify` | IMPLEMENTED | `src/index.js`, `test/notify-*.test.js` |
| Bearer token authentication | IMPLEMENTED | `src/index.js`, `test/notify-auth.test.js`, `test/admin-telegram-test.test.js` |
| JSON body parsing | IMPLEMENTED | `src/index.js`, `test/notify-payload.test.js` |
| Required field validation | IMPLEMENTED | `source`, `level`, `title`, and `message` checks in `src/index.js` |
| Level validation | IMPLEMENTED | `debug`, `info`, `success`, `warning`, and `critical` checks in `src/index.js` |
| Telegram message formatting | IMPLEMENTED | `formatTelegramMessage` in `src/index.js`, `test/telegram-format.test.js` |
| Optional `metadata` formatting | IMPLEMENTED | `formatTelegramMessage` appends metadata key/value lines; covered by `test/telegram-format.test.js` |
| Telegram Bot API delivery | IMPLEMENTED | `deliverTelegram` in `src/index.js`, mocked tests in `test/telegram-delivery.test.js` and `test/notify-delivery.test.js` |
| Success/failure JSON responses | IMPLEMENTED | Route, validation, config, delivery, and skip responses covered by tests |
| `POST /admin/telegram/test` | IMPLEMENTED | `src/index.js`, `test/admin-telegram-test.test.js` |

## Security Requirements

| Requirement | Status | Evidence |
| --- | --- | --- |
| Telegram Bot Token is held only by the gateway | IMPLEMENTED IN CODE / BLOCKED IN INFRA | Code reads `TELEGRAM_BOT_TOKEN` only from Worker env; real Cloudflare secret setup requires human credentials |
| Projects use only `NOTIFY_ENDPOINT` and `NOTIFY_API_KEY` | DOCUMENTED | `docs/deployment.md`; client library/package is not part of this repository |
| External project integration guide | IMPLEMENTED | `README.md` and `docs/api.md` document endpoint, env vars, schemas, examples, responses, and security rules |
| Do not commit real secrets | VERIFIED LOCALLY | Secret placeholders only; `.dev.vars` is ignored by `.gitignore` |
| Mask sensitive notification text | IMPLEMENTED | `redactSensitiveText` in `src/index.js`, `test/redaction.test.js` |

## Optional Policies

| Requirement | Status | Evidence |
| --- | --- | --- |
| `MIN_LEVEL` filtering | IMPLEMENTED | `src/index.js`, `test/min-level.test.js`, `docs/deployment.md` |
| `SERVICE_NAME` | IMPLEMENTED | `wrangler.toml` defines it; `GET /health` uses the Worker var with a default fallback |
| `ENVIRONMENT` | PROPOSED | No environment-specific behavior is implemented |

## MVP Exclusions

These are intentionally not implemented in the MVP design:

- DB storage
- retry queue
- Slack/Email/Discord/SMS integrations
- admin UI
- source-specific rate limits
- source-specific mute settings
- notification history dashboard

## BLOCKED

- Live authenticated `/v1/notify` or `/admin/telegram/test` verification requires the user-held `NOTIFY_API_KEY`.
- Live Telegram delivery verification requires real Telegram bot/chat credentials and a reachable configured chat.
- Future Cloudflare/DNS changes require human-owned Cloudflare/domain access.

## PROPOSED

- KV or D1 event log
- source-specific mute/allowlist
- project-specific routing rules
- critical notification deduplication
- time-window event deduplication
- admin dashboard
- Slack/Email/Discord/SMS routing
- AgentForge approval link buttons
- `ENVIRONMENT`-specific behavior

## Verification

Current local verification:

```sh
npm test
```

Latest local result recorded in `docs/goal/WORK_LOG.md`: all 26 tests passed.
