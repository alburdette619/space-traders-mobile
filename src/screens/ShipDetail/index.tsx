import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetMyShip } from '../../api/models/fleet/fleet';
import { voidRunnerIcons } from '../../constants/icons';
import { RootNavigatorParams } from '../../navigation/navigationParams';
import { flexStyles } from '../../theme/globalStyles';

export const ShipDetailScreen = () => {
  const { goBack } = useNavigation();
  const { params } = useRoute<RouteProp<RootNavigatorParams, 'ShipDetail'>>();
  const { colors } = useTheme();

  const { data: shipData, isFetching } = useGetMyShip(params.shipId);

  return (
    <SafeAreaView
      style={[flexStyles.flex, { backgroundColor: colors.background }]}
    >
      <View style={[flexStyles.flexRow]}>
        <IconButton
          icon={voidRunnerIcons.backButton}
          onPress={goBack}
          size={32}
        />
        <Text variant="headlineMedium">{shipData?.data.symbol}</Text>
      </View>
      {/* See GPT Chat for design layout of elements */}
    </SafeAreaView>
  );
};
