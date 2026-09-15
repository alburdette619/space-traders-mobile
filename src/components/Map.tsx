import {
  Atlas,
  Canvas,
  Circle,
  clamp,
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
import {
  HalfSpriteSize,
  OverscanPixels,
  RawBoundsBucketSize,
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
  maxY: number;
  minX: number;
  panX: SharedValue<number>;
  panY: SharedValue<number>;
  scalePrevious: SharedValue<number>;
}

export const Map = ({
  canvasSize,
  galaxyScale,
  groupTransform,
  maxY,
  minX,
  panX,
  panY,
  scalePrevious,
}: MapProps) => {
  const [queryBounds, setQueryBounds] = useState<null | VisibleBounds>(null);

  const {
    convertGalaxyToRaw,
    convertRawToGalaxy,
    convertScreenToGalaxy,
    sameBounds,
  } = useMapUtils();

  const visibleBoundsKey = useDerivedValue(() => {
    const scale = scalePrevious.get();
    const { height, width } = canvasSize.get();
    if (!height || !width || scale === 0 || galaxyScale === 0) {
      return '';
    }
    const { x: visibleLeft, y: visibleTop } = convertScreenToGalaxy({
      panXValue: panX.get(),
      panYValue: panY.get(),
      screenX: 0,
      screenY: 0,
      zoom: scale,
    });
    const { x: visibleRight, y: visibleBottom } = convertScreenToGalaxy({
      panXValue: panX.get(),
      panYValue: panY.get(),
      screenX: width,
      screenY: height,
      zoom: scale,
    });

    const overscanGalaxy = OverscanPixels / scale;
    const left = visibleLeft - overscanGalaxy;
    const top = visibleTop - overscanGalaxy;
    const right = visibleRight + overscanGalaxy;
    const bottom = visibleBottom + overscanGalaxy;

    const { x: rawLeft, y: rawTop } = convertGalaxyToRaw({
      galaxyScale,
      maxY,
      minX,
      worldX: left,
      worldY: top,
    });
    const { x: rawRight, y: rawBottom } = convertGalaxyToRaw({
      galaxyScale,
      maxY,
      minX,
      worldX: right,
      worldY: bottom,
    });

    const bucketedLeft =
      Math.floor(rawLeft / RawBoundsBucketSize) * RawBoundsBucketSize;
    const bucketedTop =
      Math.ceil(rawTop / RawBoundsBucketSize) * RawBoundsBucketSize;
    const bucketedRight =
      Math.ceil(rawRight / RawBoundsBucketSize) * RawBoundsBucketSize;
    const bucketedBottom =
      Math.floor(rawBottom / RawBoundsBucketSize) * RawBoundsBucketSize;

    return `${bucketedLeft},${bucketedTop},${bucketedRight},${bucketedBottom}`;
  });

  const commitBounds = useCallback(
    (next: string) => {
      const [left, top, right, bottom] = next.split(',').map(Number);
      const newBounds = { bottom, left, right, top };

      setQueryBounds((prev) =>
        sameBounds(prev, newBounds) ? prev : newBounds,
      );
    },
    [sameBounds],
  );

  useAnimatedReaction(
    () => visibleBoundsKey.get(),
    (next, prev) => {
      if (!next || next === prev) {
        return;
      }
      runOnJS(commitBounds)(next);
    },
  );

  const { data: systemsInView } = useGetSystemsInView({
    enabled: queryBounds !== null,
    queryArgs: {
      max_x: queryBounds?.right ?? 0,
      max_y: queryBounds?.top ?? 0,
      min_x: queryBounds?.left ?? 0,
      min_y: queryBounds?.bottom ?? 0,
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

      // Vary the size of the sprite based on zoom level, with a min and max size.
      // TODO: This causes some jitter when zooming in and out, on sim, is it an issue?
      const currentScale = scalePrevious.get();
      const spriteScaleRaw = clamp(HalfSpriteSize / currentScale, 0.3, 1);
      const spriteScale = Math.ceil(spriteScaleRaw * 10) / 10;

      val.set(spriteScale, 0, galaxyX - spriteScale, galaxyY - spriteScale);
    },
  );

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
