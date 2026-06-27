# Configuration Changes: 2.0.9.2 → 2.0.9.3

**Release Date:** 2022-01-05

Configuration changes required when upgrading from Marlin 2.0.9.2 to 2.0.9.3.

---

## Complex Transforms

### BLTouch HS Mode
| Old Option | New Option | Notes |
|------------|------------|-------|
| `BLTOUCH_HS_MODE` (enabled) | `BLTOUCH_HS_MODE = true` | Now requires explicit value |

**Transform:** `_t2092_2093_bltouch`

### Probe Temp Compensation → PTC Probe/Bed
| Old Option | New Options | Notes |
|------------|-------------|-------|
| `PROBE_TEMP_COMPENSATION` (enabled) | `PTC_PROBE = true`, `PTC_BED = true` | Split into two |
| `PTC_SAMPLE_(START|RES|COUNT)` | `PTC_PROBE_(START|RES|COUNT)` | Prefix change |
| `BTC_SAMPLE_(START|RES|COUNT)` | `PTC_BED_(START|RES|COUNT)` | Prefix change |
| `BTC_PROBE_TEMP` | `PTC_PROBE_TEMP` | Renamed |

**Transform:** `_t2092_2093_ptc`

---

## Simple Renames

| Old Option | New Option | Notes |
|------------|------------|-------|
| `ALLOW_LOW_EJERK` | (conditionally added) | If `DEFAULT_EJERK < 10` |

---

## Removed Options

| Option | Notes |
|--------|-------|
| `USE_TEMP_EXT_COMPENSATION` | |
| `PTC_PROBE_RAISE` | |

---

## ⚠️ Warnings (User Attention Required)

1. **If `DEFAULT_EJERK < 10`**, `ALLOW_LOW_EJERK` may be needed.

---

## Implementation Notes

- Transform functions: `_t2092_2093_bltouch`, `_t2092_2093_ptc`
- Migration step in `abm/migration-rules.js` migrationSteps table
- Migration is idempotent
