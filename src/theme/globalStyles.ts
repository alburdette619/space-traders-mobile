import { StyleSheet } from 'react-native';

export const gapStyles = StyleSheet.create({
  gapSmall: {
    gap: 4,
  },
  gapMedium: {
    gap: 8,
  },
  gapLarge: {
    gap: 16,
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
