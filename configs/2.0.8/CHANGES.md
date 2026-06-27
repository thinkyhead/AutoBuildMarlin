# Configuration Changes: 2.0.7.3 → 2.0.8

**Release Date:** 2020-10-16 (2.0.7.1), 2020-10-21 (2.0.7.2), 2023-07-20 (2.0.7.3 PIO 6), 2021-05-15 (2.0.8)

> **Note:** Versions 2.0.7.1, 2.0.7.2, 2.0.7.3 are intermediate. 2.0.7.1/2.0.7.2 had minor changes, 2.0.7.3 was a PlatformIO 6 update. This step covers all changes from 2.0.7 to 2.0.8.

---

## Changes from 2.0.7 → 2.0.7.1

### Removed Options
| Option | Notes |
|--------|-------|
| `DWIN_MARLINUI_PORTRAIT` | Added too early (2.0.7) |
| `DWIN_MARLINUI_LANDSCAPE` | |

---

## Changes from 2.0.7.1 → 2.0.7.2

**No configuration changes.**

---

## Changes from 2.0.7.2 → 2.0.7.3

**PlatformIO 6 update only — no configuration changes.**

---

## Changes from 2.0.7.3 → 2.0.8

### Complex Transforms

#### TFT Display Restructuring
| Old Option | New Options | Notes |
|------------|-------------|-------|
| `TFT_320x240` | `TFT_INTERFACE_FSMC = true`, `TFT_RES_320x240 = true` | |
| `TFT_320x240_SPI` | `TFT_INTERFACE_SPI = true`, `TFT_RES_320x240 = true` | |
| `TFT_480x320` | `TFT_INTERFACE_FSMC = true`, `TFT_RES_480x320 = true` | |
| `TFT_480x320_SPI` | `TFT_INTERFACE_SPI = true`, `TFT_RES_480x320 = true` | |
| `TFT_LVGL_UI_FSMC` | `TFT_LVGL_UI` | Renamed |
| `TFT_LVGL_UI_SPI` | `TFT_LVGL_UI` | Renamed |

**Transform:** `_t207_208_tft`
Separates interface type (FSMC/SPI) from resolution. For FSMC/SPI graphical TFT, user must select specific display model.

#### Custom User Menus → Split
| Old Option | New Options | Notes |
|------------|-------------|-------|
| `CUSTOM_USER_MENUS` | `CUSTOM_MENU_MAIN = true`, `CUSTOM_MENU_CONFIG = true` | Split into two |
| `CUSTOM_USER_MENU_TITLE` | `CUSTOM_MENU_MAIN_TITLE` | |
| `USER_SCRIPT_DONE` | `CUSTOM_MENU_MAIN_SCRIPT_DONE` | |
| `USER_SCRIPT_AUDIBLE_FEEDBACK` | `CUSTOM_MENU_MAIN_SCRIPT_AUDIBLE_FEEDBACK` | |
| `USER_SCRIPT_RETURN` | `CUSTOM_MENU_MAIN_SCRIPT_RETURN` | |
| `USER_DESC_#` (1-5) | `MAIN_MENU_ITEM_#_DESC` | Renumbered |
| `USER_GCODE_#` (1-5) | `MAIN_MENU_ITEM_#_GCODE` | Renumbered |

**Transform:** `_t207_208_custom_user_menus`

#### Touch Calibration
| Old Options | New Options | Notes |
|-------------|-------------|-------|
| `XPT2046_X_CALIBRATION` | `TOUCH_CALIBRATION_X` | |
| `XPT2046_Y_CALIBRATION` | `TOUCH_CALIBRATION_Y` | |
| `XPT2046_X_OFFSET` | `TOUCH_OFFSET_X` | |
| `XPT2046_Y_OFFSET` | `TOUCH_OFFSET_Y` | |

**Transform:** `_t207_208_touch_cal`

#### MMU2 → MMU_MODEL
| Old Option | New Option | Notes |
|------------|------------|-------|
| `PRUSA_MMU2` | `MMU_MODEL = PRUSA_MMU2` | |
| `PRUSA_MMU2_S_MODE` | `MMU_MODEL = PRUSA_MMU2S` | |

**Transform:** `_t207_208_mmu2`

---

### Simple Renames

| Old Option | New Option | Notes |
|------------|------------|-------|
| `CREALITY_TOUCH` | `BLTOUCH` | |
| `XY_PROBE_SPEED` | `XY_PROBE_FEEDRATE` | |
| `Z_PROBE_SPEED_FAST` | `Z_PROBE_FEEDRATE_FAST` | |
| `Z_PROBE_SPEED_SLOW` | `Z_PROBE_FEEDRATE_SLOW` | |
| `ASSISTED_TRAMMING_MENU_ITEM` | `ASSISTED_TRAMMING_WIZARD` | |
| `Z_AFTER_DEACTIVATE` | `(removed)` | |
| `SHORT_MANUAL_Z_MOVE` | `FINE_MANUAL_MOVE` | |
| `PROBE_OFFSET_START` | `PROBE_OFFSET_WIZARD_START_Z` | |
| `POWER_LOSS_PULL` | `POWER_LOSS_PULLUP` | |
| `LCD_LANGUAGE_1` | `LCD_LANGUAGE` | |
| `BOARD_RAMPS_DAGOMA` | `BOARD_DAGOMA_F5` | |
| `UNKNOWN_Z_NO_RAISE` | `(removed)` | |
| `INVERT_X2_VS_X_DIR true` | `INVERT_X2_VS_X_DIR` | |
| `INVERT_X2_VS_X_DIR false` | `//INVERT_X2_VS_X_DIR` | |
| `INVERT_Y2_VS_Y_DIR true` | `INVERT_Y2_VS_Y_DIR` | |
| `INVERT_Y2_VS_Y_DIR false` | `//INVERT_Y2_VS_Y_DIR` | |
| `HOMING_FEEDRATE_XY #` | `HOMING_FEEDRATE_MM_M { #, y, z }` | **⚠️ Verify axes values** |
| `HOMING_FEEDRATE_Z #` | `HOMING_FEEDRATE_MM_M { x, #, # }` | **⚠️ Verify axes values** |
| `FSMC_GRAPHICAL_TFT` | Specific display model | **⚠️ User selection** |
| `SPI_GRAPHICAL_TFT` | Specific display model | **⚠️ User selection** |

---

### Removed Options

| Option | Notes |
|--------|-------|
| `Z_AFTER_DEACTIVATE` | |
| `UNKNOWN_Z_NO_RAISE` | |
| `DWIN_MARLINUI_PORTRAIT` | |
| `DWIN_MARLINUI_LANDSCAPE` | |
| `MMU2_SERIAL` | |

---

### ⚠️ Warnings (User Attention Required)

1. **`HOMING_FEEDRATE_XY` and `HOMING_FEEDRATE_Z` → `HOMING_FEEDRATE_MM_M { x, y, z }`** — Verify all three axes values.
2. **`FSMC_GRAPHICAL_TFT`** → Must choose specific display: `MKS_ROBIN_TFT24/28/32/35/43`, `TFT_TRONXY_X5SA`, `ANET_ET4_TFT28`, `ANET_ET5_TFT35`, `TFT_GENERIC`.
3. **`SPI_GRAPHICAL_TFT`** → Must choose specific display: `MKS_TS35_V2_0`, `TFT_GENERIC`.
4. **`POWER_MONITOR_CURRENT_OFFSET`** — Meaning may have changed; verify value if used.

---

## Implementation Notes

- Transform functions: `_t207_208_tft`, `_t207_208_custom_user_menus`, `_t207_208_touch_cal`, `_t207_208_mmu2`
- Migration step in `abm/migration-rules.js` migrationSteps table
- Migration is idempotent
