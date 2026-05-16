---
title: Operations
version: v0.7.0
order: 30
summary: Common ops — updates, logs, password reset, wipe-and-restart.
---

## Update to a new release

```sh
cd resolvd
git pull
docker compose up -d --build
```

## View logs

```sh
docker compose logs -f backend
docker compose logs -f nginx
```

## Reset a forgotten admin password

```sh
docker exec -it resolvd-backend node scripts/reset-password.js <email>
```

## Wipe everything (start fresh)

```sh
docker compose down -v
rm -rf data/uploads/*
```
