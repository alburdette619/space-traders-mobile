export interface FleetAlerts {
  cargoCapacityCritical: number;
  contractDeadlineCritical: number;
  contractDeadlineWarning: number;
  fuelLevelCritical: number;
  fuelLevelWarning: number;
  shipArrivingSoon: number;
  shipConditionCritical: number;
  shipConditionWarning: number;
  shipCooldownExpired: number;
  shipCrewMoraleLow: number;
  shipIdleWarning: number;
  shipIntegrityCritical: number;
  shipIntegrityWarning: number;
}

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
