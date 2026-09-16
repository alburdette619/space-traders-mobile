import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { startCase } from 'lodash';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Divider,
  Portal,
  SegmentedButtons,
  Snackbar,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetMyAgent } from '@/src/api/models/agents/agents';
import { useGetMyShip } from '@/src/api/models/fleet/fleet';
import { type Market } from '@/src/api/models/models-Market/market';
import { type MarketTradeGood } from '@/src/api/models/models-MarketTradeGood/marketTradeGood';
import { MarketTradeGoodType } from '@/src/api/models/models-MarketTradeGood/marketTradeGoodType';
import { type Ship } from '@/src/api/models/models-Ship/ship';
import { type ShipCargoItem } from '@/src/api/models/models-ShipCargoItem/shipCargoItem';
import { useGetMarket } from '@/src/api/models/systems/systems';
import { AsyncScreenState } from '@/src/components/AsyncScreenState';
import { BackButton } from '@/src/components/BackButton';
import { CargoTradeItem } from '@/src/components/CargoTradeItem';
import { useMarketTradeController } from '@/src/hooks/useMarketTradeController';
import { RootNavigatorParams } from '@/src/navigation/navigationParams';
import { flexStyles, gapStyles } from '@/src/theme/globalStyles';

interface TradeContentProps {
  credits: number;
  isRefreshing: boolean;
  market: Market;
  ship: Ship;
}

type TradeView = 'buy' | 'cart' | 'sell';

const TradeContent = ({
  credits,
  isRefreshing,
  market,
  ship,
}: TradeContentProps) => {
  const { colors, roundness } = useTheme();
  const { goBack } = useNavigation();
  const [tradeView, setTradeView] = useState<TradeView>('buy');
  const marketGoods = useMemo(
    () => market.tradeGoods ?? [],
    [market.tradeGoods],
  );
  const {
    canCheckout,
    cartError,
    checkout,
    dismissFeedback,
    feedbackMessage,
    getMaxPurchaseUnits,
    getMaxSaleUnits,
    isCheckingOut,
    isFeedbackError,
    projectedCargoUnits,
    projectedCredits,
    purchaseCost,
    purchases,
    saleRevenue,
    sales,
    setPurchaseQuantity,
    setSaleQuantity,
  } = useMarketTradeController({ credits, marketGoods, ship });

  const tradeGoodDetails = useMemo(
    () =>
      new Map(
        [...market.exports, ...market.imports, ...market.exchange].map(
          (good) => [good.symbol, good] as const,
        ),
      ),
    [market.exchange, market.exports, market.imports],
  );
  const marketGoodsBySymbol = useMemo(
    () => new Map(marketGoods.map((good) => [good.symbol, good])),
    [marketGoods],
  );
  const purchasableGoods = useMemo(
    () => marketGoods.filter(({ type }) => type !== MarketTradeGoodType.IMPORT),
    [marketGoods],
  );
  const cartLineCount = purchases.length + sales.length;

  const getName = (good: MarketTradeGood) =>
    tradeGoodDetails.get(good.symbol)?.name ??
    startCase(good.symbol.toLowerCase());
  const getMarketDetails = (good: MarketTradeGood) =>
    `${startCase(good.type.toLowerCase())} · ${startCase(good.supply.toLowerCase())} supply · ${good.tradeVolume.toLocaleString()} per trade`;
  const renderPurchase = (good: MarketTradeGood) => {
    const quantity =
      purchases.find(({ symbol }) => symbol === good.symbol)?.units ?? 0;
    const maxQuantity = getMaxPurchaseUnits(good);
    const disabledReason =
      maxQuantity < 1 && quantity === 0
        ? 'No cargo space or credits are available for this good.'
        : undefined;

    return (
      <CargoTradeItem
        details={getMarketDetails(good)}
        disabledReason={disabledReason}
        key={`buy-${good.symbol}`}
        maxQuantity={maxQuantity}
        name={getName(good)}
        onQuantityChange={(units) => setPurchaseQuantity(good, units)}
        price={good.purchasePrice}
        quantity={quantity}
        symbol={good.symbol}
      />
    );
  };
  const renderSale = (good: MarketTradeGood) => {
    const cargoItem = ship.cargo.inventory.find(
      ({ symbol }) => symbol === good.symbol,
    );
    const quantity =
      sales.find(({ symbol }) => symbol === good.symbol)?.units ?? 0;

    return (
      <CargoTradeItem
        details={`${cargoItem?.units.toLocaleString() ?? 0} in cargo · ${getMarketDetails(good)}`}
        key={`sell-${good.symbol}`}
        maxQuantity={getMaxSaleUnits(good)}
        name={cargoItem?.name ?? getName(good)}
        onQuantityChange={(units) => setSaleQuantity(good, units)}
        price={good.sellPrice}
        quantity={quantity}
        symbol={good.symbol}
      />
    );
  };
  const renderCargoSale = (cargoItem: ShipCargoItem) => {
    const good = marketGoodsBySymbol.get(cargoItem.symbol);
    if (good && good.type !== MarketTradeGoodType.EXPORT) {
      return renderSale(good);
    }

    return (
      <CargoTradeItem
        details={`${cargoItem.units.toLocaleString()} in cargo`}
        disabledReason={
          good
            ? 'This market sells this good but does not buy it.'
            : 'This market does not trade this good.'
        }
        key={`sell-${cargoItem.symbol}`}
        maxQuantity={0}
        name={cargoItem.name}
        onQuantityChange={() => undefined}
        quantity={0}
        symbol={cargoItem.symbol}
      />
    );
  };

  return (
    <>
      <View style={styles.header}>
        <BackButton />
        <View style={flexStyles.flex}>
          <Text variant="titleLarge">Market trade</Text>
          <Text style={{ color: colors.onSurfaceVariant }} variant="labelSmall">
            {ship.nav.waypointSymbol}
          </Text>
        </View>
        {isRefreshing && <ActivityIndicator size="small" />}
      </View>

      <View style={styles.screenContent}>
        <Surface
          elevation={0}
          style={[
            styles.accountSummary,
            {
              backgroundColor: colors.surfaceVariant,
              borderRadius: roundness,
            },
          ]}
        >
          <View>
            <Text
              style={{ color: colors.onSurfaceVariant }}
              variant="labelSmall"
            >
              Agent credits
            </Text>
            <Text
              style={{ color: colors.onSurfaceVariant }}
              variant="titleMedium"
            >
              {credits.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryValue}>
            <Text
              style={{ color: colors.onSurfaceVariant }}
              variant="labelSmall"
            >
              Ship cargo
            </Text>
            <Text
              style={{ color: colors.onSurfaceVariant }}
              variant="titleMedium"
            >
              {ship.cargo.units.toLocaleString()} /{' '}
              {ship.cargo.capacity.toLocaleString()}
            </Text>
          </View>
        </Surface>

        <SegmentedButtons
          buttons={[
            { icon: 'cart-arrow-down', label: 'Buy', value: 'buy' },
            { icon: 'cart-arrow-up', label: 'Sell', value: 'sell' },
            {
              icon: 'cart-outline',
              label: `Cart${cartLineCount ? ` (${cartLineCount})` : ''}`,
              value: 'cart',
            },
          ]}
          onValueChange={(value) => setTradeView(value as TradeView)}
          value={tradeView}
        />

        <ScrollView
          contentContainerStyle={styles.itemList}
          keyboardShouldPersistTaps="handled"
          style={flexStyles.flex}
        >
          {tradeView === 'buy' &&
            (purchasableGoods.length > 0 ? (
              purchasableGoods.map(renderPurchase)
            ) : (
              <Text
                style={{ color: colors.onSurfaceVariant }}
                variant="bodyMedium"
              >
                This market has no goods available to purchase.
              </Text>
            ))}

          {tradeView === 'sell' &&
            (ship.cargo.inventory.length > 0 ? (
              ship.cargo.inventory.map(renderCargoSale)
            ) : (
              <Text
                style={{ color: colors.onSurfaceVariant }}
                variant="bodyMedium"
              >
                This ship’s cargo hold is empty.
              </Text>
            ))}

          {tradeView === 'cart' && (
            <View style={gapStyles.gapLarge}>
              {cartLineCount === 0 ? (
                <Text
                  style={{ color: colors.onSurfaceVariant }}
                  variant="bodyMedium"
                >
                  Your trade cart is empty.
                </Text>
              ) : (
                <>
                  {sales.length > 0 && (
                    <View style={gapStyles.gapMedium}>
                      <Text variant="titleMedium">Selling</Text>
                      {sales.map(({ symbol }) => {
                        const good = marketGoodsBySymbol.get(symbol);
                        return good ? renderSale(good) : null;
                      })}
                    </View>
                  )}
                  {purchases.length > 0 && (
                    <View style={gapStyles.gapMedium}>
                      <Text variant="titleMedium">Buying</Text>
                      {purchases.map(({ symbol }) => {
                        const good = marketGoodsBySymbol.get(symbol);
                        return good ? renderPurchase(good) : null;
                      })}
                    </View>
                  )}
                </>
              )}

              <Surface
                elevation={1}
                style={[styles.checkoutSummary, { borderRadius: roundness }]}
              >
                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium">Estimated sales</Text>
                  <Text variant="bodyMedium">
                    +{saleRevenue.toLocaleString()} credits
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium">Estimated purchases</Text>
                  <Text variant="bodyMedium">
                    −{purchaseCost.toLocaleString()} credits
                  </Text>
                </View>
                <Divider />
                <View style={styles.summaryRow}>
                  <Text variant="labelLarge">After checkout</Text>
                  <View style={styles.summaryValue}>
                    <Text
                      style={
                        projectedCredits < 0
                          ? { color: colors.error }
                          : undefined
                      }
                      variant="labelLarge"
                    >
                      {projectedCredits.toLocaleString()} credits
                    </Text>
                    <Text variant="labelSmall">
                      {projectedCargoUnits.toLocaleString()} /{' '}
                      {ship.cargo.capacity.toLocaleString()} cargo
                    </Text>
                  </View>
                </View>

                <Text
                  style={{ color: colors.onSurfaceVariant }}
                  variant="labelSmall"
                >
                  Each cart line executes separately at the market price
                  available when that trade completes.
                </Text>

                {cartError && (
                  <Text style={{ color: colors.error }} variant="bodySmall">
                    {cartError}
                  </Text>
                )}

                <View style={styles.checkoutActions}>
                  <Button
                    buttonColor={colors.secondary}
                    disabled={!canCheckout || isRefreshing}
                    loading={isCheckingOut}
                    mode="contained"
                    onPress={() =>
                      void checkout().then((didComplete) => {
                        if (didComplete) goBack();
                      })
                    }
                    textColor={colors.onSecondary}
                  >
                    Checkout
                  </Button>
                </View>
              </Surface>
            </View>
          )}
        </ScrollView>
      </View>

      <Portal>
        <Snackbar
          onDismiss={dismissFeedback}
          style={
            isFeedbackError
              ? { backgroundColor: colors.errorContainer }
              : undefined
          }
          visible={!!feedbackMessage}
        >
          {feedbackMessage}
        </Snackbar>
      </Portal>
    </>
  );
};

export const TradeScreen = () => {
  const { colors } = useTheme();
  const { params } = useRoute<RouteProp<RootNavigatorParams, 'Trade'>>();
  const shipQuery = useGetMyShip(params.shipId);
  const agentQuery = useGetMyAgent();
  const ship = shipQuery.data?.data;
  const marketQuery = useGetMarket(
    ship?.nav.systemSymbol ?? '',
    ship?.nav.waypointSymbol ?? '',
    { query: { enabled: !!ship, staleTime: 60_000 } },
  );
  const agent = agentQuery.data?.data;
  const market = marketQuery.data?.data;
  const isError =
    shipQuery.isError ||
    agentQuery.isError ||
    marketQuery.isError ||
    (!!market && !market.tradeGoods);

  return (
    <SafeAreaView
      style={[flexStyles.flex, { backgroundColor: colors.background }]}
    >
      {ship && agent && market?.tradeGoods ? (
        <TradeContent
          credits={agent.credits}
          isRefreshing={
            shipQuery.isFetching ||
            agentQuery.isFetching ||
            marketQuery.isFetching
          }
          market={market}
          ship={ship}
        />
      ) : (
        <AsyncScreenState
          errorMessage="Unable to load this market."
          isError={isError}
          onRetry={() =>
            void Promise.all([
              shipQuery.refetch(),
              agentQuery.refetch(),
              marketQuery.refetch(),
            ])
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  accountSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  checkoutActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  checkoutSummary: {
    gap: 10,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  itemList: {
    gap: 8,
    paddingBottom: 24,
  },
  screenContent: {
    flex: 1,
    gap: 12,
    paddingHorizontal: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryValue: {
    alignItems: 'flex-end',
  },
});
