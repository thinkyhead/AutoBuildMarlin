#!/usr/bin/env node
/**
 * Generate diff patches between consecutive Marlin config versions.
 * Outputs .patch files in each target version's configs/ directory.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const CONFIGS_DIR = path.join(ROOT, 'configs');

// Get sorted version directories
const versions = fs.readdirSync(CONFIGS_DIR)
  .filter(d => fs.statSync(path.join(CONFIGS_DIR, d)).isDirectory())
  .sort((a, b) => {
    // Version-aware sort
    const pa = a.split(/[.-]/).map(n => parseInt(n) || 0);
    const pb = b.split(/[.-]/).map(n => parseInt(n) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const na = pa[i] || 0, nb = pb[i] || 0;
      if (na !== nb) return na - nb;
    }
    return 0;
  });

console.log(`Found ${versions.length} versions:`, versions.join(', '));

const filesToDiff = ['Configuration.h', 'Configuration_adv.h'];

for (let i = 1; i < versions.length; i++) {
  const prevVer = versions[i - 1];
  const currVer = versions[i];
  const prevDir = path.join(CONFIGS_DIR, prevVer);
  const currDir = path.join(CONFIGS_DIR, currVer);

  console.log(`\n=== ${prevVer} → ${currVer} ===`);

  for (const fname of filesToDiff) {
    const prevFile = path.join(prevDir, fname);
    const currFile = path.join(currDir, fname);

    if (!fs.existsSync(prevFile)) {
      console.log(`  ${fname}: SKIP (no ${prevVer}/${fname})`);
      continue;
    }
    if (!fs.existsSync(currFile)) {
      console.log(`  ${fname}: SKIP (no ${currVer}/${fname})`);
      continue;
    }

    try {
      // Generate unified diff
      const diff = execSync(`diff -u "${prevFile}" "${currFile}"`, {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024
      });

      if (diff.trim().length === 0) {
        console.log(`  ${fname}: No changes`);
        continue;
      }

      // Write .patch file in current version directory
      const patchPath = path.join(currDir, `${fname.toLowerCase().replace('.h', '')}-${prevVer}-${currVer}.patch`);
      fs.writeFileSync(patchPath, diff, 'utf8');
      const lines = diff.split('\n').length;
      console.log(`  ${fname}: ${diff.length} bytes, ${lines} lines → ${path.basename(patchPath)}`);
    } catch (e) {
      // diff returns exit code 1 when files differ, 0 when same
      if (e.status === 1 && e.stdout) {
        const diff = e.stdout.toString();
        const patchPath = path.join(currDir, `${fname.toLowerCase().replace('.h', '')}-${prevVer}-${currVer}.patch`);
        fs.writeFileSync(patchPath, diff, 'utf8');
        const lines = diff.split('\n').length;
        console.log(`  ${fname}: ${diff.length} bytes, ${lines} lines → ${path.basename(patchPath)}`);
      } else if (e.status === 0) {
        console.log(`  ${fname}: No changes`);
      } else {
        console.error(`  ${fname}: ERROR - ${e.message}`);
      }
    }
  }
}

console.log('\nDone generating diffs.');
