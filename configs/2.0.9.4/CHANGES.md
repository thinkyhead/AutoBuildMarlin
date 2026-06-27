# Configuration Changes: 2.0.9.3 → 2.0.9.4

**Release Date:** 2022-06-05

Configuration changes required when upgrading from Marlin 2.0.9.3 to 2.0.9.4.

---

## Complex Transforms

### Bed Tramming (formerly Level Bed Corners)
| Old Option | New Option | Notes |
|------------|------------|-------|
| `LEVEL_BED_CORNERS` | `LCD_BED_TRAMMING` | Renamed |
| `LEVEL_CORNERS_INSET_LFRB` | `BED_TRAMMING_INSET_LFRB` | Renamed |
| `LEVEL_CORNERS_HEIGHT` | `BED_TRAMMING_HEIGHT` | Renamed |
| `LEVEL_CORNERS_Z_HOP` | `BED_TRAMMING_Z_HOP` | Renamed |
| `LEVEL_CENTER_TOO` | `BED_TRAMMING_INCLUDE_CENTER` | Renamed |
| `LEVEL_CORNERS_USE_PROBE` | `BED_TRAMMING_USE_PROBE` | Renamed |
| `LEVEL_CORNERS_PROBE_TOLERANCE` | `BED_TRAMMING_PROBE_TOLERANCE` | Renamed |
| `LEVEL_CORNERS_VERIFY_RAISED` | `BED_TRAMMING_VERIFY_RAISED` | Renamed |
| `LEVEL_CORNERS_AUDIO_FEEDBACK` | `BED_TRAMMING_AUDIO_FEEDBACK` | Renamed |

**Transform:** `_t2093_2094_bed_tramming`
Complete rename family from LEVEL_CORNERS_* to BED_TRAMMING_*.

### Nozzle Park
| Old Option | New Option | Notes |
|------------|------------|-------|
| `NOZZLE_PARK_X_ONLY` (enabled) | `NOZZLE_PARK_MOVE = 1` | |
| `NOZZLE_PARK_Y_ONLY` (enabled) | `NOZZLE_PARK_MOVE = 2` | |

**Transform:** `_t2093_2094_nozzle_park`

---

## Simple Renames

| Old Option | New Option | Notes |
|------------|------------|-------|
| `DWIN_CREALITY_LCD_ENHANCED` | `DWIN_LCD_PROUI` | |
| `Z_STEPPER_ALIGN_KNOWN_STEPPER_POSITIONS` | `Z_STEPPER_ALIGN_STEPPER_XY` | |
| `BOARD_TH3D_EZBOARD_LITE_V2` | `BOARD_TH3D_EZBOARD_V2` | |

---

## Removed Options

| Option | Notes |
|--------|-------|
| `TOOLCHANGE_FS_INIT_BEFORE_SWAP` | |

---

## No Warnings

---

## Implementation Notes

- Transform functions: `_t2093_2094_bed_tramming`, `_t2093_2094_nozzle_park`
- Migration step in `abm/migration-rules.js` migrationSteps table
- Migration is idempotent
