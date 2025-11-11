import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Divider, IconButton, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { voidRunnerIcons } from '../constants/icons';
import { spaceTradersLogin } from '../constants/urls';
import { flexStyles, miscStyles } from '../theme/globalStyles';

export const AgentCreationInstructionsScreen = () => {
  const theme = useTheme();
  const { goBack } = useNavigation();

  const handleOpenSpaceTradersSignup = useCallback(() => {
    Linking.openURL(spaceTradersLogin);
  }, []);

  return (
    <View
      style={[flexStyles.flex, { backgroundColor: theme.colors.background }]}
    >
      <SafeAreaView style={flexStyles.flex}>
        <IconButton
          icon={voidRunnerIcons.backButton}
          onPress={goBack}
          size={32}
        />
        <ScrollView
          alwaysBounceVertical={false}
          contentContainerStyle={styles.container}
          style={flexStyles.flex}
        >
          <Text variant="headlineLarge">
            {'/// Agent Creation Instructions'}
          </Text>
          <List.Accordion
            left={(props) => (
              <List.Icon
                {...props}
                color={theme.colors.onPrimaryContainer}
                icon="help-circle"
              />
            )}
            style={[
              {
                backgroundColor: theme.colors.primaryContainer,
              },
              styles.whyAccordion,
            ]}
            title="Why?"
            titleStyle={{ color: theme.colors.onPrimaryContainer }}
          >
            <Text style={styles.whyText} variant="bodySmall">
              Guest agents all share the same rate limit, so heavy use by others
              can slow you down. Creating your own agent gives you a dedicated
              rate limit and smoother performance.
            </Text>
            <Divider bold />
          </List.Accordion>
          <Text style={styles.stepTitles} variant="titleMedium">
            Step 1: Create an account
          </Text>
          <Text style={styles.stepBody} variant="bodyMedium">
            <Text>Visit&nbsp;</Text>
            <Text
              onPress={handleOpenSpaceTradersSignup}
              style={[miscStyles.link, { color: theme.colors.inversePrimary }]}
            >
              {spaceTradersLogin}
            </Text>
            <Text>
              &nbsp;and login or provide an email to sign up for a new account.
            </Text>
          </Text>
          <Divider bold style={styles.divider} />
          <Text variant="titleMedium">Step 2: Create your agent</Text>
          <Text style={styles.stepBody} variant="bodyMedium">
            Navigate to the &quot;Agents&quot; tab in the Space Traders web
            application and create a new agent. Choose your agent name and
            faction, then submit the form.
          </Text>
          <Divider bold style={styles.divider} />
          <Text variant="titleMedium">Step 3: Retrieve your agent token</Text>
          <Text style={styles.stepBody} variant="bodyMedium">
            After creating your agent, it will be listed on the &quot;Current
            Agents&quot; on the same page. Click the &quot;Generate Token&quot;
            button to reveal your agent token.
          </Text>
          <Divider bold style={styles.divider} />
          <Text variant="titleMedium">
            Step 4: Enter your agent token in the app
          </Text>
          <Text style={styles.stepBody} variant="bodyMedium">
            Copy the agent token from the web application and paste it into the
            agent token field on the previous screen to complete the setup
            process. This gives the app access to your agent&apos;s data, but
            you will not run into the limitations of a guest account.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  divider: {
    marginVertical: 16,
  },
  stepBody: {
    marginTop: 8,
  },
  stepTitles: {
    marginTop: 8,
  },
  whyAccordion: {
    borderRadius: 32,
    marginVertical: 16,
    paddingVertical: 0,
  },
  whyText: { marginBottom: 8, marginHorizontal: 8, paddingLeft: 0 },
});
