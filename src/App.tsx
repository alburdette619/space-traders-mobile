import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStack } from './navigation/RootNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

export const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <QueryClientProvider client={queryClient}>
          <RootStack />
        </QueryClientProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
