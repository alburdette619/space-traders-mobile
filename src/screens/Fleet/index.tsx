import { useCallback } from 'react';
import { ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGetMyShips } from '@/src/api/models/fleet/fleet';
import { Ship } from '@/src/api/models/models-Ship/ship';

import { flexStyles } from '../../theme/globalStyles';
import { AgentHeader } from './components/AgentHeader';
import { ShipItem } from './components/ShipItem';

export const FleetScreen = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const { data: ships, isFetching: isFetchingShips } = useGetMyShips();

  const renderHeader = useCallback(() => {
    return <AgentHeader />;
  }, []);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<Ship>) => {
    return <ShipItem ship={item} />;
  }, []);

  return (
    <View
      style={[
        flexStyles.flex,
        {
          backgroundColor: colors.secondaryContainer,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingTop: insets.top,
        },
      ]}
    >
      <FlatList
        bounces={false}
        contentContainerStyle={styles.listContainer}
        data={ships?.data || []}
        keyExtractor={(item) => item.symbol}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        stickyHeaderIndices={[0]}
        style={{
          backgroundColor: colors.background,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
  },
});
