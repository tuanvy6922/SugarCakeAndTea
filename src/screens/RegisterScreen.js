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
            console.log("Đang tạo tài khoản với dữ liệu:", formData);
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
        <KeyboardAvoidingView 
            style={{ flex: 1, backgroundColor: '#fff' }} 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <FlatList
                contentContainerStyle={styles.container}
                data={inputFields}
                ListHeaderComponent={
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Đăng ký tài khoản</Text>
                        <Text style={styles.subtitle}>Vui lòng điền đầy đủ thông tin bên dưới</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.inputContainer}>
                        <TextInput
                            mode="outlined"
                            style={styles.input}
                            label={item.label}
                            value={formData[item.key]}
                            onChangeText={(value) => handleChange(item.key, value)}
                            error={errors[item.key]}
                            outlineColor="#E5E7EB"
                            activeOutlineColor="#3B82F6"
                            theme={{ roundness: 8 }}
                        />
                        {errors[item.key] && (
                            <Text style={styles.errorText}>{errors[item.key]}</Text>
                        )}
                    </View>
                )}
                ListFooterComponent={
                    <View style={styles.footerContainer}>
                        <DropDownPicker
                            style={styles.dropdown}
                            containerStyle={styles.dropdownContainer}
                            dropDownContainerStyle={styles.dropdownList}
                            open={genderPickerOpen}
                            value={formData.gender}
                            items={[
                                { label: 'Nam', value: 'male' },
                                { label: 'Nữ', value: 'female' },
                                { label: 'Không tiết lộ', value: 'rather not say' },
                            ]}
                            setOpen={setGenderPickerOpen}
                            setValue={(callback) => {
                                const value = callback(formData.gender);
                                handleChange("gender", value);
                            }}
                            placeholder="Chọn giới tính"
                            placeholderStyle={styles.dropdownPlaceholder}
                        />
                        
                        <View style={styles.passwordContainer}>
                            <TextInput
                                mode="outlined"
                                style={styles.input}
                                label="Mật khẩu"
                                value={formData.password}
                                onChangeText={(value) => handleChange("password", value)}
                                secureTextEntry={!showNewPassword}
                                right={<TextInput.Icon icon={showNewPassword ? "eye-off" : "eye"} onPress={() => setShowNewPassword(!showNewPassword)} />}
                                outlineColor="#E5E7EB"
                                activeOutlineColor="#3B82F6"
                                theme={{ roundness: 8 }}
                            />
                            
                            <View style={styles.passwordRequirementsContainer}>
                                <Text style={styles.passwordRequirementsTitle}>Mật khẩu phải bao gồm:</Text>
                                <View style={styles.requirementItem}>
                                    <Text style={styles.bulletPoint}>•</Text>
                                    <Text style={styles.requirementText}>Ít nhất 8 ký tự</Text>
                                </View>
                                <View style={styles.requirementItem}>
                                    <Text style={styles.bulletPoint}>•</Text>
                                    <Text style={styles.requirementText}>Các số (0-9)</Text>
                                </View>
                                <View style={styles.requirementItem}>
                                    <Text style={styles.bulletPoint}>•</Text>
                                    <Text style={styles.requirementText}>Chữ thường (a-z)</Text>
                                </View>
                                <View style={styles.requirementItem}>
                                    <Text style={styles.bulletPoint}>•</Text>
                                    <Text style={styles.requirementText}>Chữ hoa (A-Z)</Text>
                                </View>
                                <View style={styles.requirementItem}>
                                    <Text style={styles.bulletPoint}>•</Text>
                                    <Text style={styles.requirementText}>Ký tự đặc biệt (@#$)</Text>
                                </View>
                            </View>

                            <TextInput
                                mode="outlined"
                                style={styles.input}
                                label="Xác nhận mật khẩu"
                                value={formData.confirmpassword}
                                onChangeText={(value) => handleChange("confirmpassword", value)}
                                secureTextEntry={!showConfirmPassword}
                                right={<TextInput.Icon icon={showConfirmPassword ? "eye-off" : "eye"} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
                                outlineColor="#E5E7EB"
                                activeOutlineColor="#3B82F6"
                                theme={{ roundness: 8 }}
                            />
                        </View>

                        <TouchableOpacity 
                            onPress={handleCreateAccount} 
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>Tạo tài khoản</Text>
                        </TouchableOpacity>

                        <View style={styles.loginLinkContainer}>
                            <Text style={styles.loginText}>Bạn đã có tài khoản? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                <Text style={styles.loginLink}>Đăng nhập</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    titleContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
    },
    inputContainer: {
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#fff',
        height: 48,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    dropdown: {
        borderColor: '#E5E7EB',
        height: 48,
        borderRadius: 8,
    },
    dropdownContainer: {
        marginBottom: 16,
    },
    dropdownList: {
        borderColor: '#E5E7EB',
        borderRadius: 8,
    },
    dropdownPlaceholder: {
        color: '#6B7280',
    },
    passwordContainer: {
        gap: 16,
        marginBottom: 24,
    },
    passwordRequirementsContainer: {
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 8,
    },
    passwordRequirementsTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    bulletPoint: {
        color: '#6B7280',
        marginRight: 8,
    },
    requirementText: {
        fontSize: 13,
        color: '#6B7280',
    },
    button: {
        backgroundColor: '#3B82F6',
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loginLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        color: '#6B7280',
        fontSize: 14,
    },
    loginLink: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default RegisterScreen;

