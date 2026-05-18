# Notification Gateway

Shared notification gateway for personal projects.

Projects should not call Telegram directly. They should send normalized notification events to this gateway.

## Production Endpoint

```txt
https://notify.mugeon.kim/v1/notify
```

## Project Environment Variables

Each calling project needs only:

```env
NOTIFY_ENDPOINT=https://notify.mugeon.kim/v1/notify
NOTIFY_API_KEY=...
```

Do not put Telegram bot tokens in project repositories.

## Quick Test

```sh
curl https://notify.mugeon.kim/health
```

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

Full integration docs: [docs/api.md](docs/api.md)

