# Configuration Changes: 2.0.8.4 → 2.0.9

**Release Date:** 2021-06-15

> **Note:** Versions 2.0.8.1 → 2.0.8.2 → 2.0.8.3 → 2.0.8.4 are intermediate. This step covers all changes from 2.0.8.1 to 2.0.9.

---

## Changes from 2.0.8.1 → 2.0.8.2

### Complex Transforms

#### NeoPixel Background LED Index → First/Last
| Old Option | New Options | Notes |
|------------|-------------|-------|
| `NEOPIXEL_BKGD_LED_INDEX` | `NEOPIXEL_BKGD_INDEX_FIRST`, `NEOPIXEL_BKGD_INDEX_LAST` | Single value splits to two |

**Transform:** `_t2081_2082_neopixel`
The single index value is used for both first and last.

---

## Changes from 2.0.8.2 → 2.0.8.3

**PlatformIO 6 update only — no configuration changes.**

---

## Changes from 2.0.8.3 → 2.0.8.4

**No configuration-level changes.**

---

## Changes from 2.0.8.4 → 2.0.9

### Complex Transforms

#### Redundant Temperature Sensor
| Old Option | New Options | Notes |
|------------|-------------|-------|
| `TEMP_SENSOR_1_AS_REDUNDANT` (enabled) | `TEMP_SENSOR_REDUNDANT = TEMP_SENSOR_0 value` | Uses temp sensor 0 value |
| `MAX_REDUNDANT_TEMP_SENSOR_DIFF` | `TEMP_SENSOR_REDUNDANT_MAX_DIFF` | Renamed |

**Transform:** `_t2084_209_temp_sensor_redundant`

---

### Simple Renames

| Old Option | New Option | Notes |
|------------|------------|-------|
| `MAX_REDUNDANT_TEMP_SENSOR_DIFF` | `TEMP_SENSOR_REDUNDANT_MAX_DIFF` | |
| `SENSORLESS_BACKOFF_MM { #, # }` | `SENSORLESS_BACKOFF_MM { #, #, 0 }` | Adds third value (0) |
| `PTC_SAMPLE_(START|RES|COUNT) #` | `PTC_SAMPLE_(START|RES|COUNT)` (floored to int) | Cosmetic: integer where possible |
| `BTC_SAMPLE_(START|RES|COUNT) #` | `BTC_SAMPLE_(START|RES|COUNT)` (floored to int) | Cosmetic: integer where possible |
| `BTC_PROBE_TEMP #` | `BTC_PROBE_TEMP` (floored to int) | Cosmetic: integer where possible |

---

## No Removed Options

---

## No Warnings

---

## Implementation Notes

- Transform functions: `_t2081_2082_neopixel`, `_t2084_209_temp_sensor_redundant`
- Migration steps in `abm/migration-rules.js` migrationSteps table
- Migration is idempotent
