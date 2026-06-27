# Configuration Changes: 2.0.5.5 → 2.0.6

**Release Date:** 2020-07-26

Configuration changes required when upgrading from Marlin 2.0.5.5 to 2.0.6.

> **Note:** Versions 2.0.5.1 through 2.0.5.5 had no configuration changes. This step covers the aggregate migration from any 2.0.5.x to 2.0.6.

---

## Complex Transforms

### Filament Runout Inverting → State
| Old Option | New Option | Notes |
|------------|------------|-------|
| `FIL_RUNOUT_INVERTING` (true/enabled) | `FIL_RUNOUT_STATE = HIGH` | |
| `FIL_RUNOUT_INVERTING` (false/disabled) | `FIL_RUNOUT_STATE = LOW` | |

**Transform:** `_t205_206_fil_runout`
Converts boolean inverting to explicit HIGH/LOW state.

### Home Bump → Structured
| Old Options | New Option | Notes |
|-------------|------------|-------|
| `X_HOME_BUMP_MM` | `HOMING_BUMP_MM` | Combined into single struct |
| `Y_HOME_BUMP_MM` | `{ x, y, z }` | |
| `Z_HOME_BUMP_MM` | | |

**Transform:** `_t205_206_home_bump`
All three home bump values combined.

### Min Probe Edge → Probing Margin
| Old Option | New Option | Notes |
|------------|------------|-------|
| `MIN_PROBE_EDGE` | `PROBING_MARGIN` | Renamed |
| `MIN_PROBE_EDGE_*` | `PROBING_MARGIN_*` | All variants renamed |

**Transform:** `_t205_206_min_probe_edge`
Simple rename family.

### PTC Park/Probe Positions → Structured
| Old Options | New Options | Notes |
|-------------|-------------|-------|
| `PTC_PARK_POS_X`, `PTC_PARK_POS_Y`, `PTC_PARK_POS_Z` | `PTC_PARK_POS { x, y, z }` | Combined |
| `PTC_PROBE_POS_X`, `PTC_PROBE_POS_Y` | `PTC_PROBE_POS { x, y }` | Combined |

**Transform:** `_t205_206_ptc_park`
Combines separate X/Y/Z into structs.

---

## Simple Renames

| Old Option | New Option | Notes |
|------------|------------|-------|
| `MIN_PROBE_EDGE` | `PROBING_MARGIN` | |
| `HOMING_BACKOFF_MM` | `HOMING_BACKOFF_POST_MM` | |
| `DIGIPOT_I2C` | `DIGIPOT_MCP4451` | |
| `TOOLCHANGE_FIL_SWAP_LENGTH` | `TOOLCHANGE_FS_LENGTH` | |
| `TOOLCHANGE_FIL_EXTRA_PRIME` | `TOOLCHANGE_FS_EXTRA_RESUME_LENGTH` | |
| `TOOLCHANGE_FIL_SWAP_RETRACT_SPEED` | `TOOLCHANGE_FS_RETRACT_SPEED` | |
| `TOOLCHANGE_FIL_SWAP_PRIME_SPEED` | `TOOLCHANGE_FS_UNRETRACT_SPEED` | |
| `BOARD_RUMBA32_AUS3D` | `BOARD_RUMBA32_V1_0` | |

---

## Removed Options

| Option | Notes |
|--------|-------|
| `PTC_MAX_BED_TEMP` | |
| `SPEED_POWER_SLOPE` | |
| `DIGIPOT_I2C_ADDRESS_A 0x2C` | Now commented out by default |
| `DIGIPOT_I2C_ADDRESS_B 0x2D` | Now commented out by default |
| `MIN_PROBE_EDGE_*` | Replaced by `PROBING_MARGIN_*` |

---

## ⚠️ Warnings (User Attention Required)

None for this step.

---

## Implementation Notes

- Transform functions: `_t205_206_fil_runout`, `_t205_206_home_bump`, `_t205_206_min_probe_edge`, `_t205_206_ptc_park`
- Migration step in `abm/migration-rules.js` migrationSteps table (from `2.0.5.5` to `2.0.6`)
- Migration is idempotent
