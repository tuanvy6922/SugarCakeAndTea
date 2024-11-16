import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { AntDesign } from '@expo/vector-icons';

const OrderHistoryScreen = ({ navigation }) => {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const unsubscribe = firestore()
      .collection('Bills')
      .where('user', '==', user.email)
      .onSnapshot(snapshot => {
        const billsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date ? data.date.toDate() : null,
          };
        });

        // Sắp xếp hóa đơn theo ngày giảm dần
        billsData.sort((a, b) => b.date - a.date);

        setBills(billsData);
      });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => {
    // Tạo một bản sao của item và chuyển đổi date thành string
    const orderData = {
      ...item,
      date: item.date ? item.date.toISOString() : null, // Chuyển date thành string
    };

    return (
      <TouchableOpacity 
        style={styles.billContainer}
        onPress={() => navigation.navigate('OrderDetail', { order: orderData })}
      >
        <Text style={styles.billText}>Khách hàng: {item.fullName}</Text>
        <Text style={styles.billText}>
          Thời gian giao dịch: {item.date ? item.date.toLocaleString('vi-VN') : 'N/A'}
        </Text>
        <Text style={styles.billText}>Địa chỉ: {item.address}</Text>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>
            Tổng tiền: {Number(item.totalAmount).toLocaleString('en-US')} VND
          </Text>
          <View style={styles.detailContainer}>
            <Text style={styles.detailText}>Xem chi tiết</Text>
            <AntDesign name="right" size={20} color="blue" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {bills.length > 0 ? (
        <FlatList
          showsVerticalScrollIndicator={true}
          data={bills}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.title}>Bạn chưa có lịch sử đơn hàng nào !</Text>
          <Text style={styles.promptText}>Hãy mua sắm ngay để có hóa đơn đầu tiên của bạn.</Text>
        </View>
      )}
    </View>
  );
};

export default OrderHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
    paddingBottom: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  billContainer: {
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  billText: {
    fontSize: 16,
    marginVertical: 2,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
  },
  productImage: {
    width: 60,
    height: 60,
    marginRight: 15,
    borderRadius: 5,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#D17842',
  },
  productDetails: {
    flex: 1,
  },
  quantityPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  SizeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: 'orange',
    borderRadius: 20,
    backgroundColor: 'red',
    paddingHorizontal: 5,
    marginRight: 5,
  },
  quantityText: {
    fontSize: 16,
    paddingLeft:5,
    borderLeftWidth:2,
    marginBottom: 2,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'D17842',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  promptText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#888',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  detailText: {
    fontSize: 14,
    color: 'blue',
    marginRight: 5,
  },
});
