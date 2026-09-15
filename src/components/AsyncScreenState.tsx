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
  <View style={[flexStyles.flex, styles.content]}>
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
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
});
