// src/screens/DetailScreen.js
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ToastAndroid } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CartContext } from '../components/CartContext';
import Toast from 'react-native-toast-message';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useFavorite } from '../components/FavoriteContext';

const DetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { product, index } = route.params; // Lấy product và index từ params
  const { cartItems, addToCart } = useContext(CartContext); // Lấy cartItems từ Context
  const [ currentProduct, setCurrentProduct] = useState(product); // Khởi tạo state cho sản phẩm
  const { isFavorite, addFavorite, removeFavorite } = useFavorite();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  useEffect(() => {
    // Nếu product không tồn tại, tìm sản phẩm trong cartItems dựa trên index
    if (!currentProduct && index !== undefined) {
      const foundProduct = cartItems[index]; // Sử dụng index để lấy sản phẩm
      setCurrentProduct(foundProduct);
    }
  }, [product, index, cartItems]);

  if (!currentProduct) {
    return <Text>Loading...</Text>; // Hoặc hiển thị thông báo không tìm thấy sản phẩm
  }

  // Lấy giá từ sản phẩm
  const price = currentProduct.price || {}; // Ensure price is an object
  const sizeOptions = ['S', 'M', 'L']; // Định nghĩa thứ tự mong muốn
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]); // Khởi tạo kích thước đã chọn
  
  // Hàm xử lý thêm sản phẩm vào giỏ hàng
  const handleAddToCart = () => {
    const itemToAdd = {
      index: currentProduct.index, // Sử dụng index
      type: currentProduct.type,
      name: currentProduct.name,
      image: currentProduct.imagelink_square,
      specialIngredient: currentProduct.special_ingredient,
      size: selectedSize,
      price: price[selectedSize] || 'N/A',
      description: currentProduct.description,
    };
    addToCart(itemToAdd); // Thêm sản phẩm vào giỏ hàng
    console.log('Sản phẩm đã thêm vào giỏ hàng:', itemToAdd);
    Toast.show({
      text1:'Thông báo', 
      text2: `Sản phẩm đã được thêm vào giỏ hàng - Size: ${selectedSize}`,
      position: 'top',
      type: 'info',
      duration: 2000, // Thay đổi thời gian hiển thị ở đây (tính bằng milliseconds)
    });
  };

  const handleToggleFavorite = async () => {
    const userEmail = auth().currentUser.email;
    const favoriteRef = firestore().collection('USERS').doc(userEmail).collection('Favorite').doc(currentProduct.id);

    if (isFavorite(currentProduct.id)) {
      await favoriteRef.delete();
      removeFavorite(currentProduct.id);
      ToastAndroid.show('Đã xóa khỏi danh sách yêu thích', ToastAndroid.SHORT);
    } else {
      await favoriteRef.set({
        ...currentProduct,
        selectedSize, // Thêm selectedSize vào sản phẩm
        image: currentProduct.imagelink_square // Đảm bảo lưu hình ảnh
      });
      addFavorite(currentProduct, selectedSize); // Truyền selectedSize vào đây
      console.log('Image URL:', currentProduct.imagelink_square); // Kiểm tra giá trị hình ảnh
      ToastAndroid.show('Đã thêm vào danh sách yêu thích', ToastAndroid.SHORT);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 70 }}>
      <View style={styles.imageContainer}>
        {currentProduct.imagelink_square ? (
          <Image source={{ uri: currentProduct.imagelink_square }} style={styles.productImage} />
        ) : (
          <Text>No Image Available</Text>
        )}
      </View>

      <View style={styles.imageInfoOuterContainer}>
        <View style={styles.productInfoContainer}>
          <Text style={styles.productName}>{currentProduct.name}</Text>
          <TouchableOpacity style={styles.iconContainerHeart} onPress={handleToggleFavorite}>
            <Entypo name="heart" size={28} color={isFavorite(currentProduct.id) ? 'red' : 'black'} />
          </TouchableOpacity>
        </View>
        <Text style={styles.productRating}>Rating: {currentProduct.ratings_count}</Text>
        <Text style={styles.productSpecialIngredient}>{currentProduct.special_ingredient}</Text>
      </View>

      <Text style={styles.productDescription}>
        {isDescriptionExpanded ? currentProduct.description : `${currentProduct.description.substring(0, 100)}...`}
      </Text>
      <TouchableOpacity onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
        <Text style={styles.toggleDescriptionText}>
          {isDescriptionExpanded ? 'Thu lại' : 'Xem thêm'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sizeLabel}>Size</Text>

      <View style={styles.sizeOptions}>
        {sizeOptions.map((size) => (
          <TouchableOpacity
            key={size}
            style={[styles.sizeOption, selectedSize === size && styles.selectedSizeOption]}
            onPress={() => setSelectedSize(size)}
          >
            <Text>{size}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.productPrice}>
          Price: {price[selectedSize] ? Number(price[selectedSize]).toLocaleString('en-US') : 'N/A'} VND
        </Text>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  productInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainerHeart: {
    backgroundColor: 'transparent',
  },
  imageInfoOuterContainer: {
    paddingVertical: 12, 
    paddingHorizontal: 30, 
    backgroundColor: '#e1e8ee', 
    borderBottomLeftRadius: 40, 
    borderBottomRightRadius: 40, 
  },
  imageContainer: {
    width: '100%',
    height: 250,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  productRating: {
    fontSize: 16,
    color: 'orange',
    marginVertical: 4,
  },
  productSpecialIngredient: {
    fontSize: 16,
    color: 'black',
    marginVertical: 4,
  },
  toggleDescriptionText: {
    color: 'blue',
    marginVertical: 8,
    textAlign: 'center',
  },
  productDescription: {
    fontSize: 16,
    color: 'black',
    marginVertical: 4,
    paddingLeft: 10,
  },
  sizeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
    paddingLeft: 10,
  },
  
  sizeOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  sizeOption: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderWidth: 1,
    borderColor: 'orange',
    borderRadius: 20,
    backgroundColor: 'transparent',
    marginHorizontal: 5,
  },
  selectedSizeOption: {
    borderColor: '#D17842',
    backgroundColor: '#D17842',
    color: '#fff',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Tạo khoảng cách đều giữa giá và nút
    alignItems: 'center',
    padding: 15, // Thêm padding cho container
    marginTop: 20,
    paddingBottom: 20,
  },
  productPrice: {
    fontSize: 20, // Kích thước chữ
    color: 'green', // Màu sắc
    fontWeight: 'bold',
    textAlign: 'left', // Căn trái cho văn bản
  },
  addToCartButton: {
    backgroundColor: '#D17842', // Màu nền của nút
    borderRadius: 10, // Bán kính góc
    paddingHorizontal: 20, // Padding ngang
    paddingVertical: 12, // Padding dọc
    paddingLeft:40,
    paddingRight:40,
    marginLeft:30,
  },
  buttonText: {
    color: '#fff', // Màu chữ
    fontSize: 16, // Kích thước chữ
    fontWeight: 'bold',
  },
});

export default DetailScreen;
