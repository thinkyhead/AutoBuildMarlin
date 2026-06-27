# Configuration Changes: 2.0.9.5 → 2.1

**Release Dates:** 2023-06-17 (2.0.9.6), 2023-07-04 (2.0.9.7), 2023-12-08 (2.0.9.8), 2022-06-04 (2.1)

> **Note:** Versions 2.0.9.6, 2.0.9.7, 2.0.9.8 are intermediate releases without folders. 2.0.9.6 had board renames, 2.0.9.7/8 had no changes. This step covers all changes from 2.0.9.5 to 2.1.

---

## Changes from 2.0.9.5 → 2.0.9.6

### Simple Renames

| Old Option | New Option | Notes |
|------------|------------|-------|
| `BOARD_MKS_MONSTER8` | `BOARD_MKS_MONSTER8_V1` | |
| `BOARD_INDEX_REV04` | `BOARD_OPULO_LUMEN_REV4` | |

### ⚠️ Warnings

- **`BOARD_BTT_SKR_SE_BX`** → Must select `BOARD_BTT_SKR_SE_BX_V2` or `BOARD_BTT_SKR_SE_BX_V3` based on your hardware revision.

---

## Changes from 2.0.9.6 → 2.0.9.7

**No configuration changes.**

---

## Changes from 2.0.9.7 → 2.0.9.8

**No configuration changes.**

---

## Changes from 2.0.9.8 → 2.1

### Notes
- Delta, Z_PROBE_ALLEN_KEY, and SCARA configurations are still separate in 2.1
- No automated migration for these kinematics — check manually

---

## No Complex Transforms

---

## No Removed Options (beyond laser cleanup in 2.0.9.5)

---

## Implementation Notes

- Migration steps in `abm/migration-rules.js` migrationSteps table (multiple steps aggregated)
- Migration is idempotent
