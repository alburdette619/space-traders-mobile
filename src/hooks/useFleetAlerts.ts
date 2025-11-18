import { differenceInMinutes, isPast, max } from 'date-fns';
import { merge, reduce } from 'lodash';
import { useCallback, useMemo } from 'react';

import { useGetContracts } from '../api/models/contracts/contracts';
import { useGetMyShips } from '../api/models/fleet/fleet';
import { Ship } from '../api/models/models-Ship/ship';
import { ShipAlert } from '../types/spaceTraders';

export interface FleetAlertsResult {
  alerts: ShipAlert[];
  isCritical: boolean;
  isFetchingAlerts: boolean;
}

const cargoCapacityThreshold = 0.95;
const contractDeadlineCriticalMinutes = 15;
const contractDeadlineWarningMinutes = 60;
const criticalDamageThreshold = 0.3;
const idleMinutesThreshold = 5;
const warningDamageThreshold = 0.6;

// Future: This would be nice to come from a backend endpoint.
export const useFleetAlerts = (): FleetAlertsResult => {
  const { data: ships, isFetching: isFetchingShips } = useGetMyShips();
  const { data: contracts, isFetching: isFetchingContracts } =
    useGetContracts();

  const getShipDamageAlerts = useCallback((ship: Ship): ShipAlert[] => {
    const systems = {
      engine: ship.engine,
      frame: ship.frame,
      reactor: ship.reactor,
    };

    return reduce(
      Object.values(systems),
      (acc, { condition, integrity }) => {
        if (
          condition < criticalDamageThreshold ||
          integrity < criticalDamageThreshold
        ) {
          acc.push({
            severity: 'crit',
            shipId: ship.symbol,
            type: 'damage',
          });
        } else if (
          condition < warningDamageThreshold ||
          integrity < warningDamageThreshold
        ) {
          acc.push({
            severity: 'warn',
            shipId: ship.symbol,
            type: 'damage',
          });
        }

        return acc;
      },
      [] as ShipAlert[],
    );
  }, []);

  const isShipIdle = useCallback((ship: Ship, now: Date): boolean => {
    // A ship is considered idle if it has had no significant activity for a set period.
    // Significant activity includes arriving at a destination, completing cooldowns, or consuming fuel.
    const times = [
      new Date(ship.nav.route.arrival), // if arrival <= now
      ship.cooldown?.expiration ? new Date(ship.cooldown.expiration) : null,
      ship.fuel?.consumed?.timestamp
        ? new Date(ship.fuel.consumed.timestamp)
        : null,
    ]
      .filter(Boolean)
      .filter((t) => !!t && isPast(t)) as Date[];

    const lastEventTime = max(times);

    if (lastEventTime) {
      const minutesSinceLastEvent = differenceInMinutes(now, lastEventTime);

      // Consider idle if no activity for 5 minutes
      return minutesSinceLastEvent >= idleMinutesThreshold;
    }

    return false;
  }, []);

  return useMemo(() => {
    const alerts: ShipAlert[] = [];
    const now = new Date();

    if (!isFetchingShips) {
      ships?.data.forEach((ship) => {
        // Check for ship fuel levels. Some ships may not have fuel tanks / need fuel.
        const hasFuelTank = ship.fuel.capacity > 0;
        if (hasFuelTank) {
          if (ship.fuel.current === 0) {
            // Critical at no fuel
            alerts.push({
              severity: 'crit',
              shipId: ship.symbol,
              type: 'lowFuel',
            });
          } else if (ship.fuel.current <= ship.fuel.capacity * 0.1) {
            // Warning at 10% fuel
            alerts.push({
              severity: 'warn',
              shipId: ship.symbol,
              type: 'lowFuel',
            });
          }
        }

        // Check ship cargo, critical at 95% cargo
        if (
          ship.cargo.inventory.length >
          ship.cargo.capacity * cargoCapacityThreshold
        ) {
          alerts.push({
            severity: 'crit',
            shipId: ship.symbol,
            type: 'cargoFull',
          });
        }

        // Check ship crew morale, warning at 60% morale
        if (ship.crew.morale <= 60) {
          alerts.push({
            severity: 'warn',
            shipId: ship.symbol,
            type: 'lowMorale',
          });
        }

        // Check for idle ships
        const isIdle = isShipIdle(ship, now);
        if (isIdle) {
          alerts.push({
            severity: 'warn',
            shipId: ship.symbol,
            type: 'idle',
          });
        }

        // Check for ships with cooldowns expiring within 60 seconds
        const cooldownRemaining = ship.cooldown.remainingSeconds ?? 0;
        if (cooldownRemaining > 0 && cooldownRemaining <= 60) {
          alerts.push({
            severity: 'warn',
            shipId: ship.symbol,
            type: 'cooldown',
          });
        }

        // Check for ship damage alerts
        const damageAlerts = getShipDamageAlerts(ship);
        merge(alerts, damageAlerts);
      });
    }

    // Check for contract deadlines
    if (!isFetchingContracts) {
      contracts?.data.forEach((contract) => {
        if (!contract.terms.deadline) {
          return false;
        }

        const minutesLeft = differenceInMinutes(
          new Date(contract.terms.deadline),
          now,
        );

        if (minutesLeft <= contractDeadlineCriticalMinutes) {
          // Critical at less than 15 minutes
          alerts.push({
            contractId: contract.id,
            severity: 'crit',
            type: 'deadline',
          });
        } else if (minutesLeft <= contractDeadlineWarningMinutes) {
          // Warning at less than 1 hour
          alerts.push({
            contractId: contract.id,
            severity: 'warn',
            type: 'deadline',
          });
        }
      });
    }

    return {
      alerts,
      isCritical: alerts.some((alert) => alert.severity === 'crit'),
      isFetchingAlerts: isFetchingShips || isFetchingContracts,
    };
  }, [
    contracts,
    getShipDamageAlerts,
    isFetchingContracts,
    isFetchingShips,
    isShipIdle,
    ships,
  ]);
};
