// import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
// import React, { useState } from 'react';
// import firestore from '@react-native-firebase/firestore';
// import auth from '@react-native-firebase/auth';
// import { useContext } from 'react';
// import { CartContext } from '../components/CartContext';
// import CryptoJS from 'crypto-js';
// import moment from 'moment';

// // Cấu hình ZaloPay
// const config = {
//   app_id: "2553",
//   key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
//   key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
//   endpoint: "https://sb-openapi.zalopay.vn/v2/create",
//   query_endpoint: "https://sb-openapi.zalopay.vn/v2/query"
// };

// const PaymentScreen = ({ navigation }) => {
//   const [address, setAddress] = useState('');
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
//   const { cartItems, clearCart } = useContext(CartContext);

//   const handlePayment = async () => {
//     if (!address) {
//       Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ giao hàng.');
//       return;
//     }
//     if (!selectedPaymentMethod) {
//       Alert.alert('Thông báo', 'Vui lòng chọn phương thức thanh toán.');
//       return;
//     }

//     try {
//       const user = auth().currentUser;
//       if (!user) {
//         Alert.alert('Lỗi', 'Không thể xác định người dùng.');
//         return;
//       }

//       const bill = {
//         user: user.email,
//         date: new Date(),
//         items: cartItems,
//         address,
//         paymentMethod: selectedPaymentMethod,
//       };

//       // Thêm hóa đơn vào Firestore
//       await firestore().collection('Bills').add(bill);

//       // Nếu chọn ZaloPay, khởi tạo thanh toán ZaloPay
//       if (selectedPaymentMethod === 'ZaloPay') {
//         await initiateZaloPayment(bill);
//       } else {
//         Alert.alert('Thành công', 'Thanh toán thành công!', [
//           {
//             text: 'OK',
//             onPress: () => {
//               clearCart(); // Xóa sản phẩm trong giỏ hàng đã thanh toán
//               navigation.navigate('home-nav'); 
//             },
//           },
//         ]);
//       }
//     } catch (error) {
//       Alert.alert('Lỗi', 'Có lỗi xảy ra khi lưu hóa đơn.');
//     }
//   };

//   const initiateZaloPayment = async (bill) => {
//     try {
//       const app_trans_id = moment().format('YYMMDDHHmmss') + '_' + bill.user.split('@')[0];
//       const totalAmount = bill.items.reduce((total, item) => total + (item.price * item.quantity), 0);

//       const order = {
//         app_id: 2553,
//         app_user: bill.user.split('@')[0],
//         app_trans_id: app_trans_id,
//         app_time: Date.now(),
//         amount: totalAmount,
//         item: JSON.stringify(bill.items.map(item => ({
//           itemid: item.id,
//           itemname: item.name,
//           itemprice: item.price,
//           itemquantity: item.quantity
//         }))),
//         description: 'Thanh toán đơn hàng #' + app_trans_id,
//         embed_data: JSON.stringify({ promotioninfo: "", merchantinfo: "du lieu rieng cua ung dung" }),
//         bank_code: "zalopayapp",
//         callback_url: "https://yourdomain.com/callback",
//         mac: ""
//       };

//       console.log('Order Data:', order);

//       const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
//       order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

//       const response = await fetch(config.endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(order),
//       });

//       const responseData = await response.json();
//       console.log('Response Data:', responseData);
      
//       if (responseData.return_code === 1 && responseData.order_url) {
//         await Linking.openURL(responseData.order_url);
        
//       } else {
//         Alert.alert('Error', 'Payment initiation failed!');
//       }
//     } catch (error) {
//       console.error('Payment Error:', error);
//       Alert.alert('Error', 'An error occurred during payment.');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.label}>Địa chỉ giao hàng:</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Nhập địa chỉ giao hàng"
//         value={address}
//         onChangeText={setAddress}
//       />
//       <Text style={styles.label}>Chọn phương thức thanh toán:</Text>
//       <TouchableOpacity
//         style={[
//           styles.paymentButton,
//           selectedPaymentMethod === 'ZaloPay' && styles.selectedButton,
//         ]}
//         onPress={() => setSelectedPaymentMethod('ZaloPay')}
//       >
//         <Text style={styles.buttonText}>ZaloPay</Text>
//       </TouchableOpacity>
//       <TouchableOpacity
//         style={[
//           styles.paymentButton,
//           selectedPaymentMethod === 'Cash' && styles.selectedButton,
//         ]}
//         onPress={() => setSelectedPaymentMethod('Cash')}
//       >
//         <Text style={styles.buttonText}>Nhận hàng và trả tiền mặt</Text>
//       </TouchableOpacity>
//       <TouchableOpacity
//         style={[
//           styles.payButton,
//         ]}
//         onPress={handlePayment}
//       >
//         <Text style={styles.payButtonText}>Xác nhận</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   label: {
//     fontSize: 16,
//     marginVertical: 10,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 20,
//   },
//   paymentButton: {
//     padding: 15,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     marginBottom: 10,
//     alignItems: 'center',
//   },
//   selectedButton: {
//     backgroundColor: '#D17842',
//   },
//   buttonText: {
//     color: '#000',
//   },
//   payButton: {
//     backgroundColor: '#D17842',
//     padding: 15,
//     borderRadius: 5,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   payButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default PaymentScreen;
