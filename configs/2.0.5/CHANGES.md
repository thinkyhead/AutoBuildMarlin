# Configuration Changes: 2.0.4 → 2.0.5

**Release Date:** 2020-03-14

Configuration changes required when upgrading from Marlin 2.0.4 (including 2.0.4.1–2.0.4.4) to 2.0.5.

> **Note:** Versions 2.0.4.1 through 2.0.4.4 had no configuration changes. This step covers the aggregate migration from any 2.0.4.x to 2.0.5.

---

## Complex Transforms

### Controller Fan Settings Restructuring
| Old Option | New Options | Notes |
|------------|-------------|-------|
| `CONTROLLERFAN_SECS` | `CONTROLLERFAN_IDLE_TIME` | Renamed |
| `CONTROLLERFAN_SPEED` | `CONTROLLERFAN_SPEED_ACTIVE` | Renamed |
| `CONTROLLERFAN_SPEED_Z_ONLY #` | `CONTROLLER_FAN_USE_Z_ONLY = true`, `CONTROLLERFAN_SPEED_ACTIVE #` | Split into two options |

**Transform:** `_t204_205_controllerfan`
`CONTROLLERFAN_SPEED_Z_ONLY` becomes two settings: enable Z-only mode and set the speed.

### SD Detect Invert → State
| Old Option | New Option | Notes |
|------------|------------|-------|
| `SD_DETECT_INVERTED` (enabled) | `SD_DETECT_STATE = LOW` | |
| `SD_DETECT_INVERTED` (disabled) | `SD_DETECT_STATE = HIGH` | |

**Transform:** `_t204_205_sd_detect`
Converts boolean inverted setting to explicit LOW/HIGH state.

---

## Simple Renames

| Old Option | New Option | Notes |
|------------|------------|-------|
| `CONTROLLERFAN_SECS` | `CONTROLLERFAN_IDLE_TIME` | |
| `CONTROLLERFAN_SPEED` | `CONTROLLERFAN_SPEED_ACTIVE` | |

---

## Removed Options

| Option | Notes |
|--------|-------|
| `SD_DETECT_INVERTED` | Replaced by `SD_DETECT_STATE` |

---

## No Warnings

---

## Implementation Notes

- Transform functions: `_t204_205_controllerfan`, `_t204_205_sd_detect`
- Migration step in `abm/migration-rules.js` migrationSteps table (from `2.0.4.4` to `2.0.5`)
- Migration is idempotent
