# Employee Document Manager

## Current State

- Backend uses `var` and `let Map` (non-stable) for all data stores (employees, documents, adminUsers) and ID counters -- these reset to empty on every canister upgrade/redeployment, causing all data to be wiped.
- `init()` function exists and seeds the Super Admin user if adminUsers is empty -- it could be triggered accidentally and has no protection against reseeding.
- No sample employees or documents are seeded in init(), but the non-stable storage means data appears gone after deploys anyway.
- Frontend has no hardcoded demo data.

## Requested Changes (Diff)

### Add
- `stable var` counters for nextEmployeeId, nextDocumentId, nextAdminUserId so IDs survive upgrades.
- `stable var` arrays (or upgrade hooks) to persist employee, document, and adminUser data across canister upgrades.
- Super Admin guard in `deleteAdminUser`: prevent deletion of `gokul.blackcatsolution@gmail.com`.
- `system func preupgrade` and `postupgrade` hooks to serialize/deserialize Map data into stable arrays.

### Modify
- Replace non-stable `var`/`let Map` declarations with stable-backed storage pattern using preupgrade/postupgrade.
- `init()` function: keep only Super Admin seeding (already correct), but ensure it never recreates a user that already exists (already guarded by `isEmpty()` check -- this is fine).

### Remove
- Nothing to remove from frontend (no hardcoded data found).

## Implementation Plan

1. In `main.mo`, declare stable arrays for employees, documents, and adminUsers data persistence.
2. Add `system func preupgrade` to serialize Map contents into stable arrays before upgrade.
3. Add `system func postupgrade` to deserialize stable arrays back into Maps after upgrade, and restore ID counters.
4. Add Super Admin email guard in `deleteAdminUser` to prevent deletion of `gokul.blackcatsolution@gmail.com`.
5. Ensure `init()` only seeds Super Admin once and is safe to ignore if already seeded.
