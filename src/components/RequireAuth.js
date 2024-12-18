import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const RequireAuth = (WrappedComponent) => {
    return (props) => {
        const navigation = useNavigation();
        const [isChecking, setIsChecking] = useState(true);

        // Kiểm tra trạng thái đăng nhập
        useEffect(() => {
            checkAuthStatus();
        }, []);

        const checkAuthStatus = async () => {
            try {
                const userRole = await AsyncStorage.getItem('userRole');
                const userEmail = await AsyncStorage.getItem('userEmail');
                
                if (!userEmail && userRole !== 'guest') {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    });
                    return;
                }
                
                if (userRole === 'guest') {
                    Alert.alert(
                        "Yêu cầu đăng nhập",
                        "Vui lòng đăng nhập để sử dụng tính năng này",
                        [
                            {
                                text: "Đăng nhập",
                                onPress: () => {
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ name: 'Login' }],
                                    });
                                }
                            },
                            {
                                text: "Đăng ký",
                                onPress: () => {
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ name: 'Register' }],
                                    });
                                }
                            }
                        ]
                    );
                }
                setIsChecking(false);
            } catch (error) {
                console.error("Error checking auth status:", error);
                setIsChecking(false);
            }
        };

        // Hiển thị loading state khi đang kiểm tra trạng thái đăng nhập
        if (isChecking) {
            return <View />; // Loading state
        }

        // Nếu không có lỗi, hiển thị component được bao bởi RequireAuth
        return <WrappedComponent {...props} />;
    };
};

export default RequireAuth;