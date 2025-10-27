import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NewAgentScreen } from "../screens/NewAgent";

const Stack = createNativeStackNavigator();

export const RootStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ contentStyle: styles.container, headerShown: false }}
    >
      <Stack.Screen name="NewAgent" component={NewAgentScreen} />
    </Stack.Navigator>
  );
};

const styles = {
  container: { flex: 1, marginVertical: 16 },
};
