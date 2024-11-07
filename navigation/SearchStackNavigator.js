// src/navigation/SearchStackNavigator.js
import { createStackNavigator } from '@react-navigation/stack';
import SearchScreen from '../src/screens/SearchScreen';
import DetailScreen from '../src/screens/DetailScreen';

const Stack = createStackNavigator();

const SearchStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
      <Stack.Screen 
        name="DetailScreen" 
        component={DetailScreen} 
        options={{ 
          headerTitle: 'Detail',
          headerTitleAlign: 'center'
        }} 
      />
    </Stack.Navigator>
  );
};

export default SearchStackNavigator;