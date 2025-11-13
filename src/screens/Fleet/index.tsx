import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetMyShips } from '@/src/api/models/fleet/fleet';

import { flexStyles } from '../../theme/globalStyles';
import { AgentHeader } from './components/AgentHeader';

export const FleetScreen = () => {
  const { colors } = useTheme();

  const { data: ships, isFetching: isFetchingShips } = useGetMyShips();

  const renderHeader = useCallback(() => {
    return <AgentHeader />;
  }, []);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[flexStyles.flex, { backgroundColor: colors.secondaryContainer }]}
    >
      <FlatList
        bounces={false}
        data={ships?.data || []}
        ListHeaderComponent={renderHeader}
        renderItem={() => null}
        stickyHeaderIndices={[0]}
        style={{
          backgroundColor: colors.background,
          flexGrow: 1,
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});
