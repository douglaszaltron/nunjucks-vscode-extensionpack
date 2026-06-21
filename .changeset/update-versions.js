#!/usr/bin/env node

/**
 * Script to sync the version between package.json and .vscode/launch.json.
 * Automatically executed by changesets after updating package.json.
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../package.json');
const launchJsonPath = path.join(__dirname, '../.vscode/launch.json');

try {
  // Read the updated version from package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = packageJson.version;

  // Update .vscode/launch.json with the same version
  const launchJson = JSON.parse(fs.readFileSync(launchJsonPath, 'utf8'));
  launchJson.version = version;
  fs.writeFileSync(launchJsonPath, JSON.stringify(launchJson, null, 2) + '\n');

  console.log(`✅ Version synced: ${version}`);
  console.log(`   - package.json: ${version}`);
  console.log(`   - .vscode/launch.json: ${version}`);
} catch (error) {
  console.error('❌ Error syncing versions:', error.message);
  process.exit(1);
}
