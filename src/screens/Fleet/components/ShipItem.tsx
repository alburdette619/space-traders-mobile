import { useNavigation } from '@react-navigation/native';
import { addSeconds, formatDistanceToNow } from 'date-fns';
import { camelCase, isNumber, startCase } from 'lodash';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Card,
  Divider,
  Icon,
  List,
  ProgressBar,
  Text,
} from 'react-native-paper';

import { ShipStatus } from '@/src/components/ShipStatus';
import { shipStatusIcons } from '@/src/constants/icons';
import { useShipStatusText } from '@/src/hooks/useShipStatusText';
import { flexStyles, gapStyles, miscStyles } from '@/src/theme/globalStyles';
import { baseColors } from '@/src/theme/voidTheme';
import { ShipWithAlerts } from '@/src/types/spaceTraders';

interface ShipItemProps {
  ship: ShipWithAlerts;
}

export const ShipItem = ({ ship }: ShipItemProps) => {
  const { navigate } = useNavigation();

  const hasFuelTank = ship.fuel.capacity > 0;
  const hasCargoHold = ship.cargo.capacity > 0;
  const hasCrew = ship.crew.capacity > 0;

  const shipStatusText = useShipStatusText(ship);

  const handlePress = useCallback(() => {
    navigate('ShipDetail', { shipId: ship.symbol });
  }, [navigate, ship.symbol]);

  const renderTitle = useCallback(() => {
    return (
      <View style={[flexStyles.flexRow, styles.titleContainer]}>
        <View style={flexStyles.flexRow}>
          <Text variant="titleSmall">
            {ship.registration?.name || ship.symbol}
          </Text>
          <Text style={styles.roleText} variant="labelSmall">
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

    return (
      <View style={[flexStyles.flexRow]}>
        <View style={[flexStyles.flexRow, gapStyles.gapSmall]}>
          <Icon
            size={16}
            source={
              shipStatusIcons[camelStatus as keyof typeof shipStatusIcons]
            }
          />
          <Text variant="bodySmall">{shipStatusText}</Text>
        </View>
      </View>
    );
  }, [shipStatusText, ship.nav.status]);

  const renderStatuses = useCallback(() => {
    const isInTransit = ship.nav.status === 'IN_TRANSIT';
    const isStatusVisible = isInTransit || ship.cooldown.remainingSeconds > 0;

    return isStatusVisible ? (
      <View style={[flexStyles.flexRow, gapStyles.gapMedium]}>
        <View style={[gapStyles.gapSmall]}>
          {isInTransit && (
            <View style={[flexStyles.flexRow, gapStyles.gapSmall]}>
              <Icon size={16} source="rocket-launch-outline" />
              <Text
                style={styles.smallText}
                variant="bodySmall"
              >{` ${formatDistanceToNow(new Date(ship.nav.route.arrival))}`}</Text>
            </View>
          )}
          {ship.cooldown.remainingSeconds > 0 && !isInTransit && (
            <View style={[flexStyles.flexRow, gapStyles.gapSmall]}>
              <Icon size={16} source="progress-clock" />
              <Text
                style={styles.smallText}
                variant="bodySmall"
              >{` ${formatDistanceToNow(addSeconds(new Date(), ship.cooldown.remainingSeconds))}`}</Text>
            </View>
          )}
        </View>
        <Divider style={[miscStyles.verticalDivider, styles.contentDivider]} />
      </View>
    ) : null;
  }, [ship.cooldown.remainingSeconds, ship.nav.route.arrival, ship.nav.status]);

  return (
    <Card onPress={handlePress} style={[styles.card]}>
      <List.Item description={renderSubtitle()} title={renderTitle()} />
      <Card.Content
        style={[gapStyles.gapMedium, flexStyles.flexRow, , styles.cardContent]}
      >
        {renderStatuses()}
        <ShipStatus containerStyle={styles.statsContainer} ship={ship} />
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    marginHorizontal: 8,
    paddingVertical: 4,
  },
  cardContent: { justifyContent: 'space-between' },
  contentDivider: {
    height: 36,
  },
  roleText: {
    marginLeft: 8,
  },
  smallText: {
    fontSize: 10,
  },
  statsContainer: {
    alignItems: 'flex-end',
    width: '100%',
  },
  titleContainer: { justifyContent: 'space-between', width: '100%' },
});
