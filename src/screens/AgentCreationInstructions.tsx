import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Divider, IconButton, List, Text, useTheme } from 'react-native-paper';
import { flexStyles, miscStyles } from '../theme/globalStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback } from 'react';
import { spaceTradersLogin } from '../constants/urls';
import { useNavigation } from '@react-navigation/native';

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
        <IconButton icon="chevron-left" size={32} onPress={goBack} />
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
            <Text variant="bodySmall" style={styles.whyText}>
              Guest agents all share the same rate limit, so heavy use by others
              can slow you down. Creating your own agent gives you a dedicated
              rate limit and smoother performance.
            </Text>
            <Divider bold />
          </List.Accordion>
          <Text variant="titleMedium" style={styles.stepTitles}>
            Step 1: Create an account
          </Text>
          <Text variant="bodyMedium" style={styles.stepBody}>
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
          <Text variant="bodyMedium" style={styles.stepBody}>
            Navigate to the &quot;Agents&quot; tab in the Space Traders web
            application and create a new agent. Choose your agent name and
            faction, then submit the form.
          </Text>
          <Divider bold style={styles.divider} />
          <Text variant="titleMedium">Step 3: Retrieve your agent token</Text>
          <Text variant="bodyMedium" style={styles.stepBody}>
            After creating your agent, it will be listed on the &quot;Current
            Agents&quot; on the same page. Click the &quot;Generate Token&quot;
            button to reveal your agent token.
          </Text>
          <Divider bold style={styles.divider} />
          <Text variant="titleMedium">
            Step 4: Enter your agent token in the app
          </Text>
          <Text variant="bodyMedium" style={styles.stepBody}>
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
    paddingHorizontal: 24,
    paddingBottom: 32,
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
    paddingVertical: 0,
    marginVertical: 16,
  },
  whyText: { paddingLeft: 0, marginHorizontal: 8, marginBottom: 8 },
});
