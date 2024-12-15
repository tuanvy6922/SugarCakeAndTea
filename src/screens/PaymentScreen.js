import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Linking, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useContext } from 'react';
import { CartContext } from '../components/CartContext';
import CryptoJS from 'crypto-js';
import moment from 'moment';
import { Entypo } from 'react-native-vector-icons';
import RequireAuth from '../components/RequireAuth';

// Cấu hình ZaloPay
const config = {
  app_id: "2553",
  key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
  query_endpoint: "https://sb-openapi.zalopay.vn/v2/query"
};

const PaymentScreen = ({ navigation }) => {
  const [address, setAddress] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const { cartItems, clearCart, getFinalTotal, appliedVoucher } = useContext(CartContext);
  const [selectedStore, setSelectedStore] = useState(null);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    const fetchStores = async () => {
      const storesSnapshot = await firestore().collection('Store').get();
      const storesData = storesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        address: doc.data().address
      }));
      setStores(storesData);
      if (storesData.length > 0) {
        setSelectedStore(storesData[0]);
      }
    };
    fetchStores();
  }, []);

  const handlePayment = async () => {
    if (!address) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ giao hàng.');
      return;
    }
    if (!selectedPaymentMethod) {
      Alert.alert('Thông báo', 'Vui lòng chọn phương thức thanh toán.');
      return;
    }
    if (!selectedStore) {
      Alert.alert('Thông báo', 'Vui lòng chọn cửa hàng.');
      return;
    }

    try {
      const user = auth().currentUser;
      if (!user) {
        Alert.alert('Lỗi', 'Không thể xác định người dùng.');
        return;
      }

      const userDoc = await firestore()
        .collection('Customer')
        .doc(user.email)
        .get();

      const userData = userDoc.data();
      const finalTotal = getFinalTotal();

      const bill = {
        user: user.email,
        fullName: userData.fullName,
        date: new Date(),
        items: cartItems,
        address,
        paymentMethod: selectedPaymentMethod,
        status: selectedPaymentMethod === 'ZaloPay' ? 'cancelled' : 'confirmed',
        deliveryStatus: 'pending',
        totalAmount: finalTotal,
        voucherCode: appliedVoucher ? appliedVoucher.code : "Không có",
        voucherDiscount: appliedVoucher ? appliedVoucher.discount : 0,
        store: {
          name: selectedStore.name,
          address: selectedStore.address
        }
      };

      if (selectedPaymentMethod === 'ZaloPay') {
        const paymentSuccess = await initiateZaloPayment(bill);
        if (paymentSuccess) {
          const billRef = await firestore().collection('Bills').add(bill);
          await billRef.update({
            status: 'completed'
          });
          clearCart();
          navigation.navigate('Bill-nav');
        }
      } else {
        await firestore().collection('Bills').add(bill);
        clearCart();
        Alert.alert('Thông báo','Đơn hàng của bạn đã được xác nhận');
        navigation.navigate('Bill-nav');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi lưu hóa đơn.');
    }
  };

  const initiateZaloPayment = async (bill) => {
    try {
      const app_trans_id = moment().format('YYMMDDHHmmss') + '_' + bill.user.split('@')[0];

      const order = {
        app_id: 2553,
        app_user: bill.user.split('@')[0],
        app_trans_id: app_trans_id,
        app_time: Date.now(),
        amount: bill.totalAmount,
        item: JSON.stringify(bill.items.map(item => ({
          itemid: item.id,
          itemname: item.name,
          itemprice: item.price,
          itemquantity: item.quantity
        }))),
        description: 'Thanh toán đơn hàng #' + app_trans_id,
        embed_data: JSON.stringify({ promotioninfo: "", merchantinfo: "du lieu rieng cua ung dung" }),
        bank_code: "zalopayapp",
        callback_url: "https://yourdomain.com/callback",
        mac: ""
      };

      console.log('Order Data:', order);

      const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
      order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      const responseData = await response.json();
      console.log('Response Data:', responseData);
      
      if (responseData.return_code === 1 && responseData.order_url) {
        await Linking.openURL(responseData.order_url);
        return true;
      } else {
        Alert.alert('Error', 'Payment initiation failed!');
        return false;
      }
    } catch (error) {
      console.error('Payment Error:', error);
      Alert.alert('Error', 'An error occurred during payment.');
      return false;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Entypo name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Phương thức thanh toán</Text>
      </View>
      <Text style={styles.label}>Nhập thông tin địa chỉ:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập thông tin địa chỉ"
        value={address}
        onChangeText={setAddress}
      />
      <Text style={styles.label}>Chọn phương thức thanh toán:</Text>
      <TouchableOpacity
        style={[
          styles.paymentButton,
          selectedPaymentMethod === 'ZaloPay' && styles.selectedButton,
        ]}
        onPress={() => setSelectedPaymentMethod('ZaloPay')}
      >
        <Text style={styles.buttonText}>Thanh toán tiền qua ZaloPay</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.paymentButton,
          selectedPaymentMethod === 'Cash' && styles.selectedButton,
        ]}
        onPress={() => setSelectedPaymentMethod('Cash')}
      >
        <Text style={styles.buttonText}>Nhận hàng và trả tiền mặt</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Chọn cửa hàng:</Text>
      <View style={styles.storeContainer}>
        {stores.map((store) => (
          <TouchableOpacity
            key={store.id}
            style={[
              styles.storeButton,
              selectedStore?.id === store.id && styles.selectedButton,
            ]}
            onPress={() => setSelectedStore(store)}
          >
            <Text style={styles.buttonText}>{store.name}</Text>
            <Text style={styles.addressText}>{store.address}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.payButton}
        onPress={handlePayment}
      >
        <Text style={styles.payButtonText}>Xác nhận</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  paymentButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#D17842',
  },
  buttonText: {
    color: '#000',
  },
  payButton: {
    backgroundColor: '#D17842',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    justifyContent:'center',
  },
  storeContainer: {
    marginBottom: 0,
  },
  storeButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default RequireAuth(PaymentScreen);
