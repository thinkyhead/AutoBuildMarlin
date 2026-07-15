# AutoBuildMarlin Architecture Overview

## Project Structure

```
AutoBuildMarlin/           # VSCode Extension root
├── extension.js           # Entry point — registers commands, providers, inits abm module
├── package.json           # Extension manifest — activation events, views, commands, menus
├── abm/
│   ├── abm.js             # Extension-side: main ABM panel logic (webview creation, messaging, PIO)
│   ├── abm.html           # Main panel HTML template — uses ${...} eval'd by abm.js
│   ├── editor.js          # Extension-side: Custom Editor provider for Configuration.h/_adv.h
│   ├── editor.html        # Config editor HTML template — uses ${...} eval'd by editor.js
│   ├── prefs.js           # Settings/preferences module
│   ├── docs.js            # Docs panel provider
│   ├── format.js          # C++ formatter for Marlin code
│   ├── js/
│   │   ├── marlin.js      # Accessors and utilities — scrape Marlin config files to extract board/version info
│   │   ├── schema.js      # ConfigSchema class — parses Marlin config files to structured dict (bysec/bysid)
│   │   ├── editview.js    # WebView-side: builds config editor form from schema, handles edits
│   │   ├── abmview.js     # WebView-side: main panel logic, handles extension messages
│   │   ├── vsview.js      # Provides _msg() helper using acquireVsCodeApi()
│   │   ├── grid.js        # Matrix screensaver easter egg (no-results animation)
│   │   ├── jstepper.js    # jQuery numerical stepper plugin
│   │   └── jquery-3.6.0.min.js
│   ├── pane/
│   │   ├── geom.html      # Geometry config pane (placeholder)
│   │   ├── lcd.html       # LCD config pane (placeholder)
│   │   └── sd.html        # SD config pane (placeholder)
│   ├── css/               # Stylesheets
│   └── img/               # Icons and images
└── resources/             # Extension-level resources (toolbar icons)
├── test/
│   ├── suite/             # Test suite (Mocha-based)
│   │   ├── index.js              # VSCode integration test entry point
│   │   ├── migration.test.js     # Migration integration tests (requires VSCode API)
│   │   ├── migration-rules.test.js   # Migration rules unit tests (standalone)
│   │   ├── migration-pipeline.test.js # Full pipeline tests with embedded configs
│   │   └── lcd-completeness.test.js   # Schema LCD array completeness (vs Conditionals-2-LCD.h sanity check)
│   └── fixtures/
│       └── marlin-workspace/ # Test workspace with sample Marlin configs
```

## Two Independent WebView Systems

There are **two distinct webview systems** that share no code:

### 1. Main ABM Panel (`abm.html` / `abmview.js`)

**Extension side** (`abm.js`):
- `create_webview_panel()` creates a `vscode.WebviewPanel` in `ViewColumn.One`
- The panel's `pv` (panel.webview) is a **global singleton** — only one ABM panel exists
- `webViewContent()` reads `abm.html` and evaluates `${...}` template variables using `eval` on a template literal
- `postMessage(msg)` sends to the webview via `pv.postMessage(msg)`
- `handleMessageFromUI(m)` receives messages from the webview
- Messages use `{ command: '...', ... }` format

**WebView side** (`abmview.js`):
- Singleton `ABM` object with `init()`, `handleMessageToUI(event)`
- `msg(m)` sends messages back to extension (via `_msg()` from vsview.js)
- `$('body').click(...)` dismisses error messages
- `.subtabs button` click triggers `abm_pane()` to show config sub-panes
- `#showy input` checkbox changes send commands to update settings
- Alt key toggles `.clean` buttons to `.purge`

**Panel lifecycle:**
- ABM Panel opens in response to a command such as `abm.show`
- Panel retains context when hidden (`retainContextWhenHidden: true`)
- On dispose: clears panel ref, restarts file watcher, stops build watcher, destroys IPC file
- On view state change: syncs checkbox states

**Panel data flow:**
- The ABM Panel use exported functions from module `js/marlin` to initiate loading and do simplified scraping of Marlin's config files, `boards.h`, `pins.h`, etc.…
  - Callbacks are provided for success (`allFilesAreLoaded`) and failure (`readFileError`)
- On success, when all files are loaded and buffered, it calls back to `allFilesAreLoaded`:
  - `allFilesAreLoaded` calls various `marlin.<export>` functions to scrape data from Marlin files as structured data
  - Build information is scraped from Marlin `pins/pins.h` and specific pins files
  - `allFilesAreLoaded` sends messages to the view
    - `handleMessageToUI` receives those messages in the view (`js/abmview.js`)
      updates the row values in the table, populates the build envs and buttons.

### 2. Config Editor (`editor.html` / `editview.js`)

**Extension side** (`editor.js`):
- `ConfigEditorProvider` implements `resolveCustomTextEditor()` (VSCode custom editor API)
- Each editor instance has its own closure with `my = { filename, adv, wv }`
- Maintains a `webviews` dict keyed by filename to support cross-file sync
- `reloadSchemas()` calls `combinedSchema()` from schema.js to parse both configs
- `initWebview()` sends `{ type: 'update', bysec: ... }` to the webview
- `updateWebview(external)` sends updates on external changes
- `applyConfigChange(document, changes, edit)` updates the document text (line by line edits)
- Messages use `{ type: 'change', data: { sid, enabled, value, line } }` format

**WebView side** (`editview.js`):
- `schema` is a local `ConfigSchema` instance
- `buildConfigForm()` iterates `schema.bysec` sections → creates `<fieldset>` per section → `<div class="line">` per item
- `addOptionLine(data, $inner)` renders each config option:
  - **switch** → checkbox only
  - **options** present → `<select>` dropdown
  - **type: state** → toggle-style checkbox (LOW/HIGH)
  - **type: bool** → toggle switch
  - **text/enum/int/float/string/char/array** → `<input type="text">`
  - comment as `<span>` with auto-link
- `commitChange(optref, fields)` → updates inforef, marks dirty, sends `{ type:'change' }` to extension
- Filter system hides lines by class and sections by visibility count

**Config schema** (`schema.js`):
- `ConfigSchema` class: `bysec` = dict keyed by section, `bysid` = array indexed by SID
- `importText(text)` parses `#define`, `#undef`, `#if`/`#ifdef`/`#ifndef`/`#else`/`#elif`/`#endif`
  - Tracks nested `#if` conditions in a `conditions` stack
  - Converts Marlin macros to JS eval equivalents (ENABLED→`ENABLED()`, MB→`MB()`, etc.)
- `requirement tracking`: items get a `requires` field (JS-evaluable expression), `evaled` boolean
- `refreshAllRequires()` re-evaluates all conditions
- `itemGroup(item)` maps item names to radio-button groups (LCDs, probes, kinematics, etc.)
- `combinedSchema()` in schema.js reads both configs + conditionals and produces two schemas

### Messaging Architecture Summary

| Direction | Format | Mechanism |
|-----------|--------|-----------|
| Panel: Extension → WebView | `{ command:'info', tag, val }` etc. | `pv.postMessage()` → `window.addEventListener('message', ...)` |
| Panel: WebView → Extension | `{ command:'pio', env, cmd }` etc. | `vscode.postMessage()` → `pv.onDidReceiveMessage(handler)` |
| Editor: Extension → WebView | `{ type:'update', bysec: {...} }` | `my.wv.postMessage()` → `window.addEventListener('message', ...)` |
| Editor: WebView → Extension | `{ type:'change', data: { sid, enabled, value, line } }` | `vscode.postMessage()` → `my.wv.onDidReceiveMessage(handler)` |

## Extending the Architecture

### Adding a New Auto-Complete Field

1. Parse source data in schema.js (or in a helper loaded by editor.js)
2. Pass data through the schema item's `options` field or a new `autocomplete` field
3. In `addOptionLine()` (editview.js), detect the special field type and render with `<datalist>`
4. Handle change events the same way as regular text fields (via `handleEditField` / `commitChange`)

### Adding a New Config Tool Pane

1. Create the pane HTML file in `abm/pane/`
2. Load it in `abm.js`'s `webViewContent()` with `load_pane()`
3. Link it in `abm.html` under the `.subtabs` and `.subpanes` divs
4. Add form event handling in `abmview.js` or the specific pane's JS

## Key Patterns

- **Template evaluation**: HTML templates use backtick template literals with `${...}` interpolation, evaluated by `eval()`
- **Item references**: Each `.line` div's `inforef` property points back to its schema data item for bidirectional access
- **Multi-change batching**: `start_multi_update()`/`end_multi_update()` collects changes for atomic updates
- **Debouncing**: File change watch uses timeout debouncing (2s), edit fields use 500ms delay
- **IPC file**: A temp file path-based IPC mechanism signals command completion from Terminal to extension

## Config Migration Feature (ABM Importer)

### Overview
The ABM extension includes a configuration migration system to upgrade old Marlin Configuration.h / Configuration_adv.h files to newer versions. This is useful when users open legacy printer configurations.

### Architecture
The migration pipeline consists of:
1. **Version Detection** — Extract `CONFIGURATION_H_VERSION` (hex) and `MARLIN_HEX_VERSION` from source files
2. **Schema Parsing** — Parse both configs using `ConfigSchema` with the correct Conditionals file (`Conditionals_LCD.h` for ≤2.1.2.7, split `Conditionals-1/2/3.h` for ≥2.1.3)
3. **Flat Data Extraction** — Convert parsed schema to flat `{ name: { value, enabled } }` format
4. **Migration Rules** — Apply version-to-version transforms from `migration-rules.js` (46 steps, 1.1.9 → 2.2.0)
5. **config.ini Output** — Write migrated config as `config.ini` (Marlin's preferred migration format)
6. **Backup** — Timestamped backup of original configs before migration
7. **Apply to Target Configs** — Merge migrated data into fresh embedded configs for `tgtVer`, write updated `Configuration.h` / `Configuration_adv.h` (human-readable, diffable)

### Migration Rules (`abm/migration-rules.js`)
- **46 version steps** covering 1.1.9 → 2.2.0
- **~100+ simple renames** (declarative tables)
- **25 complex transform functions** (imperative escape hatches)
- **Idempotent** — re-running migration on already-migrated config produces no changes
- **Pure Node.js** — no VSCode dependency, runnable from shell

### Embedded Configs (`configs/`)
Pre-downloaded default configurations for each Marlin version, used to:
- Provide `Conditionals_LCD.h` / split Conditionals for schema parsing via `nearestConfigVersion()`
- Serve as baseline for integration testing
- Current coverage: 1.1.9 through 2.1.3 (28 versions)

### Test Suite (`test/suite/`)
| File | Type | Run From |
|------|------|----------|
| `migration.test.js` | Integration (requires VSCode API) | Extension Development Host |
| `migration-rules.test.js` | Unit (standalone) | `node test/suite/migration-rules.test.js` |
| `migration-pipeline.test.js` | End-to-end (embedded configs) | `node test/suite/migration-pipeline.test.js` |

All 28 pipeline tests pass (1.1.9 → 2.1.3 all migrate to 2.1.2.1). Unit tests: 3/3 pass.

### Importer Module (`abm/importer.js`)
- `do_migrate()` — **Complete**. Full pipeline: detect version → parse → migrate → backup → write config.ini → apply to target configs
- `do_import()` — **Stub**. Needs implementation for importing printers from example configs.
- `parseConfigsToFlatData()` — Parses raw config text to flat format using ConfigSchema
- `flatDataToConfigIni()` — Converts flat data to config.ini format (lowercase, 40-char padded, `#` comments)
- `saveConfigIni()` — Wrapper supporting both ConfigSchema and flat data inputs
- `applyToTargetConfigs()` — **NEW**. Merges migrated flat data into fresh embedded configs for `tgtVer`, writes updated `Configuration.h` / `Configuration_adv.h`

### Refined Plan — Per-Step Conditionals Re-evaluation

**Problem:** Current `migrateConfig()` applies all transforms to flat data without re-parsing. `enabled` states freeze at initial parse; if a transform changes a dependency (e.g., enables `HAS_LCD`), downstream `require ENABLED(HAS_LCD)` options stay incorrectly disabled. New default values in intermediate configs are also missed.

**Solution:** At each version step, re-apply accumulated changes to a fresh embedded config baseline and re-parse:

```
For each step srcVer → nextVer:
  1. Apply step transforms to flat config (current behavior)
  2. Generate modified Configuration.h/_adv.h text:
     a. Read fresh embedded config for nextVer from configs/nextVer/
     b. Merge: user values override, but embedded new options & defaults preserved
  3. Re-parse via ConfigSchema with nextVer's Conditionals
  4. Continue with refreshed flat data
```

**Merge strategy:** Track `userSet: true` flag per option. User values win; embedded defaults fill gaps for new options; user's explicit disable beats new default enable.

**Trade-off:** Slower (full parse per step), more complex merge. Mitigation: Later, encode default-value changes explicitly in migration rules (e.g., "2.0.8: MIN_STEPS_PER_SEGMENT default 6→1") to make re-import optional/verification-only.

**See:** `docs/migration-process.md` → "Refined Plan: Re-evaluate Conditionals Per Migration Step" for full details.

### Future Work — Conditionals Preprocessing & JSON Storage
**Current state:** Historical config files are included for import/migrate. These could potentially be pre-processed into minimized JSON.
