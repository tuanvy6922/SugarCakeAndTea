import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const RequireAuth = (WrappedComponent) => {
    return (props) => {
        const navigation = useNavigation();
        const [isChecking, setIsChecking] = useState(true);

        useEffect(() => {
            checkAuthStatus();
        }, []);

        const checkAuthStatus = async () => {
            try {
                const userRole = await AsyncStorage.getItem('userRole');
                if (userRole === 'guest') {
                    Alert.alert(
                        "Yêu cầu đăng nhập",
                        "Vui lòng đăng nhập để sử dụng tính năng này",
                        [
                            {
                                text: "Đăng nhập",
                                onPress: () => {
                                    navigation.goBack();
                                    navigation.navigate('Login');
                                }
                            },
                            {
                                text: "Đăng ký",
                                onPress: () => {
                                    navigation.goBack();
                                    navigation.navigate('Register');
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

        if (isChecking) {
            return <View />; // Loading state
        }

        return <WrappedComponent {...props} />;
    };
};

export default RequireAuth;