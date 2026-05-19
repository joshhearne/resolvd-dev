---
title: Knowledge Base
version: v0.8.0
order: 55
summary: Per-project rich-text articles with version history, tagging, and ticket linking. BlockNote editor; project-scoped slug uniqueness; pg_trgm-driven suggestion ranker on the ticket Resolution tab.
since: v0.7.0
---

## What it is

`/kb` is per-project documentation. Every project owns its own articles, tag taxonomy, and version history. Editors author in **BlockNote** (a block editor on top of ProseMirror — rich text, headings, lists, code blocks, callouts). Readers see a rendered surface that matches the Resolvd theme.

Articles drive two things outside the KB itself: the suggestion ranker on the ticket **Resolution** tab, and the close-time "Promote to KB" nudge that captures fixes as new draft articles.

---

## Schema

`kb_articles`

| Column | Purpose |
|---|---|
| `project_id` + `slug` (`UNIQUE`) | Slug is unique per project. Different projects can reuse the same slug. |
| `title` | Plain text. |
| `content_json` (`JSONB`) | BlockNote document — array of block objects. |
| `content_text` | Plain-text mirror, kept in sync on every save. Used for FTS + excerpts + similarity ranker. |
| `status` | `draft` / `published` / `archived`. Soft-delete via `archived`. |
| `tags TEXT[]` | Surface as filter chips on the project index. AND'd together via `tags @> $1::text[]`. |
| `keywords TEXT[]` | Don't show as chips. Boost the trigram similarity score in the suggestion ranker. Use for SKU codes, model numbers, error strings. |
| `author_id`, `last_edited_by` | FKs to users. |
| `view_count` | Best-effort bump on each read. |
| `published_at` | Stamped the first time status flips to `published`. |

`kb_article_versions` snapshots every save with an optional `change_summary`. Restore writes a fresh version row marked `Restored from vN` so the audit chain stays intact.

`ticket_kb_links` is the ticket↔KB junction:

| `kind` | Source |
|---|---|
| `manual` | Picked via the article picker on the Resolution tab. |
| `suggested_accepted` | User accepted a high-confidence suggestion. |
| `system` | Promote-to-KB drafted a new article from the ticket. |

---

## Permissions

| Action | Role |
|---|---|
| Read published articles in own projects | All members |
| Create / edit / archive articles | Admin / Manager / Tech |
| Restore prior version | Admin / Manager / Tech |
| Promote ticket → KB | Admin / Manager (the resulting article starts as `draft`) |
| Hard-delete an article | Admin / Manager (otherwise archive) |

Admin sees every project's KB. Tech / Submitter / Viewer are scoped by `project_members`.

---

## Endpoints

```
GET    /api/kb/projects                                 — projects + per-project article_count
GET    /api/kb/projects/:id/articles                    — list (?q= ?status= ?tag=a,b)
GET    /api/kb/projects/:id/articles/:slug              — single read (bumps view_count)
POST   /api/kb/projects/:id/articles                    — create
PATCH  /api/kb/articles/:id                             — update (snapshots a new version on content/title change)
DELETE /api/kb/articles/:id                             — soft archive (?hard=1 hard-deletes, Admin/Manager only)
GET    /api/kb/articles/:id/versions                    — list versions
GET    /api/kb/articles/:id/versions/:n                 — single version (for diff/preview)
POST   /api/kb/articles/:id/restore/:n                  — restore version n (writes a new version row)
GET    /api/kb/tags?project_id=N&q=foo                  — distinct tags + per-tag article_count
POST   /api/kb/from-ticket/:id                          — Promote-to-KB (Admin/Manager only). Drafts a new article + system link.
GET    /api/kb/tickets/:id/suggestions                  — suggested articles for a ticket (pg_trgm ranker)
POST   /api/kb/tickets/:id/links/:articleId             — manually link an article to a ticket
DELETE /api/kb/tickets/:id/links/:articleId             — unlink
```

---

## Suggestion ranker

When a ticket opens, the Resolution tab calls `/api/kb/tickets/:id/suggestions`. The query is roughly:

```sql
SELECT a.id AS article_id, a.slug, a.title, a.tags,
       similarity(
         a.title || ' ' || array_to_string(a.tags, ' ') || ' ' || array_to_string(a.keywords, ' '),
         $ticketTitle
       ) AS score
  FROM kb_articles a
 WHERE a.project_id = $ticketProjectId
   AND a.status = 'published'
   AND NOT EXISTS (
     SELECT 1 FROM ticket_kb_links l
      WHERE l.ticket_id = $ticketId AND l.article_id = a.id
   )
 ORDER BY score DESC
 LIMIT 5;
```

`pg_trgm` is enabled at boot if available. Sequential scans are fine — typical KB sizes stay under a few thousand articles per project. A title trigram index (`idx_kb_articles_title_trgm`) accelerates plain title substring lookups in the picker.

Auto-surface threshold for the high-confidence inline match is 0.4 by default. Below that, the panel shows a "Search KB" picker instead.

---

## Promote-to-KB

`POST /api/kb/from-ticket/:id` drafts a new article seeded from:

1. Ticket title → article title.
2. Ticket description → first paragraph block.
3. `resolution_summary` (captured at close time) → "Resolution" heading + paragraph block.

Tags + keywords start empty so the editor curates them deliberately. Article status is `draft`. A `ticket_kb_links` row of `kind='system'` is recorded automatically. Admin / Manager only.

At ticket close, the closer is nudged to capture a one-line `resolution_summary` if it isn't already set — drives the **Fix applied** filter on the ticket list (`resolution_summary IS NOT NULL` OR a `ticket_kb_links` row exists).

---

## Editor

Frontend uses `@blocknote/core` + `@blocknote/react` + `@blocknote/mantine` at `0.30.0` (the last version that supports React 18). BlockNote stores content as an array of block objects; the backend extracts plain text via a recursive walk over the `content` / `children` / `text` keys and writes it to `content_text` on every save.

Editor mounts only after content is loaded (otherwise `useCreateBlockNote` captures an empty doc and never picks up the article body). For new articles, the editor mounts immediately with an undefined initial content.

---

## Cross-project

Per-user starred projects are shared between the Projects nav and the KB project picker. Star a project once; it floats to the top in both surfaces.

`ProjectDetail` carries a small **KB** button in its settings card header that deep-links to `/kb/:projectId` for techs jumping from project settings into the KB.
