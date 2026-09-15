import { useLayout } from '@react-native-community/hooks';
import { differenceInSeconds, isFuture } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Chip, Text, useTheme } from 'react-native-paper';
import { useCountdown } from 'usehooks-ts';

import { Ship } from '@/src/api/models/models-Ship/ship';
import {
  getSystemWaypoints,
  useGetSystemWaypointsInfinite,
} from '@/src/api/models/systems/systems';
import {
  MapSnapshot,
  type MapSnapshotPoint,
} from '@/src/components/MapSnapshot';
import { ShipStatus } from '@/src/components/ShipStatus';
import { voidRunnerIcons } from '@/src/constants/icons';
import { useShipStatusText } from '@/src/hooks/useShipStatusText';
import { flexStyles, gapStyles } from '@/src/theme/globalStyles';
import { getHumanReadableCountdown } from '@/src/utils/dateTime';

interface ShipHudProps {
  ship: Ship;
}

export const ShipHud = ({ ship }: ShipHudProps) => {
  const { colors, roundness } = useTheme();

  const shipStatusText = useShipStatusText(ship);

  const {
    data: waypointPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useGetSystemWaypointsInfinite(
    ship.nav.systemSymbol,
    { limit: 20 },
    {
      query: {
        enabled: !!ship.nav.systemSymbol,
        getNextPageParam: (lastPage) => {
          if (!lastPage) return undefined;
          const { meta } = lastPage;
          return meta.page * meta.limit < meta.total
            ? meta.page + 1
            : undefined;
        },
        initialPageParam: 1,
        queryFn: ({ pageParam, signal }) =>
          getSystemWaypoints(
            ship.nav.systemSymbol,
            { limit: 20, page: Number(pageParam) },
            undefined,
            signal,
          ),
      },
    },
  );

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchNextPageError, isFetchingNextPage]);

  const waypoints = useMemo(
    () => waypointPages?.pages.flatMap((page) => page?.data ?? []) ?? [],
    [waypointPages?.pages],
  );

  const { height: cardHeight, onLayout: onCardLayout } = useLayout();

  const [initialArrivalSeconds, setInitialArrivalSeconds] = useState(0);
  const [initialCooldownSeconds, setInitialCooldownSeconds] = useState(0);

  const [
    secondsTillArrival,
    {
      resetCountdown: resetArrivalCountdown,
      startCountdown: startArrivalCountdown,
    },
  ] = useCountdown({
    countStart: initialArrivalSeconds,
  });
  const [
    secondsTillCooldown,
    {
      resetCountdown: resetCooldownCountdown,
      startCountdown: startCooldownCountdown,
    },
  ] = useCountdown({
    countStart: initialCooldownSeconds,
  });

  useEffect(() => {
    if (ship?.nav.route.arrival && isFuture(new Date(ship.nav.route.arrival))) {
      const arrivalInSeconds = Math.abs(
        differenceInSeconds(new Date(ship.nav.route.arrival), new Date()),
      );

      setInitialArrivalSeconds(arrivalInSeconds);

      resetArrivalCountdown();
      startArrivalCountdown();
    }

    if (ship?.cooldown.remainingSeconds > 0) {
      setInitialCooldownSeconds(ship.cooldown.remainingSeconds);

      resetCooldownCountdown();
      startCooldownCountdown();
    }
  }, [
    resetArrivalCountdown,
    resetCooldownCountdown,
    ship?.cooldown.remainingSeconds,
    ship?.nav.route.arrival,
    startArrivalCountdown,
    startCooldownCountdown,
  ]);

  const mapRoute = useMemo(() => {
    const { destination, origin } = ship.nav.route;

    if (
      ship.nav.status !== 'IN_TRANSIT' ||
      origin.systemSymbol !== destination.systemSymbol ||
      destination.systemSymbol !== ship.nav.systemSymbol
    ) {
      return undefined;
    }

    return { destination, origin };
  }, [ship.nav.route, ship.nav.status, ship.nav.systemSymbol]);

  const mapProgressTick =
    ship.nav.status === 'IN_TRANSIT' ? secondsTillArrival : 0;

  const shipMapPoint = useMemo<MapSnapshotPoint | undefined>(() => {
    if (mapRoute) {
      const departureTime = new Date(ship.nav.route.departureTime).getTime();
      const arrivalTime = new Date(ship.nav.route.arrival).getTime();
      const routeDuration = arrivalTime - departureTime;
      const currentTime =
        mapProgressTick > 0 ? arrivalTime - mapProgressTick * 1000 : Date.now();
      const routeProgress =
        routeDuration <= 0
          ? 1
          : Math.min(
              Math.max((currentTime - departureTime) / routeDuration, 0),
              1,
            );

      return {
        symbol: ship.symbol,
        x:
          mapRoute.origin.x +
          (mapRoute.destination.x - mapRoute.origin.x) * routeProgress,
        y:
          mapRoute.origin.y +
          (mapRoute.destination.y - mapRoute.origin.y) * routeProgress,
      };
    }

    const currentWaypoint = waypoints.find(
      ({ symbol }) => symbol === ship.nav.waypointSymbol,
    );

    if (currentWaypoint) return currentWaypoint;

    const { destination, origin } = ship.nav.route;
    const routeWaypoint = [destination, origin].find(
      ({ systemSymbol }) => systemSymbol === ship.nav.systemSymbol,
    );

    return routeWaypoint
      ? {
          symbol: ship.symbol,
          x: routeWaypoint.x,
          y: routeWaypoint.y,
        }
      : undefined;
  }, [mapProgressTick, mapRoute, ship.nav, ship.symbol, waypoints]);

  return (
    <Card onLayout={onCardLayout} style={[styles.card]}>
      <Card.Content
        style={[
          flexStyles.flexRow,
          {
            backgroundColor: `${colors.secondary}5c`,
            borderRadius: roundness * 3,
            paddingHorizontal: 0,
            paddingVertical: 0,
          },
        ]}
      >
        <View
          style={[
            flexStyles.flex,
            styles.halfContainer,
            gapStyles.gapSmall,
            styles.leftHalfContainer,
          ]}
        >
          <Text variant="labelSmall">{ship.symbol}</Text>
          <Text variant="labelSmall">{shipStatusText}</Text>
          <View style={[flexStyles.flexRow, styles.statusContainer]}>
            <ShipStatus
              isProgressBarShown={false}
              isVertical
              mode="text"
              ship={ship}
            />
            <View style={[gapStyles.gapSmall]}>
              {secondsTillArrival > 0 && (
                <Chip
                  icon={voidRunnerIcons.fleet}
                  mode="outlined"
                  textStyle={{ color: 'white' }}
                >
                  <Text variant="bodySmall">
                    {getHumanReadableCountdown(secondsTillArrival)}
                  </Text>
                </Chip>
              )}
              {secondsTillCooldown > 0 && (
                <Chip icon={voidRunnerIcons.cooldown} mode="outlined">
                  <Text variant="bodySmall">
                    {getHumanReadableCountdown(secondsTillCooldown)}
                  </Text>
                </Chip>
              )}
            </View>
          </View>
        </View>
        <View
          style={[
            styles.halfContainer,
            styles.rightHalfContainer,
            {
              backgroundColor: 'black',
              borderBottomRightRadius: roundness * 2.9,
              borderLeftColor: colors.onSecondaryContainer,
              borderLeftWidth: StyleSheet.hairlineWidth,
              borderTopRightRadius: roundness * 2.9,
              height: cardHeight,
            },
          ]}
        >
          <MapSnapshot
            focusPoint={shipMapPoint}
            points={waypoints}
            route={mapRoute}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 8,
  },
  halfContainer: {
    justifyContent: 'center',
  },
  leftHalfContainer: {
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 12,
    width: '56%',
  },
  rightHalfContainer: {
    overflow: 'hidden',
    width: '42%',
  },
  statusContainer: {
    justifyContent: 'space-between',
    width: '100%',
  },
});
