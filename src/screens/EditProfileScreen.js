import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert, ToastAndroid } from 'react-native'
import React, { useState, useEffect } from 'react'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import DropDownPicker from 'react-native-dropdown-picker'

const EditProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    gender: '',
    email: '',
  })
  
  // State cho DropDownPicker
  const [genderOpen, setGenderOpen] = useState(false)

  // Fetch user data when component mounts
  useEffect(() => {
    const user = auth().currentUser
    if (user) {
      firestore()
        .collection('Customer')
        .doc(user.email)
        .get()
        .then(document => {
          if (document.exists) {
            const data = document.data()
            setUserData({
              fullName: data.fullName,
              phoneNumber: data.phoneNumber,
              address: data.address,
              gender: data.gender,
              email: data.email,
            })
          }
        })
        .catch(error => console.error("Error fetching user data: ", error))
    }
  }, [])

  const handleUpdate = async () => {
    const user = auth().currentUser
    if (!user) return

    try {
      await firestore()
        .collection('Customer')
        .doc(user.email)
        .update({
          fullName: userData.fullName,
          phoneNumber: userData.phoneNumber,
          address: userData.address,
          gender: userData.gender
        })

      ToastAndroid.show("Cập nhật thông tin thành công!", ToastAndroid.SHORT)
      navigation.goBack()
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại!")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Họ và tên</Text>
        <TextInput
          style={styles.input}
          value={userData.fullName}
          onChangeText={(text) => setUserData({...userData, fullName: text})}
          placeholder="Nhập họ và tên"
        />
        
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={userData.email}
          onChangeText={(text) => setUserData({...userData, email: text})}
          placeholder="Nhập Email"
          editable={false}
        />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={userData.phoneNumber}
          onChangeText={(text) => setUserData({...userData, phoneNumber: text})}
          keyboardType="phone-pad"
          placeholder="Nhập số điện thoại"
        />

        <Text style={styles.label}>Địa chỉ</Text>
        <TextInput
          style={styles.input}
          value={userData.address}
          onChangeText={(text) => setUserData({...userData, address: text})}
          placeholder="Nhập địa chỉ"
        />

        <Text style={styles.label}>Giới tính</Text>
        <DropDownPicker
          style={styles.dropdown}
          open={genderOpen}
          value={userData.gender}
          items={[
            { label: 'Nam', value: 'male' },
            { label: 'Nữ', value: 'female' },
            { label: 'Khác', value: 'other' }
          ]}
          setOpen={setGenderOpen}
          setValue={(callback) => {
            const value = callback(userData.gender)
            setUserData({...userData, gender: value})
          }}
          placeholder="Chọn giới tính"
        />

        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Cập nhật thông tin</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default EditProfileScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropdown: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#D17842',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})