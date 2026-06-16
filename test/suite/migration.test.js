/**
 * Migration integration tests for Auto Build Marlin.
 *
 * These tests run inside the VSCode Extension Development Host
 * and have full access to the VSCode API. They verify that
 * do_migrate() works correctly with real config files.
 */
'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');

const vscode = require('vscode');
const migRules = require('../../abm/migration-rules');
const { parseConfigsToFlatData, flatDataToConfigIni } = require('../../abm/importer');

suite('Config Migration Integration Tests', function () {

  // Path to test workspace
  const workspaceRoot = path.resolve(__dirname, '../../test-fixtures/marlin-workspace');

  test('migration-rules module loads and has expected API', function () {
    assert.ok(migRules.migrationSteps, 'migrationSteps should exist');
    assert.ok(migRules.migrateConfig, 'migrateConfig should exist');
    assert.ok(migRules.hexToVersion, 'hexToVersion should exist');
    assert.ok(migRules.versionToHex, 'versionToHex should exist');
    assert.ok(Array.isArray(migRules.migrationSteps), 'migrationSteps should be an array');
    assert.ok(migRules.migrationSteps.length >= 40, 'should have 40+ migration steps');
  });

  test('hexToVersion handles various formats', function () {
    assert.strictEqual(migRules.hexToVersion('010109'), '1.1.9');
    assert.strictEqual(migRules.hexToVersion('020005'), '2.0.5');
    assert.strictEqual(migRules.hexToVersion('02010201'), '2.1.2.1');
    assert.strictEqual(migRules.hexToVersion('02010300'), '2.1.3');
    assert.strictEqual(migRules.hexToVersion(''), '');
  });

  test('parseConfigsToFlatData extracts options from fixture configs', function () {
    const configH = fs.readFileSync(path.join(workspaceRoot, 'Marlin', 'Configuration.h'), 'utf8');
    const configAdvH = fs.readFileSync(path.join(workspaceRoot, 'Marlin', 'Configuration_adv.h'), 'utf8');

    const data = parseConfigsToFlatData(configH, configAdvH, '');

    // Should have parsed many options
    assert.ok(Object.keys(data).length > 500, 'should have 500+ options');

    // Should detect the motherboard
    assert.ok('MOTHERBOARD' in data, 'MOTHERBOARD should be present');
    assert.ok(data.MOTHERBOARD.enabled, 'MOTHERBOARD should be enabled');

    // Should find version in config
    const hexMatch = configH.match(/^#define\s+CONFIGURATION_H_VERSION\s+(\S+)/m);
    assert.ok(hexMatch, 'CONFIGURATION_H_VERSION should be found');
    assert.strictEqual(hexMatch[1], '020005', 'fixture should be version 2.0.5');
  });

  test('migrateConfig transforms a 2.0.5 config to 2.1.2.1', function () {
    const configH = fs.readFileSync(path.join(workspaceRoot, 'Marlin', 'Configuration.h'), 'utf8');
    const configAdvH = fs.readFileSync(path.join(workspaceRoot, 'Marlin', 'Configuration_adv.h'), 'utf8');

    const data = parseConfigsToFlatData(configH, configAdvH, '');
    const result = migRules.migrateConfig(data, '2.0.5', '2.1.2.1');

    // Should produce a migrated config
    assert.ok(result.config, 'migrated config should exist');
    assert.ok(result.log, 'change log should exist');
    assert.ok(result.log.length > 10, 'should have 10+ log entries');

    // Old-style options should be renamed
    assert.ok(!('FIL_RUNOUT_INVERTING' in result.config), 'FIL_RUNOUT_INVERTING should be gone');
    assert.ok(result.config.FIL_RUNOUT_STATE, 'FIL_RUNOUT_STATE should exist');

    // Should generate config.ini
    const ini = flatDataToConfigIni(result.config);
    assert.ok(ini.includes('X_BED_SIZE'), 'config.ini should contain X_BED_SIZE');
    assert.ok(ini.length > 1000, 'config.ini should be substantial');
  });

  test('migrateConfig handles idempotent re-runs', function () {
    const configH = fs.readFileSync(path.join(workspaceRoot, 'Marlin', 'Configuration.h'), 'utf8');
    const configAdvH = fs.readFileSync(path.join(workspaceRoot, 'Marlin', 'Configuration_adv.h'), 'utf8');

    const data = parseConfigsToFlatData(configH, configAdvH, '');
    const r1 = migRules.migrateConfig(data, '2.0.5', '2.1.2.1');
    const r2 = migRules.migrateConfig(r1.config, '2.0.5', '2.1.2.1');

    // Running a second time should not change anything
    // The migrated config at 2.0.5→2.1.2.1 has post-migration names,
    // so re-running is idempotent.
    assert.strictEqual(
      Object.keys(r1.config).length,
      Object.keys(r2.config).length,
      'idempotent: same number of options'
    );
  });

  test('backup directory creation', function () {
    const backupDir = path.join(workspaceRoot, 'config', 'backup');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const destDir = path.join(backupDir, `pre-migrate-${stamp}`);

    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(
      path.join(workspaceRoot, 'Marlin', 'Configuration.h'),
      path.join(destDir, 'Configuration.h')
    );

    assert.ok(fs.existsSync(path.join(destDir, 'Configuration.h')), 'backup file should exist');
  });

  test('migration chain from workspace', async function () {
    // Simulate what do_migrate() does:
    // 1. Read configs
    const configText = fs.readFileSync(path.join(workspaceRoot, 'Marlin', 'Configuration.h'), 'utf8');
    const configAdvText = fs.readFileSync(path.join(workspaceRoot, 'Marlin', 'Configuration_adv.h'), 'utf8');
    const versionText = fs.readFileSync(path.join(workspaceRoot, 'Marlin', 'src', 'inc', 'Version.h'), 'utf8');

    // 2. Detect versions
    const hexcMatch = configText.match(/^#define\s+CONFIGURATION_H_VERSION\s+(\S+)/m);
    const hexvMatch = versionText.match(/^#define\s+MARLIN_HEX_VERSION\s+(\S+)/m);
    assert.ok(hexcMatch, 'should find CONFIGURATION_H_VERSION');
    assert.ok(hexvMatch, 'should find MARLIN_HEX_VERSION');

    const srcVer = migRules.hexToVersion(hexcMatch[1]);
    const tgtVer = migRules.hexToVersion(hexvMatch[1]);

    assert.strictEqual(srcVer, '2.0.5', 'source should be 2.0.5');
    assert.strictEqual(tgtVer, '2.1.2.1', 'target should be 2.1.2.1');

    // 3. Parse and migrate
    const data = parseConfigsToFlatData(configText, configAdvText, '');
    const result = migRules.migrateConfig(data, srcVer, tgtVer);

    // 4. Write config.ini
    const iniPath = path.join(workspaceRoot, 'Marlin', 'config.ini');
    fs.writeFileSync(iniPath, flatDataToConfigIni(result.config), 'utf8');

    // 5. Verify
    assert.ok(fs.existsSync(iniPath), 'config.ini should be written');
    const iniContent = fs.readFileSync(iniPath, 'utf8');
    assert.ok(iniContent.includes('X_BED_SIZE'), 'config.ini should have X_BED_SIZE');
    assert.ok(iniContent.includes('MOTHERBOARD'), 'config.ini should have MOTHERBOARD');
    assert.ok(iniContent.includes('020005'), 'config.ini should reference old version info');

    // Clean up
    fs.unlinkSync(iniPath);
  });

});