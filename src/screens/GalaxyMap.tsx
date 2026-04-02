import {
  Atlas,
  Canvas,
  Circle,
  Group,
  rect,
  useCanvasSize,
  useRSXformBuffer,
  useTexture,
} from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useDerivedValue,
  useSharedValue,
  withDecay,
} from 'react-native-reanimated';

import { useGetMyShips } from '../api/models/fleet/fleet';
import { useGetSystemsMeta } from '../api/supabase/galaxySystemsMeta';
import { flexStyles } from '../theme/globalStyles';

const SpriteSize = 4;
const HalfSpriteSize = SpriteSize / 2;

export const GalaxyMapScreen = () => {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const { data: systemsMeta, isFetching: isFetchingSystemsMeta } =
    useGetSystemsMeta();

  const {
    max_x: maxX = 0,
    max_y: maxY = 0,
    min_x: minX = 0,
    min_y: minY = 0,
  } = systemsMeta || {};

  const {
    // data: ships,
    isFetching: isFetchingShips,
  } = useGetMyShips();

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

  const { ref: canvasRef } = useCanvasSize();

  // Core shared values for transform state
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);

  // Track previous pan position for delta calculation
  const prevPanX = useSharedValue(0);
  const prevPanY = useSharedValue(0);

  // Zoom state
  const scalePrevious = useSharedValue(1);

  // Calculate transform matrix (simplified since we're not using scaleCurrent anymore)
  const transform = useDerivedValue(() => {
    return [
      { translateX: panX.value },
      { translateY: panY.value },
      { scale: scalePrevious.value },
    ];
  });

  // const [initialBounds, setInitialBounds] = useState<null | {
  //   x: [number, number];
  //   y: [number, number];
  // }>(null);

  // useEffect(() => {
  //   if (
  //     initialBounds !== null ||
  //     !ships?.data ||
  //     isFetchingShips ||
  //     isFetchingSystemsMeta
  //   ) {
  //     return;
  //   }

  //   const maxShipX =
  //     get(
  //       maxBy(ships?.data, 'nav.route.destination.x'),
  //       'nav.route.destination.x',
  //     ) || 100;
  //   const maxShipY =
  //     get(
  //       maxBy(ships?.data, 'nav.route.destination.y'),
  //       'nav.route.destination.y',
  //     ) || 100;
  //   const minShipX =
  //     get(
  //       minBy(ships?.data, 'nav.route.destination.x'),
  //       'nav.route.destination.x',
  //     ) || -100;
  //   const minShipY =
  //     get(
  //       minBy(ships?.data, 'nav.route.destination.y'),
  //       'nav.route.destination.y',
  //     ) || -100;

  //   setInitialBounds({ x: [minShipX, maxShipX], y: [minShipY, maxShipY] });

  //   const yScale = (maxY - minY) / (maxShipY - minShipY);
  //   const xScale = (maxX - minX) / (maxShipX - minShipX);

  //   console.log('Scales:', { xScale, yScale });

  //   // let newMatrix = setScale(transformState.matrix.value, 2, 2);
  //   // newMatrix = setTranslate(
  //   //   newMatrix,
  //   //   100,
  //   //   100,
  //   //   // Math.abs(minX + minShipX),
  //   //   // Math.abs(maxY - minShipY),
  //   // );
  //   // transformState.matrix.set(newMatrix);
  // }, [
  //   initialBounds,
  //   isFetchingShips,
  //   isFetchingSystemsMeta,
  //   maxX,
  //   maxY,
  //   minX,
  //   minY,
  //   ships?.data,
  // ]);

  const testData = useMemo(() => {
    const data = Array.from({ length: 100 }).map((_) => ({
      x: Math.random() * (maxX - minX) + minX,
      y: Math.random() * (maxY - minY) + minY,
    }));

    data.push({ x: 100, y: 100 });

    return data;
  }, [maxX, minX, maxY, minY]);

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
    () => testData.map(() => rect(0, 0, SpriteSize, SpriteSize)),
    [testData],
  );

  const systemTransforms = useRSXformBuffer(testData.length, (val, i) => {
    'worklet';
    const pos = testData[i];
    const galaxyX = (pos.x - minX) * galaxyScale;
    const galaxyY = (maxY - pos.y) * galaxyScale;
    val.set(1, 0, galaxyX - HalfSpriteSize, galaxyY - HalfSpriteSize);
  });

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
  //     handleTap(event.x, event.y, scalePrevious.value, panX.value, panY.value),
  //   );
  // });

  // Pan gesture handler - 1:1 finger tracking with momentum
  const panGesture = Gesture.Pan()
    .onStart((event) => {
      // Store the starting position
      prevPanX.value = event.translationX;
      prevPanY.value = event.translationY;
    })
    .onUpdate((event) => {
      // Calculate the change since last frame
      const deltaX = event.translationX - prevPanX.value;
      const deltaY = event.translationY - prevPanY.value;

      // Apply the delta to pan position
      panX.value += deltaX;
      panY.value += deltaY;

      // Update previous position for next frame
      prevPanX.value = event.translationX;
      prevPanY.value = event.translationY;
    })
    .onEnd((event) => {
      // Add momentum with smooth physics
      panX.value = withDecay({
        clamp: [-5000, 5000],
        deceleration: 0.998,
        velocity: event.velocityX,
      });

      panY.value = withDecay({
        clamp: [-5000, 5000],
        deceleration: 0.998,
        velocity: event.velocityY,
      });
    });

  // Pinch gesture handler - apply zoom continuously
  const pinchGesture = Gesture.Pinch().onUpdate((event) => {
    // Apply zoom sensitivity (slower zoom)
    const zoomSensitivity = 0.05;
    const rawScale = 1 + (event.scale - 1) * zoomSensitivity;
    const newZoom = Math.max(
      0.1,
      Math.min(5.0, scalePrevious.value * rawScale),
    );

    // Get current focal point
    const currentFocalX = event.focalX;
    const currentFocalY = event.focalY;

    // Calculate what world point is under the focal point at current zoom
    const worldX = (currentFocalX - panX.value) / scalePrevious.value;
    const worldY = (currentFocalY - panY.value) / scalePrevious.value;

    // Update zoom and adjust pan to keep world point under focal point
    scalePrevious.value = newZoom;
    panX.value = currentFocalX - worldX * newZoom;
    panY.value = currentFocalY - worldY * newZoom;
  });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    // tapGesture,
  );

  if (
    // initialBounds === null ||
    // ships?.data.length === 0 ||
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
          ref={canvasRef}
          style={{
            height: galaxyHeight,
            width: galaxyWidth,
          }}
        >
          <Group transform={transform}>
            <Atlas
              image={systemsTexture}
              sprites={systemSprites}
              transforms={systemTransforms}
            />
          </Group>
        </Canvas>
      </Animated.View>
    </GestureDetector>
  );
};
