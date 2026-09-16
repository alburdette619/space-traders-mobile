import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
} from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { adaptNavigationTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootStack } from './src/navigation/RootNavigator';
import { voidTheme } from './src/theme/voidTheme';
// Import API interceptors to set up globally
import './src/api/interceptors';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } },
});
const { DarkTheme: adaptedNavigationTheme } = adaptNavigationTheme({
  materialDark: voidTheme,
  reactNavigationDark: NavigationDarkTheme,
});
const navigationTheme = {
  ...adaptedNavigationTheme,
  fonts: NavigationDarkTheme.fonts,
};

const App = () => {
  return (
    <GestureHandlerRootView
      style={[styles.root, { backgroundColor: voidTheme.colors.background }]}
    >
      <PaperProvider theme={voidTheme}>
        <SafeAreaProvider>
          <NavigationContainer theme={navigationTheme}>
            <QueryClientProvider client={queryClient}>
              <RootStack />
            </QueryClientProvider>
          </NavigationContainer>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default App;
