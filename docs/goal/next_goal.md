# Next Goal

## Status

READY

## Next Small Verifiable Task

1. Read `docs/goal/root_goal.md`, this file, and the current code state.
2. Implement `MIN_LEVEL` severity filtering as an optional runtime policy.
3. Default behavior should continue delivering all valid levels when `MIN_LEVEL` is absent.
4. When `MIN_LEVEL` is set, return a JSON skipped response for lower-severity notifications without calling Telegram.
5. Add local tests for absent `MIN_LEVEL`, `MIN_LEVEL=warning`, and invalid `MIN_LEVEL` behavior.

## Notes

- Keep tasks small and independently verifiable.
- Update this file after every successful cycle.
- Record before/after and verification results in `docs/goal/WORK_LOG.md`.
