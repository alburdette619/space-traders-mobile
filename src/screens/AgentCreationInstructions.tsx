import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

export const AgentCreationInstructionsScreen = () => {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    ></View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
