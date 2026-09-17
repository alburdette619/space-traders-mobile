import { type ReactNode } from 'react';
import {
  type AccessibilityRole,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

interface CompactChipProps {
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  children: ReactNode;
  icon?: string;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
  textColor?: string;
}

export const CompactChip = ({
  accessibilityLabel,
  accessibilityRole = 'text',
  children,
  icon,
  iconColor,
  style,
  textColor,
}: CompactChipProps) => {
  const { colors, roundness } = useTheme();

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessible
      style={[
        styles.container,
        {
          borderColor: colors.outline,
          borderRadius: roundness * 1.5,
        },
        style,
      ]}
    >
      {icon && (
        <Icon color={iconColor ?? colors.primary} size={14} source={icon} />
      )}
      <Text
        style={{ color: textColor ?? colors.onSurface }}
        variant="labelSmall"
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 4,
    height: 24,
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
});
