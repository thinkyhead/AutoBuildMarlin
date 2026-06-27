# Configuration Changes: 2.0.6.2 → 2.0.7

**Release Date:** 2020-09-28

Configuration changes required when upgrading from Marlin 2.0.6.2 to 2.0.7.

> **Note:** Versions 2.0.6 → 2.0.6.1 → 2.0.6.2 are intermediate releases. This step covers all changes from 2.0.6 to 2.0.7.

---

## Changes from 2.0.6 → 2.0.6.1

### Simple Renames
| Old Option | New Option | Notes |
|------------|------------|-------|
| `TOUCH_BUTTONS` | `TOUCH_SCREEN` | |
| `EVENT_GCODE_SD_STOP` | `EVENT_GCODE_SD_ABORT` | |
| `SPINDLE_LASER_ACTIVE_HIGH` (false\|true) | `SPINDLE_LASER_ACTIVE_STATE` (LOW\|HIGH) | Boolean → state |

---

## Changes from 2.0.6.1 → 2.0.6.2

**No configuration changes.**

---

## Changes from 2.0.6.2 → 2.0.7

### Simple Renames
| Old Option | New Option | Notes |
|------------|------------|-------|
| `ANYCUBIC_LCD_SERIAL_PORT` | `LCD_SERIAL_PORT` | |
| `DGUS_SERIAL_PORT` | `LCD_SERIAL_PORT` | |
| `DGUS_BAUDRATE` | `LCD_BAUDRATE` | |
| `DGUS_SERIAL_STATS_RX_BUFFER_OVERRUNS` | `SERIAL_STATS_RX_BUFFER_OVERRUNS` | |
| `INTERNAL_SERIAL_PORT` | `MMU2_SERIAL_PORT` | |

---

## No Complex Transforms

---

## No Removed Options

---

## No Warnings

---

## Implementation Notes

- Migration steps in `abm/migration-rules.js` migrationSteps table
- Migration is idempotent
