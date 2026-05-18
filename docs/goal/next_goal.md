# Next Goal

## Status

READY

## Next Small Verifiable Task

1. Read `docs/goal/root_goal.md`, this file, and the current code state.
2. Implement a conservative secret redaction helper for notification text.
3. Mask common sensitive key/value patterns before Telegram delivery.
4. Ensure formatted Telegram messages never include full values for fields such as `api_key`, `token`, `private_key`, `seed_phrase`, or wallet-like addresses.
5. Add local tests for redaction without changing normal non-sensitive messages.

## Notes

- Keep tasks small and independently verifiable.
- Update this file after every successful cycle.
- Record before/after and verification results in `docs/goal/WORK_LOG.md`.
