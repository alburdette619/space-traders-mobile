import { RouteProp, useRoute } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetMyShip } from '../../api/models/fleet/fleet';
import { AsyncScreenState } from '../../components/AsyncScreenState';
import { RootNavigatorParams } from '../../navigation/navigationParams';
import { flexStyles, miscStyles } from '../../theme/globalStyles';
import { ShipDetailSections } from './components/ShipDetailSections';
import { ShipHeader } from './components/ShipHeader';
import { ShipHud } from './components/ShipHud';

export const ShipDetailScreen = () => {
  const { params } = useRoute<RouteProp<RootNavigatorParams, 'ShipDetail'>>();
  const { colors } = useTheme();

  const { data: shipData, isError, refetch } = useGetMyShip(params.shipId);
  const ship = shipData?.data;

  if (!ship) {
    return (
      <SafeAreaView
        style={[flexStyles.flex, { backgroundColor: colors.background }]}
      >
        <ShipHeader />
        <AsyncScreenState
          errorMessage="Unable to load this ship."
          isError={isError}
          onRetry={() => void refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[flexStyles.flex, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        stickyHeaderIndices={[0]}
      >
        <View
          style={[
            styles.stickyHeaderContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <ShipHeader ship={ship} />
          <ShipHud ship={ship} />
        </View>
        <View style={[flexStyles.flex, miscStyles.screenPadding]}>
          <ShipDetailSections ship={ship} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  stickyHeaderContainer: {
    paddingBottom: 8,
  },
});
