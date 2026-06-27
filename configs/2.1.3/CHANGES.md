# Configuration Changes: 2.1.2.7 → 2.1.3

**Release Date:** 2024-11-26 (2.1.3-b1), 2025-12-24 (2.1.3-b3→b4), 2026-06-14 (2.1.3 final)

> **Note:** This aggregates changes from 2.1.2.7 through 2.1.3-b1 through 2.1.3-b4 to final 2.1.3. Beta versions (b1-b3) are retired — use the 2.1.3 migration step directly.

---

## Complex Transforms

### Endstop Inverting → Hit State
| Old Options | New Options | Notes |
|-------------|-------------|-------|
| `X_MIN_ENDSTOP_INVERTING` | `X_MIN_ENDSTOP_HIT_STATE` | Boolean → HIGH/LOW |
| `X_MAX_ENDSTOP_INVERTING` | `X_MAX_ENDSTOP_HIT_STATE` | |
| `Y_MIN_ENDSTOP_INVERTING` | `Y_MIN_ENDSTOP_HIT_STATE` | |
| `Y_MAX_ENDSTOP_INVERTING` | `Y_MAX_ENDSTOP_HIT_STATE` | |
| `Z_MIN_ENDSTOP_INVERTING` | `Z_MIN_ENDSTOP_HIT_STATE` | |
| `Z_MAX_ENDSTOP_INVERTING` | `Z_MAX_ENDSTOP_HIT_STATE` | |
| `I_MIN_ENDSTOP_INVERTING`... | `I_MIN_ENDSTOP_HIT_STATE`... | All axes X,Y,Z,I,J,K,U,V,W |

**Transform:** `_t2125_213b1_endstop_invert`
`true`/`enabled` → `HIGH`, `false`/`disabled` → `LOW`

### Disable Axes Boolean → Switch
| Old Options | New Options | Notes |
|-------------|-------------|-------|
| `DISABLE_X true` | `DISABLE_X` (enabled switch) | |
| `DISABLE_X false` | `//DISABLE_X` (commented) | |
| ... (all axes X,Y,Z,I,J,K,U,V,W,E) | ... | |

**Transform:** `_t2125_213b1_disable_axes`
Converts boolean to switch-style (enabled/disabled comment).

### Milliseconds Preheat → Split
| Old Option | New Options | Notes |
|------------|-------------|-------|
| `MILLISECONDS_PREHEAT_TIME` | `PREHEAT_TIME_HOTEND_MS`, `PREHEAT_TIME_BED_MS` | Split, both get same value |

**Transform:** `_t2125_213b1_milliseconds_preheat`

### Step Pin Inverting → Step State
| Old Options | New Options | Notes |
|-------------|-------------|-------|
| `INVERT_X_STEP_PIN` | `STEP_STATE_X` | Boolean → HIGH/LOW |
| `INVERT_Y_STEP_PIN` | `STEP_STATE_Y` | |
| ... (all axes including E0-E7) | ... | |

**Transform:** `_t2125_213b1_step_pin`
`true`/`enabled` → `HIGH`, `false`/`disabled` → `LOW`

### Babystep Invert Z → Switch
| Old Option | New Option | Notes |
|------------|------------|-------|
| `BABYSTEP_INVERT_Z true` | `BABYSTEP_INVERT_Z` (enabled switch) | |
| `BABYSTEP_INVERT_Z false` | `//BABYSTEP_INVERT_Z` | |

**Transform:** `_t2125_213b1_babystep_invert`

### Probe Points → Structured
| Old Options | New Options | Notes |
|-------------|-------------|-------|
| `PROBE_PT_1_X`, `PROBE_PT_1_Y` | `PROBE_PT_1 { x, y }` | |
| `PROBE_PT_2_X`, `PROBE_PT_2_Y` | `PROBE_PT_2 { x, y }` | |
| `PROBE_PT_3_X`, `PROBE_PT_3_Y` | `PROBE_PT_3 { x, y }` | |

**Transform:** `_t2125_213b1_probe_pt`

---

## Simple Renames

| Old Option | New Option | Notes |
|------------|------------|-------|
| `DELTA_PRINTABLE_RADIUS` | `PRINTABLE_RADIUS` | |
| `SCARA_FEEDRATE_SCALING` | `FEEDRATE_SCALING` | |
| `Z_HOMING_HEIGHT` | `Z_CLEARANCE_FOR_HOMING` | |
| `BABYSTEP_ZPROBE_GFX_OVERLAY` | `BABYSTEP_GFX_OVERLAY` | |
| `SQUARE_WAVE_STEPPING` | `EDGE_STEPPING` | |
| `Z_PROBE_OFFSET_RANGE_MIN` | `PROBE_OFFSET_ZMIN` | |
| `Z_PROBE_OFFSET_RANGE_MAX` | `PROBE_OFFSET_ZMAX` | |
| `SDIO_SUPPORT` | `ONBOARD_SDIO` | |
| `ANET_FULL_GRAPHICS_LCD_ALT_WIRING` | `CTC_A10S_A13` | By display model |
| `Z_PROBE_END_SCRIPT` | `EVENT_GCODE_AFTER_G29` | |
| `BOARD_BTT_MANTA_M4P_V1_0` | `BOARD_BTT_MANTA_M4P_V2_1` | |
| `BOARD_LINUX_RAMPS` | `BOARD_SIMULATED` | |
| `WIFI_SERIAL` | `WIFI_SERIAL_PORT` | |
| `MINIMUM_STEPPER_PULSE` | `MINIMUM_STEPPER_PULSE_NS` | Multiply old value by 1000 |
| `DISABLE_ENCODER` | `NO_BACK_MENU_ITEM` | |
| `MMU2_MENUS` | `MMU_MENUS` | |
| `FTM_SHAPING_DEFAULT_X_FREQ` | `FTM_SHAPING_DEFAULT_FREQ_X` | Swapped suffix |
| `FTM_SHAPING_DEFAULT_Y_FREQ` | `FTM_SHAPING_DEFAULT_FREQ_Y` | Swapped suffix |
| `TRAMMING_SCREW_THREAD [345][01]` | `TRAMMING_SCREW_THREAD M[345]_(CW\|CCW)` | Predefined names |
| `MMU2_SERIAL_PORT` | `MMU_SERIAL_PORT` | MMU3 early adopters |
| `MMU2_RST_PIN` | `MMU_RST_PIN` | |
| `MMU2_MAX_RETRIES` | `MMU3_MAX_RETRIES` | |
| `MMU2_FILAMENT_SENSOR_POSITION` | `MMU3_FILAMENT_SENSOR_POSITION` | |
| `MMU2_TOOL_CHANGE_LOAD_LENGTH` | `MMU3_TOOL_CHANGE_LOAD_LENGTH` | |
| `MMU2_LOAD_TO_NOZZLE_FEED_RATE` | `MMU3_LOAD_TO_NOZZLE_FEED_RATE` | |
| `MMU2_VERIFY_LOAD_TO_NOZZLE_FEED_RATE` | `MMU3_VERIFY_LOAD_TO_NOZZLE_FEED_RATE` | |
| `MMU2_RETRY_UNLOAD_TO_FINDA_LENGTH` | `MMU3_RETRY_UNLOAD_TO_FINDA_LENGTH` | |
| `MMU2_RETRY_UNLOAD_TO_FINDA_FEED_RATE` | `MMU3_RETRY_UNLOAD_TO_FINDA_FEED_RATE` | |
| `MMU2_FILAMENT_SENSOR_POSITION` (2nd) | `MMU3_FILAMENT_SENSOR_E_POSITION` | |
| `MMU2_CHECK_FILAMENT_PRESENCE_EXTRUSION_LENGTH` | `MMU3_CHECK_FILAMENT_PRESENCE_EXTRUSION_LENGTH` | |
| `MMU_HAS_CUTTER` | `MMU3_HAS_CUTTER` | |
| `MMU2_LOAD_TO_NOZZLE_SEQUENCE` | `MMU3_LOAD_TO_NOZZLE_SEQUENCE` | Only HAS_PRUSA_MMU3 |
| `MMU2_RAMMING_SEQUENCE` | `MMU3_RAMMING_SEQUENCE` | Only HAS_PRUSA_MMU3 |
| `[XYZIJKUVW]_ENABLE_ON 0/1` | `LOW/HIGH` | |
| `SDSS` | `SD_SS_PIN` | As define or value |
| `DEFAULT_SHARED_VOLUME` | Remove `SV_` prefix | |
| `FOLDER_SORTING` | `SDSORT_FOLDERS` | |
| `BTT_MINI_12864_V1` | `BTT_MINI_12864` | |
| `LARGE_MOVE_ITEMS` | `MANUAL_MOVE_DISTANCE_MM` / `MANUAL_MOVE_DISTANCE_IN` | More move options |
| `SDSORT_QUICK` | `(new option)` | Added as safe default |

---

## Removed Options

| Option | Notes |
|--------|-------|
| `MINIMUM_PLANNER_SPEED` | |
| `INTEGRATED_BABYSTEPPING` | |
| `EXPERIMENTAL_SCURVE` | |
| `X2_HOME_DIR` | |
| `CALIBRATION_MEASUREMENT_RESOLUTION` | |
| `DELTA_MAX_RADIUS` | |
| `FTM_TS` | Short-lived options |
| `FTM_STEPS_PER_UNIT_TIME` | Short-lived options |
| `FTM_MIN_TICKS` | Short-lived options |
| `FTM_MIN_SHAPE_FREQ` | Short-lived options |
| `FTM_RATIO` | Short-lived options |
| `FTM_ZMAX` | Short-lived options |
| `FTM_CTS_COMPARE_VAL` | Short-lived options |
| `ALLOW_LOW_EJERK` | |
| `TOUCH_IDLE_SLEEP` | Replaced by `DISPLAY_SLEEP_MINUTES` |
| `TOUCH_IDLE_SLEEP_MINS` | Replaced by `DISPLAY_SLEEP_MINUTES` |
| `DRIVER_TYPE_[AXIS] TMC26X(_STANDALONE)?` | Rare driver no longer supported |
| `DGUS_LCD_UI_[name]` | → `DGUS_LCD_UI [name]` (with space) |
| `MPC_MAX BANG_MAX` | → `MPC_MAX` (value of BANG_MAX) |
| `//TFT_SHARED_SPI` | Determined by pins file |
| `USE_[AXIS](MIN|MAX)_PLUG` | → `[AXIS]_SAFETY_STOP` |

---

## Added Options

| Option | Notes |
|--------|-------|
| `EDITABLE_STEPS_PER_UNIT` | Allows disabling steps-per-unit editing |
| `SDSORT_QUICK` | Fast but slight cost, safe default |
| `DISPLAY_SLEEP_MINUTES` | Replaces TOUCH_IDLE_SLEEP variants |

---

## ⚠️ Warnings (User Attention Required)

1. **`DGUS_LCD_UI_[name]` → `DGUS_LCD_UI [name]`** — Migrate if using DGUS UI (underscore to space)
2. **`USE_[AXIS](MIN|MAX)_PLUG` → `[AXIS]_SAFETY_STOP`** — Verify endstop assignments; if not auto-assigned, could be a PROBE
3. **`TFT_SHARED_SPI`** now determined by pins file — remove from config if present
4. **`DISABLE_INACTIVE_EXTRUDER` → `DISABLE_OTHER_EXTRUDERS`** (handled above)
5. **`PROBE_PT_1/2/3_X` and `_Y` → `PROBE_PT_1/2/3 { x, y }`** (handled by transform)
6. **`Z_PROBE_OFFSET_RANGE_MIN/MAX` → `PROBE_OFFSET_ZMIN/ZMAX`**
7. **`LARGE_MOVE_ITEMS` → `MANUAL_MOVE_DISTANCE_MM`** (more moves than usual)
8. **`SDIO_SUPPORT` → `ONBOARD_SDIO`**
9. **`ANET_FULL_GRAPHICS_LCD_ALT_WIRING` → `CTC_A10S_A13`** (by model of display unit)
10. **`Z_PROBE_END_SCRIPT` → `EVENT_GCODE_AFTER_G29`**
11. **`BOARD_BTT_MANTA_M4P_V1_0` → `BOARD_BTT_MANTA_M4P_V2_1`**
12. **`BOARD_LINUX_RAMPS` → `BOARD_SIMULATED`**
13. **`TOUCH_IDLE_SLEEP/MINS` → `DISPLAY_SLEEP_MINUTES`**
14. **`DRIVER_TYPE_[AXIS] TMC26X(_STANDALONE)?` removed** — no longer supported
15. **`WIFI_SERIAL` → `WIFI_SERIAL_PORT`**
16. **`MINIMUM_STEPPER_PULSE` → `MINIMUM_STEPPER_PULSE_NS`** (multiply by 1000)
17. **`DISABLE_ENCODER` → `NO_BACK_MENU_ITEM`**
18. **`MMU2_*` → `MMU_*/MMU3_*`** — MMU2 options renamed, review if using MMU
19. **`FTM_SHAPING_DEFAULT_[XY]_FREQ` → `FTM_SHAPING_DEFAULT_FREQ_[XY]`**
20. **`TRAMMING_SCREW_THREAD`** now uses predefined `M#_CW/CCW` names
21. **`[XYZIJKUVW]_ENABLE_ON` 0/1 → LOW/HIGH**
22. **`SDSS` → `SD_SS_PIN`**
23. **`DEFAULT_SHARED_VOLUME`** → Remove `SV_` prefix
24. **`SDSORT_QUICK`** added as new safe default — enable if desired

---

## Implementation Notes

- Transform functions: `_t2125_213b1_endstop_invert`, `_t2125_213b1_disable_axes`, `_t2125_213b1_milliseconds_preheat`, `_t2125_213b1_step_pin`, `_t2125_213b1_babystep_invert`, `_t2125_213b1_probe_pt`
- Migration step in `abm/migration-rules.js` migrationSteps table
- Migration is idempotent
- Beta versions 2.1.3-b1 through 2.1.3-b3 are retired; use 2.1.3 migration step directly
