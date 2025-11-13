import { sortBy } from 'lodash';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Divider, Text } from 'react-native-paper';

import { fleetAlertMessages, useFleetAlerts } from '@/src/hooks/useFleetAlerts';
import { useFleetStore } from '@/src/stores/fleetStore';
import { flexStyles, gapStyles } from '@/src/theme/globalStyles';
import { baseColors, orbitronVariants } from '@/src/theme/voidTheme';
import { FleetAlerts } from '@/src/types/spaceTraders';

export const FleetAlertsSection = () => {
  const fleetAlerts = useFleetAlerts();
  const { setShipFilter, setShipSort } = useFleetStore();

  const handleAlertPress = useCallback(
    (_alertKey: string) => {
      // Reset filters and sorts
      setShipFilter('');
      setShipSort('');

      // TODO: Implement specific filtering based on alertKey
    },
    [setShipFilter, setShipSort],
  );

  const renderAlert = useCallback(
    ([key, quantity]: [key: string, quantity: number]) => {
      const message = fleetAlertMessages[key as keyof FleetAlerts];
      const isCriticalAlert = key.toLowerCase().includes('critical');

      if (message && quantity > 0) {
        return (
          <Chip
            key={key}
            onPress={() => handleAlertPress(key)}
            style={[
              styles.chip,
              isCriticalAlert ? styles.criticalStyle : styles.warningStyle,
            ]}
            textStyle={orbitronVariants.labelSmall}
          >{`${quantity} ${message}`}</Chip>
        );
      }

      return null;
    },
    [handleAlertPress],
  );

  return (
    <View style={[styles.container, gapStyles.gapMedium]}>
      <Text variant="titleMedium">{'/// Fleet Alerts:'}</Text>
      <View
        style={[flexStyles.flexRow, styles.chipContainer, gapStyles.gapSmall]}
      >
        {sortBy(Object.entries(fleetAlerts), ([key]) =>
          key.toLowerCase().includes('critical') ? 0 : 1,
        )
          .slice(0, 5)
          .map(renderAlert)}
      </View>
      <Divider bold />
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
  },
  chipContainer: {
    flexWrap: 'wrap',
  },
  container: {
    marginHorizontal: 8,
    marginTop: 8,
  },
  criticalStyle: {
    backgroundColor: baseColors.errorContainer,
    borderColor: baseColors.errorSolid,
    color: baseColors.onErrorContainer,
  },
  warningStyle: {
    backgroundColor: baseColors.warningContainer,
    borderColor: baseColors.warningSolid,
    color: baseColors.onWarningContainer,
  },
});
