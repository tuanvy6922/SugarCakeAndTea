// src/components/TestLottie.js
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import LottieView from 'lottie-react-native';

const EmptyListAnimation = () => {
    return (
        <View style={styles.container}>
            <LottieView
                style={styles.animation}
                source={require('../lottie/coffeecup.json')} // Đảm bảo đường dẫn đúng
                autoPlay
                loop
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    animation: {
        height: 600,
        width: 300, // Thêm chiều rộng nếu cần
    },
});

export default EmptyListAnimation;