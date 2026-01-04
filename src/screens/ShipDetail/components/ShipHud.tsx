import { useLayout } from '@react-native-community/hooks';
import { differenceInSeconds, isFuture } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Chip, Text, useTheme } from 'react-native-paper';
import { useCountdown } from 'usehooks-ts';
import { CartesianChart, Scatter } from 'victory-native';

import { Ship } from '@/src/api/models/models-Ship/ship';
import { useGetSystemWaypoints } from '@/src/api/models/systems/systems';
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

  const { data: waypointsData } = useGetSystemWaypoints(
    ship.nav.systemSymbol,
    // { limit: 100 },
    undefined,
    {
      query: { enabled: !!ship.nav.systemSymbol },
    },
  );

  console.log('Waypoints Data in HUD:', JSON.stringify(waypointsData, null, 2));

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

      console.log(ship.nav.route.arrival, arrivalInSeconds);
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

  //   const {} = useMemo(() => {}, []);

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
          <CartesianChart
            data={[
              { x: 1, y: 2 },
              { x: 2, y: 3 },
              { x: 3, y: 5 },
              { x: 4, y: 4 },
              { x: 5, y: 7 },
            ]}
            domain={{ x: [0, 10], y: [0, 10] }}
            frame={{ lineWidth: 0 }}
            xKey="x"
            yKeys={['y']}
          >
            {({ points }) => {
              console.log(points);

              return (
                <Scatter
                  color="red"
                  points={points.y}
                  radius={10}
                  shape="star"
                  style="fill"
                />
              );
            }}
          </CartesianChart>
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
    paddingLeft: 8,
    width: '42%',
  },
  statusContainer: {
    justifyContent: 'space-between',
    width: '100%',
  },
});
