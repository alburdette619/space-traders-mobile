import { RouteProp, useRoute } from '@react-navigation/native';
import { camelCase, startCase } from 'lodash';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Icon, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/src/components/BackButton';

import { useGetMyShip } from '../../api/models/fleet/fleet';
import { shipStatusIcons } from '../../constants/icons';
import { RootNavigatorParams } from '../../navigation/navigationParams';
import { flexStyles } from '../../theme/globalStyles';
import { ShipHud } from './components/ShipHud';

export const ShipDetailScreen = () => {
  const { params } = useRoute<RouteProp<RootNavigatorParams, 'ShipDetail'>>();
  const { colors } = useTheme();

  const { data: shipData, isFetching } = useGetMyShip(params.shipId);
  const ship = shipData?.data;

  return isFetching || !ship ? null : (
    <SafeAreaView
      style={[flexStyles.flex, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        // Stick the HUD header
        stickyHeaderIndices={[1]}
      >
        <View style={[flexStyles.flexRow, styles.headerContainer]}>
          <BackButton />
          <View
            style={[
              flexStyles.flex,
              flexStyles.flexRow,
              styles.headerInnerContainer,
            ]}
          >
            <View style={[flexStyles.flexRow, styles.headerTitleContainer]}>
              <Text variant="titleLarge">
                {ship?.registration.name || ship?.symbol}&nbsp;•&nbsp;
                {startCase(ship.registration?.role.toLowerCase())}
              </Text>
            </View>
            <Icon
              size={28}
              source={
                shipStatusIcons[
                  camelCase(ship.nav.status) as keyof typeof shipStatusIcons
                ]
              }
            />
          </View>
        </View>
        <ShipHud ship={ship} />
        <View style={styles.contentContainer}></View>
        {/* See GPT Chat for design layout of elements */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
  },
  headerContainer: {
    alignItems: 'center',
    paddingRight: 16,
  },
  headerInnerContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleContainer: {
    alignItems: 'flex-end',
  },
});
