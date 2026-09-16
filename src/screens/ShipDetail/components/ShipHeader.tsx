import { camelCase, startCase } from 'lodash';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

import { type Ship } from '@/src/api/models/models-Ship/ship';
import { BackButton } from '@/src/components/BackButton';
import { shipStatusIcons } from '@/src/constants/icons';
import { flexStyles, gapStyles } from '@/src/theme/globalStyles';

interface ShipHeaderProps {
  ship?: Ship;
}

export const ShipHeader = ({ ship }: ShipHeaderProps) => {
  const role = ship ? startCase(ship.registration.role.toLowerCase()) : null;
  const title = ship?.registration.name || ship?.symbol || 'Ship details';

  return (
    <View style={[flexStyles.flexRow, styles.container]}>
      <BackButton />
      <View
        style={[
          flexStyles.flex,
          flexStyles.flexRow,
          flexStyles.justifyBetween,
          gapStyles.gapMedium,
        ]}
      >
        <View style={styles.registration}>
          <Text numberOfLines={1} variant="titleLarge">
            {title}
          </Text>
          {ship && (
            <Text numberOfLines={1} variant="labelSmall">
              {ship.registration.factionSymbol} • {role}
            </Text>
          )}
        </View>
        {ship && (
          <Icon
            size={28}
            source={
              shipStatusIcons[
                camelCase(ship.nav.status) as keyof typeof shipStatusIcons
              ]
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingRight: 16,
  },
  registration: {
    flex: 1,
  },
});
