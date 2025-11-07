import {
  MD3DarkTheme as PaperDarkTheme,
  configureFonts,
  type MD3Theme,
} from 'react-native-paper';

// Make sure these font families match what you load via expo-font
// (Orbitron_400Regular, Orbitron_500Medium, etc.)
const orbitronVariants = {
  // big “HUD” text
  displayLarge: {
    fontFamily: 'Orbitron_900Black',
    fontWeight: '900' as '900',
    fontSize: 36, // size[10]
    lineHeight: 40, // lineHeight[10]
    letterSpacing: 0.35, // letterSpacing[10]
  },
  displayMedium: {
    fontFamily: 'Orbitron_900Black',
    fontWeight: '900' as '900',
    fontSize: 32, // 9
    lineHeight: 36,
    letterSpacing: 0.3,
  },
  displaySmall: {
    fontFamily: 'Orbitron_800ExtraBold',
    fontWeight: '800' as '800',
    fontSize: 28, // 8
    lineHeight: 32,
    letterSpacing: 0.3,
  },

  // “Headings” – closest to your Tamagui heading sizes
  headlineLarge: {
    fontFamily: 'Orbitron_800ExtraBold',
    fontWeight: '800' as '800',
    fontSize: 24, // 7
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  headlineMedium: {
    fontFamily: 'Orbitron_700Bold',
    fontWeight: '700' as '700',
    fontSize: 22, // 6
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  headlineSmall: {
    fontFamily: 'Orbitron_700Bold',
    fontWeight: '700' as '700',
    fontSize: 20, // 5
    lineHeight: 24,
    letterSpacing: 0.2,
  },

  // Titles (card titles, section headers, etc.)
  titleLarge: {
    fontFamily: 'Orbitron_600SemiBold',
    fontWeight: '600' as '600',
    fontSize: 18, // 4
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  titleMedium: {
    fontFamily: 'Orbitron_500Medium',
    fontWeight: '500' as '500',
    fontSize: 16, // 3
    lineHeight: 19,
    letterSpacing: 0,
  },
  titleSmall: {
    fontFamily: 'Orbitron_400Regular',
    fontWeight: '400' as '400',
    fontSize: 14, // 2
    lineHeight: 17,
    letterSpacing: 0,
  },

  // Labels (buttons, chips, etc.)
  labelLarge: {
    fontFamily: 'Orbitron_500Medium',
    fontWeight: '500' as '500',
    fontSize: 14, // 2
    lineHeight: 17,
    letterSpacing: 0,
  },
  labelMedium: {
    fontFamily: 'Orbitron_500Medium',
    fontWeight: '500' as '500',
    fontSize: 12, // 1
    lineHeight: 14,
    letterSpacing: 0,
  },
  labelSmall: {
    fontFamily: 'Orbitron_400Regular',
    fontWeight: '400' as '400',
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0,
  },
};

// Start from Paper’s MD3 dark fonts and just override the “heading-like” ones
const fonts = configureFonts({
  config: {
    ...PaperDarkTheme.fonts,
    ...orbitronVariants,
  },
});

// Your Tamagui tokens, inlined so this file is self-contained
const colors = {
  voidBg: '#000020',
  voidBg2: '#000025',
  surface1: '#0F1048',
  surface2: '#0B0B3D',

  border: '#F2F4FF',

  text: '#F2F4FF',
  textMuted: '#C6CBF7',

  brandSolid: '#5A187B',
  brandHover: '#662986',
  brandPress: '#6D318B',
  onBrand: '#F6ECFF',

  disabledContainer: '#f2f4ff1f',
  disabledBorder: '#f2f4ff29',
  disabledContent: '#f2f4ff61',

  accentSolid: '#1C9DA7',
  onAccent: '#031416',

  infoSolid: '#24258A',
  onInfo: '#EAF0FF',
};

export const voidTheme: MD3Theme = {
  ...PaperDarkTheme,
  dark: true,
  roundness: 8,
  fonts,
  colors: {
    ...PaperDarkTheme.colors,

    // Base surfaces
    background: colors.voidBg,
    surface: colors.surface1,
    surfaceVariant: colors.surface2,

    // Primary = “brandSolid” (your Tamagui Button theme maps nicely to this)
    primary: colors.brandSolid,
    onPrimary: colors.onBrand,
    primaryContainer: colors.brandHover,
    onPrimaryContainer: colors.onBrand,
    inversePrimary: colors.brandPress,

    // Secondary = accent
    secondary: colors.accentSolid,
    onSecondary: colors.onAccent,
    secondaryContainer: colors.infoSolid,
    onSecondaryContainer: colors.onInfo,

    // Tertiary = info color (for badges, warnings, etc.)
    tertiary: colors.infoSolid,
    onTertiary: colors.onInfo,

    // Text & borders
    onSurface: colors.text,
    onSurfaceVariant: colors.textMuted,
    outline: colors.border,
    outlineVariant: colors.disabledBorder,

    // Disabled
    surfaceDisabled: colors.disabledContainer,
    onSurfaceDisabled: colors.disabledContent,

    // Inverse (snackbars, bottom sheet, etc.)
    inverseSurface: colors.voidBg2,
    inverseOnSurface: colors.text,
  },
};
