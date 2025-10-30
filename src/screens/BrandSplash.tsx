// BrandSplashScreen.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Image as SkImage,
  useImage,
  FilterMode,
  MipmapMode,
} from '@shopify/react-native-skia';
import * as SplashScreen from 'expo-splash-screen';
import { getTokens, Heading } from 'tamagui';
import { useLoadFonts } from '../hooks/useLoadFonts';

const DRIFT_X_PX = 4; // background horizontal drift amplitude (±px)
const DRIFT_Y_PX = 2; // background vertical drift amplitude (±px)
const PLANET_SPEED_X = 0.006;
const PLANET_BOB_Y = 0.01;
const BG_DRIFT_SPEED_X = 0.004;
const BG_DRIFT_SPEED_Y = 0.003;
const OVER_SCAN = 2;
const MIN_SHOW_MS = 2000; // min time to show brand splash

const NEAREST = { filter: FilterMode.Nearest, mipmap: MipmapMode.None };

export const BrandSplashScreen = () => {
  const { width, height } = useWindowDimensions();
  const isTallScreen = true; //height / width >= 1.95;

  const imgBgLandscape = useImage(
    require('../../assets/images/splash-background-x8.png'),
  );
  const imgBgPortrait = useImage(
    require('../../assets/images/splash-background-portrait-x8.png'),
  );
  const imgPlanet = useImage(
    require('../../assets/images/splash-planet-foreground.png'),
  );

  // Choose bg image based on aspect ratio
  const imgBg = isTallScreen ? imgBgPortrait : imgBgLandscape;

  // load custom fonts
  const { fontsLoaded, error: fontLoadingError } = useLoadFonts();

  // animation clock
  const [tick, setTick] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const loop = () => {
      setTick((t) => (t + 1) % 1_000_000);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // hide native splash once images are ready + min brand time elapsed
  const [start] = useState(() => Date.now());
  useEffect(() => {
    if (!imgBg || !imgPlanet) return;

    if (fontsLoaded) {
      const left = Math.max(0, MIN_SHOW_MS - (Date.now() - start));
      const t = setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {});
      }, left);
      return () => clearTimeout(t);
    } else if (fontLoadingError) {
      // on error, just hide immediately?
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontLoadingError, imgBg, imgPlanet, start]);

  // layout + integer-pixel motion (avoid shimmer in pixel art)
  const L = useMemo(() => {
    if (!imgBg || !imgPlanet) return null;

    // --- BACKGROUND: compute "cover + bleed" scale from the image's real size
    const imgW = imgBg.width();
    const imgH = imgBg.height();

    // we need to cover the device + a small buffer for drift so edges never show
    const needW = width + 2 * DRIFT_X_PX;
    const needH = height + 2 * DRIFT_Y_PX;

    const scale = Math.max(needW / imgW, needH / imgH);
    const bgW = Math.ceil(imgW * scale);
    const bgH = Math.ceil(imgH * scale);

    // slow background drift (snap to whole px)
    const bgDriftX = Math.round(Math.sin(tick * BG_DRIFT_SPEED_X) * DRIFT_X_PX);
    const bgDriftY = Math.round(Math.cos(tick * BG_DRIFT_SPEED_Y) * DRIFT_Y_PX);

    // center, then apply drift
    const bgX = Math.round((width - bgW) / 2 + bgDriftX);
    const bgY = Math.round((height - bgH) / 2 + bgDriftY);

    // --- PLANET: keep your alignment math, using overScan only for planet size
    const planetW = Math.ceil(imgPlanet.width() * OVER_SCAN);
    const planetH = Math.ceil(imgPlanet.height() * OVER_SCAN);

    // planet motion a bit stronger than bg
    const driftX = Math.round(Math.sin(tick * PLANET_SPEED_X) * 6); // ±6 px
    const bobY = Math.round(Math.sin(tick * PLANET_BOB_Y) * 2); // ±2 px

    const planetX = Math.round(width - planetW * 0.8 - driftX);
    const planetY = Math.round(height / 3 + bobY);

    return { bgX, bgY, bgW, bgH, planetX, planetY, planetW, planetH };
  }, [imgBg, imgPlanet, width, height, tick]);

  if (!imgBg || !imgPlanet || !L || !fontsLoaded) return null;

  return (
    <>
      <Canvas
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: getTokens().color.voidBg.val,
        }}
      >
        <SkImage
          image={imgBg}
          x={L.bgX}
          y={L.bgY}
          width={L.bgW}
          height={L.bgH}
          sampling={NEAREST}
        />
        <SkImage
          image={imgPlanet}
          x={L.planetX}
          y={L.planetY}
          width={L.planetW}
          height={L.planetH}
          sampling={NEAREST}
        />
      </Canvas>
      <Heading fontWeight="900" fontSize="$9" position="absolute" b={50} l={20}>
        {'/// VOID RUNNER'}
      </Heading>
    </>
  );
};
