# Configuration Changes: 2.0.9.4 → 2.0.9.5

**Release Date:** 2022-07-29

Configuration changes required when upgrading from Marlin 2.0.9.4 to 2.0.9.5.

---

## Removed Options

| Option | Notes |
|--------|-------|
| `LINEAR_AXES` | Delta/SCARA now in all configs |
| `LASER_POWER_INLINE` | |
| `LASER_POWER_INLINE_TRAPEZOID_CONT` | |
| `LASER_POWER_INLINE_TRAPEZOID_CONT_PER` | |
| `LASER_MOVE_POWER` | |
| `LASER_MOVE_G0_OFF` | |
| `LASER_MOVE_G28_OFF` | |
| `LASER_POWER_INLINE_INVERT` | |
| `LASER_POWER_INLINE_CONTINUOUS` | |

---

## Simple Renames

| Old Option | New Option | Notes |
|------------|------------|-------|
| `LASER_POWER_INLINE_TRAPEZOID` | `LASER_POWER_TRAP` | |

---

## No Complex Transforms

---

## No Warnings

---

## Implementation Notes

- Migration step in `abm/migration-rules.js` migrationSteps table
- Only `rename` map used, no `transforms` array
- Migration is idempotent
