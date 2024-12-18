import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, ToastAndroid, TouchableOpacity, View, SafeAreaView, Linking } from "react-native";
import { Text, TextInput } from "react-native-paper";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Entypo from 'react-native-vector-icons/Entypo';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [userLogin, setUserLogin] = useState(null);
    const [loginAttempts, setLoginAttempts] = useState(0);

    // Keep your handleLogin function and useEffect hook as they are
    const handleLogin = async () => {
        try {
            if (email.trim() === "" || password.trim() === "") {
                ToastAndroid.show("Vui lòng nhập email và password!", ToastAndroid.SHORT);
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                ToastAndroid.show("Email không hợp lệ. Vui lòng nhập lại!", ToastAndroid.SHORT);
                return;
            }
            if (password.length < 6) {
                ToastAndroid.show("Mật khẩu phải có ít nhất 6 ký tự. Vui lòng nhập lại!", ToastAndroid.SHORT);
                return;
            }
            //đăng nhập
            const userCredential = await auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            //lấy thông tin người dùng từ Firebase
            const userDoc = await firestore().collection('Customer').doc(user.email).get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                const { state, role } = userData;
                console.log(userData);
                if (state === 'Blocked') {
                    Alert.alert("Tài khoản đang tạm khóa, vui lòng liên hệ Admin");
                } else {
                    // Reset login attempts on successful login
                    setLoginAttempts(0);
                    setUserLogin(userData);
                    await AsyncStorage.setItem('userEmail', user.email);
                    if (role) { // Check if role is defined
                        await AsyncStorage.setItem('userRole', role);
                    }
                    if (state) { // Check if state is defined
                        await AsyncStorage.setItem('userState', state);
                    }
                }
            } else {
                ToastAndroid.show("Tài khoản không tồn tại. Vui lòng nhập lại!", ToastAndroid.SHORT);
            }
        } catch (error) {
            // Increment login attempts
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);

            if (newAttempts >= 5) {
                try {
                    // Get user document by email
                    const userDoc = await firestore().collection('Customer').doc(email).get();
                    
                    if (userDoc.exists) {
                        // Update state to Blocked
                        await firestore().collection('Customer').doc(email).update({
                            state: 'Blocked'
                        });
                        Alert.alert(
                            "Tài khoản đã bị khóa",
                            "Bạn đã nhập sai mật khẩu 5 lần. Tài khoản đã bị khóa, vui lòng liên hệ Admin."
                        );
                    }
                } catch (updateError) {
                    console.error("Error updating user state:", updateError);
                }
            } else {
                ToastAndroid.show(
                    `Tài khoản email hoặc mật khẩu không đúng. Còn ${5 - newAttempts} lần thử!`,
                    ToastAndroid.SHORT
                );
            }
        }
    };

    useEffect(() => {
        if (userLogin != null) {
            if (userLogin.role === "admin" && userLogin.state === "Available") {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Admin' }],
                });
            } else if (userLogin.role === "user" && userLogin.state === "Available") {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home-nav' }],
                });
            }
        }
    }, [userLogin]);

    const handleSupport = async () => {
        try {
            // Mở email hoặc số điện thoại để liên hệ
            const supportEmail = "2024802010278@student.tdmu.edu.vn"; // Thay thế bằng email hỗ trợ của bạn
            const supportPhone = "0898425843"; // Thay thế bằng số điện thoại hỗ trợ của bạn
            
            Alert.alert(
                "Liên hệ hỗ trợ",
                "Chọn phương thức liên hệ",
                [
                    {
                        text: "Gọi điện",
                        onPress: () => Linking.openURL(`tel:${supportPhone}`)
                    },
                    {
                        text: "Email",
                        onPress: () => Linking.openURL(`mailto:${supportEmail}?subject=Yêu cầu mở khóa tài khoản&body=Email cần hỗ trợ: ${email}`)
                    }
                ]
            );
            console.log(supportEmail);
        } catch (error) {
            console.error("Error sending support request:", error);
            ToastAndroid.show("Không thể gửi yêu cầu hỗ trợ. Vui lòng thử lại sau!", ToastAndroid.SHORT);
        }
    };

    const handleGuestLogin = async () => {
        try {
            // Lưu trạng thái guest vào AsyncStorage
            await AsyncStorage.setItem('userRole', 'guest');
            navigation.navigate("Home-nav");
        } catch (error) {
            console.error("Error during guest login:", error);
            ToastAndroid.show("Có lỗi xảy ra, vui lòng thử lại!", ToastAndroid.SHORT);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Image
                    style={styles.logo}
                    source={require("../../assets/icon_logo.png")}
                    resizeMode="contain"
                />

                <TextInput
                    style={styles.input}
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    outlineColor="#E2E8F0"
                    activeOutlineColor="#3B82F6"
                    left={<TextInput.Icon icon="email" color="#64748B" />}
                />

                <TextInput
                    style={styles.input}
                    label="Mật khẩu"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    mode="outlined"
                    outlineColor="#E2E8F0"
                    activeOutlineColor="#3B82F6"
                    left={<TextInput.Icon icon="lock" color="#64748B" />}
                    right={<TextInput.Icon 
                        icon={showPassword ? "eye-off" : "eye"} 
                        onPress={() => setShowPassword(!showPassword)}
                        color="#64748B"
                    />}
                />

                <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                    <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={handleLogin} 
                    style={styles.loginButton}
                    activeOpacity={0.8}
                >
                    <Text style={styles.loginButtonText}>Đăng nhập</Text>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>hoặc</Text>
                    <View style={styles.divider} />
                </View>

                <TouchableOpacity 
                    onPress={handleGuestLogin}
                    style={[styles.guestButton]}
                    activeOpacity={0.8}
                >
                    <Text style={styles.guestButtonText}>Tiếp tục với tư cách khách vãng lai</Text>
                </TouchableOpacity>

                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>Bạn chưa có tài khoản?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                        <Text style={styles.registerLink}>Đăng ký</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={styles.supportButton}
                    onPress={handleSupport}
                >
                    <Entypo name="help-with-circle" size={24} color="#3B82F6" />
                    <Text style={styles.supportText}>Liên hệ hỗ trợ</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    logo: {
        alignSelf: 'center',
        height: 180,
        width: 180,
        marginBottom: 12,
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#F8FAFC',
        height: 56,
        fontSize: 16,
    },
    forgotPasswordText: {
        textAlign: 'right',
        color: '#3B82F6',
        marginBottom: 24,
        fontSize: 14,
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 2,
        elevation: 2,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    registerText: {
        color: '#64748B',
        fontSize: 14,
    },
    registerLink: {
        color: '#3B82F6',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 4,
    },
    supportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        marginBottom: 80,
        padding: 8,
    },
    supportText: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#64748B',
        fontSize: 14,
    },
    guestButton: {
        backgroundColor: '#E2E8F0',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
        elevation: 2,
    },
    guestButtonText: {
        color: '#64748B',
        fontSize: 16,
        fontWeight: '600',
    },
});