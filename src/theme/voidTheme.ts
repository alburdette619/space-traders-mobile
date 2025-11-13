import {
  configureFonts,
  type MD3Theme,
  MD3DarkTheme as PaperDarkTheme,
} from 'react-native-paper';

// Make sure these font families match what you load via expo-font
// (Orbitron_400Regular, Orbitron_500Medium, etc.)
export const orbitronVariants = {
  // big “HUD” text
  displayLarge: {
    fontFamily: 'Orbitron_900Black',
    fontSize: 36, // size[10]
    fontWeight: '900' as '900',
    letterSpacing: 0.35, // letterSpacing[10]
    lineHeight: 40, // lineHeight[10]
  },
  displayMedium: {
    fontFamily: 'Orbitron_900Black',
    fontSize: 32, // 9
    fontWeight: '900' as '900',
    letterSpacing: 0.3,
    lineHeight: 36,
  },
  displaySmall: {
    fontFamily: 'Orbitron_800ExtraBold',
    fontSize: 28, // 8
    fontWeight: '800' as '800',
    letterSpacing: 0.3,
    lineHeight: 32,
  },

  headlineLarge: {
    fontFamily: 'Orbitron_800ExtraBold',
    fontSize: 24, // 7
    fontWeight: '800' as '800',
    letterSpacing: 0.2,
    lineHeight: 28,
  },
  headlineMedium: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 22, // 6
    fontWeight: '700' as '700',
    letterSpacing: 0.2,
    lineHeight: 26,
  },
  headlineSmall: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 20, // 5
    fontWeight: '700' as '700',
    letterSpacing: 0.2,
    lineHeight: 24,
  },

  // Labels (buttons, chips, etc.)
  labelLarge: {
    fontFamily: 'Orbitron_500Medium',
    fontSize: 14, // 2
    fontWeight: '500' as '500',
    letterSpacing: 0,
    lineHeight: 17,
  },
  labelMedium: {
    fontFamily: 'Orbitron_500Medium',
    fontSize: 12, // 1
    fontWeight: '500' as '500',
    letterSpacing: 0,
    lineHeight: 14,
  },
  labelSmall: {
    fontFamily: 'Orbitron_400Regular',
    fontSize: 11,
    fontWeight: '400' as '400',
    letterSpacing: 0,
    lineHeight: 13,
  },

  // Titles (card titles, section headers, etc.)
  titleLarge: {
    fontFamily: 'Orbitron_600SemiBold',
    fontSize: 18, // 4
    fontWeight: '600' as '600',
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  titleMedium: {
    fontFamily: 'Orbitron_500Medium',
    fontSize: 16, // 3
    fontWeight: '500' as '500',
    letterSpacing: 0,
    lineHeight: 19,
  },
  titleSmall: {
    fontFamily: 'Orbitron_400Regular',
    fontSize: 14, // 2
    fontWeight: '400' as '400',
    letterSpacing: 0,
    lineHeight: 17,
  },
};

// Start from Paper’s MD3 dark fonts and just override the “heading-like” ones
const fonts = configureFonts({
  config: {
    ...PaperDarkTheme.fonts,
    ...orbitronVariants,
  },
});

export const baseColors = {
  accentSolid: '#1C9DA7',
  border: '#F2F4FF',
  brandHover: '#662986',
  brandPress: '#6D318B',

  brandSolid: '#5A187B',

  disabledBorder: '#f2f4ff29',
  disabledContainer: '#f2f4ff1f',

  disabledContent: '#f2f4ff61',

  errorContainer: '#4C0018', // dark error surface
  errorSolid: '#FF4B7D', // bright magenta-red

  infoSolid: '#24258A',

  onAccent: '#031416',
  onBrand: '#F6ECFF',
  onError: '#1A0010',
  onErrorContainer: '#FFD9E4',
  onInfo: '#EAF0FF',
  onWarning: '#1A1200',
  onWarningContainer: '#FFF4C7',

  surface1: '#0F1048',
  surface2: '#0B0B3D',
  text: '#F2F4FF',
  textMuted: '#C6CBF7',

  voidBg: '#000020',
  voidBg2: '#000025',

  warningContainer: '#4A3500', // dark warning surface
  warningSolid: '#FFC857', // warm amber
};

export const voidTheme: MD3Theme = {
  ...PaperDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,

    background: baseColors.voidBg,

    error: baseColors.errorSolid,
    errorContainer: baseColors.errorContainer,

    inverseOnSurface: baseColors.text,
    inversePrimary: baseColors.brandPress,
    inverseSurface: baseColors.voidBg2,

    onError: baseColors.onError,
    onErrorContainer: baseColors.onErrorContainer,
    onPrimary: baseColors.onBrand,
    onPrimaryContainer: baseColors.onBrand,
    onSecondary: baseColors.onAccent,
    onSecondaryContainer: baseColors.onInfo,
    onSurface: baseColors.text,
    onSurfaceDisabled: baseColors.disabledContent,
    onSurfaceVariant: baseColors.textMuted,
    onTertiary: baseColors.onInfo,

    outline: baseColors.border,
    outlineVariant: baseColors.disabledBorder,

    primary: baseColors.brandSolid,
    primaryContainer: baseColors.brandHover,

    secondary: baseColors.accentSolid,
    secondaryContainer: baseColors.infoSolid,

    surface: baseColors.surface1,
    surfaceDisabled: baseColors.disabledContainer,
    surfaceVariant: baseColors.surface2,

    tertiary: baseColors.infoSolid,
  },
  dark: true,
  fonts,
  roundness: 8,
};
