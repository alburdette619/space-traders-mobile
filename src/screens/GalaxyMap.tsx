import { useEffect, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { getMyShips, useGetMyShipsInfinite } from '../api/models/fleet/fleet';
import { useGetGalaxySystems } from '../api/supabase/galaxySystems';
import { useGetSystemsMeta } from '../api/supabase/galaxySystemsMeta';
import { Map } from '../components/Map';
import { MaxZoom } from '../constants/mapConstants';
import { useMapGestures } from '../hooks/useMapGestures';
import { useMapUtils } from '../hooks/useMapUtils';

export const GalaxyMapScreen = () => {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const hasInitializedView = useSharedValue(false);

  const { data: systemsMeta, isPending: isPendingSystemsMeta } =
    useGetSystemsMeta();

  const {
    max_x: maxX = 0,
    max_y: maxY = 0,
    min_x: minX = 0,
    min_y: minY = 0,
  } = systemsMeta || {};

  const {
    data: systems = [],
    isPending: isPendingSystems,
    isPlaceholderData: isPlaceholderSystems,
  } = useGetGalaxySystems(systemsMeta?.updated_at);

  const {
    data: shipPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    isPending: isPendingShips,
  } = useGetMyShipsInfinite(
    { limit: 20 },
    {
      query: {
        getNextPageParam: (lastPage) => {
          if (!lastPage) return undefined;
          const { meta } = lastPage;
          return meta.page * meta.limit < meta.total
            ? meta.page + 1
            : undefined;
        },
        initialPageParam: 1,
        queryFn: ({ pageParam, signal }) =>
          getMyShips({ limit: 20, page: Number(pageParam) }, undefined, signal),
      },
    },
  );

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchNextPageError, isFetchingNextPage]);

  const ships = useMemo(
    () => shipPages?.pages.flatMap((page) => page?.data ?? []) ?? [],
    [shipPages?.pages],
  );

  const isLoadingCompleteFleet =
    isPendingShips ||
    isFetchingNextPage ||
    (!!hasNextPage && !isFetchNextPageError);

  const { galaxyHeight, galaxyScale, galaxyWidth } = useMemo(() => {
    if (maxX === 0 || maxY === 0) {
      return {
        galaxyHeight: 0,
        galaxyScale: 0,
        galaxyWidth: 0,
      };
    }
    const domainWidth = maxX - minX;
    const domainHeight = maxY - minY;

    const longestDimension = Math.max(windowHeight, windowWidth);
    const scale = longestDimension / Math.max(domainWidth, domainHeight);
    return {
      galaxyHeight: domainHeight * scale,
      galaxyScale: scale,
      galaxyWidth: domainWidth * scale,
    };
  }, [maxX, minX, maxY, minY, windowHeight, windowWidth]);

  const canvasSize = useSharedValue({ height: 0, width: 0 });

  const { convertRawToGalaxy } = useMapUtils();

  const { composedGesture, groupTransform, panX, panY, scalePrevious } =
    useMapGestures({ galaxyHeight, galaxyWidth });

  const shipSystemBounds = useMemo(() => {
    const systemsBySymbol = new globalThis.Map(
      systems.map((system) => [system.symbol, system]),
    );
    const shipSystems = [
      ...new Set(ships.map((ship) => ship.nav.route.destination.systemSymbol)),
    ].flatMap((symbol) => {
      const system = systemsBySymbol.get(symbol);
      return system ? [system] : [];
    });

    if (!shipSystems?.length) return null;

    const [firstSystem, ...remainingSystems] = shipSystems;
    return remainingSystems.reduce(
      (bounds, system) => ({
        maxShipX: Math.max(bounds.maxShipX, system.x),
        maxShipY: Math.max(bounds.maxShipY, system.y),
        minShipX: Math.min(bounds.minShipX, system.x),
        minShipY: Math.min(bounds.minShipY, system.y),
      }),
      {
        maxShipX: firstSystem.x,
        maxShipY: firstSystem.y,
        minShipX: firstSystem.x,
        minShipY: firstSystem.y,
      },
    );
  }, [ships, systems]);

  useAnimatedReaction(
    () => canvasSize.get(),
    (next) => {
      const { height: canvasHeight, width: canvasWidth } = next;
      // Return if we've already set initial bounds, haven't rendered the canvas yet,
      // or if we don't have ships or systems meta yet.
      if (
        hasInitializedView.get() ||
        !shipSystemBounds ||
        isLoadingCompleteFleet ||
        isPendingSystems ||
        isPlaceholderSystems ||
        !systemsMeta ||
        canvasHeight === 0 ||
        canvasWidth === 0
      ) {
        return;
      }

      const { maxShipX, maxShipY, minShipX, minShipY } = shipSystemBounds;

      const maxPoint = convertRawToGalaxy({
        galaxyScale,
        maxY,
        minX,
        rawX: maxShipX,
        rawY: maxShipY,
      });
      const minPoint = convertRawToGalaxy({
        galaxyScale,
        maxY,
        minX,
        rawX: minShipX,
        rawY: minShipY,
      });

      const left = Math.min(minPoint.x, maxPoint.x);
      const right = Math.max(minPoint.x, maxPoint.x);
      const top = Math.min(minPoint.y, maxPoint.y);
      const bottom = Math.max(minPoint.y, maxPoint.y);

      const fitScaleX = left === right ? MaxZoom : canvasWidth / (right - left);
      const fitScaleY =
        top === bottom ? MaxZoom : canvasHeight / (bottom - top);
      const fitScale = Math.min(fitScaleX, fitScaleY, MaxZoom);
      const centerX = (left + right) / 2;
      const centerY = (top + bottom) / 2;

      const nextPanX = canvasWidth / 2 - centerX * fitScale;
      const nextPanY = canvasHeight / 2 - centerY * fitScale;

      scalePrevious.set(fitScale);
      panX.set(nextPanX);
      panY.set(nextPanY);
      hasInitializedView.set(true);
    },
    [
      galaxyScale,
      hasInitializedView,
      isLoadingCompleteFleet,
      isPendingSystems,
      isPlaceholderSystems,
      maxY,
      minX,
      shipSystemBounds,
      systemsMeta,
      panX,
      panY,
      scalePrevious,
    ],
  );

  if (
    isPendingSystemsMeta ||
    isPendingSystems ||
    isPendingShips ||
    !systemsMeta ||
    galaxyHeight === 0 ||
    galaxyWidth === 0
  ) {
    return null;
  }

  return (
    <GestureDetector gesture={composedGesture}>
      <Map
        canvasSize={canvasSize}
        galaxyScale={galaxyScale}
        groupTransform={groupTransform}
        maxY={maxY}
        minX={minX}
        scalePrevious={scalePrevious}
        systems={systems}
      />
    </GestureDetector>
  );
};
