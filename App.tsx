import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootStack } from './src/navigation/RootNavigator';
import { voidTheme } from './src/theme/voidTheme';
// Import API interceptors to set up globally
import './src/api/interceptors';

const queryClient = new QueryClient();

const App = () => {
  return (
    <GestureHandlerRootView>
      <PaperProvider theme={voidTheme}>
        <SafeAreaProvider>
          <NavigationContainer>
            <QueryClientProvider client={queryClient}>
              <RootStack />
            </QueryClientProvider>
          </NavigationContainer>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

export default App;
