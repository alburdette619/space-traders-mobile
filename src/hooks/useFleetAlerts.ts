import {
  differenceInMinutes,
  differenceInSeconds,
  isPast,
  max,
} from 'date-fns';
import { merge, reduce } from 'lodash';
import { useCallback, useMemo } from 'react';

import { useGetContracts } from '../api/models/contracts/contracts';
import { useGetMyShips } from '../api/models/fleet/fleet';
import { Ship } from '../api/models/models-Ship/ship';
import { FleetAlerts } from '../types/spaceTraders';

const cargoCapacityThreshold = 0.95;
const contractDeadlineCriticalMinutes = 15;
const contractDeadlineWarningMinutes = 60;
const criticalDamageThreshold = 0.3;
const idleMinutesThreshold = 5;
const warningDamageThreshold = 0.6;

export const fleetAlertMessages: Record<keyof FleetAlerts, string> = {
  cargoCapacityCritical: `cargo ${cargoCapacityThreshold * 100}%`,
  contractDeadlineCritical: `deadline <${contractDeadlineCriticalMinutes}m`,
  contractDeadlineWarning: `deadline <${contractDeadlineWarningMinutes}m`,
  fuelLevelCritical: `out of fuel`,
  fuelLevelWarning: `fuel low`,
  shipArrivingSoon: `arriving soon`,
  shipConditionCritical: `needs repairs!`,
  shipConditionWarning: `needs repairs`,
  shipCooldownExpired: `cooldown ready`,
  shipCrewMoraleLow: `low morale`,
  shipIdleWarning: `idle >${idleMinutesThreshold}m`,
  shipIntegrityCritical: `ship degraded!`,
  shipIntegrityWarning: `ship degrading`,
};

// Future: This would be nice to come from a backend endpoint.
export const useFleetAlerts = (): Partial<FleetAlerts> => {
  const { data: ships, isFetching: isFetchingShips } = useGetMyShips();
  const { data: contracts, isFetching: isFetchingContracts } =
    useGetContracts();

  const now = new Date();

  const getShipDamageAlerts = useCallback(
    (ship: Ship): Partial<FleetAlerts> => {
      const systems = {
        engine: ship.engine,
        frame: ship.frame,
        reactor: ship.reactor,
      };

      return reduce(
        Object.values(systems),
        (acc, { condition, integrity }) => {
          if (condition < criticalDamageThreshold) {
            acc.shipConditionCritical = (acc.shipConditionCritical || 0) + 1;
          } else if (condition < warningDamageThreshold) {
            acc.shipConditionWarning = (acc.shipConditionWarning || 0) + 1;
          }

          if (integrity < criticalDamageThreshold) {
            acc.shipIntegrityCritical = (acc.shipIntegrityCritical || 0) + 1;
          } else if (integrity < warningDamageThreshold) {
            acc.shipIntegrityWarning = (acc.shipIntegrityWarning || 0) + 1;
          }

          return acc;
        },
        {} as Partial<FleetAlerts>,
      );
    },
    [],
  );

  const isShipIdle = useCallback((ship: Ship): boolean => {
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
    const alerts: Partial<FleetAlerts> = {};

    if (!isFetchingShips) {
      ships?.data.forEach((ship) => {
        // Check for ship fuel levels. Some ships may not have fuel tanks / need fuel.
        const hasFuelTank = ship.fuel.capacity > 0;
        if (hasFuelTank) {
          if (ship.fuel.current === 0) {
            // Critical at no fuel
            alerts.fuelLevelCritical = (alerts.fuelLevelCritical || 0) + 1;
          } else if (ship.fuel.current <= ship.fuel.capacity * 0.1) {
            // Warning at 10% fuel
            alerts.fuelLevelWarning = (alerts.fuelLevelWarning || 0) + 1;
          }
        }

        // Check ship cargo, critical at 95% cargo
        if (
          ship.cargo.inventory.length >
          ship.cargo.capacity * cargoCapacityThreshold
        ) {
          alerts.cargoCapacityCritical =
            (alerts.cargoCapacityCritical || 0) + 1;
        }

        // Check ship crew morale, warning at 60% morale
        if (ship.crew.morale <= 60) {
          alerts.shipCrewMoraleLow = (alerts.shipCrewMoraleLow || 0) + 1;
        }

        // Check for idle ships
        const isIdle = isShipIdle(ship);
        if (isIdle) {
          alerts.shipIdleWarning = (alerts.shipIdleWarning || 0) + 1;
        }

        // Check for ships arriving within 1 minute or less
        if (
          ship.nav.status === 'IN_TRANSIT' &&
          differenceInSeconds(now, new Date(ship.nav.route.arrival)) <= 60
        ) {
          alerts.shipArrivingSoon = (alerts.shipArrivingSoon || 0) + 1;
        }

        // Check for ships with cooldowns expiring within 60 seconds
        const cooldownRemaining = ship.cooldown.remainingSeconds ?? 0;
        if (cooldownRemaining > 0 && cooldownRemaining <= 60) {
          alerts.shipCooldownExpired = (alerts.shipCooldownExpired || 0) + 1;
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
          alerts.contractDeadlineCritical =
            (alerts.contractDeadlineCritical || 0) + 1;
        } else if (minutesLeft <= contractDeadlineWarningMinutes) {
          // Warning at less than 1 hour
          alerts.contractDeadlineWarning =
            (alerts.contractDeadlineWarning || 0) + 1;
        }
      });
    }
    return alerts;
  }, [
    contracts,
    getShipDamageAlerts,
    isFetchingContracts,
    isFetchingShips,
    isShipIdle,
    now,
    ships,
  ]);
};
