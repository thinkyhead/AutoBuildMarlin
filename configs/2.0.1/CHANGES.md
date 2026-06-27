# Configuration Changes: 2.0.0 → 2.0.1

**Release Date:** 2019-12-24

Configuration changes required when upgrading from Marlin 2.0.0 to 2.0.1.

---

## Simple Renames

| Old Option | New Option | Notes |
|------------|------------|-------|
| `FILAMENT_UNLOAD_RETRACT_LENGTH` | `FILAMENT_UNLOAD_PURGE_RETRACT` | |
| `FILAMENT_UNLOAD_DELAY` | `FILAMENT_UNLOAD_PURGE_DELAY` | |

---

## No Complex Transforms

This version step only contains simple renames. No transform functions required.

---

## Implementation Notes

- Migration step in `abm/migration-rules.js` migrationSteps table
- Only `rename` map is used, no `transforms` array
- Migration is idempotent
