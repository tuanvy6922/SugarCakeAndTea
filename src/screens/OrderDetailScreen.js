import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import React from 'react';

const OrderDetailScreen = ({ route }) => {
  if (!route.params || !route.params.order) {
    return (
      <View style={styles.container}>
        <Text>Không có thông tin đơn hàng</Text>
      </View>
    );
  }

  const { order } = route.params;

  const totalAmount = order.items.reduce((total, product) => {
    const price = parseFloat(product.price) || 0;
    return total + (price * product.quantity);
  }, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.billContainer}>
        <Text style={styles.billHeader}>Đơn hàng</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          <Text style={styles.billText}>Khách hàng: {order.fullName}</Text>
          <Text style={styles.billText}>Tài khoản: {order.user}</Text>
          <Text style={styles.billText}>
            Thời gian giao dịch: {order.date ? new Date(order.date).toLocaleString('vi-VN') : 'N/A'}
          </Text>
          <Text style={styles.billText}>Địa chỉ: {order.address}</Text>
          <Text style={styles.billText}>Phương thức thanh toán: {order.paymentMethod}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>
          {order.items.map((product, index) => (
            <View key={index} style={styles.productContainer}>
              {product.image && (
                <Image source={{ uri: product.image }} style={styles.productImage} />
              )}
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{product.name}</Text>
                <View style={styles.quantityPriceContainer}>
                  <Text style={styles.sizeText}>Size: {product.size}</Text>
                  <Text style={styles.quantityText}>Số lượng: {product.quantity}</Text>
                </View>
                <Text style={styles.priceText}>
                  Giá: {Number(parseFloat(product.price).toFixed(0)).toLocaleString('en-US')} VND
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.totalText}>
          Tổng tiền: {Number(totalAmount.toFixed(0)).toLocaleString('en-US')} VND
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  billContainer: {
    padding: 15,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  billHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#D17842',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
  },
  billText: {
    fontSize: 16,
    marginVertical: 5,
  },
  productContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  quantityPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  sizeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#D17842',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 15,
    marginRight: 10,
  },
  quantityText: {
    fontSize: 14,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D17842',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 20,
    color: '#D17842',
  },
});

export default OrderDetailScreen;