import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

// Lấy kích thước màn hình
const { width, height } = Dimensions.get('window');

const SearchProductAnimation = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../lottie/searchproduct.json')}
        autoPlay
        loop
        style={styles.animation}
      />
      <Text style={styles.message}>Hãy nhập tên thức uống hoặc bánh bạn cần tìm!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical:20,
  },
  animation: {
    width: width * 0.5, // Sử dụng 50% chiều rộng màn hình
    height: height * 0.3, // Sử dụng 30% chiều cao màn hình
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    color: 'grey',
  },
});

export default SearchProductAnimation;