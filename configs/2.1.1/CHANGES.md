# Configuration Changes: 2.1.0.2 → 2.1.1

**Release Dates:** 2023-07-19 (2.1.0.1 PIO 6), 2023-12-08 (2.1.0.2), 2023-07-20 (2.1.1)

> **Note:** Versions 2.1.0.1 (PlatformIO 6 update) and 2.1.0.2 (no config changes) are intermediate. This step covers all changes from 2.1.0 to 2.1.1.

---

## Changes from 2.1.0 → 2.1.0.1

**PlatformIO 6 update only — no configuration changes.**

---

## Changes from 2.1.0.1 → 2.1.0.2

**No configuration-level changes.**

---

## Changes from 2.1.0.2 → 2.1.1

### Complex Transforms

#### Laser Power Trapezoid
| Old Option | New Option | Notes |
|------------|------------|-------|
| `LASER_POWER_INLINE_TRAPEZOID` | `LASER_POWER_TRAP` | Renamed |

**Transform:** `_t2102_211_laser`

---

### Removed Options

| Option | Notes |
|--------|-------|
| `L64XX` (all settings) | Removed L64XX support entirely. |
| `LASER_POWER_INLINE` | |
| `LASER_POWER_INLINE_TRAPEZOID_CONT` | |
| `LASER_POWER_INLINE_TRAPEZOID_CONT_PER` | |
| `LASER_MOVE_POWER` | |
| `LASER_MOVE_G0_OFF` | |
| `LASER_MOVE_G28_OFF` | |
| `LASER_POWER_INLINE_INVERT` | |
| `LASER_POWER_INLINE_CONTINUOUS` | |

---

### ⚠️ Warnings

1. **L64XX driver support removed entirely** — all L64XX settings will be dropped.

---

## Implementation Notes

- Transform function: `_t2102_211_laser`
- Migration step in `abm/migration-rules.js` migrationSteps table
- Migration is idempotent
