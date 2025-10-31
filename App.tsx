import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStack } from './src/navigation/RootNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { TamaguiProvider } from 'tamagui';
import voidConfig from './tamagui.config';

const queryClient = new QueryClient();

const App = () => {
  return (
    <TamaguiProvider config={voidConfig}>
      <SafeAreaProvider>
        <NavigationContainer>
          <QueryClientProvider client={queryClient}>
            <RootStack />
          </QueryClientProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </TamaguiProvider>
  );
};

export default App;
