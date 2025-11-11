import { useLayout } from '@react-native-community/hooks';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from 'react-native-paper';

import { flexStyles } from '../theme/globalStyles';

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
              borderRightWidth: triangleSize,
              borderTopColor: colors.onBackground,
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
              borderRightWidth: triangleSize,
              borderTopColor: colors.onBackground,
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
    backgroundColor: 'transparent',
    borderRightColor: 'transparent',
    borderStyle: 'solid',
    height: 0,
    width: 0,
  },
  triangleCornerLeft: {
    transform: [{ rotate: '90deg' }],
  },
});
