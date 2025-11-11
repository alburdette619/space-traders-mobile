import BottomSheet from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { deleteItemAsync, setItemAsync } from 'expo-secure-store';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import {
  Button,
  Divider,
  Icon,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetMyAgent } from '@/src/api/models/agents/agents';
import { Register201 } from '@/src/api/models/register201';
import { CountdownContainer } from '@/src/components/CountdownContainer';
import { voidRunnerIcons } from '@/src/constants/icons';
import { useServerResetCountdown } from '@/src/hooks/useServerResetCountdown';
import { useUserStore } from '@/src/stores/userStore';
import { SpaceTradersErrorResponse } from '@/src/types/spaceTraders';

import { useGetFactions } from '../../api/models/factions/factions';
import { useRegister } from '../../api/models/global/global';
import { Faction } from '../../api/models/models-Faction/faction';
import { agentKey } from '../../constants/storageKeys';
import { getFactionImageUrl } from '../../constants/urls';
import { flexStyles, gapStyles } from '../../theme/globalStyles';
import { FactionsBottomSheet } from './components/FactionsBottomSheet';

export const NewAgentScreen = () => {
  const { navigate } = useNavigation();
  const { colors } = useTheme();

  const { setIsAuthenticated } = useUserStore();

  const { data: factions, isFetching: isFetchingFactions } = useGetFactions();
  const { humanReadableResetDate } = useServerResetCountdown();

  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
  const [guestAgentName, setGuestAgentName] = useState<string>('');
  const [agentToken, setAgentToken] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [shouldAttemptAgentLogin, setShouldAttemptAgentLogin] =
    useState<boolean>(false);

  // Fetch user-supplied agent data when attempting login with token for validation.
  const {
    data: userSuppliedAgent,
    error: errorUserSuppliedAgent,
    isError: isErrorUserSuppliedAgent,
    isFetching: isFetchingUserSuppliedAgent,
  } = useGetMyAgent({
    query: {
      enabled: shouldAttemptAgentLogin && !!agentToken,
    },
  });

  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleAuthSuccess = useCallback(() => {
    // This will navigate to MainAppTabs via RootStack
    setIsAuthenticated(true);
  }, [setIsAuthenticated]);

  // Handle side effects of user-supplied agent fetch.
  useEffect(() => {
    const deleteTokenIfInvalid = async () => {
      await deleteItemAsync(agentKey);
    };

    if (isFetchingUserSuppliedAgent) return;

    if (userSuppliedAgent) {
      handleAuthSuccess();
    } else if (isErrorUserSuppliedAgent && errorUserSuppliedAgent) {
      // Unset invalid token.
      deleteTokenIfInvalid();
      setErrorMessage(errorUserSuppliedAgent.message);
    }
  }, [
    agentToken,
    errorUserSuppliedAgent,
    handleAuthSuccess,
    isErrorUserSuppliedAgent,
    isFetchingUserSuppliedAgent,
    userSuppliedAgent,
  ]);

  const handleAgentCreationInfo = useCallback(() => {
    navigate('AgentCreationInstructions');
  }, [navigate]);

  const handleAgentLogin = useCallback(async () => {
    // Store the token and attempt to fetch agent data.
    // The token will be picked up and used by the api client when set.
    await setItemAsync(agentKey, agentToken);
    setShouldAttemptAgentLogin(true);
  }, [agentToken]);

  const handleGuestRegistrationSuccess = useCallback(
    async (result: Register201 | undefined) => {
      const data = result?.data;

      if (!data) {
        // We don't expect this to happen, but just in case.
        setErrorMessage('Registration failed. Please try again.');
        return;
      }

      // TODO: There's initial data for agent, ships, the first contract, etc.
      // We should use this as initial data for the specific initial queries after auth.
      await setItemAsync(agentKey, data.token);
      handleAuthSuccess();
    },
    [handleAuthSuccess],
  );

  const handleGuestRegistrationError = useCallback(
    ({ error }: SpaceTradersErrorResponse) => {
      setErrorMessage(error.message);
    },
    [],
  );

  const { isPending: isRegisteringAgent, mutate: register } = useRegister({
    mutation: {
      onError: handleGuestRegistrationError,
      onSuccess: handleGuestRegistrationSuccess,
    },
  });

  const handleCreateGuestAgent = useCallback(() => {
    if (!selectedFaction) return;

    register({
      data: {
        faction: selectedFaction.symbol,
        symbol: guestAgentName,
      },
    });
  }, [guestAgentName, register, selectedFaction]);

  const handleChangeFaction = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleAgentNameChange = useCallback((text: string) => {
    const upperCasedText = text.toUpperCase();
    const agentNamePattern = /^[A-Z0-9_]+$/;
    if (upperCasedText === '' || agentNamePattern.test(upperCasedText)) {
      setGuestAgentName(upperCasedText);
    }
  }, []);

  const handleSnackbarDismiss = useCallback(() => {
    setErrorMessage('');
  }, []);

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={flexStyles.flex}>
          <View style={gapStyles.gapSmall}>
            <Text style={styles.containerPadding} variant="displayLarge">
              {'/// New Agent'}
            </Text>
            <CountdownContainer countdownString={humanReadableResetDate} />
          </View>
          <View style={[flexStyles.flex, styles.containerPadding]}>
            <View style={styles.innerContainer}>
              <View style={gapStyles.gapLarge}>
                <View style={gapStyles.gapMedium}>
                  <Pressable
                    onPress={handleAgentCreationInfo}
                    style={[
                      gapStyles.gapMedium,
                      styles.agentCreationInstructionsContainer,
                      { borderColor: colors.primary },
                    ]}
                  >
                    <Icon size={16} source={voidRunnerIcons.help} />
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
                <Button
                  loading={isFetchingUserSuppliedAgent}
                  mode="contained"
                  onPress={handleAgentLogin}
                >
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
                    onChangeText={handleAgentNameChange}
                    placeholder="Enter Agent Name"
                    value={guestAgentName}
                  />
                  <Pressable
                    disabled={isFetchingFactions}
                    onPress={handleChangeFaction}
                    style={[
                      styles.selectFactionButton,
                      !selectedFaction && styles.selectFactionButtonEmpty,
                      {
                        borderColor: colors.primary,
                      },
                    ]}
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
                    loading={isRegisteringAgent}
                    mode="contained"
                    onPress={handleCreateGuestAgent}
                  >
                    Create Agent
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
      <FactionsBottomSheet
        bottomSheetRef={bottomSheetRef}
        factions={factions?.data}
        setSelectedFaction={setSelectedFaction}
      />
      <Snackbar
        duration={3000}
        onDismiss={handleSnackbarDismiss}
        visible={!!errorMessage}
      >
        {errorMessage}
      </Snackbar>
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
  container: {
    flex: 1,
  },
  containerPadding: {
    paddingHorizontal: 16,
  },
  dividerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  factionImage: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  innerContainer: {
    flex: 1,
    gap: 24,
    justifyContent: 'center',
  },
  selectFactionButton: {
    borderRadius: 4,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    padding: 12,
  },
  selectFactionButtonEmpty: {
    alignItems: 'center',
    borderStyle: 'dashed',
  },
});
