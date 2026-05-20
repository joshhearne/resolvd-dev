---
title: Consumables
version: v0.9.0
order: 38
since: v0.9.0
summary: Supply inventory with append-only ledger — toner, drums, batteries, anything that's interchangeable.
---

Consumables track stock of items Inventory shouldn't store per-serial — toner cartridges, spare drum kits, UPS batteries, replacement keyboards. Distinct from `assets` so the durable-stuff schema doesn't accumulate fungible-stuff rows.

## Schema

- `consumables` — `part_no` (unique), `vendor_company_id`, `name`, `current_stock`, `low_stock_threshold`, `notes`, `archive` flag.
- `consumable_movements` — append-only ledger. `consumable_id`, `delta` (signed int), `reason`, `ticket_id` (nullable), `by_user_id`, `at`, `note`.

Every stock change runs `UPDATE consumables SET current_stock = current_stock + $delta` + `INSERT consumable_movements …` in the same transaction. Direct `PATCH /current_stock` is rejected with `400 "use /:id/move"` so the audit trail can't be bypassed.

## Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/consumables` | List (search, archive filter). |
| `POST /api/consumables` | Create. |
| `GET / PATCH / DELETE /api/consumables/:id` | Read / update metadata / soft-archive. |
| `POST /api/consumables/:id/move` | Atomic stock adjust + ledger insert. |
| `GET /api/consumables/:id/movements` | Newest-first ledger. |
| `POST /api/consumables/:id/print-label` | Send a label to the printer. |

`POST /:id/move` body shape:

```json
{
  "delta": -2,
  "reason": "issued",
  "ticket_id": 4521,
  "note": "Toner for ACME-0042"
}
```

## UI

- **Consumables** top-nav entry, parallel to Inventory. Handler-only.
- List page: search box, low-stock chip, archive toggle, count by vendor.
- Detail page: stock card (current + threshold), inline edit, +/- stock controls, full ledger table, Print label button.

Low-stock is purely informational right now — surfaces a red badge but doesn't fire a notification. Reorder alerts via the existing notification matrix is a roadmap follow-up.

## Common operations

- **Receive shipment** — Detail → `+ N` with reason `received`, optional vendor PO note.
- **Issue to ticket** — Detail → `- 1` with reason `issued`, link to ticket. Or from the ticket itself (future — currently you start from the consumable).
- **Disposal / recall** — `- N` with reason `disposed`. Reason values are free-text but the seeded list is `received | issued | returned | disposed | count_correction | loss`.
- **Count correction** — when a manual recount disagrees with the on-screen number, log a `count_correction` movement with the delta. Keeps the discrepancy on the audit trail rather than hiding it inside an edit.
