// src/screens/CartScreen.js
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Dimensions, TextInput, Alert, Platform } from 'react-native';
import React, { useContext, useState } from 'react';
import EmptyListAnimation from '../components/EmptyListAnimation';
import { CartContext } from '../components/CartContext'; // Import CartContext
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window') 

const CartScreen = () => {
  const { 
    cartItems, 
    removeFromCart, 
    addToCart, 
    removeAllFromCart,
    applyVoucher,
    removeVoucher,
    appliedVoucher 
  } = useContext(CartContext);
  const [voucherCode, setVoucherCode] = useState('');
  const navigation = useNavigation();
  
  const handlePaymentPress = () => {
    if (cartItems.length > 0) {
      navigation.navigate('PaymentScreen');
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã giảm giá');
      return;
    }

    const result = await applyVoucher(voucherCode);
    Alert.alert('Thông báo', result.message);
    if (result.success) {
      setVoucherCode('');
    }
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);//tổng giá trị giỏ hàng
  const discount = appliedVoucher ? cartTotal * appliedVoucher.discount : 0;//tính giá trị giảm giá
  const finalTotal = cartTotal - discount;//tính giá trị thanh toán

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {cartItems.length > 0 ? ( 
          cartItems.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <TouchableOpacity onPress={() => removeAllFromCart(item.index, item.size)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>X</Text>
              </TouchableOpacity>
              <View style={styles.imageInfoContainer}>
                  {item.image ? ( // Kiểm tra xem item.image có hợp lệ không
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                  ) : (
                    <Text style={styles.emptyImageText}>No Image Available</Text> // Hiển thị thông báo nếu không có hình ảnh
                  )}
                  <View style={styles.itemInfo}>
                    <View style={styles.nameDetailsContainer}>
                      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.itemDetails}>{item.specialIngredient}</Text>
                    </View>
                  </View>
              </View>
              <View style={styles.detailsContainer}>
                <View style={styles.sizePriceContainer}>
                  <Text style={styles.sizeText}>{item.size}</Text>
                  <Text style={styles.priceText}>
                    {item.price ? `$${Number(item.price).toLocaleString('en-US')}` : 'N/A'} 
                  </Text> 
                </View>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity onPress={() => removeFromCart(item.index, item.size)} style={styles.button}>
                    <Text style={styles.buttonText}>-</Text>
                  </TouchableOpacity>
                  <View style={styles.quantityDisplay}>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                  </View>
                  <TouchableOpacity onPress={() => addToCart(item)} style={styles.buttonRight}>
                    <Text style={styles.buttonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <EmptyListAnimation />
          </View>
        )}
      </ScrollView>

      <View style={styles.summaryContainer}>
        <View style={styles.voucherContainer}>
          <TextInput
            style={styles.voucherInput}
            placeholder="Nhập mã giảm giá"
            value={voucherCode}
            onChangeText={setVoucherCode}
          />
          <TouchableOpacity 
            style={styles.voucherButton} 
            onPress={handleApplyVoucher}
          >
            <Text style={styles.voucherButtonText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>

        {appliedVoucher && (
          <View style={styles.discountContainer}>
            <View style={styles.discountRow}>
              <Text style={styles.summaryLabel}>Tạm tính:</Text>
              <Text style={styles.summaryValue}>{cartTotal.toLocaleString('en-US')} VND</Text>
            </View>
            <View style={styles.discountRow}>
              <Text style={styles.discountLabel}>
                Giảm giá ({appliedVoucher.discount * 100}%):
              </Text>
              <Text style={styles.discountValue}>
                -{discount.toLocaleString('en-US')} VND
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.removeVoucherButton} 
              onPress={removeVoucher}
            >
              <Text style={styles.removeVoucherText}>Xóa mã giảm giá</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
          <Text style={styles.totalValue}>{finalTotal.toLocaleString('en-US')} VND</Text>
        </View>

        <TouchableOpacity
          style={[styles.payButton, cartItems.length === 0 && styles.disabledPayButton]}
          onPress={handlePaymentPress}
          disabled={cartItems.length === 0}
        >
          <Text style={styles.payButtonText}>Thanh Toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 60,
  },
  scrollView: {
    flex: 1,
    padding: width * 0.05,
  },
  itemContainer: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 5,
    position: 'relative',
  },
  imageInfoContainer: {
    flexDirection: 'row', // Sắp xếp hình ảnh và thông tin theo hàng
    alignItems: 'center',
    
  },
  itemImage: {
    height: height*0.1,
    width: width*0.25,
    borderRadius: 10,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  nameDetailsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '80%',
  },
  itemName: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
  itemDetails: {
    color: '#aaa',
    marginBottom: 5,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    paddingVertical: 5,
    borderBottomWidth: 1,
    gap:10,
    borderColor: '#ddd',
  },
  sizePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingRight:20,
    
  },
  sizeText: {
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#D17842',
    color: '#fff',
    marginRight: 10,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 40,
    backgroundColor: '#D17842',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff8c00',
    padding: 5,
    width: width*0.2,
    textAlign: 'center',
    // borderWidth: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius:20,
    backgroundColor:'#f9f9f9',
    marginRight: 10,
    // width: 'auto',
  },
  button: {
    backgroundColor: '#D17842',
    borderRadius: 0,
    borderTopLeftRadius:20,
    borderBottomLeftRadius:20,
    padding: 5,
    width: width*0.1,
    alignItems: 'center',
    justifyContent:'center',
  },
  buttonRight: {
    backgroundColor: '#D17842',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    padding: 5,
    width: width*0.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    color: '#000',
    paddingHorizontal: 5,
    borderWidth: 0,
    borderColor: '#DC3535',
    borderRadius: 5,
    marginHorizontal: 5,
    alignContent:'center'
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent:'space-evenly',
    alignItems:'center',
    padding: 15,
    marginTop: 20,
    paddingBottom: 50,
  },
  totalText: {
    fontSize: 18,
    color: '#DC3535',
    fontWeight: 'bold',
    textAlign:'left',
    
  },
  payButton: {
    backgroundColor: '#D17842',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  removeButtonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    width: width*0.05,
    height: height*0.05,
  },
  disabledPayButton: {
    backgroundColor: '#999', // Màu sắc khi nút bị vô hiệu hóa
  },
  emptyMessageText: {
    fontSize: 16,
    color: '#DC3535',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  voucherContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 10,
  },
  voucherInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  voucherButton: {
    backgroundColor: '#D17842',
    borderRadius: 5,
    padding: 10,
    justifyContent: 'center',
  },
  voucherButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  discountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  discountText: {
    color: '#D17842',
    fontWeight: 'bold',
  },
  removeVoucherText: {
    color: '#DC3535',
    fontWeight: 'bold',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  discountContainer: {
    marginBottom: 10,
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 16,
    color: '#DC3535',
    fontWeight: 'bold',
  },
  discountLabel: {
    fontSize: 16,
    color: '#D17842',
    fontWeight: 'bold',
  },
  discountValue: {
    fontSize: 16,
    color: '#D17842',
    fontWeight: 'bold',
  },
  removeVoucherButton: {
    fontSize: 16,
    color: '#DC3535',
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    color: '#DC3535',
    fontWeight: 'bold',
  },
});

export default CartScreen;
