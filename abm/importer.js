/**
 * Auto Build Marlin
 * abm/importer.js - Importer to update Marlin configs from older versions.
 *
 * These methods are used to read a set of config files from an older Marlin
 * version and convert them to the current version. The old configs may already
 * be in the Marlin folder in which case they are "migrated." For "import" we
 * first present a file picker to select the location of the old configs.
 *
 * In order to correctly parse the old configs, we also need the Conditionals_LCD.h
 * file for the old version. So these files are embedded in the extension.
 *
 * We can minimize Conditionals_LCD.h by removing comments, blank lines, and
 * defines that are not used in Configuration_adv.h.
 *
 * Strategy:
 * - We will be updating enabled and disabled options because users may have
 *   placeholders for options they aren't using.
 * - Read the user's config files and the appropriate embedded Conditionals_LCD.h
 *   file into a schema object.
 * - Run all update functions in succession to bring the config data up to date
 *   with the current Marlin version.
 * - Read the config files embedded in config, apply the config options from the
 *   updated schema to the new config files and save them, backing up the old configs
 *   in a folder within the project folder.
 * - We can also write a Config.h file with just the enabled options, which may be
 *   more convenient for the user.
 *
 */

const marlin = require('./marlin'),
       prefs = require('./prefs'),
        path = require('path'),
          fs = require('fs'),
          os = require('os');

const vscode = require('vscode'),
          vc = vscode.commands,
          ws = vscode.workspace,
          vw = vscode.window;

/**
 * The config/backup folder is used for backups of configs before modifying them.
 * We rely on building with system GCC using ABM copies of Conditionals_LCD.h.
 */

/**
 * Apply settings from config files in the config/ folder
 * to the current default config files.
 */
function do_import() {
}

/**
 * Update old drop-in config files to the current Marlin version.
 */
function do_migrate() {
}

module.exports = { do_import, do_migrate };
