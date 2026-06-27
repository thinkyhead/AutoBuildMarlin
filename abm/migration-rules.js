/**
 * Auto Build Marlin
 * abm/migration-rules.js
 *
 * Version-to-version migration rules for Marlin configuration options.
 *
 * Each migration step defines how options are renamed, restructured,
 * or removed between two Marlin versions.
 *
 * The migration data format works on a flat config object:
 *   { 'OPTION_NAME': { value: '42', enabled: true }, ... }
 *
 * Simple renames just map oldName → newName.
 * Complex transforms use function handlers for restructuring.
 * Removed options are mapped to null.
 *
 * Usage:
 *   const rules = require('./migration-rules');
 *   const result = rules.migrateConfig(configData, '2.0.5', '2.1.3');
 *   // result.config  — migrated config data
 *   // result.log     — array of change descriptions
 *   // result.warnings — items needing user attention
 */

// ============================================================
// Utility helpers used by transform functions
// ============================================================

/**
 * Rename an option in-place within the config object.
 */
function _rename(config, log, oldName, newName) {
  if (!(oldName in config)) return;
  if (newName === null) {
    delete config[oldName];
    log.push(`REMOVED ${oldName}`);
    return;
  }
  if (oldName === newName) {
    log.push(`  ↳ ${oldName} preserved`);
    return;
  }
  config[newName] = { ...config[oldName] };
  delete config[oldName];
  log.push(`RENAMED ${oldName} → ${newName}`);
}

/**
 * Set an option's value, creating it if needed.
 */
function _set(config, name, value, enabled = true) {
  config[name] = { value: String(value), enabled };
}

/**
 * Remove an option entirely.
 */
function _remove(config, log, name) {
  if (name in config) {
    delete config[name];
    log.push(`REMOVED ${name}`);
  }
}

// ============================================================
// Transform functions for complex per-version restructures
// ============================================================

// --- 1.1.9 → 2.0.0 ---

function _t190_200_power_supply(config, log, w) {
  // POWER_SUPPLY 1 → PSU_CONTROL, PSU_ACTIVE_HIGH false
  // POWER_SUPPLY 2 → PSU_CONTROL, PSU_ACTIVE_HIGH true
  if ('POWER_SUPPLY' in config) {
    const v = config['POWER_SUPPLY'].value;
    if (v === '1') {
      _set(config, 'PSU_CONTROL', 'true');
      _set(config, 'PSU_ACTIVE_HIGH', 'false');
      log.push('POWER_SUPPLY 1 → PSU_CONTROL + PSU_ACTIVE_HIGH false');
    } else if (v === '2') {
      _set(config, 'PSU_CONTROL', 'true');
      _set(config, 'PSU_ACTIVE_HIGH', 'true');
      log.push('POWER_SUPPLY 2 → PSU_CONTROL + PSU_ACTIVE_HIGH true');
    }
    delete config['POWER_SUPPLY'];
  }
}

function _t190_200_z_probe(config, log, w) {
  // Z_MIN_PROBE_ENDSTOP → //Z_MIN_PROBE_USES_Z_MIN_ENDSTOP_PIN
  if ('Z_MIN_PROBE_ENDSTOP' in config) {
    const v = config['Z_MIN_PROBE_ENDSTOP'];
    if (v.enabled) {
      _set(config, 'Z_MIN_PROBE_USES_Z_MIN_ENDSTOP_PIN', 'true');
    } else {
      config['Z_MIN_PROBE_USES_Z_MIN_ENDSTOP_PIN'] = { value: 'true', enabled: false };
    }
    delete config['Z_MIN_PROBE_ENDSTOP'];
    log.push('Z_MIN_PROBE_ENDSTOP → Z_MIN_PROBE_USES_Z_MIN_ENDSTOP_PIN');
  }
}

function _t190_200_probe_offset(config, log, w) {
  // X_PROBE_OFFSET_FROM_EXTRUDER, Y_PROBE_OFFSET_FROM_EXTRUDER, Z_PROBE_OFFSET_FROM_EXTRUDER
  // → NOZZLE_TO_PROBE_OFFSET { x, y, z }
  const xOff = config['X_PROBE_OFFSET_FROM_EXTRUDER'],
        yOff = config['Y_PROBE_OFFSET_FROM_EXTRUDER'],
        zOff = config['Z_PROBE_OFFSET_FROM_EXTRUDER'];
  if (xOff || yOff || zOff) {
    const x = xOff ? xOff.value : '0',
          y = yOff ? yOff.value : '0',
          z = zOff ? zOff.value : '0';
    _set(config, 'NOZZLE_TO_PROBE_OFFSET', `{ ${x}, ${y}, ${z} }`);
    _remove(config, log, 'X_PROBE_OFFSET_FROM_EXTRUDER');
    _remove(config, log, 'Y_PROBE_OFFSET_FROM_EXTRUDER');
    _remove(config, log, 'Z_PROBE_OFFSET_FROM_EXTRUDER');
    log.push('X/Y/Z_PROBE_OFFSET_FROM_EXTRUDER → NOZZLE_TO_PROBE_OFFSET');
  }
}

function _t190_200_allen_key(config, log, w) {
  // Z_PROBE_ALLEN_KEY_DEPLOY_1_X, _1_Y, _1_Z → Z_PROBE_ALLEN_KEY_DEPLOY_1 { x, y, z }
  for (let i = 1; i <= 4; i++) {
    const x = config[`Z_PROBE_ALLEN_KEY_DEPLOY_${i}_X`],
          y = config[`Z_PROBE_ALLEN_KEY_DEPLOY_${i}_Y`],
          z = config[`Z_PROBE_ALLEN_KEY_DEPLOY_${i}_Z`];
    if (x || y || z) {
      _set(config, `Z_PROBE_ALLEN_KEY_DEPLOY_${i}`,
        `{ ${x ? x.value : '0'}, ${y ? y.value : '0'}, ${z ? z.value : '0'} }`);
      _remove(config, log, `Z_PROBE_ALLEN_KEY_DEPLOY_${i}_X`);
      _remove(config, log, `Z_PROBE_ALLEN_KEY_DEPLOY_${i}_Y`);
      _remove(config, log, `Z_PROBE_ALLEN_KEY_DEPLOY_${i}_Z`);
    }
  }
}

function _t190_200_disable_inactive(config, log, w) {
  // DISABLE_INACTIVE_EXTRUDER true → DISABLE_INACTIVE_EXTRUDER (as switch)
  // DISABLE_INACTIVE_EXTRUDER false → //DISABLE_INACTIVE_EXTRUDER
  if ('DISABLE_INACTIVE_EXTRUDER' in config) {
    const v = config['DISABLE_INACTIVE_EXTRUDER'];
    if (v.enabled && v.value !== 'false') {
      config['DISABLE_INACTIVE_EXTRUDER'] = { value: 'true', enabled: true };
    } else {
      config['DISABLE_INACTIVE_EXTRUDER'] = { value: 'true', enabled: false };
    }
    log.push('DISABLE_INACTIVE_EXTRUDER → switch form');
  }
}

// --- 2.0.0 → 2.0.1 ---
// Simple renames only.

// --- 2.0.1 → 2.0.2 ---

function _t201_202_dgus(config, log, w) {
  // DGUS_LCD → DGUS_LCD_UI_ORIGIN | FYSETC | HIPRECY (user must pick)
  const dgus = config['DGUS_LCD'];
  if (dgus && dgus.enabled) {
    w.push('⚠️ DGUS_LCD → DGUS_LCD_UI_ORIGIN, DGUS_LCD_UI_FYSETC, or DGUS_LCD_UI_HIPRECY — pick one');
    delete config['DGUS_LCD'];
    // Default to ORIGIN; user must verify
    _set(config, 'DGUS_LCD_UI_ORIGIN', 'true');
    log.push('DGUS_LCD → DGUS_LCD_UI_ORIGIN (default — verify)');
  }
}

function _t201_202_z_stepper(config, log, w) {
  // Z_DUAL_STEPPER_DRIVERS → NUM_Z_STEPPER_DRIVERS 2
  if ('Z_DUAL_STEPPER_DRIVERS' in config) {
    const wasEnabled = config['Z_DUAL_STEPPER_DRIVERS'].enabled;
    _remove(config, log, 'Z_DUAL_STEPPER_DRIVERS');
    if (wasEnabled)
      _set(config, 'NUM_Z_STEPPER_DRIVERS', '2');
    log.push('Z_DUAL_STEPPER_DRIVERS  → NUM_Z_STEPPER_DRIVERS 2');
  }
  if ('Z_TRIPLE_STEPPER_DRIVERS' in config) {
    const wasEnabled = config['Z_TRIPLE_STEPPER_DRIVERS'].enabled;
    _remove(config, log, 'Z_TRIPLE_STEPPER_DRIVERS');
    if (wasEnabled)
      _set(config, 'NUM_Z_STEPPER_DRIVERS', '3');
    log.push('Z_TRIPLE_STEPPER_DRIVERS → NUM_Z_STEPPER_DRIVERS 3');
  }
}

// --- 2.0.3 → 2.0.4 ---

function _t203_204_level_corners(config, log, w) {
  // LEVEL_CORNERS_INSET # → LEVEL_CORNERS_INSET_LFRB { #, #, #, # }
  if ('LEVEL_CORNERS_INSET' in config) {
    const v = config['LEVEL_CORNERS_INSET'].value;
    _set(config, 'LEVEL_CORNERS_INSET_LFRB', `{ ${v}, ${v}, ${v}, ${v} }`);
    _remove(config, log, 'LEVEL_CORNERS_INSET');
    log.push(`LEVEL_CORNERS_INSET ${v} → LEVEL_CORNERS_INSET_LFRB`);
  }
}

function _t203_204_rumba32(config, log, w) {
  // BOARD_RUMBA32 → BOARD_RUMBA32_AUS3D or BOARD_RUMBA32_MKS (user must pick)
  if ('BOARD_RUMBA32' in config) {
    w.push('⚠️ BOARD_RUMBA32 → BOARD_RUMBA32_AUS3D or BOARD_RUMBA32_MKS — pick one');
    _remove(config, log, 'BOARD_RUMBA32');
  }
}

// --- 2.0.4 → 2.0.5 ---

function _t204_205_controllerfan(config, log, w) {
  // CONTROLLERFAN_SECS → CONTROLLERFAN_IDLE_TIME
  if ('CONTROLLERFAN_SECS' in config) {
    _set(config, 'CONTROLLERFAN_IDLE_TIME', config['CONTROLLERFAN_SECS'].value);
    _remove(config, log, 'CONTROLLERFAN_SECS');
  }
  // CONTROLLERFAN_SPEED → CONTROLLERFAN_SPEED_ACTIVE
  if ('CONTROLLERFAN_SPEED' in config) {
    _set(config, 'CONTROLLERFAN_SPEED_ACTIVE', config['CONTROLLERFAN_SPEED'].value);
    _remove(config, log, 'CONTROLLERFAN_SPEED');
  }
  // CONTROLLERFAN_SPEED_Z_ONLY # → CONTROLLER_FAN_USE_Z_ONLY + CONTROLLERFAN_SPEED_ACTIVE #
  if ('CONTROLLERFAN_SPEED_Z_ONLY' in config) {
    const v = config['CONTROLLERFAN_SPEED_Z_ONLY'];
    _set(config, 'CONTROLLER_FAN_USE_Z_ONLY', 'true');
    _set(config, 'CONTROLLERFAN_SPEED_ACTIVE', v.value);
    _remove(config, log, 'CONTROLLERFAN_SPEED_Z_ONLY');
    log.push('CONTROLLERFAN_SPEED_Z_ONLY → CONTROLLER_FAN_USE_Z_ONLY + CONTROLLERFAN_SPEED_ACTIVE');
  }
}

function _t204_205_sd_detect(config, log, w) {
  // SD_DETECT_INVERTED → SD_DETECT_STATE LOW (if enabled) or HIGH (if disabled)
  if ('SD_DETECT_INVERTED' in config) {
    const v = config['SD_DETECT_INVERTED'];
    _set(config, 'SD_DETECT_STATE', v.enabled ? 'LOW' : 'HIGH');
    _remove(config, log, 'SD_DETECT_INVERTED');
    log.push(`SD_DETECT_INVERTED → SD_DETECT_STATE ${v.enabled ? 'LOW' : 'HIGH'}`);
  }
}

// --- 2.0.5 → 2.0.6 ---

function _t205_206_fil_runout(config, log, w) {
  // FIL_RUNOUT_INVERTING false|true → FIL_RUNOUT_STATE LOW|HIGH
  if ('FIL_RUNOUT_INVERTING' in config) {
    const v = config['FIL_RUNOUT_INVERTING'];
    _set(config, 'FIL_RUNOUT_STATE', v.value === 'true' || (v.enabled && !v.value) ? 'HIGH' : 'LOW');
    _remove(config, log, 'FIL_RUNOUT_INVERTING');
    log.push('FIL_RUNOUT_INVERTING → FIL_RUNOUT_STATE');
  }
}

function _t205_206_home_bump(config, log, w) {
  // X_HOME_BUMP_MM, Y_HOME_BUMP_MM, Z_HOME_BUMP_MM → HOMING_BUMP_MM { x, y, z }
  const xb = config['X_HOME_BUMP_MM'],
        yb = config['Y_HOME_BUMP_MM'],
        zb = config['Z_HOME_BUMP_MM'];
  if (xb || yb || zb) {
    _set(config, 'HOMING_BUMP_MM', `{ ${xb ? xb.value : '0'}, ${yb ? yb.value : '0'}, ${zb ? zb.value : '0'} }`);
    if (xb) _remove(config, log, 'X_HOME_BUMP_MM');
    if (yb) _remove(config, log, 'Y_HOME_BUMP_MM');
    if (zb) _remove(config, log, 'Z_HOME_BUMP_MM');
  }
}

function _t205_206_min_probe_edge(config, log, w) {
  // MIN_PROBE_EDGE → PROBING_MARGIN
  if ('MIN_PROBE_EDGE' in config) {
    _set(config, 'PROBING_MARGIN', config['MIN_PROBE_EDGE'].value);
    _remove(config, log, 'MIN_PROBE_EDGE');
  }
  // MIN_PROBE_EDGE_* → PROBING_MARGIN_*
  const prefixes = ['MIN_PROBE_EDGE_'],
        dims = ['X', 'Y', 'Z', 'XMIN', 'XMAX', 'YMIN', 'YMAX', 'ZMIN', 'ZMAX'];
  for (const p of prefixes)
    for (const d of dims) {
      const old = `${p}${d}`;
      if (old in config) {
        const newK = `PROBING_MARGIN_${d}`;
        _set(config, newK, config[old].value);
        _remove(config, log, old);
      }
    }
}

function _t205_206_ptc_park(config, log, w) {
  // PTC_PARK_POS_[XYZ] # → PTC_PARK_POS { x, y, z }
  const x = config['PTC_PARK_POS_X'],
        y = config['PTC_PARK_POS_Y'],
        z = config['PTC_PARK_POS_Z'];
  if (x || y || z) {
    _set(config, 'PTC_PARK_POS', `{ ${x ? x.value : '0'}, ${y ? y.value : '0'}, ${z ? z.value : '0'} }`);
    if (x) _remove(config, log, 'PTC_PARK_POS_X');
    if (y) _remove(config, log, 'PTC_PARK_POS_Y');
    if (z) _remove(config, log, 'PTC_PARK_POS_Z');
  }
  // PTC_PROBE_POS_[XY] # → PTC_PROBE_POS { x, y }
  const px = config['PTC_PROBE_POS_X'],
        py = config['PTC_PROBE_POS_Y'];
  if (px || py) {
    _set(config, 'PTC_PROBE_POS', `{ ${px ? px.value : '0'}, ${py ? py.value : '0'} }`);
    if (px) _remove(config, log, 'PTC_PROBE_POS_X');
    if (py) _remove(config, log, 'PTC_PROBE_POS_Y');
  }
}

// --- 2.0.6 → 2.0.7 ---
// Simple renames only.

// --- 2.0.7 → 2.0.8 ---

function _t207_208_tft(config, log, w) {
  // TFT_320x240 → TFT_INTERFACE_FSMC, TFT_RES_320x240
  if ('TFT_320x240' in config && config['TFT_320x240'].enabled) {
    _set(config, 'TFT_INTERFACE_FSMC', 'true');
    _set(config, 'TFT_RES_320x240', 'true');
    _remove(config, log, 'TFT_320x240');
  }
  if ('TFT_320x240_SPI' in config && config['TFT_320x240_SPI'].enabled) {
    _set(config, 'TFT_INTERFACE_SPI', 'true');
    _set(config, 'TFT_RES_320x240', 'true');
    _remove(config, log, 'TFT_320x240_SPI');
    log.push('TFT_320x240_SPI → TFT_INTERFACE_SPI + TFT_RES_320x240');
  }
  if ('TFT_480x320' in config && config['TFT_480x320'].enabled) {
    _set(config, 'TFT_INTERFACE_FSMC', 'true');
    _set(config, 'TFT_RES_480x320', 'true');
    _remove(config, log, 'TFT_480x320');
    log.push('TFT_480x320 → TFT_INTERFACE_FSMC + TFT_RES_480x320');
  }
  if ('TFT_480x320_SPI' in config && config['TFT_480x320_SPI'].enabled) {
    _set(config, 'TFT_INTERFACE_SPI', 'true');
    _set(config, 'TFT_RES_480x320', 'true');
    _remove(config, log, 'TFT_480x320_SPI');
    log.push('TFT_480x320_SPI → TFT_INTERFACE_SPI + TFT_RES_480x320');
  }
  if ('TFT_LVGL_UI_FSMC' in config) {
    _set(config, 'TFT_LVGL_UI', config['TFT_LVGL_UI_FSMC'].value);
    _remove(config, log, 'TFT_LVGL_UI_FSMC');
  }
  if ('TFT_LVGL_UI_SPI' in config) {
    _set(config, 'TFT_LVGL_UI', config['TFT_LVGL_UI_SPI'].value);
    _remove(config, log, 'TFT_LVGL_UI_SPI');
  }
  // FSMC_GRAPHICAL_TFT → user picks from MKS_ROBIN_TFT variants, etc.
  if ('FSMC_GRAPHICAL_TFT' in config && config['FSMC_GRAPHICAL_TFT'].enabled)
    w.push('⚠️ FSMC_GRAPHICAL_TFT → choose specific display: MKS_ROBIN_TFT24/28/32/35/43, TFT_TRONXY_X5SA, ANET_ET4_TFT28, ANET_ET5_TFT35, TFT_GENERIC');
  if ('SPI_GRAPHICAL_TFT' in config && config['SPI_GRAPHICAL_TFT'].enabled)
    w.push('⚠️ SPI_GRAPHICAL_TFT → choose specific display: MKS_TS35_V2_0, TFT_GENERIC');
}

function _t207_208_custom_user_menus(config, log, w) {
  // CUSTOM_USER_MENUS → CUSTOM_MENU_MAIN / CUSTOM_MENU_CONFIG
  if ('CUSTOM_USER_MENUS' in config && config['CUSTOM_USER_MENUS'].enabled) {
    _set(config, 'CUSTOM_MENU_MAIN', 'true');
    _set(config, 'CUSTOM_MENU_CONFIG', 'true');
    _remove(config, log, 'CUSTOM_USER_MENUS');
    log.push('CUSTOM_USER_MENUS → CUSTOM_MENU_MAIN + CUSTOM_MENU_CONFIG');
  }
  const renames = {
    'CUSTOM_USER_MENU_TITLE': 'CUSTOM_MENU_MAIN_TITLE',
    'USER_SCRIPT_DONE': 'CUSTOM_MENU_MAIN_SCRIPT_DONE',
    'USER_SCRIPT_AUDIBLE_FEEDBACK': 'CUSTOM_MENU_MAIN_SCRIPT_AUDIBLE_FEEDBACK',
    'USER_SCRIPT_RETURN': 'CUSTOM_MENU_MAIN_SCRIPT_RETURN',
  };
  // USER_DESC_# → MAIN_MENU_ITEM_#_DESC, USER_GCODE_# → MAIN_MENU_ITEM_#_GCODE
  for (let i = 1; i <= 5; i++) {
    const d = config[`USER_DESC_${i}`],
          g = config[`USER_GCODE_${i}`];
    if (d) {
      _set(config, `MAIN_MENU_ITEM_${i}_DESC`, d.value);
      _remove(config, log, `USER_DESC_${i}`);
    }
    if (g) {
      _set(config, `MAIN_MENU_ITEM_${i}_GCODE`, g.value);
      _remove(config, log, `USER_GCODE_${i}`);
    }
  }
}

function _t207_208_touch_cal(config, log, w) {
  // XPT2046_X_CALIBRATION → TOUCH_CALIBRATION_X, etc.
  const xcal = config['XPT2046_X_CALIBRATION'],
        ycal = config['XPT2046_Y_CALIBRATION'],
        xoff = config['XPT2046_X_OFFSET'],
        yoff = config['XPT2046_Y_OFFSET'];
  if (xcal) { _set(config, 'TOUCH_CALIBRATION_X', xcal.value); _remove(config, log, 'XPT2046_X_CALIBRATION'); }
  if (ycal) { _set(config, 'TOUCH_CALIBRATION_Y', ycal.value); _remove(config, log, 'XPT2046_Y_CALIBRATION'); }
  if (xoff) { _set(config, 'TOUCH_OFFSET_X', xoff.value); _remove(config, log, 'XPT2046_X_OFFSET'); }
  if (yoff) { _set(config, 'TOUCH_OFFSET_Y', yoff.value); _remove(config, log, 'XPT2046_Y_OFFSET'); }
}

function _t207_208_mmu2(config, log, w) {
  // PRUSA_MMU2 → MMU_MODEL PRUSA_MMU2
  if ('PRUSA_MMU2' in config) {
    if (config['PRUSA_MMU2'].enabled) {
      _set(config, 'MMU_MODEL', 'PRUSA_MMU2');
      _remove(config, log, 'PRUSA_MMU2');
      log.push('PRUSA_MMU2 → MMU_MODEL PRUSA_MMU2');
    }
  }
  if ('PRUSA_MMU2_S_MODE' in config) {
    if (config['PRUSA_MMU2_S_MODE'].enabled) {
      _set(config, 'MMU_MODEL', 'PRUSA_MMU2S');
      _remove(config, log, 'PRUSA_MMU2_S_MODE');
      log.push('PRUSA_MMU2_S_MODE → MMU_MODEL PRUSA_MMU2S');
    }
  }
}

// --- 2.0.8 → 2.0.8.1 ---

function _t208_2081_mks_lcd(config, log, w) {
  if ('MKS_LCD12864' in config)
    w.push('⚠️ MKS_LCD12864 → MKS_LCD12864A or MKS_LCD12864B — verify which revision');
  if ('BOARD_BTT_SKR_V2_0' in config)
    w.push('⚠️ BOARD_BTT_SKR_V2_0 → BOARD_BTT_SKR_V2_0_REV_A or REV_B — Rev.A bug can kill stepper drivers!');
}

// --- 2.0.8.1 → 2.0.8.2 ---
function _t2081_2082_neopixel(config, log, w) {
  // NEOPIXEL_BKGD_LED_INDEX → NEOPIXEL_BKGD_INDEX_FIRST, NEOPIXEL_BKGD_INDEX_LAST
  if ('NEOPIXEL_BKGD_LED_INDEX' in config) {
    const v = config['NEOPIXEL_BKGD_LED_INDEX'].value;
    _set(config, 'NEOPIXEL_BKGD_INDEX_FIRST', v);
    _set(config, 'NEOPIXEL_BKGD_INDEX_LAST', v);
    _remove(config, log, 'NEOPIXEL_BKGD_LED_INDEX');
    log.push('NEOPIXEL_BKGD_LED_INDEX → NEOPIXEL_BKGD_INDEX_FIRST + LAST');
  }
}

// --- 2.0.8.3 → 2.0.8.4 ---
// (no changes, PIO update only)

// --- 2.0.8.4 → 2.0.9 ---

function _t2084_209_temp_sensor_redundant(config, log, w) {
  // TEMP_SENSOR_1_AS_REDUNDANT → TEMP_SENSOR_REDUNDANT
  if ('TEMP_SENSOR_1_AS_REDUNDANT' in config) {
    if (config['TEMP_SENSOR_1_AS_REDUNDANT'].enabled) {
      _set(config, 'TEMP_SENSOR_REDUNDANT', `${config['TEMP_SENSOR_0'] ? config['TEMP_SENSOR_0'].value : '0'}`);
      _remove(config, log, 'TEMP_SENSOR_1_AS_REDUNDANT');
      log.push('TEMP_SENSOR_1_AS_REDUNDANT → TEMP_SENSOR_REDUNDANT');
    }
  }
  // MAX_REDUNDANT_TEMP_SENSOR_DIFF → TEMP_SENSOR_REDUNDANT_MAX_DIFF
  if ('MAX_REDUNDANT_TEMP_SENSOR_DIFF' in config) {
    _set(config, 'TEMP_SENSOR_REDUNDANT_MAX_DIFF', config['MAX_REDUNDANT_TEMP_SENSOR_DIFF'].value);
    _remove(config, log, 'MAX_REDUNDANT_TEMP_SENSOR_DIFF');
  }
}

// --- 2.0.9 → 2.0.9.1 ---
// (no changes)

// --- 2.0.9.1 → 2.0.9.2 ---

function _t2091_2092_arc(config, log, w) {
  // MM_PER_ARC_SEGMENT → MAX_ARC_SEGMENT_MM
  if ('MM_PER_ARC_SEGMENT' in config) {
    _set(config, 'MAX_ARC_SEGMENT_MM', config['MM_PER_ARC_SEGMENT'].value);
    _remove(config, log, 'MM_PER_ARC_SEGMENT');
  }
  // MIN_ARC_SEGMENTS → MIN_CIRCLE_SEGMENTS
  if ('MIN_ARC_SEGMENTS' in config) {
    _set(config, 'MIN_CIRCLE_SEGMENTS', config['MIN_ARC_SEGMENTS'].value);
    _remove(config, log, 'MIN_ARC_SEGMENTS');
  }
}

// --- 2.0.9.2 → 2.0.9.3 ---

function _t2092_2093_bltouch(config, log, w) {
  // BLTOUCH_HS_MODE → BLTOUCH_HS_MODE true (was name-only, now must have value)
  if ('BLTOUCH_HS_MODE' in config && config['BLTOUCH_HS_MODE'].enabled) {
    config['BLTOUCH_HS_MODE'].value = 'true';
    log.push('BLTOUCH_HS_MODE now requires value true');
  }
}

function _t2092_2093_ptc(config, log, w) {
  // PROBE_TEMP_COMPENSATION → PTC_PROBE, PTC_BED
  if ('PROBE_TEMP_COMPENSATION' in config && config['PROBE_TEMP_COMPENSATION'].enabled) {
    _set(config, 'PTC_PROBE', 'true');
    _set(config, 'PTC_BED', 'true');
    _remove(config, log, 'PROBE_TEMP_COMPENSATION');
    log.push('PROBE_TEMP_COMPENSATION → PTC_PROBE + PTC_BED');
  }
  // PTC_SAMPLE_START|RES|COUNT → PTC_PROBE_START|RES|COUNT
  const probeR = ['PTC_SAMPLE_START', 'PTC_SAMPLE_RES', 'PTC_SAMPLE_COUNT'];
  for (const old of probeR) {
    if (old in config) {
      const newK = old.replace('PTC_SAMPLE_', 'PTC_PROBE_');
      _set(config, newK, config[old].value);
      _remove(config, log, old);
    }
  }
  // BTC_SAMPLE_START|RES|COUNT → PTC_BED_START|RES|COUNT
  const bedR = ['BTC_SAMPLE_START', 'BTC_SAMPLE_RES', 'BTC_SAMPLE_COUNT'];
  for (const old of bedR) {
    if (old in config) {
      const newK = old.replace('BTC_SAMPLE_', 'PTC_BED_');
      _set(config, newK, config[old].value);
      _remove(config, log, old);
    }
  }
  // BTC_PROBE_TEMP → PTC_PROBE_TEMP
  if ('BTC_PROBE_TEMP' in config) {
    _set(config, 'PTC_PROBE_TEMP', config['BTC_PROBE_TEMP'].value);
    _remove(config, log, 'BTC_PROBE_TEMP');
  }
}

// --- 2.0.9.3 → 2.0.9.4 ---

function _t2093_2094_bed_tramming(config, log, w) {
  // LEVEL_BED_CORNERS → LCD_BED_TRAMMING
  // LEVEL_CORNERS_INSET_LFRB → BED_TRAMMING_INSET_LFRB, etc.
  const r = {
    'LEVEL_BED_CORNERS': 'LCD_BED_TRAMMING',
    'LEVEL_CORNERS_INSET_LFRB': 'BED_TRAMMING_INSET_LFRB',
    'LEVEL_CORNERS_HEIGHT': 'BED_TRAMMING_HEIGHT',
    'LEVEL_CORNERS_Z_HOP': 'BED_TRAMMING_Z_HOP',
    'LEVEL_CENTER_TOO': 'BED_TRAMMING_INCLUDE_CENTER',
    'LEVEL_CORNERS_USE_PROBE': 'BED_TRAMMING_USE_PROBE',
    'LEVEL_CORNERS_PROBE_TOLERANCE': 'BED_TRAMMING_PROBE_TOLERANCE',
    'LEVEL_CORNERS_VERIFY_RAISED': 'BED_TRAMMING_VERIFY_RAISED',
    'LEVEL_CORNERS_AUDIO_FEEDBACK': 'BED_TRAMMING_AUDIO_FEEDBACK',
  };
  for (const [old, newK] of Object.entries(r))
    if (old in config) {
      _set(config, newK, config[old].value);
      _set(config, newK, config[old].value);
      _remove(config, log, old);
    }
}

function _t2093_2094_nozzle_park(config, log, w) {
  // NOZZLE_PARK_X_ONLY → NOZZLE_PARK_MOVE 1
  if ('NOZZLE_PARK_X_ONLY' in config && config['NOZZLE_PARK_X_ONLY'].enabled) {
    _set(config, 'NOZZLE_PARK_MOVE', '1');
    _remove(config, log, 'NOZZLE_PARK_X_ONLY');
  }
  // NOZZLE_PARK_Y_ONLY → NOZZLE_PARK_MOVE 2
  if ('NOZZLE_PARK_Y_ONLY' in config && config['NOZZLE_PARK_Y_ONLY'].enabled) {
    _set(config, 'NOZZLE_PARK_MOVE', '2');
    _remove(config, log, 'NOZZLE_PARK_Y_ONLY');
  }
}

// --- 2.0.9.5 → 2.0.9.6 ---
// Board renames only (simple)

// --- 2.0.9.6 → 2.0.9.7 ---
// (no changes)

// --- 2.0.9.7 → 2.0.9.8 ---
// (no changes)

// --- 2.0.9.8 → 2.1 ---
// (Delta/Z_PROBE_ALLEN_KEY/SCARA still separate — no simple rename)

// --- 2.1 → 2.1.0.1 ---
// (PIO update)

// --- 2.1.0.1 → 2.1.0.2 ---
// (empty)

// --- 2.1.0.2 → 2.1.1 ---

function _t2102_211_laser(config, log, w) {
  // LASER_POWER_INLINE_TRAPEZOID → LASER_POWER_TRAP
  if ('LASER_POWER_INLINE_TRAPEZOID' in config) {
    _set(config, 'LASER_POWER_TRAP', config['LASER_POWER_INLINE_TRAPEZOID'].value);
    _remove(config, log, 'LASER_POWER_INLINE_TRAPEZOID');
  }
  // L64XX → removed
}

// --- 2.1.1 → 2.1.1.1 ---
// (PIO update)

// --- 2.1.1.1 → 2.1.1.2 ---
// (empty)

// --- 2.1.1 → 2.1.2 ---

function _t211_212_kinematics(config, log, w) {
  // POLAR/DELTA/SCARA/ROBOT_SEGMENTS_PER_SECOND → DEFAULT_SEGMENTS_PER_SECOND
  const segs = ['POLAR_SEGMENTS_PER_SECOND', 'DELTA_SEGMENTS_PER_SECOND', 'SCARA_SEGMENTS_PER_SECOND', 'ROBOT_SEGMENTS_PER_SECOND'];
  for (const old of segs) {
    if (old in config) {
      _set(config, 'DEFAULT_SEGMENTS_PER_SECOND', config[old].value);
      _remove(config, log, old);
    }
  }
  // ROBOT_* → TPARA_*
  const r = {
    'ROBOT_LINKAGE_1': 'TPARA_LINKAGE_1',
    'ROBOT_LINKAGE_2': 'TPARA_LINKAGE_2',
    'ROBOT_OFFSET_X': 'TPARA_OFFSET_X',
    'ROBOT_OFFSET_Y': 'TPARA_OFFSET_Y',
    'ROBOT_OFFSET_Z': 'TPARA_OFFSET_Z',
  };
  for (const [old, newK] of Object.entries(r)) {
    if (old in config) {
      _set(config, newK, config[old].value);
      _remove(config, log, old);
    }
  }
}

function _t211_212_touch_sleep(config, log, w) {
  // TOUCH_IDLE_SLEEP → TOUCH_IDLE_SLEEP_MINS (value / 60)
  if ('TOUCH_IDLE_SLEEP' in config) {
    const v = parseInt(config['TOUCH_IDLE_SLEEP'].value) || 0;
    _set(config, 'TOUCH_IDLE_SLEEP_MINS', String(Math.round(v / 60)));
    _remove(config, log, 'TOUCH_IDLE_SLEEP');
    log.push('TOUCH_IDLE_SLEEP → TOUCH_IDLE_SLEEP_MINS (seconds→minutes)');
  }
}

function _t211_212_lcd_backlight(config, log, w) {
  // LCD_BACKLIGHT_TIMEOUT → LCD_BACKLIGHT_TIMEOUT_MINS (seconds→minutes)
  if ('LCD_BACKLIGHT_TIMEOUT' in config) {
    const v = parseInt(config['LCD_BACKLIGHT_TIMEOUT'].value) || 0;
    _set(config, 'LCD_BACKLIGHT_TIMEOUT_MINS', String(Math.round(v / 60)));
    _remove(config, log, 'LCD_BACKLIGHT_TIMEOUT');
    log.push('LCD_BACKLIGHT_TIMEOUT → LCD_BACKLIGHT_TIMEOUT_MINS (seconds→minutes)');
  }
}

function _t211_212_lin_advance(config, log, w) {
  // EXTRA_LIN_ADVANCE_K → ADVANCE_K_EXTRA
  if ('EXTRA_LIN_ADVANCE_K' in config) {
    _set(config, 'ADVANCE_K_EXTRA', config['EXTRA_LIN_ADVANCE_K'].value);
    _remove(config, log, 'EXTRA_LIN_ADVANCE_K');
  }
  // LIN_ADVANCE_K → ADVANCE_K
  if ('LIN_ADVANCE_K' in config) {
    _set(config, 'ADVANCE_K', config['LIN_ADVANCE_K'].value);
    _remove(config, log, 'LIN_ADVANCE_K');
  }
}

function _t211_212_tmc_current(config, log, w) {
  // X_MAX_CURRENT → X_CURRENT, etc.
  const axes_cur = ['X', 'Y', 'Z', 'X2', 'Y2', 'Z2', 'E0', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7'];
  for (const a of axes_cur) {
    const old = `${a}_MAX_CURRENT`;
    if (old in config) {
      _set(config, `${a}_CURRENT`, config[old].value);
      _remove(config, log, old);
    }
  }
}

function _t211_212_tmc_rsense(config, log, w) {
  // X_SENSE_RESISTOR → X_RSENSE (value / 1000.0)
  const axes_rs = ['X', 'Y', 'Z', 'X2', 'Y2', 'Z2', 'E0', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7'];
  for (const a of axes_rs) {
    const old = `${a}_SENSE_RESISTOR`;
    if (old in config) {
      const v = parseFloat(config[old].value) || 0;
      _set(config, `${a}_RSENSE`, String(v / 1000.0));
      _remove(config, log, old);
    }
  }
}

function _t211_212_config_export(config, log, w) {
  // CONFIG_EXPORT → CONFIG_EXPORT 2 (if enabled without value)
  if ('CONFIG_EXPORT' in config && config['CONFIG_EXPORT'].enabled) {
    if (!config['CONFIG_EXPORT'].value || config['CONFIG_EXPORT'].value === 'true')
      config['CONFIG_EXPORT'].value = '2';
    log.push('CONFIG_EXPORT default set to 2');
  }
}

// --- 2.1.2 → 2.1.2.1 ---
// (empty)

// --- 2.1.2.1 → 2.1.2.2 ---

function _t2121_2122_pid_max(config, log, w) {
  // PID_MAX BANG_MAX → PID_MAX 255
  if ('PID_MAX' in config && config['PID_MAX'].value && config['PID_MAX'].value.includes('BANG_MAX'))
    config['PID_MAX'].value = '255';
  if ('MPC_MAX' in config && config['MPC_MAX'].value && config['MPC_MAX'].value.includes('BANG_MAX'))
    config['MPC_MAX'].value = '255';
}

function _t2121_2122_disable_e(config, log, w) {
  // DISABLE_E true/false → DISABLE_E enable/disable
  if ('DISABLE_E' in config) {
    const v = config['DISABLE_E'];
    config['DISABLE_E'].value = v.value === 'true' || (!v.value && v.enabled) ? 'enable' : 'disable';
  }
}

function _t2121_2122_disable_inactive_axes(config, log, w) {
  // DISABLE_INACTIVE_[XYZIJKUVWE] → DISABLE_IDLE_[XYZIJKUVWE]
  const axes = ['X', 'Y', 'Z', 'I', 'J', 'K', 'U', 'V', 'W', 'E'];
  for (const a of axes) {
    const old = `DISABLE_INACTIVE_${a}`;
    if (old in config) {
      const newK = `DISABLE_IDLE_${a}`;
      _set(config, newK, config[old].value);
      _set(config, newK, config[old].value);
      _remove(config, log, old);
    }
  }
  // DISABLE_INACTIVE_EXTRUDER → DISABLE_OTHER_EXTRUDERS
  if ('DISABLE_INACTIVE_EXTRUDER' in config) {
    _set(config, 'DISABLE_OTHER_EXTRUDERS', config['DISABLE_INACTIVE_EXTRUDER'].value);
    _remove(config, log, 'DISABLE_INACTIVE_EXTRUDER');
  }
}

function _t2121_2122_tmc_spi(config, log, w) {
  // TMC_SW_MOSI/MISO/SCK → TMC_SPI_MOSI/MISO/SCK
  const r = { 'TMC_SW_MOSI': 'TMC_SPI_MOSI', 'TMC_SW_MISO': 'TMC_SPI_MISO', 'TMC_SW_SCK': 'TMC_SPI_SCK' };
  for (const [old, newK] of Object.entries(r)) {
    if (old in config) {
      _set(config, newK, config[old].value);
      _remove(config, log, old);
    }
  }
}

function _t2121_2122_stepper_timeout(config, log, w) {
  // DEFAULT_STEPPER_DEACTIVE_TIME → DEFAULT_STEPPER_TIMEOUT_SEC
  if ('DEFAULT_STEPPER_DEACTIVE_TIME' in config) {
    _set(config, 'DEFAULT_STEPPER_TIMEOUT_SEC', config['DEFAULT_STEPPER_DEACTIVE_TIME'].value);
    _remove(config, log, 'DEFAULT_STEPPER_DEACTIVE_TIME');
  }
}

function _t2121_2122_folder_sorting(config, log, w) {
  // FOLDER_SORTING → SDSORT_FOLDERS
  if ('FOLDER_SORTING' in config) {
    _set(config, 'SDSORT_FOLDERS', config['FOLDER_SORTING'].value);
    _remove(config, log, 'FOLDER_SORTING');
  }
}

function _t2121_2122_btt_mini(config, log, w) {
  // BTT_MINI_12864_V1 → BTT_MINI_12864
  if ('BTT_MINI_12864_V1' in config) {
    _set(config, 'BTT_MINI_12864', config['BTT_MINI_12864_V1'].value);
    _remove(config, log, 'BTT_MINI_12864_V1');
  }
}

function _t2125_2126_pid_case(config, log, w) {
  // DEFAULT_k[pidcf] → DEFAULT_K[PIDCF] (uppercase)
  const pidLower = ['DEFAULT_Kp', 'DEFAULT_Ki', 'DEFAULT_Kd', 'DEFAULT_Kf', 'DEFAULT_Kc', 'DEFAULT_Kp_LIST', 'DEFAULT_Ki_LIST', 'DEFAULT_Kd_LIST'],
        pidUpper = ['DEFAULT_KP', 'DEFAULT_KI', 'DEFAULT_KD', 'DEFAULT_KF', 'DEFAULT_KC', 'DEFAULT_KP_LIST', 'DEFAULT_KI_LIST', 'DEFAULT_KD_LIST'];
  for (let i = 0; i < pidLower.length; i++) {
    if (pidLower[i] in config) {
      _set(config, pidUpper[i], config[pidLower[i]].value);
      _remove(config, log, pidLower[i]);
    }
  }
  // DEFAULT_bedK[pid] → DEFAULT_BED_K[PID]
  const bedKLower = ['DEFAULT_bedKp', 'DEFAULT_bedKi', 'DEFAULT_bedKd'],
        bedKUpper = ['DEFAULT_BED_KP', 'DEFAULT_BED_KI', 'DEFAULT_BED_KD'];
  for (let i = 0; i < bedKLower.length; i++) {
    if (bedKLower[i] in config) {
      _set(config, bedKUpper[i], config[bedKLower[i]].value);
      _remove(config, log, bedKLower[i]);
    }
  }
  // DEFAULT_chamberK[pid] → DEFAULT_CHAMBER_K[PID]
  const chKLower = ['DEFAULT_chamberKp', 'DEFAULT_chamberKi', 'DEFAULT_chamberKd'],
        chKUpper = ['DEFAULT_CHAMBER_KP', 'DEFAULT_CHAMBER_KI', 'DEFAULT_CHAMBER_KD'];
  for (let i = 0; i < chKLower.length; i++) {
    if (chKLower[i] in config) {
      _set(config, chKUpper[i], config[chKLower[i]].value);
      _remove(config, log, chKLower[i]);
    }
  }

  // Also uppercase these constant names when they appear as VALUES in other options
  // (e.g., SOME_OPTION = "DEFAULT_Kp" → SOME_OPTION = "DEFAULT_KP")
  const allLower = [...pidLower, ...bedKLower, ...chKLower];
  const allUpper = [...pidUpper, ...bedKUpper, ...chKUpper];
  for (const key of Object.keys(config)) {
    const item = config[key];
    if (item && typeof item.value === 'string') {
      let newValue = item.value;
      for (let i = 0; i < allLower.length; i++) {
        // Replace whole-word occurrences (with word boundaries)
        const regex = new RegExp(`\\b${allLower[i]}\\b`, 'g');
        if (regex.test(newValue)) {
          newValue = newValue.replace(regex, allUpper[i]);
        }
      }
      if (newValue !== item.value) {
        item.value = newValue;
        log.push(`  ↳ ${key}.value: uppercased PID constants`);
      }
    }
  }
}

// --- 2.1.2.5 → 2.1.3 ---
// 2.1.3 final (replaces beta series)

function _t2125_213b1_endstop_invert(config, log, w) {
  // [AXIS]_(MIN|MAX)_ENDSTOP_INVERTING → [AXIS]_(MIN|MAX)_ENDSTOP_HIT_STATE
  const axes = ['X', 'Y', 'Z', 'I', 'J', 'K', 'U', 'V', 'W'];
  const mins = ['MIN', 'MAX'];
  for (const a of axes)
    for (const m of mins) {
      const old = `${a}_${m}_ENDSTOP_INVERTING`;
      if (old in config) {
        const v = config[old];
        const newK = `${a}_${m}_ENDSTOP_HIT_STATE`;
        _set(config, newK, v.value === 'true' || (!v.value && v.enabled) ? 'HIGH' : 'LOW');
        _remove(config, log, old);
      }
    }
}

function _t2125_213b1_disable_axes(config, log, w) {
  // DISABLE_[XYZIJKUVWE] true → DISABLE_[XYZIJKUVWE] (switch)
  // DISABLE_[XYZIJKUVWE] false → //DISABLE_[XYZIJKUVWE]
  const axes = ['X', 'Y', 'Z', 'I', 'J', 'K', 'U', 'V', 'W', 'E'];
  for (const a of axes) {
    const opt = `DISABLE_${a}`;
    if (opt in config) {
      const v = config[opt];
      if (v.value === 'true' || (!v.value && v.enabled))
        config[opt] = { value: 'true', enabled: true };
      else
        config[opt] = { value: 'true', enabled: false };
    }
  }
}

function _t2125_213b1_milliseconds_preheat(config, log, w) {
  // MILLISECONDS_PREHEAT_TIME → PREHEAT_TIME_HOTEND_MS + PREHEAT_TIME_BED_MS
  if ('MILLISECONDS_PREHEAT_TIME' in config) {
    const v = config['MILLISECONDS_PREHEAT_TIME'].value;
    _set(config, 'PREHEAT_TIME_HOTEND_MS', v);
    _set(config, 'PREHEAT_TIME_BED_MS', v);
    _remove(config, log, 'MILLISECONDS_PREHEAT_TIME');
  }
}

function _t2125_213b1_step_pin(config, log, w) {
  // INVERT_[AXIS]_STEP_PIN → STEP_STATE_[AXIS]
  const axes = ['X', 'Y', 'Z', 'I', 'J', 'K', 'U', 'V', 'W', 'E0', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7'];
  for (const a of axes) {
    const old = `INVERT_${a}_STEP_PIN`;
    if (old in config) {
      const v = config[old];
      const newK = `STEP_STATE_${a}`;
      _set(config, newK, v.value === 'true' || (!v.value && v.enabled) ? 'HIGH' : 'LOW');
      _remove(config, log, old);
    }
  }
}

function _t2125_213b1_babystep_invert(config, log, w) {
  // BABYSTEP_INVERT_Z true/false → BABYSTEP_INVERT_Z switch
  if ('BABYSTEP_INVERT_Z' in config) {
    const v = config['BABYSTEP_INVERT_Z'];
    config['BABYSTEP_INVERT_Z'] = { value: 'true', enabled: v.value !== 'false' && v.enabled };
  }
}

function _t2125_213b1_probe_pt(config, log, w) {
  // PROBE_PT_1_X, PROBE_PT_1_Y → PROBE_PT_1 { x, y }
  for (let i = 1; i <= 3; i++) {
    const x = config[`PROBE_PT_${i}_X`],
          y = config[`PROBE_PT_${i}_Y`];
    if (x || y) {
      _set(config, `PROBE_PT_${i}`, `{ ${x ? x.value : '0'}, ${y ? y.value : '0'} }`);
      _remove(config, log, `PROBE_PT_${i}_X`);
      _remove(config, log, `PROBE_PT_${i}_Y`);
    }
  }
}

// --- 2.1.3 final ---
// (2.1.3-b1 through 2.1.3-b3 retired — use 2.1.3 migration step directly)

// ============================================================
// The complete migration step table
// ============================================================

const migrationSteps = [

  // ====== 1.1.9 → 2.0.0 ======
  {
    from: '1.1.9', to: '2.0.0',
    transforms: [_t190_200_power_supply, _t190_200_z_probe, _t190_200_probe_offset,
                 _t190_200_allen_key, _t190_200_disable_inactive],
    rename: {
      'PS_DEFAULT_OFF': 'PSU_DEFAULT_OFF',
      'PHOTOGRAPH_PIN': null,
      'MBL_Z_STEP': 'MESH_EDIT_Z_STEP',
      'ENDSTOP_NOISE_FILTER': 'ENDSTOP_NOISE_THRESHOLD',
      'MENU_ITEM_CASE_LIGHT': 'CASE_LIGHT_MENU',
      'DUAL_NOZZLE_DUPLICATION_MODE': 'MULTI_NOZZLE_DUPLICATION',
      'ABORT_ON_ENDSTOP_HIT_FEATURE_ENABLED': 'SD_ABORT_ON_ENDSTOP_HIT',
      'JUNCTION_DEVIATION': 'CLASSIC_JERK',
      'CHDK': 'PHOTO_GCODE',
      'CHDK_DELAY': 'PHOTO_SWITCH_MS',
      'BABYSTEP_MULTIPLICATOR': 'BABYSTEP_MULTIPLICATOR_Z',
      'MINIMUM_STEPPER_DIR_DELAY': 'MINIMUM_STEPPER_POST_DIR_DELAY',
      'STEALTHCHOP': 'STEALTHCHOP_XY',
      'SPINDLE_DIR_CHANGE': 'SPINDLE_CHANGE_DIR',
      'SPINDLE_STOP_ON_DIR_CHANGE': 'SPINDLE_CHANGE_DIR_STOP',
      'ACTION_ON_KILL': 'HOST_ACTION_COMMANDS',
      'ACTION_ON_PAUSE': 'HOST_ACTION_COMMANDS',
      'ACTION_ON_RESUME': 'HOST_ACTION_COMMANDS',
      'RETRACT_ZLIFT': 'RETRACT_ZRAISE',
      'STRING_SPLASH_LINE1': null,
      'STRING_SPLASH_LINE2': null,
      'PARKING_EXTRUDER_SECURITY_RAISE': null,
      'DELTA_CALIBRATION_RADIUS': null,
      'DELTA_FEEDRATE_SCALING': null,
    },
    warnings: ['MIN_STEPS_PER_SEGMENT default changed from 6 to 1 — verify your value'],
  },

  // ====== 2.0.0 → 2.0.1 ======
  {
    from: '2.0.0', to: '2.0.1',
    rename: {
      'FILAMENT_UNLOAD_RETRACT_LENGTH': 'FILAMENT_UNLOAD_PURGE_RETRACT',
      'FILAMENT_UNLOAD_DELAY': 'FILAMENT_UNLOAD_PURGE_DELAY',
    },
  },

  // ====== 2.0.1 → 2.0.2 ======
  {
    from: '2.0.1', to: '2.0.2',
    transforms: [_t201_202_dgus, _t201_202_z_stepper],
    rename: {
      'X_DUAL_ENDSTOPS_ADJUSTMENT': 'X2_ENDSTOP_ADJUSTMENT',
      'Y_DUAL_ENDSTOPS_ADJUSTMENT': 'Y2_ENDSTOP_ADJUSTMENT',
      'Z_DUAL_ENDSTOPS': 'Z_MULTI_ENDSTOPS',
      'Z_TRIPLE_ENDSTOPS': 'Z_MULTI_ENDSTOPS',
      'Z_DUAL_ENDSTOPS_ADJUSTMENT': 'Z2_ENDSTOP_ADJUSTMENT',
      'Z_TRIPLE_ENDSTOPS_ADJUSTMENT2': 'Z2_ENDSTOP_ADJUSTMENT',
      'Z_TRIPLE_ENDSTOPS_ADJUSTMENT3': 'Z3_ENDSTOP_ADJUSTMENT',
      'BOARD_STEVAL': 'BOARD_STEVAL_3DP001V1',
    },
  },

  // ====== 2.0.2 → 2.0.3 ======
  { from: '2.0.2', to: '2.0.3', note: 'no changes' },

  // ====== 2.0.3 → 2.0.4 ======
  {
    from: '2.0.3', to: '2.0.4',
    transforms: [_t203_204_level_corners, _t203_204_rumba32],
    rename: {
      'BOARD_BIGTREE_SKR_V1_1': 'BOARD_BTT_SKR_V1_1',
      'BOARD_BIGTREE_SKR_V1_3': 'BOARD_BTT_SKR_V1_3',
      'BOARD_BIGTREE_SKR_V1_4': 'BOARD_BTT_SKR_V1_4',
      'BOARD_BIGTREE_SKR_V1_4_TURBO': 'BOARD_BTT_SKR_V1_4_TURBO',
      'BOARD_BIGTREE_SKR_MINI_V1_1': 'BOARD_BTT_SKR_MINI_V1_1',
      'BOARD_BIGTREE_SKR_E3_DIP': 'BOARD_BTT_SKR_E3_DIP',
      'BOARD_BIGTREE_SKR_PRO_V1_1': 'BOARD_BTT_SKR_PRO_V1_1',
      'BOARD_BIGTREE_BTT002_V1_0': 'BOARD_BTT_BTT002_V1_0',
    },
  },

  // ====== 2.0.4 → 2.0.4.1 → 2.0.4.2 → 2.0.4.3 → 2.0.4.4 ======
  { from: '2.0.4',   to: '2.0.4.4', note: 'no changes across 2.0.4.1–2.0.4.4' },

  // ====== 2.0.4.4 → 2.0.5 ======
  {
    from: '2.0.4.4', to: '2.0.5',
    transforms: [_t204_205_controllerfan, _t204_205_sd_detect],
  },

  // ====== 2.0.5 → 2.0.5.1 → 2.0.5.2 → 2.0.5.3 → 2.0.5.4 ======
  { from: '2.0.5', to: '2.0.5.4', note: 'no changes across 2.0.5.1–2.0.5.4' },

  // ====== 2.0.5.4 → 2.0.5.5 ======
  { from: '2.0.5.4', to: '2.0.5.5', note: 'no changes' },

  // ====== 2.0.5.5 → 2.0.6 ======
  {
    from: '2.0.5.5', to: '2.0.6',
    transforms: [_t205_206_fil_runout, _t205_206_home_bump, _t205_206_min_probe_edge, _t205_206_ptc_park],
    rename: {
      'DIGIPOT_I2C': 'DIGIPOT_MCP4451',
      'TOOLCHANGE_FIL_SWAP_LENGTH': 'TOOLCHANGE_FS_LENGTH',
      'TOOLCHANGE_FIL_EXTRA_PRIME': 'TOOLCHANGE_FS_EXTRA_RESUME_LENGTH',
      'TOOLCHANGE_FIL_SWAP_RETRACT_SPEED': 'TOOLCHANGE_FS_RETRACT_SPEED',
      'TOOLCHANGE_FIL_SWAP_PRIME_SPEED': 'TOOLCHANGE_FS_UNRETRACT_SPEED',
      'BOARD_RUMBA32_AUS3D': 'BOARD_RUMBA32_V1_0',
      'MIN_PROBE_EDGE': 'PROBING_MARGIN',
      'HOMING_BACKOFF_MM': 'HOMING_BACKOFF_POST_MM',
      'PTC_MAX_BED_TEMP': null,
      'SPEED_POWER_SLOPE': null,
    },
  },

  // ====== 2.0.6 → 2.0.6.1 ======
  {
    from: '2.0.6', to: '2.0.6.1',
    rename: {
      'TOUCH_BUTTONS': 'TOUCH_SCREEN',
      'EVENT_GCODE_SD_STOP': 'EVENT_GCODE_SD_ABORT',
      'SPINDLE_LASER_ACTIVE_HIGH': 'SPINDLE_LASER_ACTIVE_STATE',
    },
  },

  // ====== 2.0.6.1 → 2.0.6.2 ======
  { from: '2.0.6.1', to: '2.0.6.2', note: 'no changes' },

  // ====== 2.0.6.2 → 2.0.7 ======
  {
    from: '2.0.6.2', to: '2.0.7',
    rename: {
      'ANYCUBIC_LCD_SERIAL_PORT': 'LCD_SERIAL_PORT',
      'DGUS_SERIAL_PORT': 'LCD_SERIAL_PORT',
      'DGUS_BAUDRATE': 'LCD_BAUDRATE',
      'DGUS_SERIAL_STATS_RX_BUFFER_OVERRUNS': 'SERIAL_STATS_RX_BUFFER_OVERRUNS',
      'INTERNAL_SERIAL_PORT': 'MMU2_SERIAL_PORT',
    },
  },

  // ====== 2.0.7 → 2.0.7.1 ======
  {
    from: '2.0.7', to: '2.0.7.1',
    rename: {
      'DWIN_MARLINUI_PORTRAIT': null,
      'DWIN_MARLINUI_LANDSCAPE': null,
    },
  },

  // ====== 2.0.7.1 → 2.0.7.2 ======
  { from: '2.0.7.1', to: '2.0.7.2', note: 'no changes' },

  // ====== 2.0.7.2 → 2.0.7.3 ======
  { from: '2.0.7.2', to: '2.0.7.3', note: 'PIO 6 update only' },

  // ====== 2.0.7.3 → 2.0.8 ======
  {
    from: '2.0.7.3', to: '2.0.8',
    transforms: [_t207_208_tft, _t207_208_custom_user_menus, _t207_208_touch_cal, _t207_208_mmu2],
    rename: {
      'CREALITY_TOUCH': 'BLTOUCH',
      'XY_PROBE_SPEED': 'XY_PROBE_FEEDRATE',
      'Z_PROBE_SPEED_FAST': 'Z_PROBE_FEEDRATE_FAST',
      'Z_PROBE_SPEED_SLOW': 'Z_PROBE_FEEDRATE_SLOW',
      'UNKNOWN_Z_NO_RAISE': null,
      'ASSISTED_TRAMMING_MENU_ITEM': 'ASSISTED_TRAMMING_WIZARD',
      'Z_AFTER_DEACTIVATE': null,
      'SHORT_MANUAL_Z_MOVE': 'FINE_MANUAL_MOVE',
      'PROBE_OFFSET_START': 'PROBE_OFFSET_WIZARD_START_Z',
      'POWER_LOSS_PULL': 'POWER_LOSS_PULLUP',
      'LCD_LANGUAGE_1': 'LCD_LANGUAGE',
      'BOARD_RAMPS_DAGOMA': 'BOARD_DAGOMA_F5',
      'MMU2_SERIAL': null,
    },
    warnings: ['POWER_MONITOR_CURRENT_OFFSET may need +1 offset — verify value',
               'HOMING_FEEDRATE_XY and HOMING_FEEDRATE_Z → HOMING_FEEDRATE_MM_M { x, y, z } — verify axes values',
               'FSMC_GRAPHICAL_TFT and SPI_GRAPHICAL_TFT → specific display model select'],
  },

  // ====== 2.0.8 → 2.0.8.1 ======
  {
    from: '2.0.8', to: '2.0.8.1',
    transforms: [_t208_2081_mks_lcd],
  },

  // ====== 2.0.8.1 → 2.0.8.2 ======
  {
    from: '2.0.8.1', to: '2.0.8.2',
    transforms: [_t2081_2082_neopixel],
  },

  // ====== 2.0.8.2 → 2.0.8.3 ======
  { from: '2.0.8.2', to: '2.0.8.3', note: 'PIO 6 update only' },

  // ====== 2.0.8.3 → 2.0.8.4 ======
  { from: '2.0.8.3', to: '2.0.8.4', note: 'no config-level changes' },

  // ====== 2.0.8.4 → 2.0.9 ======
  {
    from: '2.0.8.4', to: '2.0.9',
    transforms: [_t2084_209_temp_sensor_redundant],
  },

  // ====== 2.0.9 → 2.0.9.1 ======
  { from: '2.0.9', to: '2.0.9.1', note: 'no changes' },

  // ====== 2.0.9.1 → 2.0.9.2 ======
  {
    from: '2.0.9.1', to: '2.0.9.2',
    transforms: [_t2091_2092_arc],
    rename: {
      'TEMP_SENSOR_REDUNDANT_SOURCE': null,
      'TEMP_SENSOR_REDUNDANT_TARGET': null,
      'LCD_ALEPHOBJECTS_CLCD_UI': 'LCD_LULZBOT_CLCD_UI',
      'SPINDLE_LASER_PWM': 'SPINDLE_LASER_USE_PWM',
      'ARC_SEGMENTS_PER_R': null,
    },
  },

  // ====== 2.0.9.2 → 2.0.9.3 ======
  {
    from: '2.0.9.2', to: '2.0.9.3',
    transforms: [_t2092_2093_bltouch, _t2092_2093_ptc],
    rename: {
      'USE_TEMP_EXT_COMPENSATION': null,
      'PTC_PROBE_RAISE': null,
    },
    warnings: ['If DEFAULT_EJERK < 10, ALLOW_LOW_EJERK may be needed'],
  },

  // ====== 2.0.9.3 → 2.0.9.4 ======
  {
    from: '2.0.9.3', to: '2.0.9.4',
    transforms: [_t2093_2094_bed_tramming, _t2093_2094_nozzle_park],
    rename: {
      'DWIN_CREALITY_LCD_ENHANCED': 'DWIN_LCD_PROUI',
      'BOARD_TH3D_EZBOARD_LITE_V2': 'BOARD_TH3D_EZBOARD_V2',
      'TOOLCHANGE_FS_INIT_BEFORE_SWAP': null,
    },
  },

  // ====== 2.0.9.4 → 2.0.9.5 ======
  {
    from: '2.0.9.4', to: '2.0.9.5',
    rename: {
      'LINEAR_AXES': null,
      'LASER_POWER_INLINE': null,
      'LASER_POWER_INLINE_CONTINUOUS': null,
      'LASER_POWER_INLINE_CONT_PER': null,
      'LASER_POWER_INLINE_INVERT': null,
      'LASER_MOVE_POWER': null,
      'LASER_MOVE_G0_OFF': null,
      'LASER_MOVE_G28_OFF': null,
      'LASER_POWER_INLINE_TRAPEZOID_CONT': null,
      'LASER_POWER_INLINE_TRAPEZOID_CONT_PER': null,
      'LASER_POWER_INLINE_TRAPEZOID': 'LASER_POWER_TRAP',
    },
  },

  // ====== 2.0.9.5 → 2.0.9.6 ======
  {
    from: '2.0.9.5', to: '2.0.9.6',
    rename: {
      'BOARD_MKS_MONSTER8': 'BOARD_MKS_MONSTER8_V1',
      'BOARD_INDEX_REV04': 'BOARD_OPULO_LUMEN_REV4',
    },
    warnings: ['BOARD_BTT_SKR_SE_BX → BOARD_BTT_SKR_SE_BX_V2 or V3 — verify revision'],
  },

  // ====== 2.0.9.6 → 2.0.9.7 ======
  { from: '2.0.9.6', to: '2.0.9.7', note: 'no changes' },

  // ====== 2.0.9.7 → 2.0.9.8 ======
  { from: '2.0.9.7', to: '2.0.9.8', note: 'no changes' },

  // ====== 2.0.9.8 → 2.1 ======
  { from: '2.0.9.8', to: '2.1', note: 'Delta/SCARA/Z_PROBE_ALLEN_KEY still separate — check manually' },

  // ====== 2.1 → 2.1.0.1 ======
  { from: '2.1', to: '2.1.0.1', note: 'PIO 6 update only' },

  // ====== 2.1.0.1 → 2.1.0.2 ======
  { from: '2.1.0.1', to: '2.1.0.2', note: 'no config-level changes' },

  // ====== 2.1.0.2 → 2.1.1 ======
  {
    from: '2.1.0.2', to: '2.1.1',
    transforms: [_t2102_211_laser],
    rename: {
      'LASER_POWER_INLINE': null,
      'LASER_POWER_INLINE_TRAPEZOID': 'LASER_POWER_TRAP',
      'LASER_POWER_INLINE_TRAPEZOID_CONT': null,
      'LASER_POWER_INLINE_TRAPEZOID_CONT_PER': null,
      'LASER_MOVE_POWER': null,
      'LASER_MOVE_G0_OFF': null,
      'LASER_MOVE_G28_OFF': null,
      'LASER_POWER_INLINE_INVERT': null,
      'LASER_POWER_INLINE_CONTINUOUS': null,
    },
    warnings: ['L64XX driver support removed entirely — all L64XX settings will be dropped'],
  },

  // ====== 2.1.1 → 2.1.1.1 ======
  { from: '2.1.1', to: '2.1.1.1', note: 'PIO 6 update only' },

  // ====== 2.1.1.1 → 2.1.1.2 ======
  { from: '2.1.1.1', to: '2.1.1.2', note: 'no config-level changes' },

  // ====== 2.1.1 → 2.1.2 (direct) ======
  {
    from: '2.1.1', to: '2.1.2',
    transforms: [_t211_212_kinematics, _t211_212_touch_sleep, _t211_212_lcd_backlight,
                 _t211_212_lin_advance, _t211_212_tmc_current, _t211_212_tmc_rsense,
                 _t211_212_config_export],
    rename: {
      'LCD_SET_PROGRESS_MANUALLY': 'SET_PROGRESS_MANUALLY',
      'USE_M73_REMAINING_TIME': null,
      'ROTATE_PROGRESS_DISPLAY': null,
      'DEBUG_ROBOT_KINEMATICS': 'DEBUG_TPARA_KINEMATICS',
    },
  },

  // ====== 2.1.2 → 2.1.2.1 ======
  { from: '2.1.2', to: '2.1.2.1', note: 'no changes' },

  // ====== 2.1.2.1 → 2.1.2.2 ======
  {
    from: '2.1.2.1', to: '2.1.2.2',
    transforms: [_t2121_2122_pid_max, _t2121_2122_disable_e, _t2121_2122_disable_inactive_axes,
                 _t2121_2122_tmc_spi, _t2121_2122_stepper_timeout, _t2121_2122_folder_sorting,
                 _t2121_2122_btt_mini],
    rename: {
      'TFT_SHARED_SPI': 'TFT_SHARED_IO',
      'EXPERIMENTAL_SCURVE': null,
      'X2_HOME_DIR': null,
    },
  },

  // ====== 2.1.2.2 → 2.1.2.3 ======
  { from: '2.1.2.2', to: '2.1.2.3', note: 'no changes' },

  // ====== 2.1.2.3 → 2.1.2.4 ======
  { from: '2.1.2.3', to: '2.1.2.4', note: 'no changes' },

  // ====== 2.1.2.4 → 2.1.2.5 ======
  { from: '2.1.2.4', to: '2.1.2.5', note: 'no changes' },

  // ====== 2.1.2.5 → 2.1.2.6 ======
  {
    from: '2.1.2.5', to: '2.1.2.6',
    transforms: [_t2125_2126_pid_case],
  },

  // ====== 2.1.2.6 → 2.1.2.7 ======
  { from: '2.1.2.6', to: '2.1.2.7', note: 'no changes' },

  // ====== 2.1.2.7 → 2.1.2.8 ======
  { from: '2.1.2.7', to: '2.1.2.8', note: 'no changes' },

  // ====== 2.1.2.8 → 2.1.3 ======
  {
    from: '2.1.2.8', to: '2.1.3',
    transforms: [_t2125_213b1_endstop_invert, _t2125_213b1_disable_axes,
                 _t2125_213b1_milliseconds_preheat, _t2125_213b1_step_pin,
                 _t2125_213b1_babystep_invert, _t2125_213b1_probe_pt],
    rename: {
      'DELTA_PRINTABLE_RADIUS': 'PRINTABLE_RADIUS',
      'SCARA_FEEDRATE_SCALING': 'FEEDRATE_SCALING',
      'Z_HOMING_HEIGHT': 'Z_CLEARANCE_FOR_HOMING',
      'BABYSTEP_ZPROBE_GFX_OVERLAY': 'BABYSTEP_GFX_OVERLAY',
      'SQUARE_WAVE_STEPPING': 'EDGE_STEPPING',
      'MINIMUM_PLANNER_SPEED': null,
      'INTEGRATED_BABYSTEPPING': null,
      'EXPERIMENTAL_SCURVE': null,
      'X2_HOME_DIR': null,
      'CALIBRATION_MEASUREMENT_RESOLUTION': null,
      'DELTA_MAX_RADIUS': null,
      'FTM_TS': null,
      'FTM_STEPS_PER_UNIT_TIME': null,
      'FTM_MIN_TICKS': null,
      'FTM_MIN_SHAPE_FREQ': null,
      'FTM_RATIO': null,
      'FTM_ZMAX': null,
      'FTM_CTS_COMPARE_VAL': null,
      'ALLOW_LOW_EJERK': null,
    },
    warnings: [
      'DGUS_LCD_UI_[name] → DGUS_LCD_UI [name] — migrate if using DGUS UI',
      'USE_[AXIS](MIN|MAX)_PLUG → [AXIS]_SAFETY_STOP — verify endstop assignments',
      'TFT_SHARED_SPI now determined by pins file — remove from config if present',
      'DISABLE_INACTIVE_EXTRUDER → DISABLE_OTHER_EXTRUDERS (handled above)',
      'PROBE_PT_1/2/3_X and _Y → PROBE_PT_1/2/3 { x, y }',
      'Z_PROBE_OFFSET_RANGE_MIN/MAX → PROBE_OFFSET_ZMIN/ZMAX',
      'LARGE_MOVE_ITEMS → MANUAL_MOVE_DISTANCE_MM',
      'SDIO_SUPPORT → ONBOARD_SDIO',
      'ANET_FULL_GRAPHICS_LCD_ALT_WIRING → CTC_A10S_A13',
      'Z_PROBE_END_SCRIPT → EVENT_GCODE_AFTER_G29',
      'BOARD_BTT_MANTA_M4P_V1_0 → BOARD_BTT_MANTA_M4P_V2_1',
      'BOARD_LINUX_RAMPS → BOARD_SIMULATED',
      'TOUCH_IDLE_SLEEP/MINS → DISPLAY_SLEEP_MINUTES',
      'DRIVER_TYPE_[AXIS] TMC26X(_STANDALONE)? removed — no longer supported',
      'WIFI_SERIAL → WIFI_SERIAL_PORT',
      'MINIMUM_STEPPER_PULSE → MINIMUM_STEPPER_PULSE_NS (multiply by 1000)',
      'DISABLE_ENCODER → NO_BACK_MENU_ITEM',
      'MMU2_* → MMU_*/MMU3_* — MMU2 options renamed, review if using MMU',
      'FTM_SHAPING_DEFAULT_[XY]_FREQ → FTM_SHAPING_DEFAULT_FREQ_[XY]',
      'TRAMMING_SCREW_THREAD now uses predefined M#_CW/CCW names',
      '[XYZIJKUVW]_ENABLE_ON 0/1 → LOW/HIGH',
      'SDSS → SD_SS_PIN',
      'DEFAULT_SHARED_VOLUME → remove SV_ prefix',
      'SDSORT_QUICK added as new safe default — enable if desired',
    ],
  },

  // ====== 2.1.3 → 2.2.0 ======
  { from: '2.1.3', to: '2.2.0', note: 'TBD — no migration rules yet' },
];

// ============================================================
// Version helpers — uses hex strings for simple alphabetical comparison
// ============================================================

/**
 * Convert a hex version (XXYYZZ or XXYYZZWW) to a dotted string.
 * "020005" → "2.0.5",  "02010201" → "2.1.2.1"
 */
function hexToVersion(hex) {
  if (!hex) return '';
  const s = String(hex);
  const m = s.match(/^([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})?$/);
  if (!m) return s; // Not a hex version, return as-is
  const [, p1, p2, p3, p4] = m;
  return `${1 * p1}.${1 * p2}.${1 * p3}` + (p4 !== undefined && 1 * p4 ? `.${1 * p4}` : '');
}

/**
 * Convert any version string to a zero-padded 8-char hex comparison key.
 * Alphabetical comparison of these keys = correct version ordering.
 *
 * "2.0.5"   → "02000500"
 * "2.1.2.1" → "02010201"
 * "1.1.9"   → "01010900"
 * "2.1.3"   → "02010300"
 */
function versionToHex(v) {
  const s = String(v).trim();
  // If already a 6- or 8-digit hex string, pad to 8
  if (/^[0-9]{6,8}$/.test(s)) return s.padEnd(8, '0');
  // Parse dotted (and optional hyphen-suffixed) version into numeric components
  const parts = s.split(/[.\-]/);
  const arr = [];
  for (let i = 0; i < 4; i++) {
    const n = i < parts.length ? parseInt(parts[i], 10) : 0;
    arr.push(String(isNaN(n) ? 0 : n).padStart(2, '0'));
  }
  return arr.join('');
}

// ============================================================
// The main migration engine
// ============================================================

/**
 * Migrate config data from one version to another.
 *
 * @param {object} config  Flat config object: { 'OPTION': { value, enabled }, ... }
 * @param {string} from    Source version (e.g., '2.0.5')
 * @param {string} to      Target version (e.g., '2.1.2.5')
 * @returns {{ config, log, warnings }}
 */
function migrateConfig(config, from, to) {
  const log = [];
  const warnings = [];
  const result = { ...config }; // shallow copy — we'll mutate in place

  // Walk the migration steps in order.
  // Apply ALL steps up to the target version. Transforms are idempotent:
  // if an old option name doesn't exist in the config, nothing happens.
  // This ensures that even if the user's config version says "2.0.5" but
  // they never migrated their configs (still carrying old names from 2.0.4),
  // the 2.0.4→2.0.5 step will still rename those options.
  for (const step of migrationSteps) {
    // Compare using hex keys. Steps whose from version is >= the target
    // version are beyond the migration range.
    if (versionToHex(step.from) >= versionToHex(to)) break;

    // Found a step within our version range
    log.push(`\n--- ${step.from} → ${step.to} ---`);

    if (step.note) {
      if (!step.note.startsWith('no changes'))
        log.push(`  Note: ${step.note}`);
      else
        log.push(`  ${step.note}`);
    }

    // Apply simple renames
    if (step.rename) {
      for (const [oldName, newName] of Object.entries(step.rename)) {
        _rename(result, log, oldName, newName);
      }
    }

    // Apply transform functions
    if (step.transforms) {
      for (const fn of step.transforms) {
        fn(result, log, warnings);
      }
    }

    // Collect warnings
    if (step.warnings) {
      for (const w of step.warnings) {
        if (!warnings.includes(w)) warnings.push(w);
      }
    }
  }

  return { config: result, log, warnings };
}

/**
 * Find the nearest embedded config version for a given hex version.
 * Used to locate the right Conditionals_LCD.h for parsing old configs.
 *
 * @param {string} hexVer  The MARLIN_HEX_VERSION or CONFIGURATION_H_VERSION string.
 * @returns {string} The nearest configs/ subdirectory name, or null.
 */
function nearestConfigVersion(hexVer) {
  // Available embedded config version directories
  const available = [
    '1.1.9', '2.0.0', '2.0.1', '2.0.2', '2.0.3', '2.0.4',
    '2.0.5', '2.0.6', '2.0.7', '2.0.8', '2.0.8.1',
    '2.0.9', '2.0.9.1', '2.0.9.2', '2.0.9.3', '2.0.9.4', '2.0.9.5',
    '2.1.0', '2.1.1', '2.1.2', '2.1.2.1', '2.1.2.2', '2.1.2.3',
    '2.1.2.4', '2.1.2.5', '2.1.2.6', '2.1.2.7', '2.1.2.8', '2.1.3'
  ];

  if (!hexVer) return null;

  // Normalize the hex version string using hexToVersion for comparison
  const verHex = versionToHex(hexVer);

  // Find the closest available version ≤ hexVer
  let best = null;
  for (const av of available) {
    if (versionToHex(av) <= verHex)
      best = av;
    else
      break;
  }
  return best;
}

module.exports = {
  migrationSteps,
  migrateConfig,
  nearestConfigVersion,
  hexToVersion,
  versionToHex,
};
