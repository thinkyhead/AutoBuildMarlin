# Configuration Changes: 2.1.1 → 2.1.2

**Release Dates:** 2023-07-20 (2.1.1.1 PIO 6), 2023-12-11 (2.1.1.2), 2022-12-17 (2.1.2)

> **Note:** Versions 2.1.1.1 (PlatformIO 6 update) and 2.1.1.2 (no config changes) are intermediate. This step covers all changes from 2.1.1 to 2.1.2.

---

## Changes from 2.1.1 → 2.1.1.1

**PlatformIO 6 update only — no configuration changes.**

---

## Changes from 2.1.1.1 → 2.1.1.2

**No configuration-level changes.**

---

## Changes from 2.1.1 → 2.1.2

### Complex Transforms

#### Kinematics Segments → Unified

| Old Options | New Option | Notes |
|-------------|------------|-------|
| `POLAR_SEGMENTS_PER_SECOND` | `DEFAULT_SEGMENTS_PER_SECOND` | |
| `DELTA_SEGMENTS_PER_SECOND` | `DEFAULT_SEGMENTS_PER_SECOND` | |
| `SCARA_SEGMENTS_PER_SECOND` | `DEFAULT_SEGMENTS_PER_SECOND` | |
| `ROBOT_SEGMENTS_PER_SECOND` | `DEFAULT_SEGMENTS_PER_SECOND` | |

**Transform:** `_t211_212_kinematics`
All kinematics-specific segment rates unified to single `DEFAULT_SEGMENTS_PER_SECOND`.

#### Robot → TPARA Rename

| Old Options | New Options | Notes |
|-------------|-------------|-------|
| `ROBOT_LINKAGE_1` | `TPARA_LINKAGE_1` | |
| `ROBOT_LINKAGE_2` | `TPARA_LINKAGE_2` | |
| `ROBOT_OFFSET_X` | `TPARA_OFFSET_X` | |
| `ROBOT_OFFSET_Y` | `TPARA_OFFSET_Y` | |
| `ROBOT_OFFSET_Z` | `TPARA_OFFSET_Z` | |

**Transform:** `_t211_212_kinematics` (same function)

#### Touch Sleep Seconds → Minutes

| Old Option | New Option | Notes |
|------------|------------|-------|
| `TOUCH_IDLE_SLEEP #` (seconds) | `TOUCH_IDLE_SLEEP_MINS = # / 60` | Convert seconds to minutes |

**Transform:** `_t211_212_touch_sleep`

#### LCD Backlight Timeout Seconds → Minutes

| Old Option | New Option | Notes |
|------------|------------|-------|
| `LCD_BACKLIGHT_TIMEOUT #` (seconds) | `LCD_BACKLIGHT_TIMEOUT_MINS = # / 60` | Convert seconds to minutes |

**Transform:** `_t211_212_lcd_backlight`

#### Linear Advance

| Old Option | New Option | Notes |
|------------|------------|-------|
| `EXTRA_LIN_ADVANCE_K` | `ADVANCE_K_EXTRA` | Renamed |
| `LIN_ADVANCE_K` | `ADVANCE_K` | Renamed (array with DISTINCT_E_FACTORS) |

**Transform:** `_t211_212_lin_advance`

#### TMC Current

| Old Options | New Options | Notes |
|-------------|-------------|-------|
| `X_MAX_CURRENT` | `X_CURRENT` | Per-axis rename |
| `Y_MAX_CURRENT` | `Y_CURRENT` | ... |
| `Z_MAX_CURRENT` | `Z_CURRENT` | ... |
| `X2_MAX_CURRENT` | `X2_CURRENT` | ... |
| `Y2_MAX_CURRENT` | `Y2_CURRENT` | ... |
| `Z2_MAX_CURRENT` | `Z2_CURRENT` | ... |
| `E0_MAX_CURRENT`...`E7_MAX_CURRENT` | `E0_CURRENT`...`E7_CURRENT` | ... |

**Transform:** `_t211_212_tmc_current`

#### TMC Sense Resistor → RSENSE

| Old Options | New Options | Notes |
|-------------|-------------|-------|
| `X_SENSE_RESISTOR #` | `X_RSENSE = # / 1000.0` | Convert to ohms |
| `Y_SENSE_RESISTOR #` | `Y_RSENSE = # / 1000.0` | ... |
| ... (all axes) | ... | ... |

**Transform:** `_t211_212_tmc_rsense`

#### Config Export

| Old Option | New Option | Notes |
|------------|------------|-------|
| `CONFIG_EXPORT` (enabled, no value) | `CONFIG_EXPORT = 2` | Default to version 2 |

**Transform:** `_t211_212_config_export`

---

### Simple Renames

| Old Option | New Option | Notes |
|------------|------------|-------|
| `LCD_SET_PROGRESS_MANUALLY` | `SET_PROGRESS_MANUALLY` | |
| `DEBUG_ROBOT_KINEMATICS` | `DEBUG_TPARA_KINEMATICS` | |

---

### Removed Options

| Option | Notes |
|--------|-------|
| `USE_M73_REMAINING_TIME` | |
| `ROTATE_PROGRESS_DISPLAY` | |
| `... "TMC26X" ...` | Merged with other TMC |

---

## No Warnings

---

## Implementation Notes

- Transform functions: `_t211_212_kinematics`, `_t211_212_touch_sleep`, `_t211_212_lcd_backlight`, `_t211_212_lin_advance`, `_t211_212_tmc_current`, `_t211_212_tmc_rsense`, `_t211_212_config_export`
- Migration step in `abm/migration-rules.js` migrationSteps table
- Migration is idempotent
