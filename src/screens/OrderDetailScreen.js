import { StyleSheet, Text, View, ScrollView, Image, Alert } from 'react-native';
import React from 'react';
import firestore from '@react-native-firebase/firestore';
import { TouchableOpacity } from 'react-native';

const OrderDetailScreen = ({ route, navigation }) => {
  if (!route.params || !route.params.order) {
    return (
      <View style={styles.container}>
        <Text>Không có thông tin đơn hàng</Text>
      </View>
    );
  }

  const { order } = route.params;

  const cancelOrder = async () => {
    try {
      Alert.alert(
        "Xác nhận hủy đơn",
        "Bạn có chắc chắn muốn hủy đơn hàng này?",
        [
          {
            text: "Không",
            style: "cancel"
          },
          {
            text: "Có", 
            onPress: async () => {
              await firestore()
                .collection('Bills')
                .doc(order.id)
                .update({
                  status: 'cancelled'
                });
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert("Lỗi", "Không thể hủy đơn hàng. Vui lòng thử lại sau.");
    }
  };

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          <Text style={styles.billText}>Tổng tiền: {Number(order.totalAmount).toLocaleString('en-US')} VND</Text>
          <View style={styles.voucherInfo}>
            <Text style={[
              styles.voucherText,
              order.voucherCode !== "Không có" ? styles.hasVoucherText : styles.noVoucherText
            ]}>
              {order.voucherCode !== "Không có" 
                ? `Đã áp dụng mã giảm giá: ${order.voucherCode} (${order.voucherDiscount * 100}%)`
                : `Mã giảm giá: ${order.voucherCode}`
              }
            </Text>
          </View>

          {order.paymentMethod === 'Cash' && order.status !== 'cancelled' && order.status !== 'completed' && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={cancelOrder}
            >
              <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
          )}
        </View>
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
    marginBottom: 60,
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
  voucherInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#D17842',
  },
  voucherText: {
    fontStyle: 'italic',
  },
  hasVoucherText: {
    color: '#D17842',
  },
  noVoucherText: {
    color: '#666',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderDetailScreen;