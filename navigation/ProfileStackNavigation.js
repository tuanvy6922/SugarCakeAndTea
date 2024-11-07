// src/navigation/SearchStackNavigator.js
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../src/screens/ProfileScreen';
import StoreLocationScreen from '../src/screens/StoreLocationScreen';
import FavoritesScreen from '../src/screens/FavoritesScreen';
import ChangePasswordScreen from '../src/screens/ChangePasswordScreen';
import EditProfileScreen from '../src/screens/EditProfileScreen';

const Stack = createStackNavigator();

const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      {/* <Stack.Screen 
        name="StoreLocationScreen" 
        component={StoreLocationScreen} 
        options={{ 
          headerTitle: 'Vị trí cửa hàng',
          headerTitleAlign: 'center' 
        }} 
      /> */}
      <Stack.Screen 
        name="FavoriteScreen" 
        component={FavoritesScreen} 
        options={{ 
          headerTitle: 'Danh sách yêu thích',
          headerTitleAlign: 'center', 
          headerStyle: {
            backgroundColor: '#ffffff'
          }
        }} 
      />
      <Stack.Screen 
      name="ChangePasswordScreen" 
      component={ChangePasswordScreen} 
      options={{ 
        headerTitle: 'Đổi mật khẩu',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#ffffff'
        }
      }} 
      />
     <Stack.Screen 
      name="EditProfileScreen" 
      component={EditProfileScreen} 
      options={{ 
        headerTitle: 'Chỉnh sửa hồ sơ',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#ffffff'
        }
      }} 
      />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;