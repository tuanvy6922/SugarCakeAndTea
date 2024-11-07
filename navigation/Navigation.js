// src/navigation/Navigation.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigation from './TabNavigation'; // Import TabNavigation
import LoginScreen from '../src/screens/LoginScreen';
import RegisterScreen from '../src/screens/RegisterScreen';
import IntroScreen from '../src/screens/IntroScreen';
import ForgotPassword from '../src/screens/ForgotPassword';
import OrderHistoryScreen from '../src/screens/OrderHistoryScreen';
import ItemList from '../src/screens/ItemList';
import PaymentScreen from '../src/screens/PaymentScreen';
import CartScreen from '../src/screens/CartScreen';
import StoreLocationScreen from '../src/screens/StoreLocationScreen';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Intro" component={IntroScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home-nav" component={TabNavigation} options={{ headerShown: false }} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ItemList" component={ItemList} options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{
          headerTitle: "Quên mật khẩu"
        }} />
        <Stack.Screen name="StoreLocationScreen" component={StoreLocationScreen} options={{headerShown: false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;