import { Text, type TextProps } from 'react-native-paper';

type BrandedTitleProps = Omit<TextProps<never>, 'children'> & {
  title: string;
};

export const BrandedTitle = ({
  accessibilityLabel,
  accessibilityRole,
  title,
  ...textProps
}: BrandedTitleProps) => (
  <Text
    accessibilityLabel={accessibilityLabel ?? title}
    accessibilityRole={accessibilityRole ?? 'header'}
    {...textProps}
  >
    {`/// ${title}`}
  </Text>
);
