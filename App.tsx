import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStack } from './src/navigation/RootNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { TamaguiProvider } from 'tamagui';
import voidConfig from './tamagui.config';
import { ToastProvider, ToastViewport } from '@tamagui/toast';

const queryClient = new QueryClient();

const App = () => {
  return (
    <TamaguiProvider config={voidConfig}>
      <ToastProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <QueryClientProvider client={queryClient}>
              <RootStack />
            </QueryClientProvider>
          </NavigationContainer>
          <ToastViewport />
        </SafeAreaProvider>
      </ToastProvider>
    </TamaguiProvider>
  );
};

export default App;
