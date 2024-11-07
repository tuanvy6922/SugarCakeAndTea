import { StyleSheet, Text, View } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import LoginScreen from '../src/screens/LoginScreen';
import RegisterScreen from '../src/screens/RegisterScreen';
import IntroScreen from '../src/screens/IntroScreen';
import ForgotPassword from '../src/screens/ForgotPassword';
import CartScreen from '../src/screens/CartScreen';
import FavoritesScreen from '../src/screens/FavoritesScreen';
import React, { useContext} from 'react'
import { CartContext } from '../src/components/CartContext';
import OrderHistoryScreen from '../src/screens/OrderHistoryScreen';
import HomeScreen from '../src/screens/HomeScreen';
import ProfileScreen from '../src/screens/ProfileScreen';
import SearchScreen from '../src/screens/SearchScreen';
import DetailScreen from '../src/screens/DetailScreen';
import ItemList from '../src/screens/ItemList';
import AppNavigator from './StackNavigation';
import SearchStackNavigator from './SearchStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigation';
import OrderStackNavigation from './OrderStackNavigation';

const Tab = createBottomTabNavigator();
const TabNavigation = () => {
  const { cartItems } = useContext(CartContext);
  
  return (
    <Tab.Navigator screenOptions={{
        tabBarStyle:{
            position: "absolute",
            backgroundColor: '#f0f0f0',
            borderTopRightRadius:0,
            borderTopLeftRadius:0,
            bottom:0,
            left:0,
            right:0,
            shadowOpacity:4,
            shadowRadius:4,
            elevation:4,
            shadowOffset:{
                width:0,
                height:-4
            },
            borderTopWidth:4 
        }
    }}>
      <Tab.Screen
        name="home-nav"
        component={AppNavigator}
        options={{
          tabBarLabel: "Trang chủ",
          headerShown: false,
          tabBarLabelStyle: { color: "black" },
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Entypo name="home" size={24} color="blue" />
            ) : (
              <Entypo name="home" size={24} color="grey" />
            ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: "Giỏ hàng",
          headerShown: false,
          tabBarLabelStyle: { color: "black" },
          tabBarIcon: ({ focused }) => (
            <View style={{ position: 'relative' }}>
              <MaterialIcons name="shopping-cart" size={24} color={focused ? "blue" : "grey"} />
              {cartItems.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartItems.length}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Search-nav"
        component={SearchStackNavigator}
        options={{
          tabBarLabel: "Tìm kiếm",
          headerShown: false,
          tabBarLabelStyle: { color: "black" },
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Entypo name="magnifying-glass" size={24} color="blue" />
            ) : (
              <Entypo name="magnifying-glass" size={24} color="grey" />
            ),
        }}
      />
      <Tab.Screen
        name="Bill-nav"
        component={OrderStackNavigation}
        options={{
          tabBarLabel: "Biến động",
          headerShown: false,
          tabBarLabelStyle: { color: "black" },
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="notifications" size={24} color="blue" />
            ) : (
              <Ionicons name="notifications" size={24} color="grey" />
            ),
        }}
      />
      <Tab.Screen
        name="Profile-nav"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: "Thông tin",
          headerShown: false,
          tabBarLabelStyle: { color: "black" },
          tabBarIcon: ({ focused }) =>
            focused ? (
                <Ionicons name="person" size={24} color="blue" />
            ) : (
                <Ionicons name="person" size={24} color="grey" />
            ),
        }}
      />
      
    </Tab.Navigator>
  )
}

// Thêm styles cho badge
const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -10, // Điều chỉnh vị trí bên phải
    top: -5, // Điều chỉnh vị trí phía trên
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default TabNavigation
