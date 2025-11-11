import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AgentCreationInstructionsScreen } from '../screens/AgentCreationInstructions';
import { BrandSplashScreen } from '../screens/BrandSplash';
import { NewAgentScreen } from '../screens/NewAgent';
import { useUserStore } from '../stores/userStore';
import { MainAppTabs } from './MainAppTabs';
import { RootNavigatorParams } from './navigationParams';

const Stack = createNativeStackNavigator<RootNavigatorParams>();

export const RootStack = () => {
  const { isAuthenticated } = useUserStore();

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'MainAppTabs' : 'BrandSplash'}
      screenOptions={{ contentStyle: [styles.container], headerShown: false }}
    >
      {isAuthenticated ? (
        <Stack.Group>
          <Stack.Screen component={MainAppTabs} name="MainAppTabs" />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen
            component={AgentCreationInstructionsScreen}
            name="AgentCreationInstructions"
          />
          <Stack.Screen component={BrandSplashScreen} name="BrandSplash" />
          <Stack.Screen component={NewAgentScreen} name="NewAgent" />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

const styles = {
  container: { flex: 1 },
};
