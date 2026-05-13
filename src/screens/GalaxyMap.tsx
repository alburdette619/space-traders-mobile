import { get, maxBy, minBy } from 'lodash';
import { useMemo, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { useGetMyShips } from '../api/models/fleet/fleet';
import { useGetSystemsMeta } from '../api/supabase/galaxySystemsMeta';
import { Map } from '../components/Map';
import { MaxZoom } from '../constants/mapConstants';
import { useMapGestures } from '../hooks/useMapGestures';
import { useMapUtils } from '../hooks/useMapUtils';

export const GalaxyMapScreen = () => {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const hasInitializedView = useRef(false);

  const { data: systemsMeta, isFetching: isFetchingSystemsMeta } =
    useGetSystemsMeta();

  const {
    max_x: maxX = 0,
    max_y: maxY = 0,
    min_x: minX = 0,
    min_y: minY = 0,
  } = systemsMeta || {};

  const { data: ships, isFetching: isFetchingShips } = useGetMyShips();

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
    useMapGestures();

  const shipsBounds = useMemo(
    () => ({
      maxShipX: get(
        maxBy(ships?.data, 'nav.route.destination.x'),
        'nav.route.destination.x',
        0,
      ),
      maxShipY: get(
        maxBy(ships?.data, 'nav.route.destination.y'),
        'nav.route.destination.y',
        0,
      ),
      minShipX: get(
        minBy(ships?.data, 'nav.route.destination.x'),
        'nav.route.destination.x',
        0,
      ),
      minShipY: get(
        minBy(ships?.data, 'nav.route.destination.y'),
        'nav.route.destination.y',
        0,
      ),
    }),
    [ships?.data],
  );

  useAnimatedReaction(
    () => canvasSize.get(),
    (next) => {
      const { height: canvasHeight, width: canvasWidth } = next;
      // Return if we've already set initial bounds, haven't rendered the canvas yet,
      // or if we don't have ships or systems meta yet.
      if (
        hasInitializedView.current ||
        (shipsBounds.maxShipX === 0 && shipsBounds.maxShipY === 0) ||
        isFetchingShips ||
        isFetchingSystemsMeta ||
        canvasHeight === 0 ||
        canvasWidth === 0
      ) {
        return;
      }

      const { maxShipX, maxShipY, minShipX, minShipY } = shipsBounds;

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

      const shipBoundsWidth = right - left;
      const shipBoundsHeight = bottom - top;
      if (!shipBoundsWidth || !shipBoundsHeight) {
        return;
      }

      const fitScale = Math.min(
        canvasWidth / shipBoundsWidth,
        canvasHeight / shipBoundsHeight,
        MaxZoom,
      );
      const centerX = (left + right) / 2;
      const centerY = (top + bottom) / 2;

      const nextPanX = canvasWidth / 2 - centerX * fitScale;
      const nextPanY = canvasHeight / 2 - centerY * fitScale;

      scalePrevious.set(fitScale);
      panX.set(nextPanX);
      panY.set(nextPanY);
      hasInitializedView.current = true;
    },
    [
      isFetchingShips,
      isFetchingSystemsMeta,
      shipsBounds,
      panX,
      panY,
      scalePrevious,
    ],
  );

  if (
    isFetchingSystemsMeta ||
    isFetchingShips ||
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
        panX={panX}
        panY={panY}
        scalePrevious={scalePrevious}
      />
    </GestureDetector>
  );
};
