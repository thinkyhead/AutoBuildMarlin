# Configuration Changes: 1.1.9 → 2.0.0

**Release Date:** 2019-12-01

Configuration changes required when upgrading from Marlin 1.1.9 to 2.0.0. These changes are implemented in `abm/migration-rules.js` and should be applied automatically by the migration tool.

---

## Major Restructuring (Transform Functions)

### Power Supply Control

| Old Option | New Options | Notes |
|------------|-------------|-------|
| `POWER_SUPPLY 1` | `PSU_CONTROL = true`, `PSU_ACTIVE_HIGH = false` | ATX power supply control |
| `POWER_SUPPLY 2` | `PSU_CONTROL = true`, `PSU_ACTIVE_HIGH = true` | ATX power supply control |

**Transform:** `_t190_200_power_supply`
When `POWER_SUPPLY` is 1 or 2, it is replaced with `PSU_CONTROL` (enabled) and `PSU_ACTIVE_HIGH` set accordingly.

### Z Probe Endstop

| Old Option | New Option | Notes |
|------------|------------|-------|
| `Z_MIN_PROBE_ENDSTOP` | `Z_MIN_PROBE_USES_Z_MIN_ENDSTOP_PIN` (commented if disabled) | |

**Transform:** `_t190_200_z_probe`
Enabled → `Z_MIN_PROBE_USES_Z_MIN_ENDSTOP_PIN = true`
Disabled → `//Z_MIN_PROBE_USES_Z_MIN_ENDSTOP_PIN`

### Probe Offsets → Structured Offset

| Old Options | New Option | Notes |
|-------------|------------|-------|
| `X_PROBE_OFFSET_FROM_EXTRUDER` | `NOZZLE_TO_PROBE_OFFSET` | Combined into single struct |
| `Y_PROBE_OFFSET_FROM_EXTRUDER` | `{ x, y, z }` | |
| `Z_PROBE_OFFSET_FROM_EXTRUDER` | | |

**Transform:** `_t190_200_probe_offset`
All three offsets combined into `NOZZLE_TO_PROBE_OFFSET { x, y, z }`

### Allen Key Probe Deploy Points

| Old Options | New Options | Notes |
|-------------|-------------|-------|
| `Z_PROBE_ALLEN_KEY_DEPLOY_1_X` | `Z_PROBE_ALLEN_KEY_DEPLOY_1` | Combined into struct per deploy point |
| `Z_PROBE_ALLEN_KEY_DEPLOY_1_Y` | `{ x, y, z }` | |
| `Z_PROBE_ALLEN_KEY_DEPLOY_1_Z` | | |
| ... (for deploy points 1-4) | ... | |

**Transform:** `_t190_200_allen_key`
Each of the 4 deploy points gets a combined struct.

### Inactive Extruder Handling

| Old Option | New Option | Notes |
|------------|------------|-------|
| `DISABLE_INACTIVE_EXTRUDER true` | `DISABLE_INACTIVE_EXTRUDER = true` (switch) | |
| `DISABLE_INACTIVE_EXTRUDER false` | `//DISABLE_INACTIVE_EXTRUDER` | |

**Transform:** `_t190_200_disable_inactive`
Converts boolean to switch-style (enabled/disabled).

---

## Simple Renames

| Old Option | New Option | Notes |
|------------|------------|-------|
| `PS_DEFAULT_OFF` | `PSU_DEFAULT_OFF` | |
| `MBL_Z_STEP` | `MESH_EDIT_Z_STEP` | |
| `ENDSTOP_NOISE_FILTER` | `ENDSTOP_NOISE_THRESHOLD` | Value becomes `2` |
| `MENU_ITEM_CASE_LIGHT` | `CASE_LIGHT_MENU` | |
| `DUAL_NOZZLE_DUPLICATION_MODE` | `MULTI_NOZZLE_DUPLICATION` | |
| `ABORT_ON_ENDSTOP_HIT_FEATURE_ENABLED` | `SD_ABORT_ON_ENDSTOP_HIT` | |
| `//JUNCTION_DEVIATION` | `CLASSIC_JERK` | Was commented, now explicit |
| `CHDK` | `PHOTO_GCODE`, `CHDK_PIN` | Split into two options |
| `CHDK_DELAY` | `PHOTO_SWITCH_MS` | |
| `BABYSTEP_MULTIPLICATOR` | `BABYSTEP_MULTIPLICATOR_Z`, `BABYSTEP_MULTIPLICATOR_XY` | Split Z and XY |
| `MINIMUM_STEPPER_DIR_DELAY` | `MINIMUM_STEPPER_POST_DIR_DELAY`, `MINIMUM_STEPPER_PRE_DIR_DELAY` | Split |
| `STEALTHCHOP` | `STEALTHCHOP_XY`, `STEALTHCHOP_Z`, `STEALTHCHOP_E` | Per-axis control |
| `SPINDLE_DIR_CHANGE (true)` | `SPINDLE_CHANGE_DIR` | |
| `SPINDLE_STOP_ON_DIR_CHANGE (true)` | `SPINDLE_CHANGE_DIR_STOP` | |
| `ACTION_ON_KILL` | `HOST_ACTION_COMMANDS` | |
| `ACTION_ON_PAUSE` | `HOST_ACTION_COMMANDS` | |
| `ACTION_ON_RESUME` | `HOST_ACTION_COMMANDS` | |
| `RETRACT_ZLIFT` | `RETRACT_ZRAISE` | |
| `PHOTOGRAPH_PIN` | `PHOTO_GCODE`, `PHOTOGRAPH_PIN` | Split |

---

## Removed Options

| Option | Notes |
|--------|-------|
| `STRING_SPLASH_LINE1` | TODO: Delta/SCARA defaults |
| `STRING_SPLASH_LINE2` | |
| `PARKING_EXTRUDER_SECURITY_RAISE` | |
| `DELTA_CALIBRATION_RADIUS` | |
| `DELTA_FEEDRATE_SCALING` | |

---

## ⚠️ Warnings (User Attention Required)

1. **`MIN_STEPS_PER_SEGMENT` default changed from 6 to 1** — Verify your value is appropriate for your setup.
2. **`POWER_MONITOR_CURRENT_OFFSET`** — Meaning may have changed; verify value if used.

---

## Implementation Notes

- All transforms are in `abm/migration-rules.js` as `_t190_200_*` functions
- Migration is idempotent: if old option doesn't exist, nothing happens
- The migration tool applies this step when `from >= 1.1.9` and `to <= 2.0.0`
