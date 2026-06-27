# Configuration Changes: 2.1.2.1 → 2.1.2.2

**Release Date:** 2024-02-09

Configuration changes required when upgrading from Marlin 2.1.2.1 to 2.1.2.2.

---

## Complex Transforms

### PID_MAX / MPC_MAX from BANG_MAX

| Old Option | New Option | Notes |
|------------|------------|-------|
| `PID_MAX` (value includes BANG_MAX) | `PID_MAX = 255` | Copy value of BANG_MAX |
| `MPC_MAX` (value includes BANG_MAX) | `MPC_MAX = 255` | Copy value of BANG_MAX |

**Transform:** `_t2121_2122_pid_max`

### DISABLE_E Boolean → Enable/Disable

| Old Option | New Option | Notes |
|------------|------------|-------|
| `DISABLE_E true` | `DISABLE_E = enable` | |
| `DISABLE_E false` | `DISABLE_E = disable` | |

**Transform:** `_t2121_2122_disable_e`

### `DISABLE_INACTIVE_*` → `DISABLE_IDLE_*`

| Old Options | New Options | Notes |
|-------------|-------------|-------|
| `DISABLE_INACTIVE_X` | `DISABLE_IDLE_X` | Per-axis rename |
| `DISABLE_INACTIVE_Y` | `DISABLE_IDLE_Y` | ... |
| `DISABLE_INACTIVE_Z` | `DISABLE_IDLE_Z` | ... |
| `DISABLE_INACTIVE_I` | `DISABLE_IDLE_I` | ... |
| `DISABLE_INACTIVE_J` | `DISABLE_IDLE_J` | ... |
| `DISABLE_INACTIVE_K` | `DISABLE_IDLE_K` | ... |
| `DISABLE_INACTIVE_U` | `DISABLE_IDLE_U` | ... |
| `DISABLE_INACTIVE_V` | `DISABLE_IDLE_V` | ... |
| `DISABLE_INACTIVE_W` | `DISABLE_IDLE_W` | ... |
| `DISABLE_INACTIVE_E` | `DISABLE_IDLE_E` | ... |

**Transform:** `_t2121_2122_disable_inactive_axes`

### `DISABLE_INACTIVE_EXTRUDER` → `DISABLE_OTHER_EXTRUDERS`

| Old Option | New Option | Notes |
|------------|------------|-------|
| `DISABLE_INACTIVE_EXTRUDER` | `DISABLE_OTHER_EXTRUDERS` | Renamed |

**Transform:** `_t2121_2122_disable_inactive_axes` (same function)

### TMC SW → SPI Pins

| Old Options | New Options | Notes |
|-------------|-------------|-------|
| `TMC_SW_MOSI` | `TMC_SPI_MOSI` | |
| `TMC_SW_MISO` | `TMC_SPI_MISO` | |
| `TMC_SW_SCK` | `TMC_SPI_SCK` | |

**Transform:** `_t2121_2122_tmc_spi`

### Stepper Timeout

| Old Option | New Option | Notes |
|------------|------------|-------|
| `DEFAULT_STEPPER_DEACTIVE_TIME` | `DEFAULT_STEPPER_TIMEOUT_SEC` | Renamed |

**Transform:** `_t2121_2122_stepper_timeout`

### Folder Sorting

| Old Option | New Option | Notes |
|------------|------------|-------|
| `FOLDER_SORTING` | `SDSORT_FOLDERS` | Renamed |

**Transform:** `_t2121_2122_folder_sorting`

### BTT Mini 12864

| Old Option | New Option | Notes |
|------------|------------|-------|
| `BTT_MINI_12864_V1` | `BTT_MINI_12864` | Renamed |

**Transform:** `_t2121_2122_btt_mini`

---

### Simple Renames

| Old Option | New Option | Notes |
|------------|------------|-------|
| `TFT_SHARED_SPI` | `TFT_SHARED_IO` | |
| `X2_HOME_DIR` | `(removed)` | |

---

### Removed Options

| Option | Notes |
|--------|-------|
| `EXPERIMENTAL_SCURVE` | |
| `X2_HOME_DIR` | |

---

## No Warnings

---

## Implementation Notes

- Transform functions: `_t2121_2122_pid_max`, `_t2121_2122_disable_e`, `_t2121_2122_disable_inactive_axes`, `_t2121_2122_tmc_spi`, `_t2121_2122_stepper_timeout`, `_t2121_2122_folder_sorting`, `_t2121_2122_btt_mini`
- Migration step in `abm/migration-rules.js` migrationSteps table
- Migration is idempotent
