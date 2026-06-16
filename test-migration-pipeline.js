#!/usr/bin/env node
/**
 * Auto Build Marlin — Migration Pipeline Test
 *
 * Tests the full migration pipeline outside of VSCode:
 * 1. Read old config files from the embedded configs/ directory
 * 2. Parse them into flat data (simulating what importer does)
 * 3. Run the full migration chain
 * 4. Output config.ini
 *
 * Usage:
 *   node test-migration-pipeline.js              # Run all tests
 *   node test-migration-pipeline.js 2.0.5 2.1.3  # Migrate specific versions
 *   node test-migration-pipeline.js --list       # List available source configs
 */

'use strict';

const path = require('path');
const fs = require('fs');

// Project root
const ROOT = __dirname;

// ============================================================
// Import schema & migration rules directly
// ============================================================

// The schema module needs jquery-like helpers. Provide a minimal mock.
global.jQuery = { noConflict() { return this; } };
global.$ = global.jQuery;
global.window = { jQuery: global.jQuery };

// Marlin string helpers (needed by schema.js)
String.prototype.dequote = function () {
  return this.replace(/^\s*"|"\s*$/g, '').replace(/\\/g, '');
};
String.prototype.toTitleCase = function () {
  return this.replace(/\b([A-Z])(\w+)\b/gi, (_, p1, p2) => p1.toUpperCase() + p2.toLowerCase());
};
String.prototype.toLabel = function () {
  return this.replace(/[\[\]]/g, '').replace(/_/g, ' ').toTitleCase();
};
Number.prototype.limit = function (m1, m2) {
  if (m2 == null) return this > m1 ? m1 : this;
  return this < m1 ? m1 : this > m2 ? m2 : this;
};

// Load schema module
const { ConfigSchema } = require('./abm/js/schema');
const migRules = require('./abm/migration-rules');

// ============================================================
// Config parsing (simplified — no Conditionals_LCD.h)
// ============================================================

/**
 * Parse raw config text into flat data: { 'OPTION_NAME': { value, enabled }, ... }
 */
function parseConfigText(text, advText) {
  const data = {};

  const ignore = ['CONFIGURATION_H_VERSION', 'CONFIGURATION_ADV_H_VERSION', 'CONFIG_EXAMPLES_DIR', 'LCD_HEIGHT'];

  const schema = new ConfigSchema(text);
  for (const item of schema.iterateDataBySID()) {
    if (item.name && !ignore.includes(item.name)) {
      data[item.name] = { value: String(item.value ?? ''), enabled: !!item.evaled };
    }
  }

  if (advText) {
    const sidOffset = schema.bysid.length;
    const advSchema = new ConfigSchema(advText, sidOffset);
    for (const item of advSchema.iterateDataBySID()) {
      if (item.name && !ignore.includes(item.name) && !(item.name in data)) {
        data[item.name] = { value: String(item.value ?? ''), enabled: !!item.evaled };
      }
    }
  }

  return data;
}

// ============================================================
// config.ini output
// ============================================================

function flatDataToIni(data) {
  const enabled = [], disabled = [];
  for (const [name, item] of Object.entries(data)) {
    (item.enabled ? enabled : disabled).push(name);
  }
  enabled.sort();
  disabled.sort();

  let ini = '; Auto-migrated by ABM Config Updater\n;\n\n';
  for (const name of enabled)
    ini += `${name} = ${data[name].value}\n`;

  if (disabled.length) {
    ini += '\n; --- Disabled ---\n;\n';
    for (const name of disabled)
      ini += `; ${name} = ${data[name].value}\n`;
  }

  return ini;
}

// ============================================================
// Test: migrate an embedded config
// ============================================================

function testMigration(srcVer, tgtVer) {
  const configDir = path.join(ROOT, 'configs', srcVer);

  const configH  = path.join(configDir, 'Configuration.h');
  const configAdvH = path.join(configDir, 'Configuration_adv.h');

  if (!fs.existsSync(configH)) {
    console.error(`  ❌ No embedded configs for version ${srcVer}`);
    console.error(`     Expected at: ${configH}`);
    return null;
  }

  const text    = fs.readFileSync(configH, 'utf8');
  const advText = fs.existsSync(configAdvH) ? fs.readFileSync(configAdvH, 'utf8') : '';

  console.log(`  Reading configs from configs/${srcVer}/ ...`);
  console.log(`  Configuration.h: ${(text.length / 1024).toFixed(0)} KB`);
  console.log(`  Configuration_adv.h: ${(advText.length / 1024).toFixed(0)} KB`);

  // Parse into flat data
  const data = parseConfigText(text, advText);
  console.log(`  Parsed ${Object.keys(data).length} options (${Object.values(data).filter(i => i.enabled).length} enabled)`);

  // Detect CONFIGURATION_H_VERSION
  const hexMatch = text.match(/^#define\s+CONFIGURATION_H_VERSION\s+(\S+)/m);
  const configVer = hexMatch ? migRules.hexToVersion(hexMatch[1]) : srcVer;
  console.log(`  Detected config version: ${configVer}`);

  // Run migration
  console.log(`  Migrating ${configVer} → ${tgtVer} ...`);
  const result = migRules.migrateConfig(data, configVer, tgtVer);

  console.log(`  Done. ${result.log.length} log entries, ${result.warnings.length} warnings.`);

  // Generate config.ini
  const ini = flatDataToIni(result.config);
  console.log(`  Output config.ini: ${(ini.length / 1024).toFixed(0)} KB`);

  return result;
}

// ============================================================
// Main
// ============================================================

const args = process.argv.slice(2);

if (args.includes('--list')) {
  const dirs = fs.readdirSync(path.join(ROOT, 'configs')).sort();
  console.log('\nAvailable embedded config versions:');
  for (const d of dirs) {
    const hasConfig = fs.existsSync(path.join(ROOT, 'configs', d, 'Configuration.h'));
    console.log(`  ${d.padEnd(12)} ${hasConfig ? '✅' : '❌'}`);
  }
  process.exit(0);
}

if (args.length >= 2) {
  const [srcVer, tgtVer] = args;
  console.log(`\n═══ Migrate ${srcVer} → ${tgtVer} ═══\n`);
  const result = testMigration(srcVer, tgtVer);
  if (result) {
    console.log(`\n═══ Result: ${result.warnings.length} warnings, ${result.log.length} changes ═══`);
    if (result.warnings.length) {
      console.log('\nWarnings:');
      for (const w of result.warnings) console.log(`  ${w}`);
    }
    console.log('\nChange log (first 30):');
    for (const l of result.log.slice(0, 30)) console.log(`  ${l}`);
    if (result.log.length > 30) console.log(`  ... and ${result.log.length - 30} more`);
  }
  process.exit(result ? 0 : 1);
}

// Run all available embedded configs through a test migration
console.log('\n═══ Pipeline Test: Migrate all embedded configs to 2.1.2.1 ═══\n');

const versions = fs.readdirSync(path.join(ROOT, 'configs')).sort();
let passed = 0, failed = 0;

for (const ver of versions) {
  const dir = path.join(ROOT, 'configs', ver);
  if (!fs.statSync(dir).isDirectory()) continue;
  if (!fs.existsSync(path.join(dir, 'Configuration.h'))) continue;

  process.stdout.write(`  ${ver.padEnd(12)} → 2.1.2.1  `);
  try {
    const result = testMigration(ver, '2.1.2.1');
    if (result && result.config) {
      const enabled = Object.values(result.config).filter(i => i.enabled).length;
      console.log(`✅  (${enabled} enabled options)`);
      passed++;
    } else {
      console.log('❌  (null result)');
      failed++;
    }
  } catch (e) {
    console.log(`❌  ${e.message}`);
    failed++;
  }
}

console.log(`\n  ${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
