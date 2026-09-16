import { useMemo } from 'react';

import { type Ship } from '../api/models/models-Ship/ship';
import { ShipNavStatus } from '../api/models/models-ShipNavStatus/shipNavStatus';
import { ShipRole } from '../api/models/models-ShipRole/shipRole';
import { TradeSymbol } from '../api/models/models-TradeSymbol/tradeSymbol';
import { type Waypoint } from '../api/models/models-Waypoint/waypoint';
import { WaypointTraitSymbol } from '../api/models/models-WaypointTraitSymbol/waypointTraitSymbol';
import { WaypointType } from '../api/models/models-WaypointType/waypointType';
import { useGetMarket, useGetWaypoint } from '../api/models/systems/systems';
import {
  ShipActionUnavailableReasons,
  ShipModuleCapabilities,
  ShipMountCapabilities,
} from '../constants/shipActionConstants';
import { type ShipAction, type ShipActionType } from '../types/spaceTraders';
import { getHumanReadableCountdown } from '../utils/dateTime';

const ExtractableWaypointTypes: Waypoint['type'][] = [
  WaypointType.ASTEROID,
  WaypointType.ASTEROID_FIELD,
  WaypointType.DEBRIS_FIELD,
  WaypointType.ENGINEERED_ASTEROID,
];

const getRolePriorityAdjustment = (
  actionType: ShipActionType,
  role: Ship['registration']['role'],
) => {
  if (
    actionType === 'trade' &&
    (role === ShipRole.CARRIER ||
      role === ShipRole.HAULER ||
      role === ShipRole.TRANSPORT)
  ) {
    return -20;
  }

  if (actionType === 'extract' && role === ShipRole.EXCAVATOR) return -30;
  if (actionType === 'siphon' && role === ShipRole.HARVESTER) return -30;
  if (actionType === 'survey' && role === ShipRole.SURVEYOR) return -30;
  if (actionType === 'refine' && role === ShipRole.REFINERY) return -30;
  if (actionType === 'repair' && role === ShipRole.REPAIR) return -20;

  if (
    ['chart', 'scan'].includes(actionType) &&
    (role === ShipRole.EXPLORER || role === ShipRole.SATELLITE)
  ) {
    return -25;
  }

  return 0;
};

export const useGetShipActions = (ship: Ship) => {
  const isDocked = ship.nav.status === ShipNavStatus.DOCKED;
  const isInOrbit = ship.nav.status === ShipNavStatus.IN_ORBIT;
  const isInTransit = ship.nav.status === ShipNavStatus.IN_TRANSIT;

  const waypointQuery = useGetWaypoint(
    ship.nav.systemSymbol,
    ship.nav.waypointSymbol,
    {
      query: {
        enabled: !isInTransit,
        staleTime: Infinity,
      },
    },
  );
  const waypoint = waypointQuery.data?.data;
  const hasMarketplace =
    waypoint?.traits.some(
      ({ symbol }) => symbol === WaypointTraitSymbol.MARKETPLACE,
    ) ?? false;

  const shouldFetchMarket = isDocked && hasMarketplace;
  const marketQuery = useGetMarket(
    ship.nav.systemSymbol,
    ship.nav.waypointSymbol,
    {
      query: {
        enabled: shouldFetchMarket,
        staleTime: 60_000,
      },
    },
  );

  const actions = useMemo(() => {
    if (isInTransit) return [];

    const candidates: { action: ShipAction; priority: number }[] = [];
    const addAction = (action: ShipAction, priority: number) => {
      candidates.push({
        action,
        priority:
          priority +
          getRolePriorityAdjustment(action.type, ship.registration.role),
      });
    };
    const hasMountCapability = (actionType: ShipActionType) =>
      ship.mounts.some(({ symbol }) => {
        const capabilities: readonly ShipActionType[] =
          ShipMountCapabilities[symbol];
        return capabilities?.includes(actionType) ?? false;
      });
    const hasModuleCapability = (actionType: ShipActionType) =>
      ship.modules.some(({ symbol }) => {
        const capabilities: readonly ShipActionType[] =
          ShipModuleCapabilities[symbol];
        return capabilities?.includes(actionType) ?? false;
      });
    const hasTrait = (traitSymbol: WaypointTraitSymbol) =>
      waypoint?.traits.some(({ symbol }) => symbol === traitSymbol) ?? false;
    const cooldownReason =
      ship.cooldown.remainingSeconds > 0
        ? ShipActionUnavailableReasons.cooldown(
            getHumanReadableCountdown(ship.cooldown.remainingSeconds),
          )
        : undefined;
    const hasCargoSpace = ship.cargo.units < ship.cargo.capacity;
    const cargoSpaceReason = hasCargoSpace
      ? undefined
      : ShipActionUnavailableReasons.cargoFull;

    if (isDocked) {
      addAction(
        {
          isEnabled: true,
          label: 'Enter orbit',
          type: 'enterOrbit',
        },
        10,
      );
    }

    if (isInOrbit) {
      addAction(
        {
          isEnabled: true,
          label: 'Navigate',
          type: 'navigate',
        },
        10,
      );
      addAction(
        {
          isEnabled: true,
          label: 'Dock',
          type: 'dock',
        },
        20,
      );
    }

    if (isDocked && hasMarketplace && ship.cargo.capacity > 0) {
      addAction(
        {
          isEnabled: true,
          label: 'Trade',
          type: 'trade',
        },
        20,
      );
    }

    const market = marketQuery.data?.data;
    const sellsFuel =
      market?.exports.some(({ symbol }) => symbol === TradeSymbol.FUEL) ||
      market?.exchange.some(({ symbol }) => symbol === TradeSymbol.FUEL);

    if (
      isDocked &&
      hasMarketplace &&
      sellsFuel &&
      ship.fuel.capacity > 0 &&
      ship.fuel.current < ship.fuel.capacity
    ) {
      addAction(
        {
          isEnabled: true,
          label: 'Refuel',
          type: 'refuel',
        },
        30,
      );
    }

    const isExtractableWaypoint = waypoint
      ? ExtractableWaypointTypes.includes(waypoint.type)
      : false;

    if (isInOrbit && isExtractableWaypoint && hasMountCapability('extract')) {
      const unavailableReason = cooldownReason ?? cargoSpaceReason;
      addAction(
        {
          isEnabled: !unavailableReason,
          label: 'Extract',
          type: 'extract',
          unavailableReason,
        },
        30,
      );
    }

    if (
      isInOrbit &&
      waypoint?.type === WaypointType.GAS_GIANT &&
      hasMountCapability('siphon') &&
      hasModuleCapability('siphon')
    ) {
      const unavailableReason = cooldownReason ?? cargoSpaceReason;
      addAction(
        {
          isEnabled: !unavailableReason,
          label: 'Siphon',
          type: 'siphon',
          unavailableReason,
        },
        30,
      );
    }

    if (isInOrbit && isExtractableWaypoint && hasMountCapability('survey')) {
      addAction(
        {
          isEnabled: !cooldownReason,
          label: 'Survey',
          type: 'survey',
          unavailableReason: cooldownReason,
        },
        30,
      );
    }

    if (isInOrbit && hasMountCapability('scan')) {
      addAction(
        {
          isEnabled: !cooldownReason,
          label: 'Scan',
          type: 'scan',
          unavailableReason: cooldownReason,
        },
        35,
      );
    }

    if (isInOrbit && hasTrait(WaypointTraitSymbol.UNCHARTED)) {
      addAction(
        {
          isEnabled: true,
          label: 'Chart waypoint',
          type: 'chart',
        },
        25,
      );
    }

    const hasRefinery = hasModuleCapability('refine');
    const hasProcessableCargo = ship.cargo.inventory.some(
      ({ symbol, units }) =>
        units >= 100 &&
        (symbol.endsWith('_ORE') || symbol === TradeSymbol.HYDROCARBON),
    );

    if (hasRefinery) {
      const unavailableReason =
        cooldownReason ??
        (!hasProcessableCargo
          ? ShipActionUnavailableReasons.rawCargoRequired
          : undefined);
      addAction(
        {
          isEnabled: !unavailableReason,
          label: 'Refine',
          type: 'refine',
          unavailableReason,
        },
        40,
      );
    }

    const hasShipyard = hasTrait(WaypointTraitSymbol.SHIPYARD);

    if (isDocked && hasShipyard) {
      const needsRepair = [ship.engine, ship.frame, ship.reactor].some(
        ({ condition }) => condition < 1,
      );

      if (needsRepair) {
        addAction(
          {
            isEnabled: true,
            label: 'Repair',
            type: 'repair',
          },
          40,
        );
      }
    }

    return candidates
      .sort((left, right) => left.priority - right.priority)
      .map(({ action }) => action);
  }, [
    hasMarketplace,
    isDocked,
    isInOrbit,
    isInTransit,
    marketQuery.data,
    ship,
    waypoint,
  ]);

  return {
    actions,
    error: waypointQuery.error ?? marketQuery.error,
    isError:
      waypointQuery.isError || (shouldFetchMarket && marketQuery.isError),
    isPending:
      (!isInTransit && waypointQuery.isPending) ||
      (shouldFetchMarket && marketQuery.isPending),
  };
};
