# Next Goal

## Status

READY

## Next Small Verifiable Task

1. Read `docs/goal/root_goal.md`, this file, and the current code state.
2. Implement Telegram Bot API delivery for validated `POST /v1/notify` payloads using `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
3. Return a JSON success response when Telegram accepts the message.
4. Return a JSON failure response when Telegram rejects or the required Telegram secrets are missing.
5. Add local tests with mocked `fetch` so no real Telegram call is made.

## Notes

- Keep tasks small and independently verifiable.
- Update this file after every successful cycle.
- Record before/after and verification results in `docs/goal/WORK_LOG.md`.
