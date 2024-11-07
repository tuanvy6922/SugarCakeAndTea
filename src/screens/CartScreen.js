// src/screens/CartScreen.js
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import React, { useContext } from 'react';
import EmptyListAnimation from '../components/EmptyListAnimation';
import { CartContext } from '../components/CartContext'; // Import CartContext
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window') 

const CartScreen = () => {
  const { cartItems, removeFromCart, addToCart, removeAllFromCart } = useContext(CartContext); // Lấy cartItems từ CartContext
  const navigation = useNavigation();
  
  const handlePaymentPress = () => {
    if (cartItems.length > 0) {
      navigation.navigate('PaymentScreen');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>
          Tổng: {cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString('en-US')} VND
        </Text>
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
    padding: width * 0.05 ,
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
    borderRadius: 5,
    paddingHorizontal:20,
    paddingVertical:12,
    marginTop: 5,
    paddingLeft:40,
    paddingRight:40,
    marginLeft:30,
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
});

export default CartScreen;
