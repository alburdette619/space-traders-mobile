import { Text, useTheme } from 'react-native-paper';
import { PolygonalView, PolygonalViewProps } from './PolygonalView';
import { StyleSheet, View } from 'react-native';

interface CountdownContainerProps extends Omit<PolygonalViewProps, 'children'> {
  countdownString: string;
}

const countdownPrefix = 'Next server reset in: ';
const maxLengthString = `${countdownPrefix}00:00:00`;

export const CountdownContainer = ({
  countdownString,
  ...polygonalViewProps
}: CountdownContainerProps) => {
  const { colors } = useTheme();

  return (
    <PolygonalView {...polygonalViewProps}>
      <View style={styles.maxLengthText}>
        <Text style={styles.textSpacing}>{maxLengthString}</Text>
      </View>
      <Text
        style={[
          { color: colors.background },
          StyleSheet.absoluteFill,
          styles.textSpacing,
        ]}
      >
        {`${countdownPrefix}${countdownString}`}
      </Text>
    </PolygonalView>
  );
};

const styles = StyleSheet.create({
  maxLengthText: { opacity: 0 },
  textSpacing: { marginLeft: 12 },
});
