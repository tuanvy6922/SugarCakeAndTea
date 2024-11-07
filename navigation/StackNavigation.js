// src/navigation/AppNavigator.js
import { Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../src/screens/HomeScreen';
import DetailScreen from '../src/screens/DetailScreen'; // Đảm bảo đường dẫn này đúng
import ItemList from '../src/screens/ItemList';
import ProfileScreen from '../src/screens/ProfileScreen';
import SearchScreen from '../src/screens/SearchScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}}/>
      <Stack.Screen 
        name="DetailScreen" 
        component={DetailScreen} 
        options={{ 
          headerTitle: () => (
            <Text style={{ 
              fontSize: 20, fontWeight: 'bold', color: 'black', 
              textAlign: 'center',marginRight: 10 }}>Detail</Text>
          ),
          headerTitleAlign: 'center' // Căn giữa tiêu đề
        }} 
      />
      <Stack.Screen 
        name="ItemList" 
        component={ItemList} 
        options={({route}) => ({ 
          title: route.params.categoryName, 
          headerTitleAlign: 'center', // Căn giữa tiêu đề
          headerTitleStyle: { fontSize: 20, color: 'black' ,
            fontWeight: 'bold',marginRight: 10} 
        })} 
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;