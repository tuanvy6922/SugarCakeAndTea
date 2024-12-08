import { Dimensions, Linking, StyleSheet, Text, View, Image, SafeAreaView, Alert, ToastAndroid, TouchableOpacity, Animated, Easing } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, Entypo } from '@expo/vector-icons';
import RequireAuth from '../components/RequireAuth';

const { width, height } = Dimensions.get('window') 

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const user = auth().currentUser;
  const [flipped, setFlipped] = useState(false); // State để theo dõi trạng thái xoay
  const rotateAnim = useRef(new Animated.Value(0)).current; // Khởi tạo giá trị xoay

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const unsubscribe = firestore()
      .collection('USERS')
      .doc(user.email)
      .onSnapshot(
        (document) => {
          if (document.exists) {
            setUserData(document.data());
          } else {
            setUserData(null);
          }
        },
        (error) => {
          console.error("Error listening to user data: ", error);
        }
      );

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      // Xóa thông tin người dùng khỏi AsyncStorage
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('userState');
      await AsyncStorage.removeItem('userCode');
      setUserData(null);

      // Thông báo cho người dùng
      ToastAndroid.show("Đăng xuất thành công!", ToastAndroid.SHORT);

      // Điều hướng đến màn hình đăng nhập
      navigation.navigate('Login');
    } catch (error) {
      console.error("Error signing out: ", error);
      // Thông báo lỗi cho người dùng
      Alert.alert("Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại!");
    }
  };

  // Liên hệ hỗ trợ
  const ContactSupport = () => {
    const subject = 'Hỗ trợ từ người dùng';
    const body = 'Xin chào, tôi cần hỗ trợ về sản phẩm.';

    Linking.openURL('mailto:2024802010278@student.tdmu.edu.vn?subject=' + subject + '&body=' + body);
  };

  // Xoay card
  const handleFlip = () => {
    Animated.timing(rotateAnim, {
      toValue: flipped ? 0 : 1,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  // Xoay card
  const frontInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'], // Xoay 180 độ
  });

  const backInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'], // Xoay 180 độ
  });

  // Hiển thị giới tính
  const getGenderDisplay = (gender) => {
    switch(gender?.toLowerCase()) {
      case 'male':
        return 'Nam';
      case 'female':
        return 'Nữ';
      case 'other':
        return 'Không tiết lộ';
      default:
        return 'Không tiết lộ';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {userData ? (
        <View style={styles.content}>
          <TouchableOpacity style={styles.card} onPress={handleFlip}>
            <Animated.View style={[styles.face, { transform: [{ rotateY: frontInterpolate }] }]}>
              <View style={styles.rowContainer}>
                <Image
                  style={styles.profileImage}
                  source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ--mmPHnesazs3BnusJhNOA373KLqzyGWRY9PKmEqnsM-_EYZxhe8i59y2KqVmPMXpz6k&usqp=CAU' }}
                />
                <View style={styles.textContainer}>
                  <Text style={styles.name}>Xin chào {userData.fullName}</Text>
                  <Text style={styles.text}>Giới tính: {getGenderDisplay(userData.gender)}</Text>
                  <Text style={styles.text}>Mã người dùng: {userData.userCode}</Text>
                </View>
                <View>
                  <Entypo name='chevron-right' size={24} color="#333" style={styles.iconContainer}/>
                </View>
              </View>
            </Animated.View>
            <Animated.View style={[styles.face, { transform: [{ rotateY: backInterpolate }] }]}>
              <View style={styles.rowContainer}>
                <View style={styles.textContainer}>
                  <Text style={styles.text}>Email: {userData.email}</Text>
                  <Text style={styles.text}>Điện thoại: {userData.phoneNumber}</Text>
                  <Text style={styles.text}>Địa chỉ: {userData.address}</Text>
                </View>
                <View>
                  <Entypo name='chevron-right' size={24} color="#333" style={styles.iconContainer}/>
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditProfileScreen')}>
            <Text style={styles.buttonText}>Chỉnh sửa hồ sơ</Text>
            <Entypo name="edit" size={16} color="#333" style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ChatBot')}>
            <Text style={styles.buttonText}>Tư vấn sản phẩm</Text>
            <Entypo name="light-bulb" size={16} color="#333" style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FavoriteScreen')}>
            <Text style={styles.buttonText}>Danh sách yêu thích</Text>
            <Entypo name="heart" size={16} color="#333" style={styles.icon} />
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.button} onPress={() => Linking.openURL('https://www.google.com/maps/dir/?api=1&destination=10.898691950486857,106.69612421102295&q=SUGAR+CAKE+%26+TEA')}>
            <Text style={styles.buttonText}>Vị trí cửa hàng</Text>
            <Entypo name="location-pin" size={16} color="#333" style={styles.icon} />
          </TouchableOpacity> */}

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('StoreLocationScreen')}>
            <Text style={styles.buttonText}>Vị trí cửa hàng</Text>
            <Entypo name="location-pin" size={16} color="#333" style={styles.icon} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ChangePasswordScreen')}>
            <Text style={styles.buttonText}>Đổi mật khẩu</Text>
            <Entypo name="lock" size={16} color="#333" style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={ContactSupport}>
            <Text style={styles.buttonText}>Liên hệ hỗ trợ</Text>
            <Entypo name="chat" size={16} color="#333" style={styles.icon} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Đăng xuất</Text>
            <Entypo name="log-out" size={16} color="#333" style={styles.icon} />
          </TouchableOpacity>
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
    </SafeAreaView>
  );
};

export default RequireAuth(ProfileScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingBottom: 200,
  },
  card: {
    width: width*0.9,
    height: height*0.175,
    perspective: 1000, // Tạo hiệu ứng 3D
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom:30,
    marginTop:60,
  },
  face: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer:{
    flex:1,
    marginLeft: 5,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  profileImage: {
    width: width*0.2,
    height: height*0.1,
    borderRadius: 50,
    marginLeft:5,
  },
  text:{
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  state: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // Thêm hiệu ứng bóng
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5, 
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
  icon: {
    marginLeft: 'auto',
  },
  rowContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginLeft: 5,
  },
  iconContainer:{
    marginRight: 10,
  },
  guestMessageContainer: {
    alignItems: 'center',
    marginVertical: 40,
    padding: 20,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  guestMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  registerButtonText: {
    color: '#3B82F6',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
