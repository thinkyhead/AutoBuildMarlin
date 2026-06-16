/**
 * Entry point for VSCode extension integration tests.
 * Runs the test suite inside the Extension Development Host.
 */
const path = require('path');

exports.run = function () {
  const Mocha = require('mocha');
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: 30000,
  });

  return new Promise((resolve, reject) => {
    // Add all test files
    mocha.addFile(path.resolve(__dirname, 'migration.test.js'));

    try {
      mocha.run(failures => {
        if (failures > 0)
          reject(new Error(`${failures} tests failed.`));
        else
          resolve();
      });
    } catch (err) {
      reject(err);
    }
  });
};