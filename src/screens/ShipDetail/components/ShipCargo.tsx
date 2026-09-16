import { StyleSheet, View } from 'react-native';
import { Card, Icon, Text, useTheme } from 'react-native-paper';

import { type ShipCargo as ShipCargoData } from '@/src/api/models/models-ShipCargo/shipCargo';
import { flexStyles, gapStyles } from '@/src/theme/globalStyles';

interface ShipCargoProps {
  cargo: ShipCargoData;
}

const shouldShowSymbol = (name: string, symbol: string) =>
  name
    .trim()
    .replace(/[^a-z0-9]+/gi, '_')
    .toUpperCase() !== symbol;

export const ShipCargo = ({ cargo }: ShipCargoProps) => {
  const { colors } = useTheme();

  return (
    <View style={gapStyles.gapMedium}>
      <View style={[flexStyles.flexRow, flexStyles.justifyBetween]}>
        <Text variant="titleLarge">Cargo</Text>
        <View style={[flexStyles.flexRow, gapStyles.gapSmall]}>
          <Icon
            color={colors.onSurfaceVariant}
            size={18}
            source="treasure-chest-outline"
          />
          <Text style={{ color: colors.onSurfaceVariant }} variant="labelLarge">
            {cargo.units.toLocaleString()} / {cargo.capacity.toLocaleString()}{' '}
            units
          </Text>
        </View>
      </View>

      {cargo.inventory.length > 0 ? (
        <View style={[gapStyles.gapMedium, styles.grid]}>
          {cargo.inventory.map((item) => (
            <Card key={item.symbol} mode="outlined" style={styles.itemCard}>
              <Card.Content style={gapStyles.gapMedium}>
                <View style={[flexStyles.flexRow, flexStyles.justifyBetween]}>
                  <Icon
                    color={colors.secondary}
                    size={24}
                    source="package-variant-closed"
                  />
                  <View style={flexStyles.alignEnd}>
                    <Text variant="titleLarge">
                      {item.units.toLocaleString()}
                    </Text>
                    <Text
                      style={{ color: colors.onSurfaceVariant }}
                      variant="labelSmall"
                    >
                      units
                    </Text>
                  </View>
                </View>

                <View>
                  <Text numberOfLines={2} variant="titleSmall">
                    {item.name}
                  </Text>
                  {shouldShowSymbol(item.name, item.symbol) && (
                    <Text
                      numberOfLines={1}
                      style={{ color: colors.onSurfaceVariant }}
                      variant="labelSmall"
                    >
                      {item.symbol}
                    </Text>
                  )}
                </View>

                <Text
                  numberOfLines={3}
                  style={{ color: colors.onSurfaceVariant }}
                  variant="bodySmall"
                >
                  {item.description}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      ) : (
        <Text style={{ color: colors.onSurfaceVariant }} variant="bodyMedium">
          {cargo.capacity > 0
            ? 'This cargo hold is empty.'
            : 'This ship has no cargo hold.'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemCard: {
    flexBasis: '48%',
  },
});
