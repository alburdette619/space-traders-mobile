import { StyleSheet, View } from 'react-native';
import { Chip, List, Text } from 'react-native-paper';

import { Faction } from '@/src/api/models/models-Faction/faction';
import { getFactionImageUrl } from '@/src/constants/urls';
import {
  flexStyles,
  gapStyles,
  roundStyleObject,
} from '@/src/theme/globalStyles';

interface FactionListItemProps {
  faction: Faction;
  handleFactionChange: (faction: Faction) => void;
}

export const FactionListItem = ({
  faction,
  handleFactionChange,
}: FactionListItemProps) => {
  const { description, isRecruiting, name, symbol, traits } = faction;

  const sortedTraits = traits.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <List.Item
      description={(props) => (
        <View>
          <View
            style={[
              flexStyles.flexRow,
              gapStyles.gapSmall,
              { flexWrap: 'wrap', marginVertical: 4 },
            ]}
          >
            {sortedTraits.map((trait) => (
              <Chip compact key={trait.symbol} mode="outlined">
                <Text variant="labelSmall">{trait.name}</Text>
              </Chip>
            ))}
          </View>
          <Text {...props}>{description}</Text>
        </View>
      )}
      descriptionNumberOfLines={10}
      disabled={!isRecruiting}
      left={(props) => (
        <List.Image
          {...props}
          source={{ uri: getFactionImageUrl(symbol) }}
          style={styles.factionImage}
        />
      )}
      onPress={() => handleFactionChange(faction)}
      title={name}
    />
  );
};

const styles = StyleSheet.create({
  factionImage: {
    ...roundStyleObject(40),
  },
});
