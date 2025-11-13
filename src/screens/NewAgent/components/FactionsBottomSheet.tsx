import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Divider, useTheme } from 'react-native-paper';

import { Faction } from '@/src/api/models/models-Faction/faction';

import { FactionListItem } from './FactionListItem';

interface FactionsBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  factions?: Faction[];
  setSelectedFaction: (faction: Faction | null) => void;
}

export const FactionsBottomSheet = ({
  bottomSheetRef,
  factions,
  setSelectedFaction,
}: FactionsBottomSheetProps) => {
  const { colors } = useTheme();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleFactionChange = useCallback(
    (faction: Faction) => {
      setSelectedFaction(faction);

      // Delay closing to ensure state updates properly
      setTimeout(() => {
        bottomSheetRef.current?.close();
      }, 100);
    },
    [bottomSheetRef, setSelectedFaction],
  );

  const renderFactionItem = useCallback(
    ({ item }: { item: Faction }) => (
      <FactionListItem
        faction={item}
        handleFactionChange={handleFactionChange}
      />
    ),
    [handleFactionChange],
  );

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background }}
      enableDynamicSizing={false}
      enableOverDrag={false}
      enablePanDownToClose
      handleStyle={{
        backgroundColor: colors.primary,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}
      index={-1}
      ref={bottomSheetRef}
      snapPoints={['75%']}
    >
      <BottomSheetFlatList<Faction>
        alwaysBounceVertical={false}
        bounces={false}
        contentContainerStyle={[
          { backgroundColor: colors.background },
          styles.bottomSheetContent,
        ]}
        data={factions || []}
        ItemSeparatorComponent={<Divider bold />}
        keyExtractor={(item: Faction) => item.name}
        renderItem={renderFactionItem}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetContent: {
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
});
