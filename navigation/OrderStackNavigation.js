import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import OrderDetailScreen from '../src/screens/OrderDetailScreen';
import OrderHistoryScreen from '../src/screens/OrderHistoryScreen';

const Stack = createNativeStackNavigator();

const OrderStackNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#D17842',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="OrderHistory" 
        component={OrderHistoryScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen 
        name="OrderDetail" 
        component={OrderDetailScreen}
        options={{ 
          headerTitle: 'Chi tiết đơn hàng',
          headerTitleAlign: 'center', 
          headerStyle: {
            backgroundColor: '#ffffff'
          },
          headerTintColor: '#000000',
          headerTitleStyle: {
            color: '#000000',
            
          }
        }} 
      />
    </Stack.Navigator>
  );
};

export default OrderStackNavigation;

