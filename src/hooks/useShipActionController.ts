import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useStore } from 'zustand';

import { getGetMyAgentQueryKey } from '../api/models/agents/agents';
import {
  getGetMyShipQueryKey,
  getGetMyShipsInfiniteQueryKey,
  getGetMyShipsQueryKey,
  useCreateChart,
  useDockShip,
  useExtractResources,
  useOrbitShip,
  useRefuelShip,
  useSiphonResources,
} from '../api/models/fleet/fleet';
import { type Ship } from '../api/models/models-Ship/ship';
import {
  getGetMarketQueryKey,
  getGetWaypointQueryKey,
} from '../api/models/systems/systems';
import { createShipActionStore } from '../stores/shipActionStore';
import { type ShipActionType } from '../types/spaceTraders';

const getActionErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'The ship action failed.';

export const useShipActionController = (ship: Ship) => {
  const { navigate } = useNavigation();
  const queryClient = useQueryClient();
  const [actionStore] = useState(createShipActionStore);
  const {
    beginAction,
    completeAction,
    dismissFeedback,
    dismissRequestedAction,
    failAction,
    feedbackMessage,
    finishAction,
    isFeedbackError,
    pendingActionType,
    requestAction,
    requestedActionType,
  } = useStore(actionStore);

  const chartMutation = useCreateChart();
  const dockMutation = useDockShip();
  const extractMutation = useExtractResources();
  const orbitMutation = useOrbitShip();
  const refuelMutation = useRefuelShip();
  const siphonMutation = useSiphonResources();

  const refreshShipQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getGetMyShipQueryKey(ship.symbol),
      }),
      queryClient.invalidateQueries({
        queryKey: getGetMyShipsQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getGetMyShipsInfiniteQueryKey(),
      }),
    ]);
  }, [queryClient, ship.symbol]);

  const runCommand = useCallback(
    async (
      actionType: ShipActionType,
      command: () => Promise<unknown>,
      successMessage: string,
    ) => {
      if (!beginAction(actionType)) return;

      try {
        await command();
        await refreshShipQueries();
        completeAction(successMessage);
      } catch (error: unknown) {
        failAction(getActionErrorMessage(error));
      } finally {
        finishAction();
      }
    },
    [beginAction, completeAction, failAction, finishAction, refreshShipQueries],
  );

  const handleChart = useCallback(() => {
    void runCommand(
      'chart',
      async () => {
        await chartMutation.mutateAsync({ shipSymbol: ship.symbol });
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: getGetMyAgentQueryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: getGetWaypointQueryKey(
              ship.nav.systemSymbol,
              ship.nav.waypointSymbol,
            ),
          }),
        ]);
      },
      'Waypoint charted.',
    );
  }, [chartMutation, queryClient, runCommand, ship]);

  const handleDock = useCallback(() => {
    void runCommand(
      'dock',
      () => dockMutation.mutateAsync({ shipSymbol: ship.symbol }),
      'Ship docked.',
    );
  }, [dockMutation, runCommand, ship.symbol]);

  const handleEnterOrbit = useCallback(() => {
    void runCommand(
      'enterOrbit',
      () => orbitMutation.mutateAsync({ shipSymbol: ship.symbol }),
      'Ship entered orbit.',
    );
  }, [orbitMutation, runCommand, ship.symbol]);

  const handleExtract = useCallback(() => {
    void runCommand(
      'extract',
      () => extractMutation.mutateAsync({ data: {}, shipSymbol: ship.symbol }),
      'Resources extracted.',
    );
  }, [extractMutation, runCommand, ship.symbol]);

  const handleRefuel = useCallback(
    (units: number) => {
      dismissRequestedAction();
      void runCommand(
        'refuel',
        async () => {
          await refuelMutation.mutateAsync({
            data: { units },
            shipSymbol: ship.symbol,
          });
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: getGetMyAgentQueryKey(),
            }),
            queryClient.invalidateQueries({
              queryKey: getGetMarketQueryKey(
                ship.nav.systemSymbol,
                ship.nav.waypointSymbol,
              ),
            }),
          ]);
        },
        'Ship refueled.',
      );
    },
    [dismissRequestedAction, queryClient, refuelMutation, runCommand, ship],
  );

  const handleSiphon = useCallback(() => {
    void runCommand(
      'siphon',
      () => siphonMutation.mutateAsync({ shipSymbol: ship.symbol }),
      'Resources siphoned.',
    );
  }, [runCommand, ship.symbol, siphonMutation]);

  const handleTrade = useCallback(() => {
    navigate('Trade', { shipId: ship.symbol });
  }, [navigate, ship.symbol]);

  const handlers = useMemo(
    () =>
      ({
        chart: handleChart,
        dock: handleDock,
        enterOrbit: handleEnterOrbit,
        extract: handleExtract,
        navigate: () => requestAction('navigate'),
        refine: () => requestAction('refine'),
        refuel: () => requestAction('refuel'),
        repair: () => requestAction('repair'),
        scan: () => requestAction('scan'),
        siphon: handleSiphon,
        survey: () => requestAction('survey'),
        trade: handleTrade,
      }) satisfies Record<ShipActionType, () => void>,
    [
      handleChart,
      handleDock,
      handleEnterOrbit,
      handleExtract,
      handleSiphon,
      handleTrade,
      requestAction,
    ],
  );

  const startAction = useCallback(
    (actionType: ShipActionType) => {
      if (actionStore.getState().pendingActionType) return;
      handlers[actionType]();
    },
    [actionStore, handlers],
  );

  return {
    confirmRefuel: handleRefuel,
    dismissFeedback,
    dismissRequestedAction,
    feedbackMessage,
    isFeedbackError,
    pendingActionType,
    requestedActionType,
    startAction,
  };
};
