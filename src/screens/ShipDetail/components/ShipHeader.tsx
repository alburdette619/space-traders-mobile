import { camelCase, startCase } from 'lodash';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

import { type Ship } from '@/src/api/models/models-Ship/ship';
import { BackButton } from '@/src/components/BackButton';
import { shipStatusIcons } from '@/src/constants/icons';
import { flexStyles } from '@/src/theme/globalStyles';

interface ShipHeaderProps {
  ship?: Ship;
}

export const ShipHeader = ({ ship }: ShipHeaderProps) => {
  const role = ship ? startCase(ship.registration.role.toLowerCase()) : null;
  const title = ship?.registration.name || ship?.symbol || 'Ship details';

  return (
    <View style={[flexStyles.flexRow, styles.container]}>
      <BackButton />
      <View style={[flexStyles.flex, flexStyles.flexRow, styles.content]}>
        <Text numberOfLines={1} style={styles.title} variant="titleLarge">
          {title}
          {role ? ` • ${role}` : ''}
        </Text>
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
    alignItems: 'center',
    paddingRight: 16,
  },
  content: {
    gap: 8,
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
  },
});
