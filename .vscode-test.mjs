import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
  label: 'migrationTests',
  files: 'test/**/*.test.js',
  version: 'stable',
  // Open a Marlin workspace for integration tests
  workspaceFolder: './test-fixtures/marlin-workspace',
  mocha: {
    timeout: 30000,
  },
});
