import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NewAgentScreen } from '../screens/NewAgent';
import { BrandSplashScreen } from '../screens/BrandSplash';

const Stack = createNativeStackNavigator();

export const RootStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ contentStyle: styles.container, headerShown: false }}
      initialRouteName="BrandSplash"
    >
      <Stack.Screen name="BrandSplash" component={BrandSplashScreen} />
      <Stack.Screen name="NewAgent" component={NewAgentScreen} />
    </Stack.Navigator>
  );
};

const styles = {
  container: { flex: 1, marginVertical: 16 },
};
