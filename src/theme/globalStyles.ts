import { Platform, StyleSheet } from 'react-native';

import { baseColors } from './voidTheme';

export const gapStyles = StyleSheet.create({
  gapLarge: {
    gap: 16,
  },
  gapMedium: {
    gap: 8,
  },
  gapSmall: {
    gap: 4,
  },
  gapXLarge: {
    gap: 24,
  },
  gapXXLarge: {
    gap: 32,
  },
});

export const flexStyles = StyleSheet.create({
  flex: { flex: 1 },
  flexRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export const miscStyles = StyleSheet.create({
  link: {
    textDecorationLine: 'underline',
  },
  shadow: {
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: baseColors.text,
          shadowOffset: { height: 4, width: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
        }
      : {
          // Android native shadow—feel free to bump higher than MD3's 0–5
          elevation: 12,
        }),
  },
});

export const roundStyleObject = (size: number) => ({
  borderRadius: size / 2,
  height: size,
  width: size,
});
