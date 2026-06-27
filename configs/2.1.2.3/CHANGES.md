# Configuration Changes: 2.1.2.2 → 2.1.2.3

**Release Date:** 2024-05-29

---

## No Configuration Option Changes

This version step has **no configuration-level changes** (renames, removals, or restructurings).

---

## Functional Enhancements

| Feature | Notes |
|---------|-------|
| ESP3D_WIFISUPPORT | Users with this enabled will have additional WiFi configuration options available after migration |

The migration adds new WiFi-related options with default values.
Users who already have `ESP3D_WIFISUPPORT` enabled will simply gain access to these new options without needing to change their existing configuration.

---

## No Complex Transforms Required

---

## No Warnings

---

## Implementation Notes

- Migration step in `abm/migration-rules.js` migrationSteps table has no transforms or renames
- Migration is a no-op for config option values; new options will use their defaults
