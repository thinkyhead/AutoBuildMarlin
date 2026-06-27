# Configuration Changes: 2.0.1 → 2.0.2

**Release Date:** 2020-01-27

Configuration changes required when upgrading from Marlin 2.0.1 to 2.0.2.

---

## Complex Transforms

### DGUS LCD → Specific UI Variants
| Old Option | New Options | Notes |
|------------|-------------|-------|
| `DGUS_LCD` | `DGUS_LCD_UI_ORIGIN`, `DGUS_LCD_UI_FYSETC`, `DGUS_LCD_UI_HIPRECY` | **⚠️ User selection required** |

**Transform:** `_t201_202_dgus`
If `DGUS_LCD` was enabled, user must pick one of the three UI variants. Defaults to `DGUS_LCD_UI_ORIGIN` but requires verification.

### Z Dual/Triple Steppers → NUM_Z_STEPPER_DRIVERS
| Old Option | New Option | Notes |
|------------|------------|-------|
| `Z_DUAL_STEPPER_DRIVERS` | `NUM_Z_STEPPER_DRIVERS = 2` | |
| `Z_TRIPLE_STEPPER_DRIVERS` | `NUM_Z_STEPPER_DRIVERS = 3` | |

**Transform:** `_t201_202_z_stepper`
Converts boolean dual/triple stepper options to a single numeric option.

---

## Simple Renames

| Old Option | New Option | Notes |
|------------|------------|-------|
| `X_DUAL_ENDSTOPS_ADJUSTMENT` | `X2_ENDSTOP_ADJUSTMENT` | |
| `Y_DUAL_ENDSTOPS_ADJUSTMENT` | `Y2_ENDSTOP_ADJUSTMENT` | |
| `Z_DUAL_ENDSTOPS` | `Z_MULTI_ENDSTOPS` | |
| `Z_TRIPLE_ENDSTOPS` | `Z_MULTI_ENDSTOPS` | |
| `Z_DUAL_ENDSTOPS_ADJUSTMENT` | `Z2_ENDSTOP_ADJUSTMENT` | |
| `Z_TRIPLE_ENDSTOPS_ADJUSTMENT2` | `Z2_ENDSTOP_ADJUSTMENT` | |
| `Z_TRIPLE_ENDSTOPS_ADJUSTMENT3` | `Z3_ENDSTOP_ADJUSTMENT` | |
| `BOARD_STEVAL` | `BOARD_STEVAL_3DP001V1` | |

---

## No Removed Options

---

## ⚠️ Warnings (User Attention Required)

1. **DGUS_LCD** → Must select one of: `DGUS_LCD_UI_ORIGIN`, `DGUS_LCD_UI_FYSETC`, or `DGUS_LCD_UI_HIPRECY`. Default is ORIGIN but verify your hardware.

---

## Implementation Notes

- Transform functions: `_t201_202_dgus`, `_t201_202_z_stepper`
- Migration step in `abm/migration-rules.js` migrationSteps table
- Migration is idempotent
