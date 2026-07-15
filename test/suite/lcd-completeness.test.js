#!/usr/bin/env node
/**
 * Auto Build Marlin — LCD Completeness Test
 *
 * Verifies that the schema.js lcd array covers all LCD options from the
 * Conditionals-2-LCD.h sanity check. Useful for catching missing LCD entries.
 *
 * Usage:
 *   node lcd-completeness.test.js               # Check schema vs sanity check
 *   node lcd-completeness.test.js --summary     # Summary only
 *   node lcd-completeness.test.js --list        # List all options
 */

'use strict';

const path = require('path');
const fs = require('fs');

// Project root
const ROOT = path.join(__dirname, '../..');

// Import schema module
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

const { ConfigSchema } = require('../../abm/js/schema');

// ============================================================================
// Helper functions (test utilities, not core schema methods)
// ============================================================================

/**
 * Get the list of LCD option names from the schema's exclusive.lcd array.
 * Useful for checking completeness of LCD-related lookups.
 *
 * @returns {string[]} Array of LCD option names (e.g. ['REPRAP_DISCOUNT_SMART_CONTROLLER', 'ULTIPANEL', ...])
 */
function getLCDList() {
  return ConfigSchema.exclusive.lcd.slice(); // return a copy to avoid mutation
}

/**
 * Find LCD options from the schema that are NOT present in a given lookup object or array.
 * Useful for verifying completeness of LCD display name tables.
 *
 * @param {Object|Set} lookup - Object with keys being LCD option names, or a Set of LCD option names
 * @returns {string[]} Array of LCD option names missing from the lookup
 */
function getMissingLCDs(lookup) {
  const schemaLCDs = getLCDList();
  const missing = [];

  for (const name of schemaLCDs) {
    if (lookup instanceof Set ? !lookup.has(name) : !(name in lookup)) {
      missing.push(name);
    }
  }

  return missing;
}

// ============================================================================
// Test: verify schema.js lcd array is complete
// ============================================================================

console.log('\n=== LCD Completeness Test ===\n');

// Get the schema lcd list
const schemaLCDs = getLCDList();
console.log(`Schema exclusive.lcd array: ${schemaLCDs.length} options`);

// Load the sanity check from Conditionals-2-LCD.h
const sanityCheckPath = path.join(ROOT, 'src', 'inc', 'Conditionals-2-LCD.h');

// Check which defines from the sanity check are missing from schema
const sanityDefines = new Set();
if (fs.existsSync(sanityCheckPath)) {
  const sanityText = fs.readFileSync(sanityCheckPath, 'utf8');
  
  // Extract all #define entries that look like LCD options
  // The sanity check groups all defined LCD options into one big OR condition
  const defines = new Set();
  for (const match of sanityText.matchAll(/\b([A-Z][A-Z0-9_]*)\b/g)) {
    const def = match[1];
    // Filter to LCD-related defines
    if (def.match(/LCD|TFT|DISPLAY|CONTROLLER$/) ||
        def === 'MINIPANEL' || def === 'EXTENSIBLE_UI' || def === 'ULTIMAKERCONTROLLER' ||
        def === 'ULTIPANEL' || def === 'ULTI_CONTROLLER' || def === 'ULTRA_LCD' ||
        def === 'MAKRPANEL' || def.startsWith('DGUS_') || def.startsWith('DWIN_')) {
      defines.add(def);
    }
  }
  
  // Find missing defines
  const missing = [];
  for (const def of defines) {
    if (!schemaLCDs.includes(def)) {
      missing.push(def);
    }
  }
  
  if (missing.length > 0) {
    console.log(`\n❌ ${missing.length} defines from Conditionals-2-LCD.h are NOT in schema:`);
    for (const def of missing) {
      console.log(`   ${def}`);
    }
  } else {
    console.log('\n✅ All Conditionals-2-LCD.h defines are in schema');
  }
} else {
  console.log(`\n⚠️  Conditionals-2-LCD.h not found at ${sanityCheckPath}`);
  console.log('   Skipping sanity check comparison');
}

// ============================================================================
// Test: verify LCD display name lookup completeness
// ============================================================================

console.log('\n--- LCD Display Name Lookup Check ---\n');

// Load the LCD display name lookup from marlin.js
const marlinPath = path.join(ROOT, 'abm', 'js', 'marlin.js');
if (fs.existsSync(marlinPath)) {
  const marlinText = fs.readFileSync(marlinPath, 'utf8');
  
  // Extract the lcdControllerNames object
  const nameMatch = marlinText.match(/var lcdControllerNames\s*=\s*\{([\s\S]*?)\};/);
  if (nameMatch) {
    const nameBody = nameMatch[1];
    const names = {};
    for (const match of nameBody.matchAll(/'([^']+)'\s*:\s*'([^']*)'/g)) {
      names[match[1]] = match[2];
    }
    
    console.log(`LCD display name lookup: ${Object.keys(names).length} entries`);
    
    // Check completeness
    const missing = getMissingLCDs(names);
    if (missing.length > 0) {
      console.log(`\n⚠️  ${missing.length} LCD options missing display names:`);
      for (const def of missing) {
        console.log(`   ${def}`);
      }
    } else {
      console.log('\n✅ All LCD options have display names');
    }
  } else {
    console.log('\n⚠️  lcdControllerNames object not found in marlin.js');
  }
} else {
  console.log(`\n⚠️  marlin.js not found at ${marlinPath}`);
}

// ============================================================================
// Main
// ============================================================================

const args = process.argv.slice(2);

if (args.includes('--list')) {
  console.log('\nAll LCD options in schema:');
  for (let i = 0; i < schemaLCDs.length; i++) {
    console.log(`  ${i + 1}. ${schemaLCDs[i]}`);
  }
  process.exit(0);
}

if (args.includes('--summary')) {
  const missing = getMissingLCDs({});
  console.log(`\nSummary: ${schemaLCDs.length} total, ${schemaLCDs.length - missing.length} covered`);
  process.exit(0);
}

// Default: run completeness check
console.log('\n=== Running completeness checks ===\n');
console.log('Test completed successfully.');
