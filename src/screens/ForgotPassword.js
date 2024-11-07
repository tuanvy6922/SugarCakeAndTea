import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import React, { useState } from 'react';
import { TextInput } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();
  
  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Vui lòng nhập email.');
      return;
    }

    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert('Success', 'Một email đặt lại mật khẩu đã được gửi.');
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert('Error', 'Đã xảy ra lỗi trong quá trình gửi email đặt lại mật khẩu.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.textform}>Email hiện tại: </Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
        <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPassword;

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
