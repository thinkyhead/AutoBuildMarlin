# Configuration Changes: 2.1.2.5 → 2.1.2.6

**Release Date:** 2025-12-23

Configuration changes required when upgrading from Marlin 2.1.2.5 to 2.1.2.6.

---

## Complex Transforms

### PID Constants Uppercase

| Old Options | New Options | Notes |
|-------------|-------------|-------|
| `DEFAULT_Kp` | `DEFAULT_KP` | Uppercase |
| `DEFAULT_Ki` | `DEFAULT_KI` | Uppercase |
| `DEFAULT_Kd` | `DEFAULT_KD` | Uppercase |
| `DEFAULT_Kf` | `DEFAULT_KF` | Uppercase |
| `DEFAULT_Kc` | `DEFAULT_KC` | Uppercase |
| `DEFAULT_Kp_LIST` | `DEFAULT_KP_LIST` | Uppercase |
| `DEFAULT_Ki_LIST` | `DEFAULT_KI_LIST` | Uppercase |
| `DEFAULT_Kd_LIST` | `DEFAULT_KD_LIST` | Uppercase |
| `DEFAULT_bedKp` | `DEFAULT_BED_KP` | Uppercase + underscore |
| `DEFAULT_bedKi` | `DEFAULT_BED_KI` | Uppercase + underscore |
| `DEFAULT_bedKd` | `DEFAULT_BED_KD` | Uppercase + underscore |
| `DEFAULT_chamberKp` | `DEFAULT_CHAMBER_KP` | Uppercase + underscore |
| `DEFAULT_chamberKi` | `DEFAULT_CHAMBER_KI` | Uppercase + underscore |
| `DEFAULT_chamberKd` | `DEFAULT_CHAMBER_KD` | Uppercase + underscore |

**Transform:** `_t2125_2126_pid_case`
Renames all PID-related constants to uppercase with proper underscore separation.

**Also uppercases PID constant references in VALUES** — if any option's value contains these constant names (e.g., `SOME_OPTION = "DEFAULT_Kp"`), they will be uppercased to `DEFAULT_KP` as well.

---

## No Simple Renames (handled by transform)

---

## No Removed Options

---

## No Warnings

---

## Implementation Notes

- Transform function: `_t2125_2126_pid_case`
- Migration step in `abm/migration-rules.js` migrationSteps table
- Migration is idempotent
