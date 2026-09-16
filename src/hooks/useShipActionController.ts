import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useState } from 'react';

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
import { type ShipActionType } from '../types/spaceTraders';

const getActionErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'The ship action failed.';

export const useShipActionController = (ship: Ship) => {
  const queryClient = useQueryClient();
  const pendingActionRef = useRef<ShipActionType | undefined>(undefined);
  const [feedbackMessage, setFeedbackMessage] = useState<string>();
  const [isFeedbackError, setIsFeedbackError] = useState(false);
  const [pendingActionType, setPendingActionType] = useState<ShipActionType>();
  const [requestedActionType, setRequestedActionType] =
    useState<ShipActionType>();

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
      if (pendingActionRef.current) return;

      pendingActionRef.current = actionType;
      setFeedbackMessage(undefined);
      setIsFeedbackError(false);
      setPendingActionType(actionType);

      try {
        await command();
        await refreshShipQueries();
        setFeedbackMessage(successMessage);
      } catch (error: unknown) {
        setFeedbackMessage(getActionErrorMessage(error));
        setIsFeedbackError(true);
      } finally {
        pendingActionRef.current = undefined;
        setPendingActionType(undefined);
      }
    },
    [refreshShipQueries],
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
      setRequestedActionType(undefined);
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
    [queryClient, refuelMutation, runCommand, ship],
  );

  const handleSiphon = useCallback(() => {
    void runCommand(
      'siphon',
      () => siphonMutation.mutateAsync({ shipSymbol: ship.symbol }),
      'Resources siphoned.',
    );
  }, [runCommand, ship.symbol, siphonMutation]);

  const requestActionFlow = useCallback((actionType: ShipActionType) => {
    if (!pendingActionRef.current) {
      setRequestedActionType(
        (currentActionType) => currentActionType ?? actionType,
      );
    }
  }, []);

  const handlers = useMemo(
    () =>
      ({
        chart: handleChart,
        dock: handleDock,
        enterOrbit: handleEnterOrbit,
        extract: handleExtract,
        navigate: () => requestActionFlow('navigate'),
        refine: () => requestActionFlow('refine'),
        refuel: () => requestActionFlow('refuel'),
        repair: () => requestActionFlow('repair'),
        scan: () => requestActionFlow('scan'),
        siphon: handleSiphon,
        survey: () => requestActionFlow('survey'),
        trade: () => requestActionFlow('trade'),
      }) satisfies Record<ShipActionType, () => void>,
    [
      handleChart,
      handleDock,
      handleEnterOrbit,
      handleExtract,
      handleSiphon,
      requestActionFlow,
    ],
  );

  const startAction = useCallback(
    (actionType: ShipActionType) => {
      if (pendingActionRef.current) return;
      handlers[actionType]();
    },
    [handlers],
  );

  const dismissFeedback = useCallback(() => {
    setFeedbackMessage(undefined);
    setIsFeedbackError(false);
  }, []);

  const dismissRequestedAction = useCallback(() => {
    setRequestedActionType(undefined);
  }, []);

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
