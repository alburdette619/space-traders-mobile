import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Portal,
  Snackbar,
  Text,
  useTheme,
} from 'react-native-paper';

import { Ship } from '@/src/api/models/models-Ship/ship';
import { useGetShipActions } from '@/src/hooks/useGetShipActions';
import { flexStyles, gapStyles } from '@/src/theme/globalStyles';
import { ShipActionType } from '@/src/types/spaceTraders';

const CargoPlaceholders = ['cargo-1', 'cargo-2', 'cargo-3', 'cargo-4'];

const ShipActionIcons: Record<ShipActionType, string> = {
  chart: 'map-marker-plus-outline',
  dock: 'anchor',
  enterOrbit: 'orbit',
  extract: 'pickaxe',
  manageLoadout: 'wrench-cog-outline',
  navigate: 'navigation-variant-outline',
  refine: 'recycle',
  refuel: 'gas-station-outline',
  repair: 'wrench-outline',
  scan: 'radar',
  siphon: 'pipe',
  survey: 'map-search-outline',
  trade: 'swap-horizontal',
};

const ShipActions = ({ ship }: { ship: Ship }) => {
  const { colors } = useTheme();
  const { actions, isError, isPending } = useGetShipActions(ship);
  const [selectedUnavailableReason, setSelectedUnavailableReason] =
    useState<string>();
  const primaryActionType = actions.find(({ isEnabled }) => isEnabled)?.type;

  return (
    <View style={gapStyles.gapMedium}>
      <View style={[flexStyles.flexRow, styles.sectionHeader]}>
        <Text variant="titleLarge">Actions</Text>
        {isPending && <ActivityIndicator size="small" />}
      </View>

      {isError && (
        <Text style={{ color: colors.error }} variant="bodySmall">
          Some contextual actions could not be loaded.
        </Text>
      )}

      {actions.length > 0 ? (
        <View style={styles.actionGrid}>
          {actions.map((action) => (
            <Pressable
              accessibilityHint={action.unavailableReason}
              accessibilityLabel={
                action.unavailableReason
                  ? `${action.label}. Unavailable: ${action.unavailableReason}`
                  : action.label
              }
              accessibilityRole="button"
              accessibilityState={{ disabled: !action.isEnabled }}
              key={action.type}
              onPress={() => {
                if (action.unavailableReason) {
                  setSelectedUnavailableReason(
                    (currentReason) =>
                      currentReason ?? action.unavailableReason,
                  );
                }
              }}
              style={styles.actionContainer}
            >
              <Button
                disabled={!action.isEnabled}
                icon={ShipActionIcons[action.type]}
                mode={
                  action.type === primaryActionType ? 'contained' : 'outlined'
                }
                pointerEvents="none"
              >
                {action.label}
              </Button>
            </Pressable>
          ))}
        </View>
      ) : (
        !isPending && (
          <Text style={{ color: colors.onSurfaceVariant }} variant="bodyMedium">
            No actions are available while this ship is in transit.
          </Text>
        )
      )}

      <Portal>
        <Snackbar
          duration={3000}
          onDismiss={() => setSelectedUnavailableReason(undefined)}
          visible={!!selectedUnavailableReason}
        >
          {selectedUnavailableReason}
        </Snackbar>
      </Portal>
    </View>
  );
};

export const ShipDetailSections = ({ ship }: { ship: Ship }) => {
  const { colors, roundness } = useTheme();
  const placeholderStyle = {
    backgroundColor: colors.surfaceVariant,
    borderColor: colors.outlineVariant,
    borderRadius: roundness * 1.5,
  };

  return (
    <View style={styles.container}>
      <ShipActions ship={ship} />

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
  actionContainer: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 140,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  sectionHeader: {
    justifyContent: 'space-between',
  },
  systemPlaceholder: {
    borderWidth: StyleSheet.hairlineWidth,
    height: 64,
  },
});
