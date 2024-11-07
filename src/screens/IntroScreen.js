import { Image, StyleSheet, SafeAreaView } from 'react-native'
import React, { useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';

const IntroScreen = ({navigation}) => {
  useEffect(() => {
    const checkLoginStatus = async () => {
      const userEmail = await AsyncStorage.getItem('userEmail');
      
      if (userEmail) {
        // Nếu có thông tin đăng nhập, điều hướng đến Home
        navigation.navigate("Home-nav");
      } else {
        // Nếu không có, điều hướng đến Login
        navigation.navigate("Login");
      }
    };

    const timer = setTimeout(() => {
      checkLoginStatus();
    }, 2000); // 2000 milliseconds = 2 seconds

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Image 
        source={require('../../assets/Intro.png')}
        style={styles.image}
      />
    </SafeAreaView>
  )
}

export default IntroScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
})