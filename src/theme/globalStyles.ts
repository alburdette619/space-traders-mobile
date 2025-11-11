import { StyleSheet } from 'react-native';

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
});
