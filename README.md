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

## License

Code, copy, design, and brand assets are © 2026 Hearne Technologies. All rights reserved.

This repo is public for transparency, not for reuse. Not currently accepting community PRs — file an issue for feature suggestions or bugs.

The Resolvd application is licensed separately under FSL-1.1-Apache-2.0: https://github.com/joshhearne/resolvd
