import React, { useState, useEffect } from "react";
import { View, StyleSheet, ToastAndroid, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { Icon } from "react-native-paper";
import DropDownPicker from 'react-native-dropdown-picker'; // Import DropDownPicker
import { createAccount } from "../../store";
import firestore from '@react-native-firebase/firestore';

const RegisterScreen = ({ navigation }) => {
    // Khai báo các state để quản lý form đăng ký
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmpassword: "",
        phoneNumber: "",
        address: "",
        gender: "", 
    });

    const [errors, setErrors] = useState({});
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [genderPickerOpen, setGenderPickerOpen] = useState(false);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    useEffect(() => {
        validateForm();
    }, [formData]);

    // Hàm kiểm tra tính hợp lệ của form
    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName) newErrors.fullName = "Tên đầy đủ không được bỏ trống";
        if (!emailPattern.test(formData.email)) newErrors.email = "Email không đúng định dạng";
        if (formData.password.length < 6) newErrors.password = "Mật khẩu phải từ 6 kí tự trở lên";
        if (formData.password !== formData.confirmpassword) newErrors.confirmpassword = "Mật khẩu không khớp";
        if (!formData.phoneNumber) newErrors.phoneNumber = "Số điện thoại không được bỏ trống";
        if (!formData.address) newErrors.address = "Địa chỉ không được bỏ trống";
        if (!formData.gender) newErrors.gender = "Giới tính không được bỏ trống"; 
        setErrors(newErrors);
    };

    // Hàm xử lý thay đổi giá trị trong form
    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
        console.log("Selected gender:", value); // In ra giá trị đã chọn
    };

    // Hàm kiểm tra email đã tồn tại trong database
    const checkEmailExists = async (email) => {
        try {
            const querySnapshot = await firestore()
                .collection('USERS')
                .where('email', '==', email)
                .get();
            
            return !querySnapshot.empty; // Trả về true nếu email đã tồn tại
        } catch (error) {
            console.error("Lỗi khi kiểm tra email:", error);
            throw error;
        }
    };

    const handleCreateAccount = async () => {
        if (Object.keys(errors).length > 0) {
            ToastAndroid.show("Vui lòng sửa các lỗi trước khi đăng ký!", ToastAndroid.LONG);
            return;
        }

        try {
            // Nếu email chưa tồn tại, tiếp tục tạo tài khoản
            const emailExists = await checkEmailExists(formData.email);
            if (emailExists) {
                ToastAndroid.show("Email này đã được đăng ký! Vui lòng sử dụng email khác.", ToastAndroid.LONG);
                return;
            }

            await createAccount(
                formData.fullName,
                formData.email,
                formData.password,
                "user",
                formData.phoneNumber,
                formData.address,
                formData.gender
            );
            ToastAndroid.show("Tạo tài khoản thành công!", ToastAndroid.LONG);
            navigation.navigate("Login");
        } catch (error) {
            console.error("Lỗi:", error);
            ToastAndroid.show("Đã xảy ra lỗi khi tạo tài khoản!", ToastAndroid.LONG);
        }
    };

    // Dữ liệu cho FlatList
    const inputFields = [
        { key: "fullName", label: "Tên đầy đủ" },
        { key: "email", label: "Email" },
        { key: "phoneNumber", label: "Số điện thoại" },
        { key: "address", label: "Địa chỉ" },
    ];

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <FlatList
                contentContainerStyle={styles.container}
                data={inputFields}
                renderItem={({ item }) => (
                    <View>
                        <TextInput
                            style={styles.input}
                            label={item.label}
                            value={formData[item.key]}
                            onChangeText={(value) => handleChange(item.key, value)}
                        />
                    </View>
                )}
                keyExtractor={(item) => item.key}
                ListHeaderComponent={
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Đăng ký tài khoản</Text>
                    </View>
                }
                ListFooterComponent={
                    <>
                        <DropDownPicker
                            style={styles.dropdownContainer}
                            open={genderPickerOpen}
                            value={formData.gender}
                            items={[
                                { label: 'Nam', value: 'male' },
                                { label: 'Nữ', value: 'female' },
                                { label: 'Khác', value: 'other' },
                            ]}
                            setOpen={setGenderPickerOpen}
                            setValue={(callback) => {
                                const value = callback(formData.gender);
                                handleChange("gender", value);
                            }}
                            placeholder="Chọn giới tính"
                            onClose={() => setGenderPickerOpen(false)}
                            onOpen={() => setGenderPickerOpen(true)}
                        />
                        <TextInput
                            style={styles.input}
                            label={"Mật khẩu"}
                            value={formData.password}
                            onChangeText={(value) => handleChange("password", value)}
                            secureTextEntry={!showNewPassword}
                            right={<TextInput.Icon icon={showNewPassword ? "eye-off" : "eye"} onPress={() => setShowNewPassword(!showNewPassword)} />}
                        />
                        <Text style={styles.passwordRequirements}>
                            Mật khẩu ít nhất 8 ký tự và đáp ứng 4 điều kiện sau:
                            {"\n"}• Các số 0-9. Ví dụ: 2, 6, 7
                            {"\n"}• Các chữ cái thường (nhỏ) a-z. Ví dụ: a, e, r
                            {"\n"}• Chữ cái viết hoa (in hoa) A-Z. Ví dụ: A, E, R
                            {"\n"}• Các ký tự đặc biệt như @#$ 
                        </Text>
                        
                        <TextInput
                            style={styles.input}
                            label={"Xác nhận mật khẩu"}
                            value={formData.confirmpassword}
                            onChangeText={(value) => handleChange("confirmpassword", value)}
                            secureTextEntry={!showConfirmPassword}
                            right={<TextInput.Icon icon={showConfirmPassword ? "eye-off" : "eye"} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
                        />
                        
                        <TouchableOpacity onPress={handleCreateAccount} style={styles.button}>
                            <Text style={{ fontSize: 16, color: 'white' }}>Tạo tài khoản</Text>
                        </TouchableOpacity>
                        
                        <View style={styles.footerView}>
                            <Text style={styles.footerText}>Bạn đã có tài khoản?</Text>
                            <Button style={styles.footerLink} onPress={() => navigation.navigate("Login")}>Đăng nhập</Button>
                        </View>
                    </>
                }
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignContent: 'center',
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    titleContainer: {
        justifyContent: 'center',
        alignContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
    },
    input: {
        height: 50,
        borderRadius: 10,
        borderTopLeftRadius:10,
        borderTopRightRadius:10,
        borderWidth:1,
        overflow: 'hidden',
        backgroundColor: 'white',
        marginTop: 20,
        paddingLeft: 12,
    },
    button: {
        backgroundColor: "navy",
        marginTop: 20,
        height: 40,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: 'center'
    },
    footerView: {
        flexDirection: "row",
        justifyContent: 'center',
        alignContent: 'center',
        marginTop: 10
    },
    footerText: {
        fontSize: 14,
        color: '#000000',
        alignSelf: 'center',
        paddingLeft: 10
    },
    footerLink: {
        color: "navy",
        fontWeight: "bold",
        fontSize: 14,
        paddingLeft: 5
    },
    textValidContainer: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        marginTop: 5,
        marginBottom: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: 'navy',
        padding: 8,
        borderRadius: 5,
        marginTop: 20,
    },
    dropdownContainer: {
        marginTop: 20,

    },
    passwordRequirements: {
        marginTop: 10,
        fontSize: 14,
        color: 'red', // Change color as needed
    },
});

export default RegisterScreen;

