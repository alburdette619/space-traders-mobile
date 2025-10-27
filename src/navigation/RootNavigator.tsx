import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { CharacterList } from '../screens/CharacterList';

const Stack = createNativeStackNavigator();

export const RootStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ contentStyle: styles.container, headerShown: false }}
    >
      {/* <Stack.Screen name="Home" component={CharacterList} /> */}
    </Stack.Navigator>
  );
};

const styles = {
  container: { flex: 1, marginVertical: 16 },
};
