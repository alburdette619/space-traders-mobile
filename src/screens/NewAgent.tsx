import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetFactions } from '../api/models/factions/factions';
import { useCallback, useRef, useState } from 'react';
import { Faction } from '../api/models/models-Faction/faction';
import { useNavigation } from '@react-navigation/native';
import { setItemAsync } from 'expo-secure-store';
import { agentKey } from '../constants/storageKeys';
import { useRegister } from '../api/models/global/global';
import {
  GestureResponderEvent,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {
  Avatar,
  Button,
  Divider,
  Icon,
  List,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { flexStyles, gapStyles } from '../theme/globalStyles';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import { getFactionImageUrl } from '../constants/urls';

export const NewAgentScreen = () => {
  const { navigate } = useNavigation();
  const { colors } = useTheme();

  const { data: factions, isFetching: isFetchingFactions } = useGetFactions();

  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
  const [guestAgentName, setGuestAgentName] = useState<string>('');
  const [agentToken, setAgentToken] = useState<string>('');

  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleFactionChange = useCallback(
    (value: Faction) => {
      bottomSheetRef.current?.close();
      const faction = factions?.data.find((f) => f.name === value.name) || null;
      setSelectedFaction(faction);
    },
    [factions],
  );

  const renderFactionItem = useCallback(
    ({ item }: { item: Faction }) => {
      const { description, isRecruiting, name, symbol } = item;

      return (
        <List.Item
          description={description}
          descriptionNumberOfLines={10}
          disabled={!isRecruiting}
          onPress={() => handleFactionChange(item)}
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
    },
    [handleFactionChange],
  );

  const handleAgentCreationInfo = useCallback(() => {
    navigate('AgentCreationInstructions');
  }, [navigate]);

  const handleAgentLogin = useCallback(async () => {
    await setItemAsync(agentKey, agentToken);

    // TODO: validate token, fetch agent data, navigate to the main app.
  }, [agentToken]);

  // TODO: handle success/error states
  const handleGuestRegistrationSuccess = useCallback(() => {}, []);

  const handleGuestRegistrationError = useCallback(() => {}, []);

  const { mutate: register } = useRegister({
    mutation: {
      onSuccess: handleGuestRegistrationSuccess,
      onError: handleGuestRegistrationError,
    },
  });

  const handleCreateGuestAgent = useCallback(() => {
    if (!selectedFaction) return;

    register({
      data: {
        symbol: guestAgentName,
        faction: selectedFaction.symbol,
      },
    });
  }, [guestAgentName, register, selectedFaction]);

  const handleChangeFaction = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

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

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <Text variant="displayLarge">{'/// New Agent'}</Text>
          <View style={styles.innerContainer}>
            <View style={gapStyles.gapLarge}>
              <View style={gapStyles.gapMedium}>
                <Pressable
                  style={[
                    gapStyles.gapMedium,
                    styles.agentCreationInstructionsContainer,
                    { borderColor: colors.primary },
                  ]}
                  onPress={handleAgentCreationInfo}
                >
                  <Icon source="help-circle" size={16} />
                  <Text variant="labelSmall">Help</Text>
                </Pressable>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect={false}
                  onChangeText={setAgentToken}
                  placeholder="Enter Agent Token"
                  value={agentToken}
                />
              </View>
              <Button mode="contained" onPress={handleAgentLogin}>
                Login
              </Button>
            </View>
            <View style={[gapStyles.gapMedium, styles.dividerContainer]}>
              <Divider bold style={flexStyles.flex} />
              <Text variant="bodyMedium">OR</Text>
              <Divider bold style={flexStyles.flex} />
            </View>
            <View style={gapStyles.gapSmall}>
              <Text variant="titleMedium">Guest mode</Text>
              <View style={gapStyles.gapLarge}>
                <Text>
                  This mode could experience slowdowns due to resource
                  constraints.
                </Text>
                <TextInput
                  autoCapitalize="words"
                  autoComplete="off"
                  autoCorrect={false}
                  // Max length to match API validation
                  maxLength={14}
                  onChangeText={setGuestAgentName}
                  placeholder="Enter Agent Name"
                  value={guestAgentName}
                />
                <Pressable
                  style={[
                    styles.selectFactionButton,
                    !selectedFaction && styles.selectFactionButtonEmpty,
                    {
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={handleChangeFaction}
                >
                  {selectedFaction ? (
                    <View style={[gapStyles.gapSmall, flexStyles.flexRow]}>
                      <Image
                        source={{
                          uri: getFactionImageUrl(selectedFaction.symbol),
                        }}
                        style={styles.factionImage}
                      />
                      <Text variant="titleSmall">{selectedFaction.name}</Text>
                    </View>
                  ) : (
                    <Text variant="titleSmall">Select Faction</Text>
                  )}
                </Pressable>
                <Button
                  // Min length 3 to match API validation
                  disabled={guestAgentName.length < 3 || !selectedFaction}
                  onPress={handleCreateGuestAgent}
                  mode="contained"
                >
                  Create Agent
                </Button>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        enableOverDrag={false}
        enablePanDownToClose
        snapPoints={['75%']}
        handleStyle={{
          backgroundColor: colors.primary,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
        index={-1}
      >
        <BottomSheetFlatList<Faction>
          alwaysBounceVertical={false}
          bounces={false}
          contentContainerStyle={[
            { backgroundColor: colors.background },
            styles.bottomSheetContent,
          ]}
          data={factions?.data || []}
          ItemSeparatorComponent={<Divider bold />}
          keyExtractor={(item: Faction) => item.name}
          renderItem={renderFactionItem}
        />
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  agentCreationInstructionsContainer: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderRadius: 32,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bottomSheetContent: {
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dividerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  factionImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  innerContainer: {
    flex: 1,
    gap: 24,
    justifyContent: 'center',
  },
  selectFactionButton: {
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    padding: 12,
    height: 48,
  },
  selectFactionButtonEmpty: {
    borderStyle: 'dashed',
    alignItems: 'center',
  },
});
