# ABM Config Migration — Detailed Process Flow

*Generated from actual code as of 2026-06-17*

---

## Overview

This document describes the complete configuration migration pipeline as implemented in the AutoBuildMarlin VSCode extension. The pipeline upgrades legacy Marlin `Configuration.h` / `Configuration_adv.h` files to the current Marlin version by applying a chain of version-to-version transforms, outputting a `config.ini` file that Marlin's build system can apply.

**Key files:**
- `abm/importer.js` — Main pipeline (`do_migrate()`, `doMigration()`, helpers)
- `abm/migration-rules.js` — 46 version steps, ~100 renames, 25 transforms
- `abm/js/schema.js` — `ConfigSchema` parser + `combinedSchema()`
- `abm/js/marlin.js` — Version detection, file I/O
- `configs/<version>/` — Embedded default configs + Conditionals files (28 versions)

---

## Complete Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           do_migrate() Entry Point                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Version Detection (marlin.extractVersionInfo)                       │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Reads from workspace:                                                       │
│   • Configuration.h  → CONFIGURATION_H_VERSION (hex, e.g. "02000500")      │
│   • Version.h        → MARLIN_HEX_VERSION (hex, e.g. "02010201")           │
│                                                                             │
│ Converts via migRules.hexToVersion():                                       │
│   srcVer = "2.0.5"  (from CONFIGURATION_H_VERSION)                         │
│   tgtVer = "2.1.2.1" (from MARLIN_HEX_VERSION)                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Parse Workspace Configs → Flat Data (loadWorkspaceConfigs)         │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                             │
│ 2a. Read user's config files:                                               │
│     configText    = Marlin/Configuration.h                                  │
│     configAdvText = Marlin/Configuration_adv.h                              │
│                                                                             │
│ 2b. Find nearest embedded Conditionals file (nearestConfigVersion):         │
│     • Looks up srcVer in hardcoded `available[]` (28 versions: 1.1.9–2.1.3)│
│     • Returns closest version ≤ srcVer                                      │
│     • Reads embedded Conditionals_LCD.h (or split files for ≥2.1.3)        │
│                                                                             │
│ 2c. Parse into flat data (parseConfigsToFlatData):                          │
│     • ConfigSchema(configText) → iterates bysid → {name: {value, enabled}} │
│     • ConfigSchema(configAdvText, sidOffset) → merges, avoids dupes        │
│     • Filters out: CONFIGURATION_H_VERSION, CONFIGURATION_ADV_H_VERSION,   │
│                    CONFIG_EXAMPLES_DIR, LCD_HEIGHT                          │
│     • Result: { 'OPTION_NAME': { value: '42', enabled: true }, ... }       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Run Migration Chain (migRules.migrateConfig)                        │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                             │
│ Input: flat config data, srcVer, tgtVer                                     │
│                                                                             │
│ For each migrationStep in migrationSteps[] (ordered):                       │
│   1. if step.from ≥ tgtVer → break (past target)                           │
│   2. Apply simple renames (step.rename: { oldName → newName or null })     │
│      _rename() mutates config in place, logs "RENAMED X → Y"               │
│   3. Apply transform functions (step.transforms[]: fn(config, log, warn))  │
│      Complex restructures: split, merge, value conversion, conditionals    │
│   4. Collect warnings (step.warnings[])                                    │
│                                                                             │
│ Output: { config: migratedData, log: [...], warnings: [...] }              │
│                                                                             │
│ Notable: Idempotent — steps apply even if old names still present          │
│          (handles configs never migrated, carrying names from earlier ver) │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: Backup Old Configs (backupConfigs)                                  │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Creates timestamped directory:                                              │
│   config/backup/pre-migrate-YYYY-MM-DDTHH-MM-SS/                           │
│ Copies:                                                                     │
│   • Configuration.h, Configuration_adv.h, config.ini (if exists)           │
│   • Conditionals_LCD.h from workspace (Marlin/src/inc/) if present         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: Write config.ini (saveConfigIni)                                    │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Creates Marlin/Config/ini:                                                  │
│   # header                                                                  │
│   [config:base]                                                             │
│   ini_use_config               = all                                        │
│   [config:basic]                                                              │
│   motherboard                  = BOARD_RAMPS_14_EFB                         │
│   serial_port                  = 0                                          │
│   pidtemp                      = on                                         │
│   invert_x_dir                 = false                                      │
│   ...                                                                       │
│   #                                                                          │
│   # Disabled options                                                        │
│   #                                                                          │
│   # some_disabled_option        = value                                     │
│                                                                             │
│ Format rules:                                                               │
│   • Lowercase names, padded to 40 chars                                    │
│   • ` = ` separator                                                        │
│   • Empty value → `on` (switch type)                                       │
│   • Boolean: `true`/`false`                                                │
│   • Disabled options: `# ` prefix, same format                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 7: Apply to Target Version Configs (NEW — final output)               │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Reads fresh embedded configs for tgtVer from configs/tgtVer/:               │
│   • Configuration.h, Configuration_adv.h                                    │
│                                                                             │
│ Merges migrated flat data into fresh configs:                               │
│   • For each option in flat data: write #define / #undef to config text     │
│   • Preserve file structure, sections, comments from embedded baseline      │
│   • New options in target version get their embedded defaults               │
│   • User-set options override embedded defaults                             │
│                                                                             │
│ Writes updated config files:                                                │
│   • Marlin/Configuration.h  ← migrated + target-version baseline            │
│   • Marlin/Configuration_adv.h ← migrated + target-version baseline         │
│                                                                             │
│ Result: User now has BOTH artifacts:                                        │
│   1. config.ini          — for PlatformIO build (abm.apply.ini)            │
│   2. Configuration.h/.h  — human-readable, diffable, version-controlled    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 6: Show Results (showMigrationResult)                                  │
│ ─────────────────────────────────────────────────────────────────────────── │
│ VSCode notification:                                                        │
│   "Config migrated 2.0.5 → 2.1.2.1. 47 option changes. 3 items need       │
│    attention. Backups in backup/pre-migrate-2026-06-17T12-34-56."          │
│ Buttons: [Show Details] [Apply]                                             │
│   • Show Details → Output channel with full change log + warnings          │
│   • Apply → executes `abm.apply.ini` command (runs PlatformIO script)      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Component Reference

### 1. Version Detection (`marlin.extractVersionInfo`)

**File:** `abm/js/marlin.js:182`

```javascript
function extractVersionInfo() {
  return {
    hexv: _confValue(files.version.text, 'MARLIN_HEX_VERSION'),      // Firmware
    hexc: _confValue(files.config.text, 'CONFIGURATION_H_VERSION'),  // Config
    vers: _confValue(files.version.text, 'SHORT_BUILD_VERSION').dequote(),
    date: _confValue(files.version.text, 'STRING_DISTRIBUTION_DATE').dequote(),
    auth: _confValue(files.config.text, 'STRING_CONFIG_H_AUTHOR').dequote()
  };
}
```

**Returns:** `{ hexv, hexc, vers, date, auth }` — hex strings like `"02010201"`

**Conversion:** `migRules.hexToVersion("02010201") → "2.1.2.1"`

---

### 2. Conditionals Resolution (`nearestConfigVersion`)

**File:** `abm/migration-rules.js:1413`

```javascript
function nearestConfigVersion(hexVer) {
  const available = [
    '1.1.9', '2.0.0', '2.0.1', '2.0.2', '2.0.3', '2.0.4',
    '2.0.5', '2.0.6', '2.0.7', '2.0.8', '2.0.8.1',
    '2.0.9', '2.0.9.1', '2.0.9.2', '2.0.9.3', '2.0.9.4', '2.0.9.5',
    '2.1.0', '2.1.1', '2.1.2', '2.1.2.1', '2.1.2.2', '2.1.2.3',
    '2.1.2.4', '2.1.2.5', '2.1.2.6', '2.1.2.7', '2.1.3'
  ];

  const verHex = versionToHex(hexVer);
  let best = null;
  for (const av of available) {
    if (versionToHex(av) <= verHex) best = av;
    else break;
  }
  return best;  // e.g., "2.0.5" for srcVer "02000500"
}
```

**Purpose:** Find embedded Conditionals file matching user's config version.

**Embedded structure:**
```
configs/
  2.0.5/
    Configuration.h
    Configuration_adv.h
    Conditionals_LCD.h        ← single file for ≤2.1.2.7
  2.1.3/
    Configuration.h
    Configuration_adv.h
    Conditionals-1-axes.h     ← split files for ≥2.1.3
    Conditionals-2-LCD.h
    Conditionals-3-etc.h
```

---

### 3. Config Parsing → Flat Data (`parseConfigsToFlatData`)

**File:** `abm/importer.js:71`

```javascript
function parseConfigsToFlatData(configText, configAdvText, condText) {
  const data = {};

  // Parse main config
  const schema = new ConfigSchema(configText);
  for (const item of schema.iterateDataBySID()) {
    if (item.name && !SKIP.includes(item.name)) {
      data[item.name] = { value: String(item.value ?? ''), enabled: !!item.evaled };
    }
  }

  // Parse adv config with SID offset
  const sidOffset = schema.bysid.length;
  const advSchema = new ConfigSchema(configAdvText, sidOffset);
  for (const item of advSchema.iterateDataBySID()) {
    if (item.name && !SKIP.includes(item.name) && !(item.name in data)) {
      data[item.name] = { value: String(item.value ?? ''), enabled: !!item.evaled };
    }
  }
  return data;
}
```

**ConfigSchema usage:**
- `new ConfigSchema(text)` — parses `#define`, `#undef`, `#if`/`#endif`
- `iterateDataBySID()` — yields items in source order with `sid`, `name`, `value`, `evaled`, `section`
- `evaled` = boolean after requirement evaluation (`true` if option is active)

**Note:** Conditionals text (`condText`) is NOT passed here — it's used by the editor's `combinedSchema()` for live editing, but migration uses the flat data approach without re-evaluating conditionals per step.

---

### 4. Migration Chain (`migrateConfig`)

**File:** `abm/migration-rules.js:1355`

```javascript
function migrateConfig(config, from, to) {
  const log = [], warnings = [];
  const result = { ...config };  // shallow copy, mutate in place

  for (const step of migrationSteps) {
    if (versionToHex(step.from) >= versionToHex(to)) break;

    if (step.rename) {
      for (const [oldName, newName] of Object.entries(step.rename)) {
        _rename(result, log, oldName, newName);
      }
    }
    if (step.transforms) {
      for (const fn of step.transforms) {
        fn(result, log, warnings);  // fn(config, log, warnings)
      }
    }
    if (step.warnings) warnings.push(...step.warnings);
  }
  return { config: result, log, warnings };
}
```

**Migration Step Structure:**
```javascript
{
  from: '2.0.5',
  to:   '2.0.6',
  note: 'added CONFIG_EXPORT',
  rename: {
    'OLD_NAME': 'NEW_NAME',      // simple rename
    'REMOVED_OPTION': null       // removal
  },
  transforms: [
    fn(config, log, warnings) { /* complex restructure */ }
  ],
  warnings: [
    'User must manually set NEW_OPTION',
    'DEFAULT_X_CHANGED from 6 to 1'
  ]
}
```

**Example Transforms (from `migration-rules.js`):**

| Version | Transform | Description |
|---------|-----------|-------------|
| 1.1.9→2.0.0 | `_t190_200_power_supply` | `POWER_SUPPLY 1` → `PSU_CONTROL + PSU_ACTIVE_HIGH false` |
| 1.1.9→2.0.0 | `_t190_200_z_probe` | `Z_MIN_PROBE_ENDSTOP` → `Z_MIN_PROBE_USES_Z_MIN_ENDSTOP_PIN` |
| 2.0.5→2.0.7 | `_t2005_2007_homing` | `X/Y/Z_HOME_BUMP_MM` → `HOMING_BUMP_MM {x,y,z}` |
| 2.1.2→2.1.2.6 | PID case fix | `DEFAULT_bedKp` → `DEFAULT_BED_KP` (uppercase) |

---

### 5. Config.ini Generation (`flatDataToConfigIni` / `saveConfigIni`)

**File:** `abm/importer.js:138`

```javascript
function flatDataToConfigIni(data, opts = {}) {
  const fmt = (name, val) => String(name).padEnd(40) + ' = ' + String(val);
  const skip = ['CONFIGURATION_H_VERSION', 'CONFIGURATION_ADV_H_VERSION', ...];

  let ini = '#\n# Marlin Firmware\n# config.ini — Auto-migrated\n#\n';
  if (opts.sections) ini += `[config:${opts.key || 'basic'}]\n`;

  const enabled  = items.filter(([, item]) =>  item.enabled);
  const disabled = items.filter(([, item]) => !item.enabled);

  for (const [name, item] of enabled) {
    let val = item.value || 'on';  // empty → 'on'
    ini += fmt(name.toLowerCase(), val) + '\n';
  }
  if (disabled.length) {
    ini += '\n#\n# Disabled options\n#\n';
    for (const [name, item] of disabled) {
      let val = item.value || 'on';
      ini += '# ' + fmt(name.toLowerCase(), val) + '\n';
    }
  }
  return ini;
}
```

**saveConfigIni adds required header:**
```javascript
[config:base]
ini_use_config = all
[config:basic]
```

---

### 6. Backup System (`backupConfigs`)

**File:** `abm/importer.js:217`

```javascript
function backupConfigs(wr) {
  const destDir = path.join(wr, 'config', 'backup', `pre-migrate-${stamp}`);
  fs.mkdirSync(destDir, { recursive: true });

  for (const fname of ['Configuration.h', 'Configuration_adv.h', 'config.ini']) {
    copyIfExists(path.join(wr, 'Marlin', fname), destDir);
  }
  copyIfExists(path.join(wr, 'Marlin', 'src', 'inc', 'Conditionals_LCD.h'), destDir);
  return destDir;
}
```

---

## Conditionals Files Handling

### For Migration (importer.js)
- Uses **single embedded Conditionals file** selected by `nearestConfigVersion(srcVer)`
- Only reads `Conditionals_LCD.h` (or split files concatenated for ≥2.1.3)
- Does NOT re-evaluate conditionals after each migration step
- Flat data captures `enabled` state at parse time only

### For Editor (schema.js:combinedSchema)
- Reads **workspace** Conditionals file(s):
  ```javascript
  const cond = marlin.pathFromArray(['src', 'inc', 'Conditionals_LCD.h']);
  if (fs.existsSync(cond)) {
    configd = fs.readFileSync(cond, 'utf8');
  } else {
    // Fallback to split files (≥2.1.3)
    configd = fs.readFileSync(cond1) + fs.readFileSync(cond2) + fs.readFileSync(cond3);
  }
  ```
- Creates `adv_combo = config1 + conditionals + config2` for live requirement evaluation

---

## Refined Plan: Re-evaluate Conditionals Per Migration Step

### Problem
The current migration chain (`migrateConfig()`) applies all transforms to a flat config object without re-parsing the modified config through the schema. This means:
- `enabled` states are frozen at initial parse time
- If a transform changes a dependency (e.g., enables `HAS_LCD`), downstream options that `require ENABLED(HAS_LCD)` remain incorrectly disabled
- New default values in newer config versions are not captured (options added in newer configs with different defaults)

### Proposed Solution: Re-import at Each Step

At each migration step that advances the version, re-apply the updated config to a fresh baseline from the embedded configs and re-parse:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ REFINED STEP 3: Migration with Per-Step Re-import                          │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                             │
│ For each migration step from srcVer → nextVer (until target):              │
│                                                                             │
│   1. Apply step transforms to flat config data (current behavior)          │
│                                                                             │
│   2. **NEW:** Generate modified Configuration.h text:                       │
│        a. Read fresh embedded config for `nextVer` from `configs/nextVer/` │
│        b. Apply all accumulated config changes as `#define`/`#undef` lines │
│           to the fresh config text (merge strategy: user values override   │
│           embedded defaults, but embedded *new* options are preserved)     │
│        c. Do same for Configuration_adv.h                                  │
│                                                                             │
│   3. **NEW:** Re-parse modified config texts:                               │
│        a. Get Conditionals for `nextVer` (via nearestConfigVersion)        │
│        b. Parse via ConfigSchema → fresh flat data with updated `enabled`  │
│                                                                             │
│   4. Continue to next step with refreshed flat data                        │
│                                                                             │
│ Benefits:                                                                   │
│   • Captures newly-enabled-by-default options in newer configs             │
│   • Conditionals correctly re-evaluated for each version                   │
│   • New options introduced in intermediate versions appear automatically   │
│                                                                             │
│ Trade-offs:                                                                 │
│   • Slower (full schema parse per version step)                            │
│   • More complex merge logic (user changes vs embedded defaults)           │
│   • Need to track which options are "user-set" vs "inherited from default" │
│                                                                             │
│ Future Optimization:                                                        │
│   If migration rules later encode *default value changes* explicitly       │
│   (e.g., "in 2.0.8, MIN_STEPS_PER_SEGMENT default changed 6→1"),          │
│   we can apply those directly in flat data without re-import.              │
│   This refinement would make re-import optional/verification-only.         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Implementation Sketch

```javascript
// In migrateConfig() or a new wrapper:
async function migrateConfigWithReimport(config, fromVer, toVer) {
  let currentConfig = { ...config };
  let currentVer = fromVer;

  for (const step of migrationSteps) {
    if (versionToHex(step.from) < versionToHex(currentVer)) continue;
    if (versionToHex(step.to) > versionToHex(toVer)) break;

    // 1. Apply transforms for this step
    applyRenameAndTransforms(currentConfig, step);

    // 2. Re-import using next version's baseline
    const nextVer = step.to;
    const freshConfig = loadEmbeddedConfig(nextVer); // Configuration.h + _adv.h
    const conditionals = loadEmbeddedConditionals(nextVer);

    // Merge: user values take precedence, but fresh defaults fill gaps
    const mergedText = mergeConfigTexts(freshConfig, currentConfig);

    // 3. Re-parse with fresh conditionals
    currentConfig = parseConfigsToFlatData(mergedConfigH, mergedConfigAdvH, conditionals);
    currentVer = nextVer;
  }

  return { config: currentConfig, log, warnings };
}
```

### Merge Strategy Details

| Scenario | Resolution |
|----------|------------|
| Option exists in both user config and fresh embedded | **User value wins** (preserves intentional changes) |
| Option only in user config (removed in newer Marlin) | **Keep user value** (will be handled by rename/removal transform) |
| Option only in fresh embedded (new in this version) | **Adopt embedded default** (captures new defaults) |
| Option disabled by user but enabled by default in new version | **User's disabled state wins** (explicit user choice respected) |

This requires tracking `userSet: true` flag in flat data for options the user explicitly configured.

---

## Current Limitations & Known Issues

| Issue | Location | Impact |
|-------|----------|--------|
| Conditionals not re-evaluated per step | `migrateConfig()` | If a transform enables/disables a dependency, downstream requires may be stale |
| `nearestConfigVersion` hardcoded | `migration-rules.js:1415` | Must update `available[]` when adding new embedded configs |
| No Conditionals for `do_import()` | `importer.js:363` | File-picker import path stubbed out |
| Single `config.ini` output | `saveConfigIni()` | Doesn't generate separate `[config:basic]`/`[config:advanced]` sections |
| `loadWorkspaceConfigs` ignores Conditionals | `importer.js:118` | `condText` loaded but never passed to `parseConfigsToFlatData` |

---

## Test Coverage

| Test File | Type | Versions Tested |
|-----------|------|-----------------|
| `test/suite/migration-rules.test.js` | Unit (3 tests) | 1.1.9→2.0.5, 2.0.5→2.0.7, 2.1.2→2.1.2.6 |
| `test/suite/migration-pipeline.test.js` | E2E (28 tests) | All 28 embedded versions → 2.1.2.1 |
| `test/suite/migration.test.js` | Integration (VSCode) | 2.0.5 fixture → 2.1.2.1 |

Run standalone:
```bash
cd /path/to/AutoBuildMarlin
node test/suite/migration-rules.test.js
node test/suite/migration-pipeline.test.js
```

---

## Future Enhancements (from AGENTS.md)

1. **Preprocess Conditionals** — Strip comments, keep only directives, store as JSON
2. **JSON Conditionals Store** — `{ version, defines, requires }` as schema starting base
3. **Re-evaluate Conditionals per step** — Apply transforms → re-parse → continue
4. **Implement `do_import()`** — File picker → migrate selected configs → apply
5. **Separate config sections** — `[config:basic]` + `[config:advanced]` in output
