# Configuration Changes: 2.0.9.1 → 2.0.9.2

**Release Date:** 2021-10-02

Configuration changes required when upgrading from Marlin 2.0.9.1 to 2.0.9.2.

---

## Complex Transforms

### ARC Segments
| Old Option | New Option | Notes |
|------------|------------|-------|
| `MM_PER_ARC_SEGMENT` | `MAX_ARC_SEGMENT_MM` | Renamed |
| `MIN_ARC_SEGMENTS` | `MIN_CIRCLE_SEGMENTS` | Renamed |

**Transform:** `_t2091_2092_arc`
Renames and removes `ARC_SEGMENTS_PER_R`.

---

## Simple Renames

| Old Option | New Option | Notes |
|------------|------------|-------|
| `TEMP_SENSOR_REDUNDANT_SOURCE #` | `TEMP_SENSOR_REDUNDANT_SOURCE E#` | Prefix with E |
| `TEMP_SENSOR_REDUNDANT_TARGET #` | `TEMP_SENSOR_REDUNDANT_TARGET E#` | Prefix with E |
| `LCD_ALEPHOBJECTS_CLCD_UI` | `LCD_LULZBOT_CLCD_UI` | |
| `SPINDLE_LASER_PWM` | `SPINDLE_LASER_USE_PWM` | |

---

## Removed Options

| Option | Notes |
|--------|-------|
| `ARC_SEGMENTS_PER_R` | |
| `TEMP_SENSOR_REDUNDANT_SOURCE` (old format) | Replaced by `TEMP_SENSOR_REDUNDANT_SOURCE E#` |
| `TEMP_SENSOR_REDUNDANT_TARGET` (old format) | Replaced by `TEMP_SENSOR_REDUNDANT_TARGET E#` |

---

## No Warnings

---

## Implementation Notes

- Transform function: `_t2091_2092_arc`
- Migration step in `abm/migration-rules.js` migrationSteps table
- Migration is idempotent
