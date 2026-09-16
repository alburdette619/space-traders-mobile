import { ShipModuleSymbol } from '../api/models/models-ShipModule/shipModuleSymbol';
import { ShipMountSymbol } from '../api/models/models-ShipMount/shipMountSymbol';
import { type ShipActionType } from '../types/spaceTraders';

export const ShipModuleCapabilities = {
  [ShipModuleSymbol.MODULE_CARGO_HOLD_I]: [],
  [ShipModuleSymbol.MODULE_CARGO_HOLD_II]: [],
  [ShipModuleSymbol.MODULE_CARGO_HOLD_III]: [],
  [ShipModuleSymbol.MODULE_CREW_QUARTERS_I]: [],
  [ShipModuleSymbol.MODULE_ENVOY_QUARTERS_I]: [],
  [ShipModuleSymbol.MODULE_FUEL_REFINERY_I]: ['refine'],
  [ShipModuleSymbol.MODULE_GAS_PROCESSOR_I]: ['siphon'],
  [ShipModuleSymbol.MODULE_JUMP_DRIVE_I]: [],
  [ShipModuleSymbol.MODULE_JUMP_DRIVE_II]: [],
  [ShipModuleSymbol.MODULE_JUMP_DRIVE_III]: [],
  [ShipModuleSymbol.MODULE_MICRO_REFINERY_I]: ['refine'],
  [ShipModuleSymbol.MODULE_MINERAL_PROCESSOR_I]: [],
  [ShipModuleSymbol.MODULE_ORE_REFINERY_I]: ['refine'],
  [ShipModuleSymbol.MODULE_PASSENGER_CABIN_I]: [],
  [ShipModuleSymbol.MODULE_SCIENCE_LAB_I]: [],
  [ShipModuleSymbol.MODULE_SHIELD_GENERATOR_I]: [],
  [ShipModuleSymbol.MODULE_SHIELD_GENERATOR_II]: [],
  [ShipModuleSymbol.MODULE_WARP_DRIVE_I]: [],
  [ShipModuleSymbol.MODULE_WARP_DRIVE_II]: [],
  [ShipModuleSymbol.MODULE_WARP_DRIVE_III]: [],
} as const satisfies Record<ShipModuleSymbol, readonly ShipActionType[]>;

export const ShipMountCapabilities = {
  [ShipMountSymbol.MOUNT_GAS_SIPHON_I]: ['siphon'],
  [ShipMountSymbol.MOUNT_GAS_SIPHON_II]: ['siphon'],
  [ShipMountSymbol.MOUNT_GAS_SIPHON_III]: ['siphon'],
  [ShipMountSymbol.MOUNT_LASER_CANNON_I]: [],
  [ShipMountSymbol.MOUNT_MINING_LASER_I]: ['extract'],
  [ShipMountSymbol.MOUNT_MINING_LASER_II]: ['extract'],
  [ShipMountSymbol.MOUNT_MINING_LASER_III]: ['extract'],
  [ShipMountSymbol.MOUNT_MISSILE_LAUNCHER_I]: [],
  [ShipMountSymbol.MOUNT_SENSOR_ARRAY_I]: ['scan'],
  [ShipMountSymbol.MOUNT_SENSOR_ARRAY_II]: ['scan'],
  [ShipMountSymbol.MOUNT_SENSOR_ARRAY_III]: ['scan'],
  [ShipMountSymbol.MOUNT_SURVEYOR_I]: ['survey'],
  [ShipMountSymbol.MOUNT_SURVEYOR_II]: ['survey'],
  [ShipMountSymbol.MOUNT_SURVEYOR_III]: ['survey'],
  [ShipMountSymbol.MOUNT_TURRET_I]: [],
} as const satisfies Record<ShipMountSymbol, readonly ShipActionType[]>;
