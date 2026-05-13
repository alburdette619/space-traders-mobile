import { Gesture } from 'react-native-gesture-handler';
import {
  useDerivedValue,
  useSharedValue,
  withDecay,
} from 'react-native-reanimated';

import { MaxZoom } from '../constants/mapConstants';
import { useMapUtils } from './useMapUtils';

export const useMapGestures = () => {
  const { convertScreenToGalaxy } = useMapUtils();

  // Core shared values for transform state
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);

  // Track previous pan position for delta calculation
  const prevPanX = useSharedValue(0);
  const prevPanY = useSharedValue(0);

  // Zoom state
  const scalePrevious = useSharedValue(1);

  // Calculate transform matrix
  const groupTransform = useDerivedValue(() => {
    return [
      { translateX: panX.get() },
      { translateY: panY.get() },
      { scale: scalePrevious.get() },
    ];
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
      // Add momentum with smooth physics
      panX.set(
        withDecay({
          clamp: [-5000, 5000],
          deceleration: 0.998,
          velocity: event.velocityX,
        }),
      );

      panY.set(
        withDecay({
          clamp: [-5000, 5000],
          deceleration: 0.998,
          velocity: event.velocityY,
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
    const { x: worldX, y: worldY } = convertScreenToGalaxy({
      panXValue: panX.get(),
      panYValue: panY.get(),
      screenX: currentFocalX,
      screenY: currentFocalY,
      zoom: currentScale,
    });

    // Update zoom and adjust pan to keep world point under focal point
    scalePrevious.set(newZoom);
    panX.set(currentFocalX - worldX * newZoom);
    panY.set(currentFocalY - worldY * newZoom);
  });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    // tapGesture,
  );

  return {
    composedGesture,
    groupTransform,
    panX,
    panY,
    scalePrevious,
  };
};
