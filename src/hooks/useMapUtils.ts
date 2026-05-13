import { useCallback } from 'react';

import { VisibleBounds } from '../types/mapTypes';

type ConvertGalaxyToRawArgs = {
  galaxyScale: number;
  maxY: number;
  minX: number;
  worldX: number;
  worldY: number;
};

type ConvertGalaxyToScreenArgs = {
  panXValue: number;
  panYValue: number;
  worldX: number;
  worldY: number;
  zoom: number;
};

type ConvertRawToGalaxyArgs = {
  galaxyScale: number;
  maxY: number;
  minX: number;
  rawX: number;
  rawY: number;
};

type ConvertScreenToGalaxyArgs = {
  panXValue: number;
  panYValue: number;
  screenX: number;
  screenY: number;
  zoom: number;
};

export const useMapUtils = () => {
  const convertGalaxyToScreen = useCallback(
    ({
      panXValue,
      panYValue,
      worldX,
      worldY,
      zoom,
    }: ConvertGalaxyToScreenArgs) => {
      'worklet';
      return {
        x: worldX * zoom + panXValue,
        y: worldY * zoom + panYValue,
      };
    },
    [],
  );

  const convertScreenToGalaxy = useCallback(
    ({
      panXValue,
      panYValue,
      screenX,
      screenY,
      zoom,
    }: ConvertScreenToGalaxyArgs) => {
      'worklet';
      return {
        x: (screenX - panXValue) / zoom,
        y: (screenY - panYValue) / zoom,
      };
    },
    [],
  );

  const convertRawToGalaxy = useCallback(
    ({ galaxyScale, maxY, minX, rawX, rawY }: ConvertRawToGalaxyArgs) => {
      'worklet';
      return {
        x: (rawX - minX) * galaxyScale,
        y: (maxY - rawY) * galaxyScale,
      };
    },
    [],
  );

  const convertGalaxyToRaw = useCallback(
    ({ galaxyScale, maxY, minX, worldX, worldY }: ConvertGalaxyToRawArgs) => {
      'worklet';
      return {
        x: worldX / galaxyScale + minX,
        y: maxY - worldY / galaxyScale,
      };
    },
    [],
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

  return {
    convertGalaxyToRaw,
    convertGalaxyToScreen,
    convertRawToGalaxy,
    convertScreenToGalaxy,
    sameBounds,
  };
};
