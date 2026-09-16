import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { Ship } from '@/src/api/models/models-Ship/ship';
import { useGetShipActions } from '@/src/hooks/useGetShipActions';
import { gapStyles } from '@/src/theme/globalStyles';

const CargoPlaceholders = ['cargo-1', 'cargo-2', 'cargo-3', 'cargo-4'];

export const ShipDetailSections = ({ ship }: { ship: Ship }) => {
  const { colors, roundness } = useTheme();
  const placeholderStyle = {
    backgroundColor: colors.surfaceVariant,
    borderColor: colors.outlineVariant,
    borderRadius: roundness * 1.5,
  };

  const shipActions = useGetShipActions(ship);
  console.log('Actions', shipActions);

  return (
    <View style={styles.container}>
      <View style={gapStyles.gapMedium}>
        <Text variant="titleLarge">Actions</Text>
        <View style={[styles.actionPlaceholder, placeholderStyle]} />
      </View>

      <View style={gapStyles.gapMedium}>
        <Text variant="titleLarge">Cargo</Text>
        <View style={styles.cargoGrid}>
          {CargoPlaceholders.map((placeholder) => (
            <View
              key={placeholder}
              style={[styles.cargoPlaceholder, placeholderStyle]}
            />
          ))}
        </View>
      </View>

      <View style={gapStyles.gapMedium}>
        <Text variant="titleLarge">Crew</Text>
        <View style={[styles.crewPlaceholder, placeholderStyle]} />
      </View>

      <View style={gapStyles.gapMedium}>
        <Text variant="titleLarge">Loadout</Text>

        <View style={gapStyles.gapSmall}>
          <Text variant="titleSmall">Core systems</Text>
          <View style={styles.coreSystems}>
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

        <View style={gapStyles.gapSmall}>
          <Text variant="titleSmall">Modules</Text>
          <View style={[styles.listPlaceholder, placeholderStyle]} />
        </View>

        <View style={gapStyles.gapSmall}>
          <Text variant="titleSmall">Mounts</Text>
          <View style={[styles.listPlaceholder, placeholderStyle]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionPlaceholder: {
    borderWidth: StyleSheet.hairlineWidth,
    height: 56,
  },
  cargoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cargoPlaceholder: {
    aspectRatio: 1.5,
    borderWidth: StyleSheet.hairlineWidth,
    flexBasis: '48%',
    flexGrow: 1,
  },
  container: {
    gap: 24,
    paddingBottom: 32,
    paddingTop: 8,
  },
  coreSystems: {
    gap: 8,
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
