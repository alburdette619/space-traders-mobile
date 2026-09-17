import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { type WaypointTrait } from '../api/models/models-WaypointTrait/waypointTrait';
import { WaypointTraitSymbol } from '../api/models/models-WaypointTraitSymbol/waypointTraitSymbol';
import { gapStyles } from '../theme/globalStyles';
import { CompactChip } from './CompactChip';

interface WaypointServiceChipsProps {
  emptyMessage?: string;
  traits: WaypointTrait[];
}

export const WaypointServiceChips = ({
  emptyMessage = 'No market or shipyard services at this waypoint.',
  traits,
}: WaypointServiceChipsProps) => {
  const { colors } = useTheme();
  const hasMarketplace = traits.some(
    ({ symbol }) => symbol === WaypointTraitSymbol.MARKETPLACE,
  );
  const hasShipyard = traits.some(
    ({ symbol }) => symbol === WaypointTraitSymbol.SHIPYARD,
  );

  if (!hasMarketplace && !hasShipyard) {
    return (
      <Text style={{ color: colors.onSurfaceVariant }} variant="bodyMedium">
        {emptyMessage}
      </Text>
    );
  }

  return (
    <View style={[gapStyles.gapSmall, styles.chips]}>
      {hasMarketplace && (
        <CompactChip
          accessibilityLabel="Marketplace available"
          icon="storefront-outline"
        >
          Marketplace
        </CompactChip>
      )}
      {hasShipyard && (
        <CompactChip
          accessibilityLabel="Shipyard available"
          icon="hammer-wrench"
        >
          Shipyard
        </CompactChip>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
