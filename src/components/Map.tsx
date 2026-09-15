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
import { useMemo } from 'react';
import { SharedValue } from 'react-native-reanimated';

import { type GalaxySystem } from '../api/supabase/galaxySystems';
import { HalfSpriteSize, SpriteSize } from '../constants/mapConstants';
import { useMapGestures } from '../hooks/useMapGestures';
import { flexStyles } from '../theme/globalStyles';

interface MapProps {
  canvasSize: SharedValue<{ height: number; width: number }>;
  galaxyScale: number;
  groupTransform?: ReturnType<typeof useMapGestures>['groupTransform'];
  maxY: number;
  minX: number;
  scalePrevious: SharedValue<number>;
  systems: GalaxySystem[];
}

export const Map = ({
  canvasSize,
  galaxyScale,
  groupTransform,
  maxY,
  minX,
  scalePrevious,
  systems,
}: MapProps) => {
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
    () => systems.map(() => rect(0, 0, SpriteSize, SpriteSize)),
    [systems],
  );

  const systemPositions = useMemo(
    () =>
      systems.map((system) => ({
        x: (system.x - minX) * galaxyScale,
        y: (maxY - system.y) * galaxyScale,
      })),
    [galaxyScale, maxY, minX, systems],
  );

  const systemTransforms = useRSXformBuffer(
    systemPositions.length,
    (val, i) => {
      'worklet';
      const position = systemPositions[i];
      if (!position) return;

      // Vary the size of the sprite based on zoom level, with a min and max size.
      const currentScale = scalePrevious.get();
      const spriteScaleRaw = clamp(HalfSpriteSize / currentScale, 0.3, 1);
      const spriteScale = Math.ceil(spriteScaleRaw * 10) / 10;

      val.set(
        spriteScale,
        0,
        position.x - HalfSpriteSize * spriteScale,
        position.y - HalfSpriteSize * spriteScale,
      );
    },
  );

  return (
    <Canvas onSize={canvasSize} style={[flexStyles.flex]}>
      {systems.length > 0 && (
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
