import { StyleSheet, View, ViewProps } from 'react-native';
import { flexStyles } from '../theme/globalStyles';
import { useTheme } from 'react-native-paper';
import { useLayout } from '@react-native-community/hooks';

export interface PolygonalViewProps
  extends Omit<ViewProps, 'height' | 'style' | 'width'> {
  polygonSides?: ('left' | 'right')[];
}

export const PolygonalView = ({
  children,
  polygonSides = ['right'],
  ...viewProps
}: PolygonalViewProps) => {
  const { colors } = useTheme();

  const { onLayout: onContentLayout, ...contentLayout } = useLayout();
  const triangleSize = contentLayout.height || 0;

  return (
    <View {...viewProps} style={[flexStyles.flexRow]}>
      {polygonSides.includes('left') && (
        <View
          style={[
            {
              borderTopColor: colors.onBackground,
              borderRightWidth: triangleSize,
              borderTopWidth: triangleSize,
            },
            styles.triangleCorner,
            styles.triangleCornerLeft,
          ]}
        />
      )}
      <View
        onLayout={onContentLayout}
        style={[
          { backgroundColor: colors.onBackground },
          styles.contentContainer,
        ]}
      >
        {children}
      </View>
      {polygonSides.includes('right') && (
        <View
          style={[
            {
              borderTopColor: colors.onBackground,
              borderRightWidth: triangleSize,
              borderTopWidth: triangleSize,
            },
            styles.triangleCorner,
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 12,
  },
  triangleCorner: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightColor: 'transparent',
  },
  triangleCornerLeft: {
    transform: [{ rotate: '90deg' }],
  },
});
