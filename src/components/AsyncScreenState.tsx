import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';

import { flexStyles } from '../theme/globalStyles';

interface AsyncScreenStateProps {
  errorMessage?: string;
  isError: boolean;
  onRetry?: () => void;
}

export const AsyncScreenState = ({
  errorMessage = 'Unable to load this screen.',
  isError,
  onRetry,
}: AsyncScreenStateProps) => (
  <View
    style={[
      flexStyles.flex,
      flexStyles.alignCenter,
      flexStyles.justifyCenter,
      styles.content,
    ]}
  >
    {isError ? (
      <>
        <Text variant="bodyLarge">{errorMessage}</Text>
        {onRetry && (
          <Button mode="outlined" onPress={onRetry}>
            Try again
          </Button>
        )}
      </>
    ) : (
      <ActivityIndicator />
    )}
  </View>
);

const styles = StyleSheet.create({
  content: {
    gap: 12,
    padding: 24,
  },
});
