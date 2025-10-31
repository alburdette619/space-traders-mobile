import { defaultConfig } from '@tamagui/config/v4';
import { createFont, createTamagui, createTokens } from 'tamagui';

const orbitron = createFont({
  family: 'Orbitron',
  size: {
    // Headings expect numeric keys; include 1–10 at least
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 22,
    7: 24,
    8: 28,
    9: 32,
    10: 36,
  },
  lineHeight: {
    1: 14,
    2: 17,
    3: 19,
    4: 22,
    5: 24,
    6: 26,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
  },
  letterSpacing: {
    1: 0,
    2: 0,
    3: 0,
    4: 0.2,
    5: 0.2,
    6: 0.2,
    7: 0.2,
    8: 0.3,
    9: 0.3,
    10: 0.35,
  },
  weight: {
    // optional mapping used by SizableText variants
    1: '400',
    2: '400',
    3: '500',
    4: '600',
    5: '700',
    6: '700',
    7: '800',
    8: '800',
    9: '900',
    10: '900',
  },
  // IMPORTANT for Android: map weights to actual loaded fontFamily names
  // so weight changes resolve to the right TTF. (RN limitation)
  face: {
    400: { normal: 'Orbitron_400Regular' },
    500: { normal: 'Orbitron_500Medium' },
    600: { normal: 'Orbitron_600SemiBold' },
    700: { normal: 'Orbitron_700Bold' },
    800: { normal: 'Orbitron_800ExtraBold' },
    900: { normal: 'Orbitron_900Black' },
  },
});

const tokens = createTokens({
  ...defaultConfig.tokens,
  color: {
    // neutrals
    voidBg: '#000020',
    voidBg2: '#000025',
    surface1: '#0F1048',
    surface2: '#0B0B3D',

    border: '#F2F4FF',

    text: '#F2F4FF',
    textMuted: '#C6CBF7',

    // roles from splash screen art
    brandSolid: '#5A187B', // purple gas
    brandHover: '#662986', // onBrand 8% overlay
    brandPress: '#6D318B', // onBrand 12% overlay
    onBrand: '#F6ECFF',

    disabledContainer: '#f2f4ff1f', // ~12% on-surface over bg
    disabledBorder: '#f2f4ff29', // subtle edge if you keep borders
    disabledContent: '#f2f4ff61', // ~38% on-surface for label/icon

    accentSolid: '#1C9DA7', // cyan (mid) from #9BE8D7/#D0F2FB family
    onAccent: '#031416',

    infoSolid: '#24258A', // deep nebula blue
    onInfo: '#EAF0FF',
  },
});

const voidConfig = createTamagui({
  ...defaultConfig,
  fonts: {
    ...defaultConfig.fonts,
    heading: orbitron, // use Orbitron for headings otherwise keep defaults
  },

  settings: {
    ...defaultConfig.settings,
    onlyAllowShorthands: false,
  },

  tokens,

  themes: {
    // single neutral dark app theme
    dark: {
      background: tokens.color.voidBg,
      backgroundHover: tokens.color.surface2,
      backgroundPress: tokens.color.surface1,
      borderColor: tokens.color.border,
      borderColorHover: tokens.color.border,
      color: tokens.color.text,
      placeholderColor: tokens.color.textMuted,

      // role tokens (use directly on components)
      brandSolid: tokens.color.brandSolid,
      onBrand: tokens.color.onBrand,
      accentSolid: tokens.color.accentSolid,
      onAccent: tokens.color.onAccent,
      infoSolid: tokens.color.infoSolid,
      onInfo: tokens.color.onInfo,
    },
    dark_Button: {
      background: tokens.color.brandSolid,
      backgroundDisabled: tokens.color.disabledContainer,
      backgroundHover: tokens.color.brandHover,
      backgroundPress: tokens.color.brandPress,
      borderColor: tokens.color.brandSolid,
      borderColorDisabled: tokens.color.disabledBorder,
      color: tokens.color.onBrand,
      colorDisabled: tokens.color.disabledContent,
    },
  },
});

type VoidConfig = typeof voidConfig;

/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'tamagui' {
  interface TamaguiCustomConfig extends VoidConfig {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

export default voidConfig;
