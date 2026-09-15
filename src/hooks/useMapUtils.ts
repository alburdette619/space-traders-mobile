import { useCallback } from 'react';

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

  return {
    convertRawToGalaxy,
    convertScreenToGalaxy,
  };
};
