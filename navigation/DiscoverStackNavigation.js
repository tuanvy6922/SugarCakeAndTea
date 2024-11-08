import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import DiscoverScreen from '../src/screens/DiscoverScreen';
import DetailScreen from '../src/screens/DetailScreen';
import SearchScreen from '../src/screens/SearchScreen';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const DiscoverStackNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DiscoverScreen" 
      component={DiscoverScreen} 
      options={{ headerShown: false }} />

      <Stack.Screen name="DetailScreen" 
      component={DetailScreen} 
      options={{ headerTitle: 'Chi tiết sản phẩm', headerTitleAlign: 'center' }} />

      <Stack.Screen name="SearchScreen" 
      component={SearchScreen} 
      options={{ headerTitle: 'Tìm kiếm', headerTitleAlign: 'center' }} />
    </Stack.Navigator>
  )
}

export default DiscoverStackNavigation

