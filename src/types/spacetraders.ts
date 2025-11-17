export type AlertType =
  | 'cargoFull'
  | 'cooldown'
  | 'damage'
  | 'deadline'
  | 'idle'
  | 'lowFuel'
  | 'lowMorale';

export type ShipAlert = {
  contractId?: string;
  severity: 'crit' | 'warn';
  shipId?: string;
  type: AlertType;
};

export interface ShipStatusCounts {
  docked: number;
  inOrbit: number;
  inTransit: number;
}

export interface SpaceTradersErrorResponse {
  error: {
    code: number;
    data?: Record<string, unknown>;
    message: string;
  };
}
