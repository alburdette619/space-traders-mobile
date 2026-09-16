import { Ship } from '../api/models/models-Ship/ship';

export type AlertType =
  | 'cargoFull'
  | 'cooldown'
  | 'damage'
  | 'deadline'
  | 'idle'
  | 'lowFuel'
  | 'lowMorale';

export interface ContractAlert extends Omit<ShipAlert, 'shipId'> {
  contractId: string;
  type: 'deadline';
}

export interface ShipAction {
  isEnabled: boolean;
  label: string;
  type: ShipActionType;
  unavailableReason?: string;
}

export type ShipActionType =
  | 'chart'
  | 'dock'
  | 'enterOrbit'
  | 'extract'
  | 'navigate'
  | 'refine'
  | 'refuel'
  | 'repair'
  | 'scan'
  | 'siphon'
  | 'survey'
  | 'trade';

export interface ShipAlert {
  severity: 'crit' | 'warn';
  shipId: string;
  type: Omit<AlertType, 'deadline'>;
}

export interface ShipStatusCounts {
  docked: number;
  inOrbit: number;
  inTransit: number;
}

export interface ShipWithAlerts extends Ship {
  alerts: ShipAlert[];
  isAlertCritical: boolean;
}

export interface SpaceTradersErrorResponse {
  error: {
    code: number;
    data?: Record<string, unknown>;
    message: string;
  };
}
