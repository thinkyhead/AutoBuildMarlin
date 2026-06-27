# Configuration Changes: 2.0.8 → 2.0.8.1

**Release Date:** 2021-05-15

Configuration changes required when upgrading from Marlin 2.0.8 to 2.0.8.1.

---

## Complex Transforms

### MKS LCD12864 Split
| Old Option | New Options | Notes |
|------------|-------------|-------|
| `MKS_LCD12864` | `MKS_LCD12864A` or `MKS_LCD12864B` | **⚠️ User selection required** |

**Transform:** `_t208_2081_mks_lcd`
User must select the correct MKS LCD12864 revision.

### SKR V2.0 Board Revision
| Old Option | New Options | Notes |
|------------|-------------|-------|
| `BOARD_BTT_SKR_V2_0` | `BOARD_BTT_SKR_V2_0_REV_A` or `BOARD_BTT_SKR_V2_0_REV_B` | **⚠️ Critical: Rev.A has bug that can kill stepper drivers!** |

**Transform:** `_t208_2081_mks_lcd` (same function)
User must select the correct SKR V2.0 board revision.

---

## No Simple Renames

---

## No Removed Options

---

## ⚠️ Warnings (User Attention Required)

1. **MKS_LCD12864** → Must select `MKS_LCD12864A` or `MKS_LCD12864B` based on your hardware revision.
2. **BOARD_BTT_SKR_V2_0** → **Critical!** Must select `BOARD_BTT_SKR_V2_0_REV_A` or `BOARD_BTT_SKR_V2_0_REV_B`. Rev.A has a bug that can kill stepper drivers!

---

## Implementation Notes

- Transform function: `_t208_2081_mks_lcd`
- Migration step in `abm/migration-rules.js` migrationSteps table
- Migration is idempotent
