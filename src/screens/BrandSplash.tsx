import { useNavigation } from '@react-navigation/native';
import {
  Canvas,
  FilterMode,
  MipmapMode,
  Image as SkImage,
  useImage,
} from '@shopify/react-native-skia';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { agentKey } from '../constants/storageKeys';
import { useLoadFonts } from '../hooks/useLoadFonts';
import { useUserStore } from '../stores/userStore';

const DRIFT_X_PX = 4; // background horizontal drift amplitude (±px)
const DRIFT_Y_PX = 4; // background vertical drift amplitude (±px)
const OVER_SCAN = 2;
const MIN_SHOW_MS = __DEV__ ? 1000 : 5000; // min time to show brand splash

const NEAREST = { filter: FilterMode.Nearest, mipmap: MipmapMode.None };

export const BrandSplashScreen = () => {
  const { navigate } = useNavigation();
  const { height, width } = useWindowDimensions();
  const { colors } = useTheme();

  const { setIsAuthenticated } = useUserStore();

  const imgBg = useImage(
    require('../../assets/images/splash-background-x8.png'),
  );
  const imgPlanet = useImage(
    require('../../assets/images/splash-planet-foreground.png'),
  );

  // Choose bg image based on aspect ratio

  // load custom fonts
  const { error: fontLoadingError, fontsLoaded } = useLoadFonts();

  // Check for existing agent
  const [hasAgent, setHasAgent] = useState<boolean | null>(null);
  useEffect(() => {
    const checkAgent = async () => {
      try {
        const agentKeyValue = await SecureStore.getItemAsync(agentKey);
        setHasAgent(!!agentKeyValue);
      } catch {
        setHasAgent(false);
      }
    };

    checkAgent();
  }, []);

  // animation clock
  const bgProgX = useSharedValue(0);
  const bgProgY = useSharedValue(0);
  const plProgX = useSharedValue(0);
  const plProgY = useSharedValue(0);

  useEffect(() => {
    // linear ping-pong loops (autoReverse: true)
    bgProgX.value = withRepeat(
      withTiming(1, { duration: 12000, easing: Easing.linear }),
      -1,
      true,
    );
    bgProgY.value = withRepeat(
      withTiming(1, { duration: 12000, easing: Easing.linear }),
      -1,
      true,
    );
    plProgX.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.linear }),
      -1,
      true,
    );
    plProgY.value = withRepeat(
      withTiming(1, { duration: 14000, easing: Easing.linear }),
      -1,
      true,
    );
  }, [bgProgX, bgProgY, plProgX, plProgY]);

  // hide native splash once images are ready + min brand time elapsed
  const [start] = useState(() => Date.now());
  useEffect(() => {
    if (!imgBg || !imgPlanet || !fontsLoaded || hasAgent === null) return;

    const left = Math.max(0, MIN_SHOW_MS - (Date.now() - start));
    const t = setTimeout(() => {
      console.log('BrandSplash: done');
      if (hasAgent) {
        setIsAuthenticated(true);
        navigate('MainAppTabs');
      } else {
        navigate('NewAgent');
      }
    }, left);
    return () => clearTimeout(t);
  }, [
    fontLoadingError,
    fontsLoaded,
    hasAgent,
    imgBg,
    imgPlanet,
    navigate,
    setIsAuthenticated,
    start,
  ]);

  // layout + integer-pixel motion (avoid shimmer in pixel art)
  const imageLayout = useMemo(() => {
    if (!imgBg || !imgPlanet) return undefined;

    // --- BACKGROUND: cover + tiny bleed from the chosen image's intrinsic size
    const imgW = imgBg.width();
    const imgH = imgBg.height();
    const needW = width + 2 * DRIFT_X_PX;
    const needH = height + 2 * DRIFT_Y_PX;
    const scale = Math.max(needW / imgW, needH / imgH);
    const bgW = Math.ceil(imgW * scale);
    const bgH = Math.ceil(imgH * scale);

    const baseBgX = Math.round((width - bgW) / 2);
    const baseBgY = Math.round((height - bgH) / 2);

    // --- PLANET: keep your alignment exactly, just swap to ping-pong motion
    const planetW = Math.ceil(imgPlanet.width() * OVER_SCAN);
    const planetH = Math.ceil(imgPlanet.height() * OVER_SCAN);

    const basePlanetX = Math.round(width - planetW * 0.8);
    const basePlanetY = Math.round(height / 3);

    return {
      baseBgX,
      baseBgY,
      basePlanetX,
      basePlanetY,
      bgH,
      bgW,
      planetH,
      planetW,
    };
  }, [imgBg, imgPlanet, width, height]);

  // Map 0..1 -> -A..+A and round to whole pixels (pixel-art safe)
  const baseBgX = imageLayout?.baseBgX ?? 0;
  const baseBgY = imageLayout?.baseBgY ?? 0;
  const basePlanetX = imageLayout?.basePlanetX ?? 0;
  const basePlanetY = imageLayout?.basePlanetY ?? 0;

  const bgX = useDerivedValue(() => {
    const offset = Math.round((bgProgX.value * 2 - 1) * DRIFT_X_PX);
    return baseBgX + offset;
  }, [baseBgX]);

  const bgY = useDerivedValue(() => {
    const offset = Math.round((bgProgY.value * 2 - 1) * DRIFT_Y_PX);
    return baseBgY + offset;
  }, [baseBgY]);

  const planetX = useDerivedValue(() => {
    const offset = Math.round((plProgX.value * 2 - 1) * 6);
    return basePlanetX - offset;
  }, [basePlanetX]);

  const planetY = useDerivedValue(() => {
    const offset = Math.round((plProgY.value * 2 - 1) * 2);
    return basePlanetY + offset;
  }, [basePlanetY]);

  if (!imgBg || !imgPlanet || !imageLayout || !fontsLoaded) return null;

  return (
    <>
      <Canvas
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: colors.background,
        }}
      >
        <SkImage
          height={imageLayout.bgH}
          image={imgBg}
          sampling={NEAREST}
          width={imageLayout.bgW}
          x={bgX}
          y={bgY}
        />
        <SkImage
          height={imageLayout.planetH}
          image={imgPlanet}
          sampling={NEAREST}
          width={imageLayout.planetW}
          x={planetX}
          y={planetY}
        />
      </Canvas>
      <Text style={styles.appNameText} variant="displayLarge">
        {'/// VOID RUNNER'}
      </Text>
    </>
  );
};

const styles = StyleSheet.create({
  appNameText: {
    bottom: 50,
    left: 20,
    position: 'absolute',
  },
});
