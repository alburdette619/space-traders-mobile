import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NewAgentScreen } from '../screens/NewAgent';
import { BrandSplashScreen } from '../screens/BrandSplash';
import { RootNavigatorParams } from './navigationParams';
import { AgentCreationInstructionsScreen } from '../screens/AgentCreationInstructions';

const Stack = createNativeStackNavigator<RootNavigatorParams>();

export const RootStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ contentStyle: [styles.container], headerShown: false }}
      initialRouteName="BrandSplash"
    >
      <Stack.Screen
        name="AgentCreationInstructions"
        component={AgentCreationInstructionsScreen}
      />
      <Stack.Screen name="BrandSplash" component={BrandSplashScreen} />
      <Stack.Screen name="NewAgent" component={NewAgentScreen} />
    </Stack.Navigator>
  );
};

const styles = {
  container: { flex: 1 },
};
