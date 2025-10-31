import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Heading,
  Input,
  Select as TamaguiSelect,
  SizableText,
  Text,
  View,
  XStack,
  Button,
  Separator,
  getToken,
  getTokens,
} from 'tamagui';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetFactions } from '../api/models/factions/factions';
import { useCallback, useState } from 'react';
import { Faction } from '../api/models/models-Faction/faction';
import { Select } from '../components/Select';
import { useNavigation } from '@react-navigation/native';
import { setItemAsync } from 'expo-secure-store';
import { agentKey } from '../constants/storageKeys';
import { useRegister } from '../api/models/global/global';

export const NewAgentScreen = () => {
  const { navigate } = useNavigation();

  const { data: factions, isFetching: isFetchingFactions } = useGetFactions();

  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
  const [guestAgentName, setGuestAgentName] = useState<string>('');
  const [agentToken, setAgentToken] = useState<string>('');

  const renderFactionItem = useCallback(
    (faction: { symbol: string; name: string }, index: number) => (
      <TamaguiSelect.Item
        index={index}
        key={faction.symbol}
        value={faction.name}
      >
        <TamaguiSelect.ItemText size="$6">
          {faction.name}
        </TamaguiSelect.ItemText>
      </TamaguiSelect.Item>
    ),
    [],
  );

  const handleFactionChange = useCallback(
    (value: string) => {
      const faction = factions?.data.find((f) => f.name === value) || null;
      setSelectedFaction(faction);
    },
    [factions],
  );

  const handleAgentCreationInfo = useCallback(() => {
    navigate('AgentCreationInstructions');
  }, [navigate]);

  const handleAgentLogin = useCallback(async () => {
    await setItemAsync(agentKey, agentToken);

    // TODO: validate token, fetch agent data, navigate to the main app.
  }, []);

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

  return (
    <View flex={1} bg="$background" px="$4">
      <SafeAreaView style={{ flex: 1 }}>
        <Heading>{'/// New Agent'}</Heading>
        <View flex={1} gap="$6" justifyContent="center">
          <View gap="$4">
            <View gap="$2">
              <View
                alignItems="center"
                alignSelf="flex-end"
                flexDirection="row"
                gap="$2"
                onPress={handleAgentCreationInfo}
              >
                <MaterialIcons
                  color={getTokens().color.text.val}
                  name="info"
                  size={16}
                />
                <SizableText size="$2">What is this?</SizableText>
              </View>
              <Input
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                onChangeText={setAgentToken}
                placeholder="Enter Agent Token"
                value={agentToken}
              />
            </View>
            <Button onPress={handleAgentLogin}>Login</Button>
          </View>
          <XStack alignItems="center" gap="$2">
            <Separator />
            <SizableText size="$4">OR</SizableText>
            <Separator />
          </XStack>
          <View gap="$1">
            <SizableText size="$8">Guest mode</SizableText>
            <View gap="$4">
              <Text>
                This mode could experience slowdowns due to resource
                constraints.
              </Text>
              <Input
                autoCapitalize="words"
                autoComplete="off"
                autoCorrect={false}
                // Max length to match API validation
                maxLength={14}
                onChangeText={setGuestAgentName}
                placeholder="Enter Agent Name"
                value={guestAgentName}
              />
              <Select
                disabled={isFetchingFactions}
                items={factions?.data.map(renderFactionItem)}
                onValueChange={handleFactionChange}
                value={selectedFaction?.name || ''}
              />
              <Button
                backgroundColor="$brandSolid"
                // Min length 3 to match API validation
                disabled={guestAgentName.length < 3 || !selectedFaction}
                onPress={handleCreateGuestAgent}
              >
                Create Agent
              </Button>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};
