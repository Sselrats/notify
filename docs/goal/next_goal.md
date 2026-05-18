# Next Goal

## Status

READY

## Next Small Verifiable Task

1. Read `docs/goal/root_goal.md`, this file, and the current code state.
2. Implement JSON body parsing for authenticated `POST /v1/notify` requests.
3. Validate the required payload fields: `source`, `level`, `title`, and `message`.
4. Return JSON validation errors for malformed JSON or missing/invalid required fields.
5. Add local tests for malformed JSON, missing fields, and a minimally valid payload.

## Notes

- Keep tasks small and independently verifiable.
- Update this file after every successful cycle.
- Record before/after and verification results in `docs/goal/WORK_LOG.md`.
