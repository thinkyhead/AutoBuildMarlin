#!/usr/bin/env node
/**
 * Auto Build Marlin — Migration Rules Test Harness
 *
 * Tests the migration-rules module by simulating config migration
 * across version chains. Can be run from the shell to verify
 * that migration transforms work correctly.
 *
 * Usage:
 *   node test-migration.js                    # Run all predefined tests
 *   node test-migration.js --dump             # Show the migration step list
 *   node test-migration.js --chain 2.0.5 2.1.2.5  # Show chained steps
 */

'use strict';

const rules = require('./abm/migration-rules');
const path = require('path');
const fs = require('fs');

// ---------------------------------------------------------------
// Test data: sample configs at various version levels
// ---------------------------------------------------------------

function makeSampleConfig_v1_9() {
  return {
    'STRING_CONFIG_H_AUTHOR': { value: '(none)', enabled: true },
    'CUSTOM_MACHINE_NAME': { value: '"My Printer"', enabled: true },
    'MOTHERBOARD': { value: 'BOARD_RAMPS_14_EFB', enabled: true },
    'EXTRUDERS': { value: '1', enabled: true },
    'X_BED_SIZE': { value: '200', enabled: true },
    'Y_BED_SIZE': { value: '200', enabled: true },
    'Z_MAX_POS': { value: '180', enabled: true },
    'TEMP_SENSOR_0': { value: '1', enabled: true },
    'TEMP_SENSOR_BED': { value: '1', enabled: true },
    'POWER_SUPPLY': { value: '1', enabled: true },
    'STRING_SPLASH_LINE1': { value: '"Marlin"', enabled: true },
    'STRING_SPLASH_LINE2': { value: '"www.marlinfw.org"', enabled: false },
    'PS_DEFAULT_OFF': { value: 'true', enabled: false },
    'Z_MIN_PROBE_ENDSTOP': { value: 'true', enabled: true },
    'X_PROBE_OFFSET_FROM_EXTRUDER': { value: '10', enabled: true },
    'Y_PROBE_OFFSET_FROM_EXTRUDER': { value: '-5', enabled: true },
    'Z_PROBE_OFFSET_FROM_EXTRUDER': { value: '0', enabled: true },
    'DISABLE_INACTIVE_EXTRUDER': { value: 'true', enabled: true },
    'MBL_Z_STEP': { value: '0.02', enabled: true },
    'ENDSTOP_NOISE_FILTER': { value: 'true', enabled: true },
    'BABYSTEP_MULTIPLICATOR': { value: '10', enabled: false },
    'MIN_STEPS_PER_SEGMENT': { value: '6', enabled: true },
    'DISABLE_E': { value: 'false', enabled: true },
    'PID_MAX': { value: 'BANG_MAX', enabled: true },
  };
}

function makeSampleConfig_v2_0_5() {
  return {
    'STRING_CONFIG_H_AUTHOR': { value: '(none)', enabled: true },
    'CUSTOM_MACHINE_NAME': { value: '"My Printer"', enabled: true },
    'MOTHERBOARD': { value: 'BOARD_RAMPS_14_EFB', enabled: true },
    'EXTRUDERS': { value: '1', enabled: true },
    'X_BED_SIZE': { value: '200', enabled: true },
    'Y_BED_SIZE': { value: '200', enabled: true },
    'Z_MAX_POS': { value: '180', enabled: true },
    'TEMP_SENSOR_0': { value: '1', enabled: true },
    'TEMP_SENSOR_BED': { value: '1', enabled: true },
    'X_HOME_BUMP_MM': { value: '5', enabled: true },
    'Y_HOME_BUMP_MM': { value: '5', enabled: true },
    'Z_HOME_BUMP_MM': { value: '2', enabled: true },
    'HOMING_BACKOFF_MM': { value: '2', enabled: true },
    'FIL_RUNOUT_INVERTING': { value: 'true', enabled: true },
    'MIN_PROBE_EDGE': { value: '10', enabled: true },
    'CONTROLLERFAN_SECS': { value: '60', enabled: true },
    'CONTROLLERFAN_SPEED': { value: '255', enabled: true },
    'DIGIPOT_I2C': { value: 'true', enabled: true },
    'SD_DETECT_INVERTED': { value: 'true', enabled: true },
    'PTC_PARK_POS_X': { value: '0', enabled: true },
    'PTC_PARK_POS_Y': { value: '0', enabled: true },
    'PTC_PARK_POS_Z': { value: '10', enabled: true },
    'PTC_PROBE_POS_X': { value: '100', enabled: true },
    'PTC_PROBE_POS_Y': { value: '100', enabled: true },
    'PTC_MAX_BED_TEMP': { value: '90', enabled: true },
    'DISABLE_INACTIVE_EXTRUDER': { value: 'true', enabled: true },
  };
}

function makeSampleConfig_v2_1_2() {
  return {
    'STRING_CONFIG_H_AUTHOR': { value: '(none)', enabled: true },
    'CUSTOM_MACHINE_NAME': { value: '"My Printer"', enabled: true },
    'MOTHERBOARD': { value: 'BOARD_RAMPS_14_EFB', enabled: true },
    'EXTRUDERS': { value: '1', enabled: true },
    'X_BED_SIZE': { value: '200', enabled: true },
    'Y_BED_SIZE': { value: '200', enabled: true },
    'Z_MAX_POS': { value: '180', enabled: true },
    'TEMP_SENSOR_0': { value: '1', enabled: true },
    'TEMP_SENSOR_BED': { value: '1', enabled: true },
    'LIN_ADVANCE_K': { value: '0.22', enabled: true },
    'EXTRA_LIN_ADVANCE_K': { value: '0.44', enabled: true },
    'X_MAX_CURRENT': { value: '800', enabled: true },
    'Y_MAX_CURRENT': { value: '800', enabled: true },
    'Z_MAX_CURRENT': { value: '800', enabled: true },
    'E0_MAX_CURRENT': { value: '1000', enabled: true },
    'X_SENSE_RESISTOR': { value: '110', enabled: true },
    'Y_SENSE_RESISTOR': { value: '110', enabled: true },
    'Z_SENSE_RESISTOR': { value: '110', enabled: true },
    'E0_SENSE_RESISTOR': { value: '110', enabled: true },
    'DELTA_SEGMENTS_PER_SECOND': { value: '200', enabled: true },
    'LCD_BACKLIGHT_TIMEOUT': { value: '300', enabled: true },
    'TOUCH_IDLE_SLEEP': { value: '600', enabled: true },
    'CONFIG_EXPORT': { value: '', enabled: true },
    'DISABLE_INACTIVE_E': { value: 'true', enabled: true },
    'DISABLE_INACTIVE_X': { value: 'false', enabled: true },
    'DEFAULT_STEPPER_DEACTIVE_TIME': { value: '120', enabled: true },
    'TMC_SW_MOSI': { value: '66', enabled: true },
    'TMC_SW_MISO': { value: '67', enabled: true },
    'TMC_SW_SCK': { value: '68', enabled: true },
    'FOLDER_SORTING': { value: 'true', enabled: true },
    'BTT_MINI_12864_V1': { value: 'true', enabled: true },
    'TFT_SHARED_SPI': { value: 'true', enabled: true },
    'DISABLE_INACTIVE_EXTRUDER': { value: 'true', enabled: true },
    'EXPERIMENTAL_SCURVE': { value: 'true', enabled: true },
    'DEFAULT_bedKp': { value: '100', enabled: true },
    'DEFAULT_bedKi': { value: '5', enabled: true },
    'DEFAULT_bedKd': { value: '250', enabled: true },
    'DEFAULT_chamberKp': { value: '80', enabled: true },
    'DEFAULT_chamberKi': { value: '4', enabled: true },
    'DEFAULT_chamberKd': { value: '200', enabled: true },
  };
}

// ---------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------

const TESTS = [
  {
    name: '1.1.9 → 2.0.5',
    from: '1.1.9', to: '2.0.5',
    makeConfig: makeSampleConfig_v1_9,
    checks: (cfg, log, w) => {
      const errors = [];
      // Power supply restructured
      if ('POWER_SUPPLY' in cfg) errors.push('POWER_SUPPLY should have been removed');
      if (cfg['PSU_CONTROL']?.value !== 'true') errors.push('PSU_CONTROL should be true');
      if (cfg['PSU_ACTIVE_HIGH']?.value !== 'false') errors.push('PSU_ACTIVE_HIGH should be false');
      // Splash lines removed
      if ('STRING_SPLASH_LINE1' in cfg) errors.push('STRING_SPLASH_LINE1 should have been removed');
      if ('STRING_SPLASH_LINE2' in cfg) errors.push('STRING_SPLASH_LINE2 should have been removed');
      // Probe offset restructured
      if ('X_PROBE_OFFSET_FROM_EXTRUDER' in cfg) errors.push('X_PROBE_OFFSET should have been removed');
      if (cfg['NOZZLE_TO_PROBE_OFFSET']?.value !== '{ 10, -5, 0 }') errors.push('NOZZLE_TO_PROBE_OFFSET value mismatch');
      // Z endstop renamed
      if ('Z_MIN_PROBE_ENDSTOP' in cfg) errors.push('Z_MIN_PROBE_ENDSTOP should have been removed');
      if (cfg['Z_MIN_PROBE_USES_Z_MIN_ENDSTOP_PIN']?.enabled !== true) errors.push('Z_MIN_PROBE_USES should be enabled');
      // Value defaults changed warning
      if (!w.some(l => l.includes('MIN_STEPS_PER_SEGMENT'))) errors.push('Should warn about MIN_STEPS_PER_SEGMENT');
      return errors;
    }
  },
  {
    name: '2.0.5 → 2.0.7',
    from: '2.0.5', to: '2.0.7',
    makeConfig: makeSampleConfig_v2_0_5,
    checks: (cfg, log, w) => {
      const errors = [];
      // HOMING_BUMP_MM should be created from X/Y/Z_HOME_BUMP_MM
      if (cfg['HOMING_BUMP_MM']?.value !== '{ 5, 5, 2 }') errors.push('HOMING_BUMP_MM value mismatch');
      // PROBING_MARGIN from MIN_PROBE_EDGE
      if (cfg['PROBING_MARGIN']?.value !== '10') errors.push('PROBING_MARGIN should be 10');
      // FIL_RUNOUT_INVERTING → FIL_RUNOUT_STATE
      if (cfg['FIL_RUNOUT_STATE']?.value !== 'HIGH') errors.push('FIL_RUNOUT_STATE should be HIGH');
      // CONTROLLERFAN_SECS → CONTROLLERFAN_IDLE_TIME
      if (cfg['CONTROLLERFAN_IDLE_TIME']?.value !== '60') errors.push('CONTROLLERFAN_IDLE_TIME should be 60');
      if (cfg['CONTROLLERFAN_SPEED_ACTIVE']?.value !== '255') errors.push('CONTROLLERFAN_SPEED_ACTIVE should be 255');
      // SD_DETECT_INVERTED → SD_DETECT_STATE
      if (cfg['SD_DETECT_STATE']?.value !== 'LOW') errors.push('SD_DETECT_STATE should be LOW (inverted was true)');
      // PTC_PARK_POS restructured
      if (cfg['PTC_PARK_POS']?.value !== '{ 0, 0, 10 }') errors.push('PTC_PARK_POS value mismatch');
      if (cfg['PTC_PROBE_POS']?.value !== '{ 100, 100 }') errors.push('PTC_PROBE_POS value mismatch');
      // PTC_MAX_BED_TEMP removed
      if ('PTC_MAX_BED_TEMP' in cfg) errors.push('PTC_MAX_BED_TEMP should have been removed');
      return errors;
    }
  },
  {
    name: '2.1.2 → 2.1.2.2 + PID case fixes',
    from: '2.1.2', to: '2.1.2.6',
    makeConfig: makeSampleConfig_v2_1_2,
    checks: (cfg, log, w) => {
      const errors = [];
      // LIN_ADVANCE_K → ADVANCE_K
      if (cfg['ADVANCE_K']?.value !== '0.22') errors.push('ADVANCE_K should be 0.22');
      if ('LIN_ADVANCE_K' in cfg) errors.push('LIN_ADVANCE_K should have been removed');
      // EXTRA_LIN_ADVANCE_K → ADVANCE_K_EXTRA
      if (cfg['ADVANCE_K_EXTRA']?.value !== '0.44') errors.push('ADVANCE_K_EXTRA should be 0.44');
      // X_MAX_CURRENT → X_CURRENT, etc.
      if (cfg['X_CURRENT']?.value !== '800') errors.push('X_CURRENT should be 800');
      if ('X_MAX_CURRENT' in cfg) errors.push('X_MAX_CURRENT should have been removed');
      // X_SENSE_RESISTOR 110 → X_RSENSE 0.11
      if (cfg['X_RSENSE']?.value !== '0.11') errors.push('X_RSENSE should be 0.11');
      // DELTA_SEGMENTS_PER_SECOND → DEFAULT_SEGMENTS_PER_SECOND
      if (cfg['DEFAULT_SEGMENTS_PER_SECOND']?.value !== '200') errors.push('DEFAULT_SEGMENTS_PER_SECOND should be 200');
      // LCD_BACKLIGHT_TIMEOUT → LCD_BACKLIGHT_TIMEOUT_MINS (300s = 5 min)
      if (cfg['LCD_BACKLIGHT_TIMEOUT_MINS']?.value !== '5') errors.push('LCD_BACKLIGHT_TIMEOUT_MINS should be 5');
      // CONFIG_EXPORT should be set to 2
      if (cfg['CONFIG_EXPORT']?.value !== '2') errors.push('CONFIG_EXPORT should be 2');
      // DISABLE_INACTIVE_E → DISABLE_IDLE_E
      if (cfg['DISABLE_IDLE_E']?.value !== 'true') errors.push('DISABLE_IDLE_E should be true');
      if ('DISABLE_INACTIVE_E' in cfg) errors.push('DISABLE_INACTIVE_E should have been removed');
      // TMC_SW_MOSI → TMC_SPI_MOSI
      if (cfg['TMC_SPI_MOSI']?.value !== '66') errors.push('TMC_SPI_MOSI should be 66');
      // DEFAULT_STEPPER_DEACTIVE_TIME → DEFAULT_STEPPER_TIMEOUT_SEC
      if (cfg['DEFAULT_STEPPER_TIMEOUT_SEC']?.value !== '120') errors.push('DEFAULT_STEPPER_TIMEOUT_SEC should be 120');
      // FOLDER_SORTING → SDSORT_FOLDERS
      if (cfg['SDSORT_FOLDERS']?.value !== 'true') errors.push('SDSORT_FOLDERS should be true');
      // BTT_MINI_12864_V1 → BTT_MINI_12864
      if (cfg['BTT_MINI_12864']?.value !== 'true') errors.push('BTT_MINI_12864 should be true');
      // DISABLE_INACTIVE_EXTRUDER → DISABLE_OTHER_EXTRUDERS
      if (cfg['DISABLE_OTHER_EXTRUDERS']?.value !== 'true') errors.push('DISABLE_OTHER_EXTRUDERS should be true');
      // PID case fixes
      if (cfg['DEFAULT_BED_KP']?.value !== '100') errors.push('DEFAULT_BED_KP should be 100');
      if ('DEFAULT_bedKp' in cfg) errors.push('DEFAULT_bedKp should have been removed');
      if (cfg['DEFAULT_CHAMBER_KP']?.value !== '80') errors.push('DEFAULT_CHAMBER_KP should be 80');
      if ('DEFAULT_chamberKi' in cfg) errors.push('DEFAULT_chamberKi should have been removed');
      return errors;
    }
  },
];

// ---------------------------------------------------------------
// Results reporter
// ---------------------------------------------------------------

function runTests() {
  let passed = 0, failed = 0;

  for (const test of TESTS) {
    const label = `  [${test.name}] (${test.from} → ${test.to})`;
    process.stdout.write(label + ' '.repeat(Math.max(1, 52 - label.length)));

    try {
      const cfg = test.makeConfig();
      const { config, log, warnings } = rules.migrateConfig(cfg, test.from, test.to);

      const errors = test.checks(config, log, warnings);
      if (errors.length === 0) {
        console.log(' ✅ PASS');
        passed++;
      } else {
        console.log(' ❌ FAIL');
        console.log('      ' + errors.join('\n      '));
        failed++;
      }
    } catch (e) {
      console.log(' ❌ ERROR');
      console.log('      ' + e.message);
      failed++;
    }
  }

  console.log('');
  console.log(`  ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// ---------------------------------------------------------------
// Dump the migration step list
// ---------------------------------------------------------------

function dumpSteps() {
  console.log('');
  console.log('Migration Steps (ordered):');
  console.log('══════════════════════════');
  for (const step of rules.migrationSteps) {
    const note = step.note ? ` (${step.note})` : '';
    const renameCount = step.rename ? Object.keys(step.rename).length : 0;
    const transformCount = step.transforms ? step.transforms.length : 0;
    const warnCount = step.warnings ? step.warnings.length : 0;
    const actions = [];
    if (renameCount) actions.push(`${renameCount} renames`);
    if (transformCount) actions.push(`${transformCount} transforms`);
    if (warnCount) actions.push(`${warnCount} warnings`);
    console.log(`  ${step.from.padEnd(12)} → ${step.to.padEnd(12)} ${note.padEnd(28)} ${actions.join(', ')}`);
  }
}

// ---------------------------------------------------------------
// Show the chain of steps between two versions
// ---------------------------------------------------------------

function showChain(from, to) {
  console.log(`\n  Version chain: ${from} → ${to}\n`);
  let count = 0;
  for (const step of rules.migrationSteps) {
    if (rules.versionToHex(step.from) >= rules.versionToHex(to)) break;
    if (rules.versionToHex(step.to) <= rules.versionToHex(from) && step.from !== step.to) continue;
    count++;
    console.log(`    ${count}. ${step.from} → ${step.to}${step.note ? ` (${step.note})` : ''}`);
  }
  console.log(`\n    ${count} migration steps`);
}

// ---------------------------------------------------------------
// Main
// ---------------------------------------------------------------

const args = process.argv.slice(2);

if (args.includes('--dump')) {
  dumpSteps();
} else if (args.includes('--chain')) {
  const fromIdx = args.indexOf('--chain') + 1;
  const toIdx = fromIdx + 1;
  if (fromIdx < args.length && toIdx < args.length) {
    showChain(args[fromIdx], args[toIdx]);
  } else {
    console.log('Usage: node test-migration.js --chain <from> <to>');
  }
} else {
  console.log('\n  ╔══════════════════════════════════════════════╗');
  console.log('  ║  Auto Build Marlin — Migration Rules Tests  ║');
  console.log('  ╚══════════════════════════════════════════════╝\n');
  const ok = runTests();
  process.exit(ok ? 0 : 1);
}