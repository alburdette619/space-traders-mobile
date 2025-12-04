import { addSeconds, formatDistanceToNow } from 'date-fns';
import { camelCase, isNumber, startCase } from 'lodash';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Icon, List, ProgressBar, Text } from 'react-native-paper';

import { shipStatusIcons } from '@/src/constants/icons';
import { flexStyles, gapStyles } from '@/src/theme/globalStyles';
import { baseColors } from '@/src/theme/voidTheme';
import { ShipWithAlerts } from '@/src/types/spaceTraders';

interface ShipItemProps {
  ship: ShipWithAlerts;
}

export const ShipItem = ({ ship }: ShipItemProps) => {
  const hasFuelTank = ship.fuel.capacity > 0;
  const hasCargoHold = ship.cargo.capacity > 0;
  const hasCrew = ship.crew.capacity > 0;

  const renderTitle = useCallback(() => {
    return (
      <View style={[flexStyles.flexRow, styles.spaceBetweenContainer]}>
        <View style={flexStyles.flexRow}>
          <Text variant="titleSmall">
            {ship.registration?.name || ship.symbol}
          </Text>
          <Text style={{ marginLeft: 8 }} variant="labelSmall">
            ({startCase(ship.registration?.role.toLowerCase())})
          </Text>
        </View>
        {ship.alerts.length > 0 && (
          <View style={[flexStyles.flexRow, gapStyles.gapSmall]}>
            {ship.alerts.length > 1 && (
              <Text variant="labelSmall">{ship.alerts.length}</Text>
            )}
            <Icon
              color={
                ship.isAlertCritical
                  ? baseColors.errorSolid
                  : baseColors.warningSolid
              }
              size={16}
              source="alert-outline"
            />
          </View>
        )}
      </View>
    );
  }, [
    ship.alerts.length,
    ship.isAlertCritical,
    ship.registration?.name,
    ship.registration?.role,
    ship.symbol,
  ]);

  const renderSubtitle = useCallback(() => {
    const camelStatus = camelCase(ship.nav.status);
    let status = startCase(ship.nav.status.toLowerCase());
    const isInTransit = ship.nav.status === 'IN_TRANSIT';

    if (ship.nav.status === 'IN_ORBIT') {
      status += ` of ${ship.nav.waypointSymbol}`;
    } else if (ship.nav.status === 'DOCKED') {
      status += ` at ${ship.nav.waypointSymbol}`;
    } else if (isInTransit) {
      status += `${ship.nav.route.origin.symbol} → ${ship.nav.route.destination.symbol}`;
    }

    return (
      <View style={[flexStyles.flexRow]}>
        <View style={[flexStyles.flexRow, gapStyles.gapSmall]}>
          <Icon
            size={16}
            source={
              shipStatusIcons[camelStatus as keyof typeof shipStatusIcons]
            }
          />
          <Text variant="bodySmall">{status}</Text>
        </View>
        {isInTransit && (
          <Text variant="bodySmall">{` • Arrives in ${formatDistanceToNow(new Date(ship.nav.route.arrival))}`}</Text>
        )}
        {ship.cooldown.remainingSeconds > 0 && !isInTransit && (
          <Text variant="bodySmall">{` • Cooldown in ${formatDistanceToNow(addSeconds(new Date(), ship.cooldown.remainingSeconds))}`}</Text>
        )}
      </View>
    );
  }, [
    ship.cooldown.remainingSeconds,
    ship.nav.route.arrival,
    ship.nav.route.destination,
    ship.nav.route.origin,
    ship.nav.status,
    ship.nav.waypointSymbol,
  ]);

  const renderStatuses = useCallback(() => {
    const fuelStatus = hasFuelTank
      ? ship.fuel.current / ship.fuel.capacity
      : null;
    const cargoStatus = hasCargoHold
      ? ship.cargo.units / ship.cargo.capacity
      : null;
    const crewStatus = hasCrew ? ship.crew.morale : null;

    return (
      <View style={[styles.spaceBetweenContainer, { alignItems: 'flex-end' }]}>
        <View style={[flexStyles.flexRow]}>
          {isNumber(fuelStatus) ? (
            <View style={flexStyles.flexRow}>
              <Icon size={16} source="barrel-outline" />
              <Text style={styles.statusText} variant="bodySmall">
                {fuelStatus * 100}%
              </Text>
              <ProgressBar
                color={baseColors.accentSolid}
                progress={fuelStatus}
                style={styles.progressBar}
              />
              <Text variant="bodyLarge">•&nbsp;&nbsp;</Text>
            </View>
          ) : null}
          {isNumber(cargoStatus) ? (
            <View style={flexStyles.flexRow}>
              <Icon size={16} source="treasure-chest-outline" />
              <Text style={styles.statusText} variant="bodySmall">
                {cargoStatus * 100}%
              </Text>
              <ProgressBar
                color={baseColors.brandSolid}
                progress={cargoStatus}
                style={styles.progressBar}
              />
              <Text variant="bodyLarge">•&nbsp;&nbsp;</Text>
            </View>
          ) : null}
          {isNumber(crewStatus) ? (
            <View style={flexStyles.flexRow}>
              <Icon size={16} source="account-group-outline" />
              <Text style={styles.statusText} variant="bodySmall">
                {crewStatus}%
              </Text>
              <ProgressBar
                color={baseColors.infoSolid}
                progress={crewStatus / 100}
                style={styles.progressBar}
              />
            </View>
          ) : null}
          {!hasFuelTank && !hasCargoHold && !hasCrew ? (
            <Text variant="labelSmall">---</Text>
          ) : null}
        </View>
      </View>
    );
  }, [ship.fuel, ship.cargo, ship.crew, hasFuelTank, hasCargoHold, hasCrew]);

  return (
    <Card style={[styles.card]}>
      <List.Item
        description={renderSubtitle()}
        title={renderTitle()}
        titleStyle={styles.titleContainer}
      />
      <Card.Content>{renderStatuses()}</Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    marginHorizontal: 8,
    paddingVertical: 4,
  },
  progressBar: {
    transform: [{ rotate: '-90deg' }],
    width: 16,
  },
  spaceBetweenContainer: { justifyContent: 'space-between', width: '100%' },
  statusText: {
    marginLeft: 4,
  },
  titleContainer: {
    // marginBottom: 4,
    // minHeight: undefined,
  },
});
