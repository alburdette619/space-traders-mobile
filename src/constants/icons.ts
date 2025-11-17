// Mapping of icon names to their corresponding icon identifiers from material-design-icons.
// These icons are used throughout the Void Runner application for various UI elements.
export const voidRunnerIcons = {
  alert: 'alert-outline',
  backButton: 'chevron-left',
  contracts: 'handshake-outline',
  contractsFocused: 'handshake',
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
