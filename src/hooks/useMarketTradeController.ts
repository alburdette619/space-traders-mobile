import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useStore } from 'zustand';

import { getGetMyAgentQueryKey } from '../api/models/agents/agents';
import {
  getGetMyShipQueryKey,
  getGetMyShipsInfiniteQueryKey,
  getGetMyShipsQueryKey,
  usePurchaseCargo,
  useSellCargo,
} from '../api/models/fleet/fleet';
import { type MarketTradeGood } from '../api/models/models-MarketTradeGood/marketTradeGood';
import { MarketTradeGoodType } from '../api/models/models-MarketTradeGood/marketTradeGoodType';
import { type Ship } from '../api/models/models-Ship/ship';
import { getGetMarketQueryKey } from '../api/models/systems/systems';
import { createMarketTradeStore } from '../stores/marketTradeStore';

interface UseMarketTradeControllerParams {
  credits: number;
  marketGoods: MarketTradeGood[];
  ship: Ship;
}

const getActionErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Checkout failed.';

export const useMarketTradeController = ({
  credits,
  marketGoods,
  ship,
}: UseMarketTradeControllerParams) => {
  const queryClient = useQueryClient();
  const purchaseMutation = usePurchaseCargo();
  const sellMutation = useSellCargo();
  const [tradeStore] = useState(createMarketTradeStore);
  const {
    beginCheckout,
    completeCheckout,
    dismissFeedback,
    failCheckout,
    feedbackMessage,
    finishCheckout,
    isCheckingOut,
    isFeedbackError,
    purchases,
    sales,
    setPurchase,
    setSale,
  } = useStore(tradeStore);

  const marketGoodsBySymbol = useMemo(
    () => new Map(marketGoods.map((good) => [good.symbol, good])),
    [marketGoods],
  );
  const cargoBySymbol = useMemo(
    () => new Map(ship.cargo.inventory.map((item) => [item.symbol, item])),
    [ship.cargo.inventory],
  );

  const purchaseCost = purchases.reduce((total, item) => {
    const price = marketGoodsBySymbol.get(item.symbol)?.purchasePrice ?? 0;
    return total + item.units * price;
  }, 0);
  const saleRevenue = sales.reduce((total, item) => {
    const price = marketGoodsBySymbol.get(item.symbol)?.sellPrice ?? 0;
    return total + item.units * price;
  }, 0);
  const purchaseUnits = purchases.reduce(
    (total, item) => total + item.units,
    0,
  );
  const saleUnits = sales.reduce((total, item) => total + item.units, 0);
  const projectedCredits = credits + saleRevenue - purchaseCost;
  const projectedCargoUnits = ship.cargo.units - saleUnits + purchaseUnits;

  const getMaxPurchaseUnits = useCallback(
    (good: MarketTradeGood) => {
      if (good.type === MarketTradeGoodType.IMPORT) return 0;

      const otherPurchaseCost = purchases.reduce((total, item) => {
        if (item.symbol === good.symbol) return total;
        const price = marketGoodsBySymbol.get(item.symbol)?.purchasePrice ?? 0;
        return total + item.units * price;
      }, 0);
      const otherPurchaseUnits = purchases.reduce(
        (total, item) =>
          item.symbol === good.symbol ? total : total + item.units,
        0,
      );
      const availableCredits =
        credits +
        sales.reduce((total, item) => {
          const price = marketGoodsBySymbol.get(item.symbol)?.sellPrice ?? 0;
          return total + item.units * price;
        }, 0) -
        otherPurchaseCost;
      const availableCargoUnits =
        ship.cargo.capacity -
        ship.cargo.units +
        sales.reduce((total, item) => total + item.units, 0) -
        otherPurchaseUnits;
      const affordableUnits =
        good.purchasePrice > 0
          ? Math.floor(availableCredits / good.purchasePrice)
          : good.tradeVolume;

      return Math.max(
        0,
        Math.min(good.tradeVolume, affordableUnits, availableCargoUnits),
      );
    },
    [credits, marketGoodsBySymbol, purchases, sales, ship.cargo],
  );

  const getMaxSaleUnits = useCallback(
    (good: MarketTradeGood) =>
      good.type === MarketTradeGoodType.EXPORT
        ? 0
        : Math.min(
            cargoBySymbol.get(good.symbol)?.units ?? 0,
            good.tradeVolume,
          ),
    [cargoBySymbol],
  );

  const setPurchaseQuantity = useCallback(
    (good: MarketTradeGood, units: number) => {
      const nextUnits = Math.min(
        Math.max(Math.trunc(units), 0),
        getMaxPurchaseUnits(good),
      );
      setPurchase({ symbol: good.symbol, units: nextUnits });
    },
    [getMaxPurchaseUnits, setPurchase],
  );

  const setSaleQuantity = useCallback(
    (good: MarketTradeGood, units: number) => {
      const nextUnits = Math.min(
        Math.max(Math.trunc(units), 0),
        getMaxSaleUnits(good),
      );
      setSale({ symbol: good.symbol, units: nextUnits });
    },
    [getMaxSaleUnits, setSale],
  );

  const cartError = useMemo(() => {
    if (projectedCredits < 0) return 'The cart exceeds available credits.';
    if (projectedCargoUnits > ship.cargo.capacity) {
      return 'The cart exceeds this ship’s cargo capacity.';
    }
    if (projectedCargoUnits < 0) return 'The cart sells unavailable cargo.';

    const invalidPurchase = purchases.some((item) => {
      const good = marketGoodsBySymbol.get(item.symbol);
      return (
        !good ||
        good.type === MarketTradeGoodType.IMPORT ||
        item.units < 1 ||
        item.units > good.tradeVolume
      );
    });
    if (invalidPurchase) return 'A purchase exceeds the market trade limit.';

    const invalidSale = sales.some((item) => {
      const good = marketGoodsBySymbol.get(item.symbol);
      const cargoUnits = cargoBySymbol.get(item.symbol)?.units ?? 0;
      return (
        !good ||
        good.type === MarketTradeGoodType.EXPORT ||
        item.units < 1 ||
        item.units > good.tradeVolume ||
        item.units > cargoUnits
      );
    });
    if (invalidSale) return 'A sale exceeds available cargo or trade limits.';

    return undefined;
  }, [
    cargoBySymbol,
    marketGoodsBySymbol,
    projectedCargoUnits,
    projectedCredits,
    purchases,
    sales,
    ship.cargo.capacity,
  ]);

  const refreshTradeQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getGetMyAgentQueryKey() }),
      queryClient.invalidateQueries({
        queryKey: getGetMyShipQueryKey(ship.symbol),
      }),
      queryClient.invalidateQueries({ queryKey: getGetMyShipsQueryKey() }),
      queryClient.invalidateQueries({
        queryKey: getGetMyShipsInfiniteQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getGetMarketQueryKey(
          ship.nav.systemSymbol,
          ship.nav.waypointSymbol,
        ),
      }),
    ]);
  }, [queryClient, ship]);

  const checkout = useCallback(async () => {
    if (
      cartError ||
      purchases.length + sales.length === 0 ||
      !beginCheckout()
    ) {
      return false;
    }

    let completedTrades = 0;

    try {
      for (const sale of sales) {
        await sellMutation.mutateAsync({
          data: sale,
          shipSymbol: ship.symbol,
        });
        completedTrades += 1;
        setSale({ symbol: sale.symbol, units: 0 });
      }

      for (const purchase of purchases) {
        await purchaseMutation.mutateAsync({
          data: purchase,
          shipSymbol: ship.symbol,
        });
        completedTrades += 1;
        setPurchase({ symbol: purchase.symbol, units: 0 });
      }

      completeCheckout(
        `${completedTrades} ${completedTrades === 1 ? 'trade' : 'trades'} completed.`,
      );
      return true;
    } catch (error: unknown) {
      const prefix =
        completedTrades > 0
          ? `${completedTrades} ${completedTrades === 1 ? 'trade completed' : 'trades completed'} before checkout stopped. `
          : '';
      failCheckout(`${prefix}${getActionErrorMessage(error)}`);
      return false;
    } finally {
      await refreshTradeQueries();
      finishCheckout();
    }
  }, [
    beginCheckout,
    cartError,
    completeCheckout,
    failCheckout,
    finishCheckout,
    purchaseMutation,
    purchases,
    refreshTradeQueries,
    sales,
    sellMutation,
    setPurchase,
    setSale,
    ship.symbol,
  ]);

  return {
    canCheckout:
      !cartError && purchases.length + sales.length > 0 && !isCheckingOut,
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
  };
};
