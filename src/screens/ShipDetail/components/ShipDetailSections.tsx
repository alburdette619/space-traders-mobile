import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { Ship } from '@/src/api/models/models-Ship/ship';
import { gapStyles } from '@/src/theme/globalStyles';

import { ShipActions } from './ShipActions';
import { ShipCargo } from './ShipCargo';
import { ShipLocalServices } from './ShipLocalServices';

export const ShipDetailSections = ({ ship }: { ship: Ship }) => {
  const { colors, roundness } = useTheme();
  const hasCargoHold =
    ship.cargo.capacity > 0 || ship.cargo.inventory.length > 0;
  const hasCrew =
    ship.crew.capacity > 0 || ship.crew.current > 0 || ship.crew.required > 0;
  const hasModuleSlots = ship.frame.moduleSlots > 0 || ship.modules.length > 0;
  const hasMountingPoints =
    ship.frame.mountingPoints > 0 || ship.mounts.length > 0;
  const placeholderStyle = {
    backgroundColor: colors.surfaceVariant,
    borderColor: colors.outlineVariant,
    borderRadius: roundness * 1.5,
  };

  return (
    <View style={[gapStyles.gapXLarge, styles.container]}>
      <ShipLocalServices ship={ship} />

      <ShipActions ship={ship} />

      {hasCargoHold && <ShipCargo cargo={ship.cargo} />}

      {hasCrew && (
        <View style={gapStyles.gapMedium}>
          <Text variant="titleLarge">Crew</Text>
          <View style={[styles.crewPlaceholder, placeholderStyle]} />
        </View>
      )}

      <View style={gapStyles.gapMedium}>
        <Text variant="titleLarge">Loadout</Text>

        <View style={gapStyles.gapSmall}>
          <Text variant="titleSmall">Core systems</Text>
          <View style={gapStyles.gapMedium}>
            <View style={gapStyles.gapSmall}>
              <Text variant="labelMedium">Frame</Text>
              <View style={[styles.systemPlaceholder, placeholderStyle]} />
            </View>
            <View style={gapStyles.gapSmall}>
              <Text variant="labelMedium">Reactor</Text>
              <View style={[styles.systemPlaceholder, placeholderStyle]} />
            </View>
            <View style={gapStyles.gapSmall}>
              <Text variant="labelMedium">Engine</Text>
              <View style={[styles.systemPlaceholder, placeholderStyle]} />
            </View>
          </View>
        </View>

        {hasModuleSlots && (
          <View style={gapStyles.gapSmall}>
            <Text variant="titleSmall">Modules</Text>
            <View style={[styles.listPlaceholder, placeholderStyle]} />
          </View>
        )}

        {hasMountingPoints && (
          <View style={gapStyles.gapSmall}>
            <Text variant="titleSmall">Mounts</Text>
            <View style={[styles.listPlaceholder, placeholderStyle]} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
    paddingTop: 8,
  },
  crewPlaceholder: {
    borderWidth: StyleSheet.hairlineWidth,
    height: 80,
  },
  listPlaceholder: {
    borderWidth: StyleSheet.hairlineWidth,
    height: 112,
  },
  systemPlaceholder: {
    borderWidth: StyleSheet.hairlineWidth,
    height: 64,
  },
});
