import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import React, { useState } from 'react';
import { TextInput, HelperText } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const ChangePassword = () => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const navigation = useNavigation();

  // Hàm kiểm tra các điều kiện
  const validatePassword = () => {
    const conditions = [
      { test: newPassword.length < 6, message: 'Mật khẩu mới phải từ 6 kí tự trở lên' },
      { test: newPassword === currentPass, message: 'Mật khẩu mới không được trùng với mật khẩu cũ' },
      { test: !/[A-Z]/.test(newPassword), message: 'Mật khẩu mới phải chứa ít nhất một ký tự chữ hoa' },
      { test: !/[0-9]/.test(newPassword), message: 'Mật khẩu mới phải chứa ít nhất một ký tự số' },
      { test: !/[!@#$%^&*]/.test(newPassword), message: 'Mật khẩu mới phải chứa ít nhất một ký tự đặc biệt' },
    ];

    const error = conditions.find(condition => condition.test)?.message || '';
    return error;
  };

  // Hàm xác thực người dùng
  const reauthenticate = () => {
    const user = auth().currentUser;
    const credential = auth.EmailAuthProvider.credential(user.email, currentPass);
    return user.reauthenticateWithCredential(credential);
  };
  
  // Hàm xử lý khi người dùng đổi mật khẩu
  const handleChangePassword = async () => {
    const error = validatePassword();
    if (error) {
      setErrorMessage(error);
      return;
    }

    try {
      const user = auth().currentUser;
      
      if (!user) {
        Alert.alert('Lỗi', 'Người dùng hiện tại không tồn tại');
        return;
      }
      // Xác thực người dùng
      await reauthenticate();
      await user.updatePassword(newPassword);

      // Cập nhật mật khẩu trong Firestore
      await firestore()
        .collection('Customer')
        .doc(user.email) // Sử dụng email làm ID tài liệu
        .update({
          password: newPassword, // Cập nhật mật khẩu mới
        });

      Alert.alert('Thành công', 'Cập nhật mật khẩu thành công, vui lòng đăng nhập lại');
      navigation.navigate("Login");
    } catch (error) {
      console.error(error); // In ra lỗi để kiểm tra
      Alert.alert('Lỗi', error.message || 'Đổi mật khẩu thất bại'); // Hiển thị thông báo lỗi
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.textform}>Mật khẩu hiện tại</Text>
      <TextInput
        style={styles.input}
        value={currentPass}
        onChangeText={setCurrentPass}
        secureTextEntry={!showCurrentPassword}
        right={<TextInput.Icon 
          icon={showCurrentPassword ? "eye-off" : "eye"} 
          onPress={() => setShowCurrentPassword(!showCurrentPassword)} 
        />}
      />

      <Text style={styles.textform}>Mật khẩu mới</Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry={!showNewPassword}
        right={<TextInput.Icon 
          icon={showNewPassword ? "eye-off" : "eye"} 
          onPress={() => setShowNewPassword(!showNewPassword)} 
        />}
      />
      <HelperText style={{alignSelf:'flex-start', marginLeft:3, marginTop:5}} 
      type="error" visible={!!errorMessage}>
        {errorMessage}
      </HelperText>
      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Đổi mật khẩu</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 30,
  },
  textform: {
    marginBottom: 8,
    fontSize: 17,
  },
  input: {
    backgroundColor: 'white',
    borderColor: '#80bfff',
    borderWidth: 1,
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: 'navy',
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
