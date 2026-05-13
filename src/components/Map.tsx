import {
  Atlas,
  Canvas,
  Circle,
  Group,
  rect,
  useRSXformBuffer,
  useTexture,
} from '@shopify/react-native-skia';
import { useCallback, useMemo, useState } from 'react';
import {
  SharedValue,
  useAnimatedReaction,
  useDerivedValue,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

import { useGetSystemsInView } from '../api/supabase/galaxySystems';
import { useGetSystemsMeta } from '../api/supabase/galaxySystemsMeta';
import {
  HalfSpriteSize,
  OverscanPixels,
  SpriteSize,
} from '../constants/mapConstants';
import { useMapGestures } from '../hooks/useMapGestures';
import { useMapUtils } from '../hooks/useMapUtils';
import { flexStyles } from '../theme/globalStyles';
import { VisibleBounds } from '../types/mapTypes';

interface MapProps {
  canvasSize: SharedValue<{ height: number; width: number }>;
  galaxyScale: number;
  groupTransform?: ReturnType<typeof useMapGestures>['groupTransform'];
  panX: SharedValue<number>;
  panY: SharedValue<number>;
  scalePrevious: SharedValue<number>;
}

export const Map = ({
  canvasSize,
  galaxyScale,
  groupTransform,
  panX,
  panY,
  scalePrevious,
}: MapProps) => {
  const [queryBounds, setQueryBounds] = useState<null | VisibleBounds>(null);

  const { data: systemsMeta, isFetching: isFetchingSystemsMeta } =
    useGetSystemsMeta();

  const { max_y: maxY = 0, min_x: minX = 0 } = systemsMeta || {};

  const {
    convertGalaxyToRaw,
    convertRawToGalaxy,
    convertScreenToGalaxy,
    sameBounds,
  } = useMapUtils();

  const visibleBoundsKey = useDerivedValue(() => {
    const scale = scalePrevious.get();
    if (!canvasSize.get().height || !canvasSize.get().width || scale === 0) {
      return '0,0,0,0';
    }
    let { x: left, y: top } = convertScreenToGalaxy({
      panXValue: panX.get(),
      panYValue: panY.get(),
      screenX: 0,
      screenY: 0,
      zoom: scalePrevious.get(),
    });
    let { x: right, y: bottom } = convertScreenToGalaxy({
      panXValue: panX.get(),
      panYValue: panY.get(),
      screenX: canvasSize.get().width,
      screenY: canvasSize.get().height,
      zoom: scalePrevious.get(),
    });

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
      const { x: newRawBoundsLeft, y: newRawBoundsTop } = convertGalaxyToRaw({
        galaxyScale,
        maxY,
        minX,
        worldX: Math.ceil(left),
        worldY: Math.ceil(top),
      });
      const { x: newRawBoundsRight, y: newRawBoundsBottom } =
        convertGalaxyToRaw({
          galaxyScale,
          maxY,
          minX,
          worldX: Math.ceil(right),
          worldY: Math.ceil(bottom),
        });

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
    [convertGalaxyToRaw, galaxyScale, maxY, minX, sameBounds],
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

  const { data: systemsInView } = useGetSystemsInView({
    queryArgs: {
      max_x: queryBounds?.right || 0,
      max_y: queryBounds?.top || 0,
      min_x: queryBounds?.left || 0,
      min_y: queryBounds?.bottom || 0,
    },
  });

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

      const { x: galaxyX, y: galaxyY } = convertRawToGalaxy({
        galaxyScale,
        maxY,
        minX,
        rawX: system.x,
        rawY: system.y,
      });

      val.set(1, 0, galaxyX - HalfSpriteSize, galaxyY - HalfSpriteSize);
    },
  );

  if (isFetchingSystemsMeta) {
    return null;
  }

  return (
    <Canvas onSize={canvasSize} style={[flexStyles.flex]}>
      {systemSprites !== undefined && (
        <Group transform={groupTransform}>
          <Atlas
            image={systemsTexture}
            sprites={systemSprites}
            transforms={systemTransforms}
          />
        </Group>
      )}
    </Canvas>
  );
};
