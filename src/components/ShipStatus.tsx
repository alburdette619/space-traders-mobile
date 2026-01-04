import { isNumber } from 'lodash';
import { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Icon, ProgressBar, Text } from 'react-native-paper';

import { Ship } from '../api/models/models-Ship/ship';
import { flexStyles, gapStyles } from '../theme/globalStyles';
import { baseColors } from '../theme/voidTheme';

interface ShipStatusProps {
  containerStyle?: StyleProp<ViewStyle>;
  isProgressBarShown?: boolean;
  isVertical?: boolean;
  mode?: 'icon' | 'text';
  ship: Ship;
}

export const ShipStatus = ({
  containerStyle,
  isProgressBarShown = true,
  isVertical = false,
  mode = 'icon',
  ship,
}: ShipStatusProps) => {
  const { cargoStatus, crewStatus, fuelStatus, isEmptyStatus } = useMemo(() => {
    const hasFuelTank = ship.fuel.capacity > 0;
    const hasCargoHold = ship.cargo.capacity > 0;
    const hasCrew = ship.crew.capacity > 0;

    return {
      cargoStatus: hasCargoHold ? ship.cargo.units / ship.cargo.capacity : null,
      crewStatus: hasCrew ? ship.crew.morale : null,
      fuelStatus: hasFuelTank ? ship.fuel.current / ship.fuel.capacity : null,
      isEmptyStatus: !hasFuelTank && !hasCargoHold && !hasCrew,
    };
  }, [
    ship.cargo.capacity,
    ship.cargo.units,
    ship.crew.capacity,
    ship.crew.morale,
    ship.fuel,
  ]);

  return (
    <View style={[styles.statsContainer, containerStyle]}>
      <View style={isVertical ? [gapStyles.gapSmall] : flexStyles.flexRow}>
        {isNumber(fuelStatus) ? (
          <View
            style={[
              flexStyles.flexRow,
              isVertical &&
                !isProgressBarShown && { justifyContent: 'space-between' },
            ]}
          >
            {mode === 'icon' && <Icon size={16} source="barrel-outline" />}
            {mode === 'text' && <Text variant="labelSmall">Fuel:</Text>}
            <Text
              style={[styles.statsText, mode === 'icon' && styles.smallText]}
              variant="bodySmall"
            >
              {fuelStatus * 100}%
            </Text>
            {isProgressBarShown && (
              <ProgressBar
                color={baseColors.accentSolid}
                progress={fuelStatus}
                style={styles.progressBar}
              />
            )}
            {!isVertical && <Text variant="bodyLarge">•&nbsp;&nbsp;</Text>}
          </View>
        ) : null}
        {isNumber(cargoStatus) ? (
          <View
            style={[
              flexStyles.flexRow,
              isVertical &&
                !isProgressBarShown && { justifyContent: 'space-between' },
            ]}
          >
            {mode === 'icon' && (
              <Icon size={16} source="treasure-chest-outline" />
            )}
            {mode === 'text' && <Text variant="labelSmall">Cargo:</Text>}
            <Text
              style={[styles.statsText, mode === 'icon' && styles.smallText]}
              variant="bodySmall"
            >
              {/* {cargoStatus * 100}% */}
              100%
            </Text>
            {isProgressBarShown && (
              <ProgressBar
                color={baseColors.brandSolid}
                progress={cargoStatus}
                style={styles.progressBar}
              />
            )}
            {!isVertical && <Text variant="bodyLarge">•&nbsp;&nbsp;</Text>}
          </View>
        ) : null}
        {isNumber(crewStatus) ? (
          <View
            style={[
              flexStyles.flexRow,
              isVertical &&
                !isProgressBarShown && { justifyContent: 'space-between' },
            ]}
          >
            {mode === 'icon' && (
              <Icon size={16} source="account-group-outline" />
            )}
            {mode === 'text' && <Text variant="labelSmall">Crew:</Text>}
            <Text
              style={[styles.statsText, mode === 'icon' && styles.smallText]}
              variant="bodySmall"
            >
              {crewStatus}%
            </Text>
            {isProgressBarShown && (
              <ProgressBar
                color={baseColors.infoSolid}
                progress={crewStatus / 100}
                style={styles.progressBar}
              />
            )}
          </View>
        ) : null}
      </View>
      {isEmptyStatus ? (
        <Text style={styles.emptyStats} variant="labelSmall">
          ---
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyStats: { paddingRight: 4 },
  progressBar: {
    transform: [{ rotate: '-90deg' }],
    width: 16,
  },
  smallText: {
    fontSize: 10,
  },
  statsContainer: {},
  statsText: {
    marginLeft: 4,
  },
});
