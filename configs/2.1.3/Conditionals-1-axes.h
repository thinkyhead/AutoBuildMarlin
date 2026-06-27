#if EXTRUDERS
  #define HAS_EXTRUDERS 1
  #define HAS_E_AXIS 1
  #if EXTRUDERS > 1
    #define HAS_MULTI_EXTRUDER 1
  #endif
  #define E_AXIS_N(E) AxisEnum(E_AXIS + E_INDEX_N(E))
#else
  #undef EXTRUDERS
  #define EXTRUDERS 0
  #undef SINGLENOZZLE
  #undef SWITCHING_EXTRUDER
  #undef MECHANICAL_SWITCHING_EXTRUDER
  #undef SWITCHING_NOZZLE
  #undef MECHANICAL_SWITCHING_NOZZLE
  #undef MIXING_EXTRUDER
  #undef HOTEND_IDLE_TIMEOUT
  #undef HOTEND_OVERSHOOT
  #undef DISABLE_E
  #undef PREVENT_LENGTHY_EXTRUDE
  #undef FILAMENT_SWITCH_AND_MOTION
  #undef FILAMENT_RUNOUT_SENSOR
  #undef FILAMENT_RUNOUT_DISTANCE_MM
  #undef FILAMENT_MOTION_SENSOR
  #undef FILAMENT_MOTION_DISTANCE_MM
  #undef DISABLE_OTHER_EXTRUDERS
#endif
#define E_OPTARG(N) OPTARG(HAS_MULTI_EXTRUDER, N)
#define E_TERN_(N)  TERN_(HAS_MULTI_EXTRUDER, N)
#define E_TERN0(N)  TERN0(HAS_MULTI_EXTRUDER, N)
#if ANY(SWITCHING_EXTRUDER, MECHANICAL_SWITCHING_EXTRUDER)
  #define HAS_SWITCHING_EXTRUDER 1
#endif
#if ANY(SWITCHING_NOZZLE, MECHANICAL_SWITCHING_NOZZLE)
  #define HAS_SWITCHING_NOZZLE 1
#endif
#ifdef MMU_MODEL
  #define HAS_MMU 1
  #define SINGLENOZZLE
  #define _PRUSA_MMU1             1
  #define _PRUSA_MMU2             2
  #define _PRUSA_MMU2S            3
  #define _PRUSA_MMU3             4
  #define _EXTENDABLE_EMU_MMU2   12
  #define _EXTENDABLE_EMU_MMU2S  13
  #define _EXTENDABLE_EMU_MMU3   14
  #define _MMU CAT(_,MMU_MODEL)
  #if _MMU == _PRUSA_MMU1
    #define HAS_PRUSA_MMU1 1
  #elif _MMU % 10 == _PRUSA_MMU2
    #define HAS_PRUSA_MMU2 1
  #elif _MMU % 10 == _PRUSA_MMU2S
    #define HAS_PRUSA_MMU2 1
    #define HAS_PRUSA_MMU2S 1
  #elif _MMU % 10 == _PRUSA_MMU3
    #define HAS_PRUSA_MMU3 1
  #endif
  #if _MMU == _EXTENDABLE_EMU_MMU2 || _MMU == _EXTENDABLE_EMU_MMU2S
    #define HAS_EXTENDABLE_MMU 1
  #endif
  #undef _MMU
  #undef _PRUSA_MMU1
  #undef _PRUSA_MMU2
  #undef _PRUSA_MMU2S
  #undef _PRUSA_MMU3
  #undef _EXTENDABLE_EMU_MMU2
  #undef _EXTENDABLE_EMU_MMU2S
  #undef _EXTENDABLE_EMU_MMU3
#endif
#if ENABLED(E_DUAL_STEPPER_DRIVERS)
  #define E_STEPPERS      2
  #define E_MANUAL        1
#elif HAS_SWITCHING_EXTRUDER
  #if EXTRUDERS > 4
    #define E_STEPPERS    3
  #elif EXTRUDERS > 2
    #define E_STEPPERS    2
  #else
    #define E_STEPPERS    1
  #endif
#elif ENABLED(MIXING_EXTRUDER)
  #define E_STEPPERS      MIXING_STEPPERS
  #define E_MANUAL        1
  #if MIXING_STEPPERS == 2
    #define HAS_DUAL_MIXING 1
  #endif
  #ifndef MIXING_VIRTUAL_TOOLS
    #define MIXING_VIRTUAL_TOOLS 1
  #endif
#elif ENABLED(SWITCHING_TOOLHEAD)
  #define E_STEPPERS      EXTRUDERS
  #define E_MANUAL        EXTRUDERS
#elif HAS_PRUSA_MMU2 || HAS_PRUSA_MMU3
  #define E_STEPPERS      1
  #define E_MANUAL        1
#endif
#ifndef E_STEPPERS
  #define E_STEPPERS EXTRUDERS
#endif
#ifndef E_MANUAL
  #define E_MANUAL EXTRUDERS
#endif
#if ANY(SINGLENOZZLE, MIXING_EXTRUDER)
  #define HOTENDS 1
#elif HAS_SWITCHING_EXTRUDER && !HAS_SWITCHING_NOZZLE
  #define HOTENDS E_STEPPERS
#elif TEMP_SENSOR_0
  #define HOTENDS EXTRUDERS
#else
  #define HOTENDS 0
#endif
#if HOTENDS
  #define HAS_HOTEND 1
  #ifndef HOTEND_OVERSHOOT
    #define HOTEND_OVERSHOOT 15
  #endif
  #ifndef MIN_POWER
    #define MIN_POWER 0
  #endif
#else
  #undef MPCTEMP
  #undef PIDTEMP
  #undef PREVENT_COLD_EXTRUSION
  #undef THERMAL_PROTECTION_HOTENDS
#endif
#if HOTENDS > 1
  #define HAS_MULTI_HOTEND 1
  #define HAS_HOTEND_OFFSET 1
  #ifndef HOTEND_OFFSET_X
    #define HOTEND_OFFSET_X { 0 }
  #endif
  #ifndef HOTEND_OFFSET_Y
    #define HOTEND_OFFSET_Y { 0 }
  #endif
  #ifndef HOTEND_OFFSET_Z
    #define HOTEND_OFFSET_Z { 0 }
  #endif
#else
  #undef HOTEND_OFFSET_X
  #undef HOTEND_OFFSET_Y
  #undef HOTEND_OFFSET_Z
#endif
#define UNUSED_TEMP_SENSOR(N) (!TEMP_SENSOR_##N || N >= HOTENDS)
#if UNUSED_TEMP_SENSOR(0)
  #undef TEMP_SENSOR_0
#endif
#if UNUSED_TEMP_SENSOR(1)
  #undef TEMP_SENSOR_1
#endif
#if UNUSED_TEMP_SENSOR(2)
  #undef TEMP_SENSOR_2
#endif
#if UNUSED_TEMP_SENSOR(3)
  #undef TEMP_SENSOR_3
#endif
#if UNUSED_TEMP_SENSOR(4)
  #undef TEMP_SENSOR_4
#endif
#if UNUSED_TEMP_SENSOR(5)
  #undef TEMP_SENSOR_5
#endif
#if UNUSED_TEMP_SENSOR(6)
  #undef TEMP_SENSOR_6
#endif
#if UNUSED_TEMP_SENSOR(7)
  #undef TEMP_SENSOR_7
#endif
#if !TEMP_SENSOR_BED
  #undef TEMP_SENSOR_BED
#endif
#if !TEMP_SENSOR_CHAMBER
  #undef TEMP_SENSOR_CHAMBER
#endif
#if !TEMP_SENSOR_PROBE
  #undef TEMP_SENSOR_PROBE
#endif
#if !TEMP_SENSOR_REDUNDANT
  #undef TEMP_SENSOR_REDUNDANT
#endif
#if !TEMP_SENSOR_BOARD
  #undef TEMP_SENSOR_BOARD
#endif
#if !TEMP_SENSOR_SOC
  #undef TEMP_SENSOR_SOC
#endif
#undef UNUSED_TEMP_SENSOR
#ifdef NUM_AXES
  #undef NUM_AXES
  #define NUM_AXES_WARNING 1
#endif
#ifdef W_DRIVER_TYPE
  #define NUM_AXES 9
#elif defined(V_DRIVER_TYPE)
  #define NUM_AXES 8
#elif defined(U_DRIVER_TYPE)
  #define NUM_AXES 7
#elif defined(K_DRIVER_TYPE)
  #define NUM_AXES 6
#elif defined(J_DRIVER_TYPE)
  #define NUM_AXES 5
#elif defined(I_DRIVER_TYPE)
  #define NUM_AXES 4
#elif defined(Z_DRIVER_TYPE)
  #define NUM_AXES 3
#elif defined(Y_DRIVER_TYPE)
  #define NUM_AXES 2
#elif defined(X_DRIVER_TYPE)
  #define NUM_AXES 1
#else
  #define NUM_AXES 0
#endif
#if NUM_AXES >= 1
  #define HAS_X_AXIS 1
  #define HAS_A_AXIS 1
  #if NUM_AXES >= 2
    #define HAS_Y_AXIS 1
    #define HAS_B_AXIS 1
    #if NUM_AXES >= 3
      #define HAS_Z_AXIS 1
      #define HAS_C_AXIS 1
      #if NUM_AXES >= 4
        #define HAS_I_AXIS 1
        #if NUM_AXES >= 5
          #define HAS_J_AXIS 1
          #if NUM_AXES >= 6
            #define HAS_K_AXIS 1
            #if NUM_AXES >= 7
              #define HAS_U_AXIS 1
              #if NUM_AXES >= 8
                #define HAS_V_AXIS 1
                #if NUM_AXES >= 9
                  #define HAS_W_AXIS 1
                #endif
              #endif
            #endif
          #endif
        #endif
      #endif
    #endif
  #endif
#endif
#if HAS_Z_AXIS
  #ifdef Z4_DRIVER_TYPE
    #define NUM_Z_STEPPERS 4
  #elif defined(Z3_DRIVER_TYPE)
    #define NUM_Z_STEPPERS 3
  #elif defined(Z2_DRIVER_TYPE)
    #define NUM_Z_STEPPERS 2
  #else
    #define NUM_Z_STEPPERS 1
  #endif
#endif
#if !HAS_X_AXIS
  #undef AVOID_OBSTACLES
  #undef X2_DRIVER_TYPE
  #undef X_ENABLE_ON
  #undef DISABLE_X
  #undef INVERT_X_DIR
  #undef X_HOME_DIR
  #undef X_MIN_POS
  #undef X_MAX_POS
  #undef MANUAL_X_HOME_POS
  #undef MIN_SOFTWARE_ENDSTOPS
  #undef MAX_SOFTWARE_ENDSTOPS
  #undef MIN_SOFTWARE_ENDSTOP_X
  #undef MAX_SOFTWARE_ENDSTOP_X
#endif
#if !HAS_Y_AXIS
  #undef AVOID_OBSTACLES
  #undef Y2_DRIVER_TYPE
  #undef Y_ENABLE_ON
  #undef DISABLE_Y
  #undef INVERT_Y_DIR
  #undef Y_HOME_DIR
  #undef Y_MIN_POS
  #undef Y_MAX_POS
  #undef MANUAL_Y_HOME_POS
  #undef MIN_SOFTWARE_ENDSTOP_Y
  #undef MAX_SOFTWARE_ENDSTOP_Y
#endif
#if !HAS_Z_AXIS
  #undef Z2_DRIVER_TYPE
  #undef Z3_DRIVER_TYPE
  #undef Z4_DRIVER_TYPE
  #undef Z_ENABLE_ON
  #undef DISABLE_Z
  #undef INVERT_Z_DIR
  #undef Z_HOME_DIR
  #undef Z_MIN_POS
  #undef Z_MAX_POS
  #undef MANUAL_Z_HOME_POS
  #undef Z_SAFE_HOMING
  #undef MIN_SOFTWARE_ENDSTOP_Z
  #undef MAX_SOFTWARE_ENDSTOP_Z
#endif
#if !HAS_I_AXIS
  #undef I_ENABLE_ON
  #undef DISABLE_I
  #undef INVERT_I_DIR
  #undef I_HOME_DIR
  #undef I_MIN_POS
  #undef I_MAX_POS
  #undef MANUAL_I_HOME_POS
  #undef MIN_SOFTWARE_ENDSTOP_I
  #undef MAX_SOFTWARE_ENDSTOP_I
#endif
#if !HAS_J_AXIS
  #undef J_ENABLE_ON
  #undef DISABLE_J
  #undef INVERT_J_DIR
  #undef J_HOME_DIR
  #undef J_MIN_POS
  #undef J_MAX_POS
  #undef MANUAL_J_HOME_POS
  #undef MIN_SOFTWARE_ENDSTOP_J
  #undef MAX_SOFTWARE_ENDSTOP_J
#endif
#if !HAS_K_AXIS
  #undef K_ENABLE_ON
  #undef DISABLE_K
  #undef INVERT_K_DIR
  #undef K_HOME_DIR
  #undef K_MIN_POS
  #undef K_MAX_POS
  #undef MANUAL_K_HOME_POS
  #undef MIN_SOFTWARE_ENDSTOP_K
  #undef MAX_SOFTWARE_ENDSTOP_K
#endif
#if !HAS_U_AXIS
  #undef U_ENABLE_ON
  #undef DISABLE_U
  #undef INVERT_U_DIR
  #undef U_HOME_DIR
  #undef U_MIN_POS
  #undef U_MAX_POS
  #undef MANUAL_U_HOME_POS
  #undef MIN_SOFTWARE_ENDSTOP_U
  #undef MAX_SOFTWARE_ENDSTOP_U
#endif
#if !HAS_V_AXIS
  #undef V_ENABLE_ON
  #undef DISABLE_V
  #undef INVERT_V_DIR
  #undef V_HOME_DIR
  #undef V_MIN_POS
  #undef V_MAX_POS
  #undef MANUAL_V_HOME_POS
  #undef MIN_SOFTWARE_ENDSTOP_V
  #undef MAX_SOFTWARE_ENDSTOP_V
#endif
#if !HAS_W_AXIS
  #undef W_ENABLE_ON
  #undef DISABLE_W
  #undef INVERT_W_DIR
  #undef W_HOME_DIR
  #undef W_MIN_POS
  #undef W_MAX_POS
  #undef MANUAL_W_HOME_POS
  #undef MIN_SOFTWARE_ENDSTOP_W
  #undef MAX_SOFTWARE_ENDSTOP_W
#endif
#if E_STEPPERS <= 7
  #undef INVERT_E7_DIR
  #undef E7_DRIVER_TYPE
  #if E_STEPPERS <= 6
    #undef INVERT_E6_DIR
    #undef E6_DRIVER_TYPE
    #if E_STEPPERS <= 5
      #undef INVERT_E5_DIR
      #undef E5_DRIVER_TYPE
      #if E_STEPPERS <= 4
        #undef INVERT_E4_DIR
        #undef E4_DRIVER_TYPE
        #if E_STEPPERS <= 3
          #undef INVERT_E3_DIR
          #undef E3_DRIVER_TYPE
          #if E_STEPPERS <= 2
            #undef INVERT_E2_DIR
            #undef E2_DRIVER_TYPE
            #if E_STEPPERS <= 1
              #undef INVERT_E1_DIR
              #undef E1_DRIVER_TYPE
              #if E_STEPPERS == 0
                #undef INVERT_E0_DIR
                #undef E0_DRIVER_TYPE
              #endif
            #endif
          #endif
        #endif
      #endif
    #endif
  #endif
#endif
#define _OR_HAS_DA(A) ENABLED(DISABLE_##A) ||
#if MAP(_OR_HAS_DA, X, Y, Z, I, J, K, U, V, W) 0
  #define HAS_DISABLE_MAIN_AXES 1
#endif
#if HAS_DISABLE_MAIN_AXES || ENABLED(DISABLE_E)
  #define HAS_DISABLE_AXES 1
#endif
#undef _OR_HAS_DA
#ifdef X2_DRIVER_TYPE
  #define HAS_X2_STEPPER 1
#endif
#ifdef Y2_DRIVER_TYPE
  #define HAS_Y2_STEPPER 1
#endif
#if NUM_AXES >= 3
  #define PRIMARY_LINEAR_AXES 3
#else
  #define PRIMARY_LINEAR_AXES NUM_AXES
#endif
#define SECONDARY_AXES SUB3(NUM_AXES)
#if ENABLED(AXIS9_ROTATES)
  #define ROTATIONAL_AXES 6
#elif ENABLED(AXIS8_ROTATES)
  #define ROTATIONAL_AXES 5
#elif ENABLED(AXIS7_ROTATES)
  #define ROTATIONAL_AXES 4
#elif ENABLED(AXIS6_ROTATES)
  #define ROTATIONAL_AXES 3
#elif ENABLED(AXIS5_ROTATES)
  #define ROTATIONAL_AXES 2
#elif ENABLED(AXIS4_ROTATES)
  #define ROTATIONAL_AXES 1
#else
  #define ROTATIONAL_AXES 0
#endif
#if ROTATIONAL_AXES
  #define HAS_ROTATIONAL_AXES 1
#endif
#define SECONDARY_LINEAR_AXES (NUM_AXES - PRIMARY_LINEAR_AXES - ROTATIONAL_AXES)
#if HAS_EXTRUDERS
  #define LOGICAL_AXES INCREMENT(NUM_AXES)
#else
  #define LOGICAL_AXES NUM_AXES
#endif
#if ENABLED(DISTINCT_E_FACTORS) && E_STEPPERS > 1
  #define DISTINCT_AXES (NUM_AXES + E_STEPPERS)
  #define DISTINCT_E E_STEPPERS
  #define E_INDEX_N(E) (E)
#else
  #undef DISTINCT_E_FACTORS
  #define DISTINCT_AXES LOGICAL_AXES
  #define DISTINCT_E 1
  #define E_INDEX_N(E) 0
#endif
#define _DISTINCT_E_LOOP(E) for (int8_t E = 0; E < DISTINCT_E; E++)
#define DISTINCT_E_LOOP() _DISTINCT_E_LOOP(e)
#define _EXTRUDER_LOOP(E) for (int8_t E = 0; E < EXTRUDERS; E++)
#define EXTRUDER_LOOP() _EXTRUDER_LOOP(e)
#define _HOTEND_LOOP(H) for (int8_t H = 0; H < HOTENDS; H++)
#define HOTEND_LOOP() _HOTEND_LOOP(e)
#define ARRAY_BY_EXTRUDERS(V...) ARRAY_N(EXTRUDERS, V)
#define ARRAY_BY_EXTRUDERS1(v1) ARRAY_N_1(EXTRUDERS, v1)
#define ARRAY_BY_HOTENDS(V...) ARRAY_N(HOTENDS, V)
#define ARRAY_BY_HOTENDS1(v1) ARRAY_N_1(HOTENDS, v1)
