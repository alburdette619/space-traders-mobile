import { StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Icon,
  IconButton,
  Text,
  useTheme,
} from 'react-native-paper';

import { type TradeSymbol } from '../api/models/models-TradeSymbol/tradeSymbol';
import { voidRunnerIcons } from '../constants/icons';
import { flexStyles, gapStyles } from '../theme/globalStyles';

interface CargoTradeItemProps {
  details: string;
  disabledReason?: string;
  maxQuantity: number;
  name: string;
  onQuantityChange: (quantity: number) => void;
  price?: number;
  quantity: number;
  symbol: TradeSymbol;
}

export const CargoTradeItem = ({
  details,
  disabledReason,
  maxQuantity,
  name,
  onQuantityChange,
  price,
  quantity,
  symbol,
}: CargoTradeItemProps) => {
  const { colors, roundness } = useTheme();
  const normalizedName = name
    .trim()
    .replace(/[^a-z0-9]+/gi, '_')
    .toUpperCase();
  const shouldShowSymbol = normalizedName !== symbol;

  return (
    <Card mode="outlined">
      <Card.Content style={gapStyles.gapMedium}>
        <View style={[flexStyles.flexRow, styles.header]}>
          <View style={flexStyles.flex}>
            <Text variant="titleMedium">{name}</Text>
            {shouldShowSymbol && (
              <Text
                style={{ color: colors.onSurfaceVariant }}
                variant="labelSmall"
              >
                {symbol}
              </Text>
            )}
          </View>
          <View style={styles.price}>
            <View style={[flexStyles.flexRow, gapStyles.gapSmall]}>
              {price !== undefined && (
                <Icon size={16} source={voidRunnerIcons.credits} />
              )}
              <Text variant="titleMedium">
                {price === undefined ? '—' : price.toLocaleString()}
              </Text>
              {price !== undefined && (
                <Text
                  style={{ color: colors.onSurfaceVariant }}
                  variant="labelSmall"
                >
                  / unit
                </Text>
              )}
            </View>
          </View>
        </View>

        <Text style={{ color: colors.onSurfaceVariant }} variant="bodySmall">
          {details}
        </Text>

        {disabledReason ? (
          <Text style={{ color: colors.onSurfaceVariant }} variant="labelSmall">
            {disabledReason}
          </Text>
        ) : quantity === 0 ? (
          <Button
            disabled={maxQuantity < 1}
            icon="cart-plus"
            mode="outlined"
            onPress={() => onQuantityChange(1)}
          >
            Add
          </Button>
        ) : (
          <View style={styles.quantityRow}>
            {quantity > 1 && (
              <IconButton
                accessibilityLabel={`Remove ${name} from cart`}
                icon="delete-outline"
                iconColor={colors.error}
                onPress={() => onQuantityChange(0)}
                size={20}
                style={styles.quantityButton}
              />
            )}
            <IconButton
              accessibilityLabel={
                quantity === 1
                  ? `Remove ${name} from cart`
                  : `Decrease ${name} quantity`
              }
              icon={quantity === 1 ? 'delete-outline' : 'minus'}
              iconColor={quantity === 1 ? colors.error : undefined}
              mode="outlined"
              onPress={() =>
                onQuantityChange(quantity === 1 ? 0 : quantity - 1)
              }
              size={18}
              style={styles.quantityButton}
            />
            <View
              style={[
                styles.quantityValue,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.outlineVariant,
                  borderRadius: roundness,
                },
              ]}
            >
              <Text variant="titleSmall">{quantity.toLocaleString()}</Text>
              <Text
                style={{ color: colors.onSurfaceVariant }}
                variant="labelSmall"
              >
                / {maxQuantity.toLocaleString()}
              </Text>
            </View>
            <IconButton
              accessibilityLabel={`Increase ${name} quantity`}
              disabled={quantity >= maxQuantity}
              icon="plus"
              mode="outlined"
              onPress={() => onQuantityChange(quantity + 1)}
              size={18}
              style={styles.quantityButton}
            />
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    justifyContent: 'space-between',
  },
  price: {
    alignItems: 'flex-end',
  },
  quantityButton: {
    height: 36,
    margin: 0,
    width: 36,
  },
  quantityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'flex-end',
  },
  quantityValue: {
    alignItems: 'baseline',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
});
