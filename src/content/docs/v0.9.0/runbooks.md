---
title: Runbooks
version: v0.9.0
order: 27
since: v0.9.0
summary: Checklist KB articles driven from the ticket Runbook tab, with canned-response pills that prefill the comment composer.
---

A **runbook** is a KB article with `kind='runbook'`. Same editor, same versioning, same agent-only flag — the difference is rendered on the ticket: a Runbook tab lists every runbook started against the ticket with persistent checkbox state per step.

## Authoring

1. **KB → New article**.
2. Set **Kind: Runbook** in the editor sidebar.
3. Body uses BlockNote check-list-item blocks for steps. Headings, paragraphs, bullets render as section labels around the boxes.
4. Set status to **Published** when ready (drafts don't appear in the ticket picker).

### Canned-response pills

Inside a step's text, write one of:

- **Bare form** — `@canned:Vendor escalation`. Title runs to the end of the step line; convention is one canned reference per step.
- **Bracketed form** — `@canned:[Vendor escalation]` — explicit boundary, can sit mid-line.

On the ticket runbook panel these render as a 📋 pill. Click it and the canned-response body (with `{ticket.ref}` / `{submitter.firstName}` / etc. substituted server-side) drops into the comment composer. The view also jumps back to the Comments tab.

## Running

Open a ticket as a project handler (global Admin/Manager/Tech, or a project member with a handler role override / Agent flag on the ticket's project). Click the **Runbook** tab → **+ Start a runbook** → pick from the project's published runbooks.

State is keyed by `(ticket_id, article_id)` — opening the same runbook on a different ticket gets independent checkboxes.

Each checkbox tick records who ticked it + the timestamp. **Reset** clears all state for that ticket's run. **Mark complete** stamps `completed_at` on the run and shows a green badge; reopen by unsetting.

## Audit + permissions

- Read / write a run: project handler on the ticket's project.
- Delete a run: same as above.
- Author / edit a runbook article: same rules as any KB article (`canEdit` role; the article's agent_only flag layered on top).
- Delete an agent-only runbook: global Admin only (matches agent-only KB).

## Schema

- `kb_articles.kind` enum-ish text (`article` | `runbook`).
- `ticket_runbook_runs` (`ticket_id`, `article_id`, `step_states JSONB`, `started_by`, `started_at`, `completed_at`). Unique on `(ticket_id, article_id)` so opening the same runbook on a ticket twice merges. `step_states` is `{ blockId: { checked, checked_by, checked_by_name, checked_at } }`.

## Roadmap (post-v0.9.0)

- **Runbook → ScreenConnect BackStage script push.** When SC's deep-link launcher lands and hosted multi-tenant reach lets a runbook step `@sc:<script-id>` fire a script against the linked asset's endpoint.
- **Runbook → Action1 script push.** Same idea, gated on A1 surfacing a partner-accessible deploy API.

Both extend the existing `@canned:` syntax with `@sc:` / `@action1:` tokens. State capture (stdout / stderr) per step.
