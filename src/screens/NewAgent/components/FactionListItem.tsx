import { Faction } from '@/src/api/models/models-Faction/faction';
import { getFactionImageUrl } from '@/src/constants/urls';
import { flexStyles, gapStyles } from '@/src/theme/globalStyles';
import { StyleSheet, View } from 'react-native';
import { Chip, List, Text } from 'react-native-paper';

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
              <Chip key={trait.symbol} mode="outlined" compact>
                <Text variant="labelSmall">{trait.name}</Text>
              </Chip>
            ))}
          </View>
          <Text {...props}>{description}</Text>
        </View>
      )}
      descriptionNumberOfLines={10}
      disabled={!isRecruiting}
      onPress={() => handleFactionChange(faction)}
      title={name}
      left={(props) => (
        <List.Image
          {...props}
          source={{ uri: getFactionImageUrl(symbol) }}
          style={styles.factionImage}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  factionImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
