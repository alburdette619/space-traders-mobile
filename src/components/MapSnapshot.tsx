import { Circle, Group, Line, Path, Skia } from '@shopify/react-native-skia';
import { memo, useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

import { type GalaxySystem } from '../api/supabase/galaxySystems';
import { flexStyles } from '../theme/globalStyles';
import { Map } from './Map';

export interface MapSnapshotPoint {
  symbol: string;
  x: number;
  y: number;
}

interface MapSnapshotProps {
  focusPoint?: MapSnapshotPoint;
  points: GalaxySystem[];
  route?: MapSnapshotRoute;
}

interface MapSnapshotRoute {
  destination: MapSnapshotPoint;
  origin: MapSnapshotPoint;
}

const SnapshotPadding = 12;
const SnapshotSpriteSize = 3;
const SnapshotZoom = 10;
const CrossbarGap = 10;
const CrossbarLength = 18;
const CrossbarWidth = 1;
const RadarAxisExtent = 1000;
const RadarGridExtent = 480;
const RadarGridSpacing = 24;
const RadarGridWidth = 1;
const RadarInset = 8;
const ShipMarkerRadius = 4;
const ShipMarkerRingRadius = 7;
const ShipMarkerRingWidth = 1.5;
const RouteWidth = 1.5;

const radarGridPath = Skia.Path.Make();

for (
  let offset = -RadarGridExtent;
  offset <= RadarGridExtent;
  offset += RadarGridSpacing
) {
  if (offset === 0) continue;

  radarGridPath.moveTo(offset, -RadarGridExtent);
  radarGridPath.lineTo(offset, RadarGridExtent);
  radarGridPath.moveTo(-RadarGridExtent, offset);
  radarGridPath.lineTo(RadarGridExtent, offset);
}

export const MapSnapshot = memo(
  ({ focusPoint, points, route }: MapSnapshotProps) => {
    const { colors } = useTheme();

    const framingPoints = useMemo(
      () => [
        ...points,
        ...(focusPoint ? [focusPoint] : []),
        ...(route ? [route.origin, route.destination] : []),
      ],
      [focusPoint, points, route],
    );

    const bounds = useMemo(() => {
      if (framingPoints.length === 0) return null;

      const [firstPoint, ...remainingPoints] = framingPoints;
      return remainingPoints.reduce(
        (currentBounds, point) => ({
          maxX: Math.max(currentBounds.maxX, point.x),
          maxY: Math.max(currentBounds.maxY, point.y),
          minX: Math.min(currentBounds.minX, point.x),
          minY: Math.min(currentBounds.minY, point.y),
        }),
        {
          maxX: firstPoint.x,
          maxY: firstPoint.y,
          minX: firstPoint.x,
          minY: firstPoint.y,
        },
      );
    }, [framingPoints]);

    const localFocusPoint = useMemo(() => {
      if (!bounds || !focusPoint) return null;

      return {
        x: focusPoint.x - bounds.minX,
        y: bounds.maxY - focusPoint.y,
      };
    }, [bounds, focusPoint]);

    const localRoute = useMemo(() => {
      if (!bounds || !route) return null;

      return {
        destination: {
          x: route.destination.x - bounds.minX,
          y: bounds.maxY - route.destination.y,
        },
        origin: {
          x: route.origin.x - bounds.minX,
          y: bounds.maxY - route.origin.y,
        },
      };
    }, [bounds, route]);

    const canvasSize = useSharedValue({ height: 0, width: 0 });
    const panX = useSharedValue(0);
    const panY = useSharedValue(0);
    const scale = useSharedValue(1);

    const groupTransform = useDerivedValue(() => [
      { translateX: panX.get() },
      { translateY: panY.get() },
      { scale: scale.get() },
    ]);

    const hudTransform = useDerivedValue(() => [
      { translateX: canvasSize.get().width / 2 },
      { translateY: canvasSize.get().height / 2 },
    ]);

    const radarInnerRadius = useDerivedValue(
      () =>
        Math.max(
          Math.min(canvasSize.get().width, canvasSize.get().height) / 2 -
            RadarInset,
          0,
        ) / 3,
    );
    const radarMiddleRadius = useDerivedValue(
      () =>
        (Math.max(
          Math.min(canvasSize.get().width, canvasSize.get().height) / 2 -
            RadarInset,
          0,
        ) *
          2) /
        3,
    );
    const radarOuterRadius = useDerivedValue(() =>
      Math.max(
        Math.min(canvasSize.get().width, canvasSize.get().height) / 2 -
          RadarInset,
        0,
      ),
    );

    const routeWidth = useDerivedValue(() => RouteWidth / scale.get());
    const shipMarkerRadius = useDerivedValue(
      () => ShipMarkerRadius / scale.get(),
    );
    const shipMarkerRingRadius = useDerivedValue(
      () => ShipMarkerRingRadius / scale.get(),
    );
    const shipMarkerRingWidth = useDerivedValue(
      () => ShipMarkerRingWidth / scale.get(),
    );

    useAnimatedReaction(
      () => canvasSize.get(),
      ({ height, width }) => {
        if (!bounds || height === 0 || width === 0) return;

        const domainWidth = bounds.maxX - bounds.minX;
        const domainHeight = bounds.maxY - bounds.minY;
        const focusX = localFocusPoint?.x ?? domainWidth / 2;
        const focusY = localFocusPoint?.y ?? domainHeight / 2;
        const centeredDomainWidth = Math.max(focusX, domainWidth - focusX) * 2;
        const centeredDomainHeight =
          Math.max(focusY, domainHeight - focusY) * 2;
        const availableWidth = Math.max(width - SnapshotPadding * 2, 1);
        const availableHeight = Math.max(height - SnapshotPadding * 2, 1);

        const fitScaleX =
          centeredDomainWidth === 0
            ? Infinity
            : availableWidth / centeredDomainWidth;
        const fitScaleY =
          centeredDomainHeight === 0
            ? Infinity
            : availableHeight / centeredDomainHeight;
        const nextScale =
          centeredDomainWidth === 0 && centeredDomainHeight === 0
            ? 1
            : Math.min(fitScaleX, fitScaleY) * SnapshotZoom;

        scale.set(nextScale);
        panX.set(width / 2 - focusX * nextScale);
        panY.set(height / 2 - focusY * nextScale);
      },
      [bounds, localFocusPoint, panX, panY, scale],
    );

    return (
      <View pointerEvents="none" style={flexStyles.flex}>
        <Map
          background={
            localFocusPoint && (
              <Group transform={hudTransform}>
                <Path
                  color={`${colors.secondary}45`}
                  path={radarGridPath}
                  strokeWidth={RadarGridWidth}
                  style="stroke"
                />
                <Line
                  color={`${colors.secondary}80`}
                  p1={{ x: -RadarAxisExtent, y: 0 }}
                  p2={{ x: RadarAxisExtent, y: 0 }}
                  strokeWidth={CrossbarWidth}
                />
                <Line
                  color={`${colors.secondary}80`}
                  p1={{ x: 0, y: -RadarAxisExtent }}
                  p2={{ x: 0, y: RadarAxisExtent }}
                  strokeWidth={CrossbarWidth}
                />
                <Circle
                  color={`${colors.secondary}80`}
                  cx={0}
                  cy={0}
                  r={radarInnerRadius}
                  strokeWidth={RadarGridWidth}
                  style="stroke"
                />
                <Circle
                  color={`${colors.secondary}80`}
                  cx={0}
                  cy={0}
                  r={radarMiddleRadius}
                  strokeWidth={RadarGridWidth}
                  style="stroke"
                />
                <Circle
                  color={`${colors.secondary}80`}
                  cx={0}
                  cy={0}
                  r={radarOuterRadius}
                  strokeWidth={RadarGridWidth}
                  style="stroke"
                />
              </Group>
            )
          }
          canvasSize={canvasSize}
          galaxyScale={1}
          groupTransform={groupTransform}
          maxY={bounds?.maxY ?? 0}
          minX={bounds?.minX ?? 0}
          overlay={
            localFocusPoint && (
              <Group transform={hudTransform}>
                <Line
                  color={`${colors.secondary}CC`}
                  p1={{ x: -CrossbarGap - CrossbarLength, y: 0 }}
                  p2={{ x: -CrossbarGap, y: 0 }}
                  strokeWidth={CrossbarWidth}
                />
                <Line
                  color={`${colors.secondary}CC`}
                  p1={{ x: CrossbarGap, y: 0 }}
                  p2={{ x: CrossbarGap + CrossbarLength, y: 0 }}
                  strokeWidth={CrossbarWidth}
                />
                <Line
                  color={`${colors.secondary}CC`}
                  p1={{ x: 0, y: -CrossbarGap - CrossbarLength }}
                  p2={{ x: 0, y: -CrossbarGap }}
                  strokeWidth={CrossbarWidth}
                />
                <Line
                  color={`${colors.secondary}CC`}
                  p1={{ x: 0, y: CrossbarGap }}
                  p2={{ x: 0, y: CrossbarGap + CrossbarLength }}
                  strokeWidth={CrossbarWidth}
                />
              </Group>
            )
          }
          scalePrevious={scale}
          spriteScreenSize={SnapshotSpriteSize}
          systemColor={`${colors.onSurfaceVariant}80`}
          systems={points}
        >
          {localRoute && (
            <Line
              color={`${colors.primary}99`}
              p1={localRoute.origin}
              p2={localRoute.destination}
              strokeWidth={routeWidth}
            />
          )}
          {localFocusPoint && (
            <>
              <Circle
                color={`${colors.primary}66`}
                cx={localFocusPoint.x}
                cy={localFocusPoint.y}
                r={shipMarkerRingRadius}
              />
              <Circle
                color="black"
                cx={localFocusPoint.x}
                cy={localFocusPoint.y}
                r={shipMarkerRadius}
              />
              <Circle
                color={colors.primary}
                cx={localFocusPoint.x}
                cy={localFocusPoint.y}
                r={shipMarkerRadius}
                strokeWidth={shipMarkerRingWidth}
                style="stroke"
              />
            </>
          )}
        </Map>
      </View>
    );
  },
);

MapSnapshot.displayName = 'MapSnapshot';
