# Configuration Changes: 2.0.3 → 2.0.4

**Release Date:** 2020-02-21

Configuration changes required when upgrading from Marlin 2.0.3 to 2.0.4.

---

## Complex Transforms

### Level Corners Inset → Structured LFRB
| Old Option | New Option | Notes |
|------------|------------|-------|
| `LEVEL_CORNERS_INSET #` | `LEVEL_CORNERS_INSET_LFRB { #, #, #, # }` | Single value expands to four |

**Transform:** `_t203_204_level_corners`
The single inset value is replicated to all four corners (Left, Front, Right, Back).

### RUMBA32 Board Split
| Old Option | New Options | Notes |
|------------|-------------|-------|
| `BOARD_RUMBA32` | `BOARD_RUMBA32_AUS3D` or `BOARD_RUMBA32_MKS` | **⚠️ User selection required** |

**Transform:** `_t203_204_rumba32`
User must select the correct RUMBA32 variant.

---

## Simple Renames (BIGTREE → BTT Board Naming)

| Old Option | New Option | Notes |
|------------|------------|-------|
| `BOARD_BIGTREE_SKR_V1_1` | `BOARD_BTT_SKR_V1_1` | |
| `BOARD_BIGTREE_SKR_V1_3` | `BOARD_BTT_SKR_V1_3` | |
| `BOARD_BIGTREE_SKR_V1_4` | `BOARD_BTT_SKR_V1_4` | |
| `BOARD_BIGTREE_SKR_V1_4_TURBO` | `BOARD_BTT_SKR_V1_4_TURBO` | |
| `BOARD_BIGTREE_SKR_MINI_V1_1` | `BOARD_BTT_SKR_MINI_V1_1` | |
| `BOARD_BIGTREE_SKR_E3_DIP` | `BOARD_BTT_SKR_E3_DIP` | |
| `BOARD_BIGTREE_SKR_PRO_V1_1` | `BOARD_BTT_SKR_PRO_V1_1` | |
| `BOARD_BIGTREE_BTT002_V1_0` | `BOARD_BTT_BTT002_V1_0` | |

---

## No Removed Options

---

## ⚠️ Warnings (User Attention Required)

1. **BOARD_RUMBA32** → Must select `BOARD_RUMBA32_AUS3D` or `BOARD_RUMBA32_MKS` based on your hardware revision.

---

## Implementation Notes

- Transform functions: `_t203_204_level_corners`, `_t203_204_rumba32`
- Migration step in `abm/migration-rules.js` migrationSteps table
- Migration is idempotent
