import { createStore } from 'zustand';

import { type ShipActionType } from '../types/spaceTraders';

interface ShipActionState {
  beginAction: (actionType: ShipActionType) => boolean;
  completeAction: (message: string) => void;
  dismissFeedback: () => void;
  dismissRequestedAction: () => void;
  failAction: (message: string) => void;
  feedbackMessage?: string;
  finishAction: () => void;
  isFeedbackError: boolean;
  pendingActionType?: ShipActionType;
  requestAction: (actionType: ShipActionType) => void;
  requestedActionType?: ShipActionType;
}

export const createShipActionStore = () =>
  createStore<ShipActionState>((set, get) => ({
    beginAction: (pendingActionType) => {
      if (get().pendingActionType) return false;

      set({
        feedbackMessage: undefined,
        isFeedbackError: false,
        pendingActionType,
      });
      return true;
    },
    completeAction: (feedbackMessage) =>
      set({ feedbackMessage, isFeedbackError: false }),
    dismissFeedback: () =>
      set({ feedbackMessage: undefined, isFeedbackError: false }),
    dismissRequestedAction: () => set({ requestedActionType: undefined }),
    failAction: (feedbackMessage) =>
      set({ feedbackMessage, isFeedbackError: true }),
    feedbackMessage: undefined,
    finishAction: () => set({ pendingActionType: undefined }),
    isFeedbackError: false,
    pendingActionType: undefined,
    requestAction: (requestedActionType) => {
      const state = get();
      if (!state.pendingActionType && !state.requestedActionType) {
        set({ requestedActionType });
      }
    },
    requestedActionType: undefined,
  }));
