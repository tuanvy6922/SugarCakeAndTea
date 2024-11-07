import { StyleSheet, Text, View, FlatList, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const OrderHistoryScreen = () => {
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
    const totalAmount = item.items.reduce((total, product) => {
      const price = parseFloat(product.price) || 0;
      return total + (price * product.quantity);
    }, 0);

    return (
      <View style={styles.billContainer}>
        <Text style={styles.billText}>Tên: {item.fullName}</Text>
        <Text style={styles.billText}>Tài khoản: {item.user}</Text>
        <Text style={styles.billText}>
          Thời gian giao dịch: {item.date ? item.date.toLocaleString('vi-VN') : 'N/A'}
        </Text>
        <Text style={styles.billText}>Địa chỉ: {item.address}</Text>
        <Text style={styles.billText}>Phương thức thanh toán: {item.paymentMethod}</Text>
        <Text style={styles.billText}>Sản phẩm:</Text>
        {item.items.map((product, index) => (
          <View key={index} style={styles.productContainer}>
            {product.image && (
              <Image source={{ uri: product.image }} style={styles.productImage} />
            )}
            <View style={styles.productDetails}>
              <Text style={styles.billText}>
                {product.name}
              </Text>
              <View style={styles.quantityPriceContainer}>
                <Text style={styles.SizeText}>
                  Size: {product.size}
                </Text>
                <Text style={styles.quantityText}>
                  Số lượng: {product.quantity}
                </Text>
              </View>
              <Text style={styles.priceText}>
                Price: {Number(parseFloat(product.price).toFixed(0)).toLocaleString('en-US') || 'N/A'} VND
              </Text>
            </View>
          </View>
        ))}
        <Text style={styles.totalText}>
          Tổng tiền: {Number(totalAmount.toFixed(0)).toLocaleString('en-US')} VND
        </Text>
      </View>
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
    fontWeight: 'bold',
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
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
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
});
