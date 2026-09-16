import { type ShipActionType } from '../types/spaceTraders';

// Mapping of icon names to their corresponding icon identifiers from material-design-icons.
// These icons are used throughout the Void Runner application for various UI elements.
export const voidRunnerIcons = {
  alert: 'alert-outline',
  backButton: 'chevron-left',
  contracts: 'handshake-outline',
  contractsFocused: 'handshake',
  cooldown: 'progress-clock',
  credits: 'credit-card-chip-outline',
  fleet: 'rocket-launch-outline',
  fleetFocused: 'rocket-launch',
  galaxyMap: 'creation-outline',
  galaxyMapFocused: 'creation',
  help: 'help-circle',
  stats: 'chart-box-outline',
  statsFocused: 'chart-box',
} as const;

export const shipStatusIcons = {
  docked: 'space-station',
  inOrbit: 'orbit',
  inTransit: voidRunnerIcons.fleet,
} as const;

export const shipActionIcons: Record<ShipActionType, string> = {
  chart: 'map-marker-plus-outline',
  dock: 'anchor',
  enterOrbit: 'orbit',
  extract: 'pickaxe',
  navigate: 'navigation-variant-outline',
  refine: 'recycle',
  refuel: 'gas-station-outline',
  repair: 'wrench-outline',
  scan: 'radar',
  siphon: 'pipe',
  survey: 'map-search-outline',
  trade: 'swap-horizontal',
};
