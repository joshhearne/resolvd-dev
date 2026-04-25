# resolvd.dev

Marketing and documentation site for [Resolvd](https://github.com/joshhearne/resolvd) — self-hosted issue tracking.

Built with [Astro](https://astro.build) + [Tailwind CSS v4](https://tailwindcss.com). Static output, deployable to any CDN.

## Pages

- `/` — Overview, features, stack snapshot
- `/install/` — Interactive Docker install wizard (client-side; generates `.env`, `docker-compose.yml`, proxy snippet)
- `/manual/` — Step-by-step manual setup with branching choices (auth, email, reverse proxy)
- `/docs/` — Env var reference, roles, operations, troubleshooting

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output -> dist/
npm run preview
```

## Roadmap

- [ ] v2: live demo instance that resets every 4 hours
- [ ] Screenshots / product gallery
- [ ] Changelog page sourced from Resolvd releases
