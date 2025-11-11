import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { BottomNavigation, Icon, useTheme } from 'react-native-paper';

import { voidRunnerIcons } from '../constants/icons';
import { ContractsScreen } from '../screens/Contracts';
import { FleetScreen } from '../screens/Fleet';
import { GalaxyMapScreen } from '../screens/GalaxyMap';
import { StatsScreen } from '../screens/Stats';
import { MainAppTabsParams } from './navigationParams';

const tabBarIconSize = 24;

const TabBar = ({
  descriptors,
  insets,
  navigation,
  state,
}: BottomTabBarProps) => (
  <BottomNavigation.Bar
    getLabelText={({ route }) => {
      const { options } = descriptors[route.key];
      return typeof options.tabBarLabel === 'string'
        ? options.tabBarLabel
        : typeof options.title === 'string'
          ? options.title
          : route.name;
    }}
    navigationState={state}
    onTabPress={({ preventDefault, route }) => {
      const evt = navigation.emit({
        canPreventDefault: true,
        target: route.key,
        type: 'tabPress',
      });
      if (evt.defaultPrevented) preventDefault();
      else {
        navigation.dispatch({
          ...CommonActions.navigate(route.name, route.params),
          target: state.key,
        });
      }
    }}
    renderIcon={({ color, focused, route }) =>
      descriptors[route.key].options.tabBarIcon?.({
        color,
        focused,
        size: tabBarIconSize,
      }) ?? null
    }
    safeAreaInsets={insets}
  />
);

const TabsNavigator = createBottomTabNavigator<MainAppTabsParams>();

export const MainAppTabs = () => {
  const theme = useTheme();

  return (
    <TabsNavigator.Navigator
      initialRouteName="Fleet"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <TabsNavigator.Screen
        component={FleetScreen}
        name="Fleet"
        options={{
          tabBarButtonTestID: 'fleet-tab-button',
          tabBarIcon: ({ color, focused, size }) => (
            <Icon
              color={color}
              size={size}
              source={
                focused ? voidRunnerIcons.fleetFocused : voidRunnerIcons.fleet
              }
            />
          ),
          tabBarLabel: 'Fleet',
        }}
      />
      <TabsNavigator.Screen
        component={ContractsScreen}
        name="Contracts"
        options={{
          tabBarButtonTestID: 'contracts-tab-button',
          tabBarIcon: ({ color, focused, size }) => (
            <Icon
              color={color}
              size={size}
              source={
                focused
                  ? voidRunnerIcons.contractsFocused
                  : voidRunnerIcons.contracts
              }
            />
          ),
          tabBarLabel: 'Contracts',
        }}
      />
      <TabsNavigator.Screen
        component={GalaxyMapScreen}
        name="GalaxyMap"
        options={{
          tabBarButtonTestID: 'galaxy-map-tab-button',
          tabBarIcon: ({ color, focused, size }) => (
            <Icon
              color={color}
              size={size}
              source={
                focused
                  ? voidRunnerIcons.galaxyMapFocused
                  : voidRunnerIcons.galaxyMap
              }
            />
          ),
          tabBarLabel: 'Map',
        }}
      />
      <TabsNavigator.Screen
        component={StatsScreen}
        name="Stats"
        options={{
          tabBarButtonTestID: 'stats-tab-button',
          tabBarIcon: ({ color, focused, size }) => (
            <Icon
              color={color}
              size={size}
              source={
                focused ? voidRunnerIcons.statsFocused : voidRunnerIcons.stats
              }
            />
          ),
          tabBarLabel: 'Stats',
        }}
      />
    </TabsNavigator.Navigator>
  );
};
