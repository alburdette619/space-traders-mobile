import { createStore } from 'zustand';

import { type PurchaseCargoBody } from '../api/models/purchaseCargoBody';
import { type SellCargoBody } from '../api/models/sellCargoBody';

const updateTradeItem = <T extends PurchaseCargoBody | SellCargoBody>(
  items: T[],
  nextItem: T,
) => {
  if (nextItem.units <= 0) {
    return items.filter((item) => item.symbol !== nextItem.symbol);
  }

  const existingItem = items.find((item) => item.symbol === nextItem.symbol);
  if (existingItem) {
    return items.map((item) =>
      item.symbol === nextItem.symbol ? nextItem : item,
    );
  }

  return [...items, nextItem];
};

interface MarketTradeState {
  beginCheckout: () => boolean;
  completeCheckout: (message: string) => void;
  dismissFeedback: () => void;
  failCheckout: (message: string) => void;
  feedbackMessage?: string;
  finishCheckout: () => void;
  isCheckingOut: boolean;
  isFeedbackError: boolean;
  purchases: PurchaseCargoBody[];
  sales: SellCargoBody[];
  setPurchase: (purchase: PurchaseCargoBody) => void;
  setSale: (sale: SellCargoBody) => void;
}

export const createMarketTradeStore = () =>
  createStore<MarketTradeState>((set, get) => ({
    beginCheckout: () => {
      if (get().isCheckingOut) return false;

      set({
        feedbackMessage: undefined,
        isCheckingOut: true,
        isFeedbackError: false,
      });
      return true;
    },
    completeCheckout: (feedbackMessage) =>
      set({ feedbackMessage, isFeedbackError: false }),
    dismissFeedback: () =>
      set({ feedbackMessage: undefined, isFeedbackError: false }),
    failCheckout: (feedbackMessage) =>
      set({ feedbackMessage, isFeedbackError: true }),
    feedbackMessage: undefined,
    finishCheckout: () => set({ isCheckingOut: false }),
    isCheckingOut: false,
    isFeedbackError: false,
    purchases: [],
    sales: [],
    setPurchase: (purchase) =>
      set(({ purchases }) => ({
        purchases: updateTradeItem(purchases, purchase),
      })),
    setSale: (sale) =>
      set(({ sales }) => ({ sales: updateTradeItem(sales, sale) })),
  }));
