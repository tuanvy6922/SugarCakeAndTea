import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, ToastAndroid, TouchableOpacity, View, SafeAreaView } from "react-native";
import { Text, TextInput } from "react-native-paper";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [userLogin, setUserLogin] = useState(null);

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
            const userDoc = await firestore().collection('USERS').doc(user.email).get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                const { state, role } = userData;
                console.log(userData);
                if (state === 'Lock') {
                    Alert.alert("Tài khoản đang tạm khóa, vui lòng liên hệ Admin");
                } else {
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
            ToastAndroid.show("Tài khoản email hoặc mật khẩu không đúng. Vui lòng nhập lại!", ToastAndroid.SHORT);
        }
    };

    useEffect(() => {
        if (userLogin != null) {
            if (userLogin.role === "admin" && userLogin.state === "Available") {
                navigation.navigate("Admin");
            } else if (userLogin.role === "user" && userLogin.state === "Available") {
                navigation.navigate("Home-nav");
            }
        }
    }, [userLogin]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Image
                    style={styles.logo}
                    source={require("../../assets/icon_logo.png")}
                />

                <TextInput
                    style={styles.input}
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    outlineColor="#E0E0E0"
                    activeOutlineColor="#3B82F6"
                />

                <TextInput
                    style={styles.input}
                    label="Mật khẩu"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    mode="outlined"
                    outlineColor="#E0E0E0"
                    activeOutlineColor="#3B82F6"
                    right={<TextInput.Icon 
                        icon={showPassword ? "eye-off" : "eye"} 
                        onPress={() => setShowPassword(!showPassword)} 
                    />}
                />

                <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                    <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
                    <Text style={styles.loginButtonText}>Đăng nhập</Text>
                </TouchableOpacity>

                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>Bạn chưa có tài khoản? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                        <Text style={styles.registerLink}>Đăng ký</Text>
                    </TouchableOpacity>
                </View>
                
            </View>
        </SafeAreaView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        //flex: 1,
        backgroundColor: 'white',
    },
    content: {
        //flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    logo: {
        alignSelf: 'center',
        height: 200,
        width: 200,
        justifyContent: 'center',
        marginBottom: 40,
    },
    input: {
        marginBottom: 15,
        backgroundColor: 'white',
    },
    forgotPasswordText: {
        textAlign: 'right',
        color: '#3B82F6',
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#3B82F6',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 20,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    registerText: {
        color: '#666',
    },
    registerLink: {
        color: '#3B82F6',
        fontWeight: 'bold',
    },
});