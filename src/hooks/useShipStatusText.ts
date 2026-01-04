import { startCase } from 'lodash';
import { useMemo } from 'react';

import { Ship } from '../api/models/models-Ship/ship';

export const useShipStatusText = (ship: Ship, showInTransitOrigin = false) => {
  const shipStatusText = useMemo(() => {
    let status = startCase(ship.nav.status.toLowerCase());
    const isInTransit = ship.nav.status === 'IN_TRANSIT';

    if (ship.nav.status === 'IN_ORBIT') {
      status += ` of ${ship.nav.waypointSymbol}`;
    } else if (ship.nav.status === 'DOCKED') {
      status += ` at ${ship.nav.waypointSymbol}`;
    } else if (isInTransit) {
      if (showInTransitOrigin) {
        status += `${ship.nav.route.origin.symbol} → ${ship.nav.route.destination.symbol}`;
      } else {
        status += ` to ${ship.nav.route.destination.symbol}`;
      }
    }
    return status;
  }, [
    ship.nav.route.destination,
    ship.nav.route.origin,
    ship.nav.status,
    ship.nav.waypointSymbol,
    showInTransitOrigin,
  ]);

  return shipStatusText;
};
