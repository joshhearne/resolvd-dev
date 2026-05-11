---
title: Troubleshooting
version: v0.6.0
order: 40
summary: Cookie / redirect loops, Entra AADSTS50011, 413 Request Entity Too Large.
---

## Cookies aren't being set / login redirects loop

Almost always a TLS / proxy header issue. Make sure your proxy forwards `X-Forwarded-Proto` and that `COOKIE_SECURE=true` matches whether you're actually serving HTTPS.

## Entra login fails with AADSTS50011

Redirect URI in your App Registration doesn't exactly match `AZURE_REDIRECT_URI`. Check trailing slashes and protocol.

## 413 Request Entity Too Large on attachments

Bump `client_max_body_size` (nginx) or `max_size` (Caddy) to at least `MAX_UPLOAD_MB`.
