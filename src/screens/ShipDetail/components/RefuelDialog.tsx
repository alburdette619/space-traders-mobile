import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Dialog,
  Icon,
  IconButton,
  Portal,
  ProgressBar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { useGetMyAgent } from '@/src/api/models/agents/agents';
import { type Ship } from '@/src/api/models/models-Ship/ship';
import { TradeSymbol } from '@/src/api/models/models-TradeSymbol/tradeSymbol';
import { useGetMarket } from '@/src/api/models/systems/systems';
import { shipActionIcons } from '@/src/constants/icons';
import { flexStyles, gapStyles } from '@/src/theme/globalStyles';

const FuelPerMarketUnit = 100;

interface RefuelDialogProps {
  isPending: boolean;
  onConfirm: (units: number) => void;
  onDismiss: () => void;
  ship: Ship;
  visible: boolean;
}

export const RefuelDialog = ({
  isPending,
  onConfirm,
  onDismiss,
  ship,
  visible,
}: RefuelDialogProps) => {
  const { colors, roundness } = useTheme();
  const missingFuel = ship.fuel.capacity - ship.fuel.current;
  const maxMarketUnits = Math.ceil(missingFuel / FuelPerMarketUnit);
  const defaultMarketUnits = Math.floor(missingFuel / FuelPerMarketUnit);
  const [marketUnitInput, setMarketUnitInput] = useState(
    defaultMarketUnits.toString(),
  );

  useEffect(() => {
    if (visible) setMarketUnitInput(defaultMarketUnits.toString());
  }, [defaultMarketUnits, visible]);

  const marketQuery = useGetMarket(
    ship.nav.systemSymbol,
    ship.nav.waypointSymbol,
    {
      query: {
        enabled: visible,
        staleTime: 60_000,
      },
    },
  );
  const agentQuery = useGetMyAgent({ query: { enabled: visible } });

  const parsedMarketUnits = Number.parseInt(marketUnitInput, 10);
  const marketUnits = Number.isNaN(parsedMarketUnits)
    ? undefined
    : parsedMarketUnits;
  const quantityError =
    marketUnits === undefined
      ? 'Enter the number of market units to buy.'
      : marketUnits < 0
        ? 'Market units cannot be negative.'
        : marketUnits > maxMarketUnits
          ? `This ship can hold at most ${maxMarketUnits} more market ${maxMarketUnits === 1 ? 'unit' : 'units'}.`
          : undefined;
  const fuelToBuy =
    quantityError || marketUnits === undefined
      ? 0
      : Math.min(marketUnits * FuelPerMarketUnit, missingFuel);
  const wastedFuel =
    marketUnits === undefined
      ? 0
      : Math.max(marketUnits * FuelPerMarketUnit - fuelToBuy, 0);
  const targetFuel = ship.fuel.current + fuelToBuy;
  const fuelTradeGood = marketQuery.data?.data.tradeGoods?.find(
    ({ symbol }) => symbol === TradeSymbol.FUEL,
  );
  const fuelPrice = fuelTradeGood?.purchasePrice;
  const estimatedCost =
    fuelPrice !== undefined &&
    marketUnits !== undefined &&
    marketUnits > 0 &&
    !quantityError
      ? marketUnits * fuelPrice
      : undefined;
  const availableCredits = agentQuery.data?.data.credits;
  const hasEnoughCredits =
    estimatedCost !== undefined &&
    availableCredits !== undefined &&
    estimatedCost <= availableCredits;
  const isRefreshingQuote = marketQuery.isFetching || agentQuery.isFetching;

  const canConfirm =
    fuelToBuy > 0 && hasEnoughCredits && !isPending && !isRefreshingQuote;
  const targetProgress =
    ship.fuel.capacity > 0 ? Math.min(targetFuel / ship.fuel.capacity, 1) : 0;

  const adjustMarketUnits = (adjustment: number) => {
    const currentUnits = marketUnits ?? 0;
    const nextUnits = Math.min(
      Math.max(currentUnits + adjustment, 0),
      maxMarketUnits,
    );
    setMarketUnitInput(nextUnits.toString());
  };

  return (
    <Portal>
      <Dialog dismissable={!isPending} onDismiss={onDismiss} visible={visible}>
        <Dialog.Content style={gapStyles.gapMedium}>
          <View style={[flexStyles.flexRow, styles.header]}>
            <Icon
              color={colors.secondary}
              size={32}
              source={shipActionIcons.refuel}
            />
            <Text variant="titleLarge">Refuel ship</Text>
          </View>

          <View
            style={[
              gapStyles.gapMedium,
              styles.fuelPanel,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.outlineVariant,
                borderRadius: roundness,
              },
            ]}
          >
            <View style={flexStyles.alignCenter}>
              <Text
                style={{ color: colors.onSurfaceVariant }}
                variant="labelMedium"
              >
                Fuel target
              </Text>
              <Text
                style={{ color: colors.onSurfaceVariant }}
                variant="titleLarge"
              >
                {ship.fuel.current} → {targetFuel} / {ship.fuel.capacity}
              </Text>
            </View>
            <ProgressBar color={colors.secondary} progress={targetProgress} />
          </View>

          {missingFuel <= 0 ? (
            <Text
              style={{ color: colors.onSurfaceVariant }}
              variant="bodySmall"
            >
              This ship is already fully fueled.
            </Text>
          ) : (
            <View style={gapStyles.gapMedium}>
              <View
                style={[
                  flexStyles.flexRow,
                  flexStyles.justifyCenter,
                  gapStyles.gapSmall,
                ]}
              >
                <IconButton
                  accessibilityLabel="Decrease market fuel units"
                  disabled={
                    isPending || marketUnits === undefined || marketUnits <= 0
                  }
                  icon="minus"
                  iconColor={colors.secondary}
                  mode="outlined"
                  onPress={() => adjustMarketUnits(-1)}
                />
                <TextInput
                  activeOutlineColor={colors.secondary}
                  disabled={isPending}
                  error={!!quantityError}
                  keyboardType="number-pad"
                  label="Market units"
                  mode="outlined"
                  onChangeText={(value) =>
                    setMarketUnitInput(value.replace(/[^0-9]/g, ''))
                  }
                  right={<TextInput.Affix text={`/ ${maxMarketUnits}`} />}
                  selectTextOnFocus
                  style={styles.quantityInput}
                  value={marketUnitInput}
                />
                <IconButton
                  accessibilityLabel="Increase market fuel units"
                  disabled={
                    isPending ||
                    (marketUnits !== undefined && marketUnits >= maxMarketUnits)
                  }
                  icon="plus"
                  iconColor={colors.secondary}
                  mode="outlined"
                  onPress={() => adjustMarketUnits(1)}
                />
              </View>

              {quantityError ? (
                <Text style={{ color: colors.error }} variant="labelSmall">
                  {quantityError}
                </Text>
              ) : (
                <View style={gapStyles.gapMedium}>
                  {wastedFuel > 0 && (
                    <View
                      style={[
                        flexStyles.flexRow,
                        gapStyles.gapMedium,
                        styles.wasteWarning,
                        {
                          backgroundColor: colors.errorContainer,
                          borderRadius: roundness,
                        },
                      ]}
                    >
                      <Icon
                        color={colors.onErrorContainer}
                        size={20}
                        source="alert-outline"
                      />
                      <Text
                        style={[
                          styles.wasteWarningText,
                          { color: colors.onErrorContainer },
                        ]}
                        variant="bodySmall"
                      >
                        Exceeds tank capacity{' '}
                        <Text style={styles.wasteWarningAmount}>
                          {wastedFuel.toLocaleString()}
                        </Text>
                        &nbsp;fuel will be wasted
                      </Text>
                    </View>
                  )}

                  {marketUnits === 0 ? (
                    <Text
                      style={{ color: colors.onSurfaceVariant }}
                      variant="bodySmall"
                    >
                      Add a market unit to refuel this ship.
                    </Text>
                  ) : isRefreshingQuote ? (
                    <ActivityIndicator size="small" />
                  ) : estimatedCost !== undefined && fuelPrice !== undefined ? (
                    <View>
                      <Text variant="labelMedium">Estimated cost</Text>
                      <Text variant="titleMedium">
                        {estimatedCost.toLocaleString()} credits
                      </Text>
                      <Text
                        style={{ color: colors.onSurfaceVariant }}
                        variant="labelSmall"
                      >
                        Adds {fuelToBuy.toLocaleString()} tank fuel ·{' '}
                        {marketUnits?.toLocaleString()} ×{' '}
                        {fuelPrice.toLocaleString()} credits
                      </Text>
                      <Text
                        style={{
                          color: hasEnoughCredits
                            ? colors.onSurfaceVariant
                            : colors.error,
                        }}
                        variant="labelSmall"
                      >
                        Agent credits:{' '}
                        {availableCredits?.toLocaleString() ?? '—'}
                        {!hasEnoughCredits && availableCredits !== undefined
                          ? ` · ${(estimatedCost - availableCredits).toLocaleString()} more needed`
                          : ''}
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ color: colors.error }} variant="bodySmall">
                      Fuel pricing is unavailable. Try again shortly.
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button disabled={isPending} onPress={onDismiss}>
            Cancel
          </Button>
          <Button
            buttonColor={colors.secondary}
            disabled={!canConfirm}
            loading={isPending}
            mode="contained"
            onPress={() => onConfirm(fuelToBuy)}
            textColor={colors.onSecondary}
          >
            Refuel
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  fuelPanel: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  header: {
    gap: 12,
  },
  quantityInput: {
    width: 144,
  },
  wasteWarning: {
    padding: 10,
  },
  wasteWarningAmount: {
    fontWeight: '700',
  },
  wasteWarningText: {
    flex: 1,
  },
});
