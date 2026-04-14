import {
  Atlas,
  Canvas,
  Circle,
  Group,
  rect,
  useRSXformBuffer,
  useTexture,
} from '@shopify/react-native-skia';
import { get, maxBy, minBy } from 'lodash';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withDecay,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

import { useGetMyShips } from '../api/models/fleet/fleet';
import { useGetSystemsInView } from '../api/supabase/galaxySystems';
import { useGetSystemsMeta } from '../api/supabase/galaxySystemsMeta';
import { flexStyles } from '../theme/globalStyles';

type VisibleBounds = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

const SpriteSize = 2;
const HalfSpriteSize = SpriteSize / 2;

const MaxZoom = 150;
const OverscanPixels = 160;

export const GalaxyMapScreen = () => {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const [queryBounds, setQueryBounds] = useState<null | VisibleBounds>(null);

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

  // Core shared values for transform state
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);

  // Track previous pan position for delta calculation
  const prevPanX = useSharedValue(0);
  const prevPanY = useSharedValue(0);

  // Zoom state
  const scalePrevious = useSharedValue(1);

  // Calculate transform matrix
  const transform = useDerivedValue(() => {
    return [
      { translateX: panX.get() },
      { translateY: panY.get() },
      { scale: scalePrevious.get() },
    ];
  });
  const convertGalaxyToScreen = useCallback(
    (
      worldX: number,
      worldY: number,
      panXValue: number,
      panYValue: number,
      zoom: number,
    ) => {
      'worklet';
      return {
        x: (worldX + panXValue) * zoom,
        y: (worldY + panYValue) * zoom,
      };
    },
    [],
  );

  const convertScreenToGalaxy = useCallback(
    (
      screenX: number,
      screenY: number,
      panXValue: number,
      panYValue: number,
      zoom: number,
    ) => {
      'worklet';
      return {
        x: screenX / zoom - panXValue,
        y: screenY / zoom - panYValue,
      };
    },
    [],
  );

  const convertRawToGalaxy = useCallback(
    (x: number, y: number) => {
      'worklet';
      return {
        x: (x - minX) * galaxyScale,
        y: (maxY - y) * galaxyScale,
      };
    },
    [galaxyScale, maxY, minX],
  );

  const convertGalaxyToRaw = useCallback(
    (worldX: number, worldY: number) => {
      'worklet';
      return {
        x: worldX / galaxyScale + minX,
        y: maxY - worldY / galaxyScale,
      };
    },
    [galaxyScale, maxY, minX],
  );

  const sameBounds = useCallback(
    (a: null | VisibleBounds, b: null | VisibleBounds) =>
      !!a &&
      !!b &&
      a.left === b.left &&
      a.top === b.top &&
      a.right === b.right &&
      a.bottom === b.bottom,
    [],
  );

  const visibleBoundsKey = useDerivedValue(() => {
    const scale = scalePrevious.get();
    if (!canvasSize.get().height || !canvasSize.get().width || scale === 0) {
      return '0,0,0,0';
    }
    let { x: left, y: top } = convertScreenToGalaxy(
      0,
      0,
      panX.get(),
      panY.get(),
      scalePrevious.get(),
    );
    let { x: right, y: bottom } = convertScreenToGalaxy(
      canvasSize.get().width,
      canvasSize.get().height,
      panX.get(),
      panY.get(),
      scalePrevious.get(),
    );

    const overscanGalaxy = OverscanPixels / scale;

    left -= overscanGalaxy;
    top -= overscanGalaxy;
    right += overscanGalaxy;
    bottom += overscanGalaxy;

    if (left === right) {
      left = Math.max(left - overscanGalaxy, 0);
    }
    if (top === bottom) {
      bottom = Math.max(bottom - overscanGalaxy, 0);
    }

    return `${left},${top},${right},${bottom}`;
  });

  const commitBounds = useCallback(
    (next: string) => {
      const [left, top, right, bottom] = next.split(',').map(Number);
      const { x: newRawBoundsLeft, y: newRawBoundsTop } = convertGalaxyToRaw(
        left,
        top,
      );
      const { x: newRawBoundsRight, y: newRawBoundsBottom } =
        convertGalaxyToRaw(right, bottom);

      const rawBucketSize = 1000;

      const newBounds = {
        bottom: Math.floor(newRawBoundsBottom / rawBucketSize) * rawBucketSize,
        left: Math.floor(newRawBoundsLeft / rawBucketSize) * rawBucketSize,
        right: Math.ceil(newRawBoundsRight / rawBucketSize) * rawBucketSize,
        top: Math.ceil(newRawBoundsTop / rawBucketSize) * rawBucketSize,
      };
      setQueryBounds((prev) =>
        sameBounds(prev, newBounds) ? prev : newBounds,
      );
    },
    [convertGalaxyToRaw, sameBounds],
  );

  useAnimatedReaction(
    () => visibleBoundsKey.get(),
    (next, prev) => {
      if (!next || next === prev || next === '0,0,0,0') {
        return;
      }
      runOnJS(commitBounds)(next);
    },
  );

  console.log('Query bounds:', queryBounds);

  const { data: systemsInView } = useGetSystemsInView({
    queryArgs: {
      max_x: queryBounds?.right || 0,
      max_y: queryBounds?.top || 0,
      min_x: queryBounds?.left || 0,
      min_y: queryBounds?.bottom || 0,
    },
  });

  console.log('Systems in view:', systemsInView?.length);

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

      const maxPoint = convertRawToGalaxy(maxShipX, maxShipY);
      const minPoint = convertRawToGalaxy(minShipX, minShipY);

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
      const nextPanX = canvasWidth / (2 * fitScale) - (left + right) / 2;
      const nextPanY = canvasHeight / (2 * fitScale) - (top + bottom) / 2;
      console.log('Ship bounds:', {
        bottom,
        fitScale,
        left,
        maxShipX,
        maxShipY,
        minShipX,
        minShipY,
        nextPanX,
        nextPanY,
        right,
        shipBoundsHeight,
        shipBoundsWidth,
        top,
      });
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

  const systemsTexture = useTexture(
    <Circle
      color="lightblue"
      cx={HalfSpriteSize}
      cy={HalfSpriteSize}
      r={HalfSpriteSize}
    />,
    {
      height: SpriteSize,
      width: SpriteSize,
    },
  );

  const systemSprites = useMemo(
    () => systemsInView?.map(() => rect(0, 0, SpriteSize, SpriteSize)),
    [systemsInView],
  );

  const systemTransforms = useRSXformBuffer(
    systemsInView?.length || 0,
    (val, i) => {
      'worklet';
      const system = systemsInView?.[i];
      if (!system) return;

      const { x: galaxyX, y: galaxyY } = convertRawToGalaxy(system.x, system.y);

      val.set(1, 0, galaxyX - HalfSpriteSize, galaxyY - HalfSpriteSize);
    },
  );

  /**
   * Handles tap gestures for item selection
   * Converts screen coordinates to world coordinates and performs hit testing
   */
  // const handleTap = useCallback(
  //   (
  //     screenX: number,
  //     screenY: number,
  //     currentZoom: number,
  //     currentPanX: number,
  //     currentPanY: number,
  //   ) => {},
  //   [],
  // );

  // const tapGesture = Gesture.Tap().onStart((event) => {
  //   scheduleOnRN(() =>
  //     handleTap(event.x, event.y, scalePrevious.get(), panX.get(), panY.get()),
  //   );
  // });

  // Pan gesture handler - 1:1 finger tracking with momentum
  const panGesture = Gesture.Pan()
    .onStart((event) => {
      // Store the starting position
      prevPanX.set(event.translationX);
      prevPanY.set(event.translationY);
    })
    .onUpdate((event) => {
      // Calculate the change since last frame
      const deltaX = event.translationX - prevPanX.get();
      const deltaY = event.translationY - prevPanY.get();

      // Apply the delta to pan position
      panX.set(panX.get() + deltaX / scalePrevious.get());
      panY.set(panY.get() + deltaY / scalePrevious.get());

      // Update previous position for next frame
      prevPanX.set(event.translationX);
      prevPanY.set(event.translationY);
    })
    .onEnd((event) => {
      const currentScale = scalePrevious.get();

      // Add momentum with smooth physics
      panX.set(
        withDecay({
          clamp: [-5000, 5000],
          deceleration: 0.998,
          velocity: event.velocityX / currentScale,
        }),
      );

      panY.set(
        withDecay({
          clamp: [-5000, 5000],
          deceleration: 0.998,
          velocity: event.velocityY / currentScale,
        }),
      );
    });

  // Pinch gesture handler - apply zoom continuously
  const pinchGesture = Gesture.Pinch().onUpdate((event) => {
    // Apply zoom sensitivity (slower zoom)
    const zoomSensitivity = 0.05;
    const rawScale = 1 + (event.scale - 1) * zoomSensitivity;
    const newZoom = Math.max(
      0.1,
      Math.min(MaxZoom, scalePrevious.get() * rawScale),
    );

    // Get current focal point
    const currentFocalX = event.focalX;
    const currentFocalY = event.focalY;

    const currentScale = scalePrevious.get();

    // Calculate what world point is under the focal point at current zoom
    const { x: worldX, y: worldY } = convertScreenToGalaxy(
      currentFocalX,
      currentFocalY,
      panX.get(),
      panY.get(),
      currentScale,
    );

    // Update zoom and adjust pan to keep world point under focal point
    scalePrevious.set(newZoom);
    panX.set(event.focalX / newZoom - worldX);
    panY.set(event.focalY / newZoom - worldY);
  });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    // tapGesture,
  );

  if (
    isFetchingSystemsMeta ||
    isFetchingShips ||
    galaxyHeight === 0 ||
    galaxyWidth === 0
  ) {
    console.log('No ships or initial bounds not set yet');
    return null;
  }

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[
          flexStyles.flex,
          {
            backgroundColor: 'black',
          },
        ]}
      >
        <Canvas
          onSize={canvasSize}
          style={[
            flexStyles.flex,
            {
              height: galaxyHeight,
              width: galaxyWidth,
            },
          ]}
        >
          {systemSprites !== undefined && (
            <Group transform={transform}>
              <Atlas
                image={systemsTexture}
                sprites={systemSprites}
                transforms={systemTransforms}
              />
            </Group>
          )}
        </Canvas>
      </Animated.View>
    </GestureDetector>
  );
};
