import { StyleSheet, Text, View, StatusBar } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-native-paper';
import { CartProvider } from './src/components/CartContext';
import { FavoriteProvider } from './src/components/FavoriteContext';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import PaymentScreen from './src/screens/PaymentScreen';
import TabNavigation from './navigation/TabNavigation';
import DetailScreen from './src/screens/DetailScreen';
import Navigation from './navigation/Navigation';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();


export default function App() {    
  StatusBar.setBarStyle('dark-content')
  return (
    <Provider>
      <CartProvider>
        <FavoriteProvider>
          <Navigation/>
          <Toast/>
        </FavoriteProvider>
      </CartProvider>
    </Provider>
    
  );
}

const styles = StyleSheet.create()