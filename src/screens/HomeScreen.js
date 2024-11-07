// src/screens/HomeScreen.js
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import Header from '../components/Headers';
import Slider from '../components/Slider';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  // Khởi tạo các state để quản lý dữ liệu
  const [sliderList, setSliderList] = useState([]); // Danh sách slider
  const [currentSlide, setCurrentSlide] = useState(0); // Slide hiện tại
  const [data, setData] = useState([]); // Dữ liệu sản phẩm
  const user = auth().currentUser; // Người dùng hiện tại
  const [categories, setCategories] = useState([]); // Danh sách thể loại
  const [selectedCategory, setSelectedCategory] = useState('All'); // Thể loại đã chọn
  const [filteredData, setFilteredData] = useState([]); // Dữ liệu sản phẩm đã lọc
  const navigation = useNavigation(); // Điều hướng giữa các màn hình

  useEffect(() => {
    // Lấy dữ liệu từ Firestore
    const unsubscribeSliders = firestore()
      .collection('Sliders')
      .onSnapshot(querySnapshot => {
        const sliders = querySnapshot.docs.map(doc => doc.data());
        setSliderList(sliders); // Cập nhật danh sách slider
      });

    const unsubscribeCategories = firestore()
      .collection('Category')
      .onSnapshot(querySnapshot => {
        const categoriesList = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
        setCategories([{ name: 'All' }, ...categoriesList]); // Cập nhật danh sách thể loại
      });

    const unsubscribeProducts = firestore()
      .collection('Product')
      .onSnapshot(querySnapshot => {
        const productsList = querySnapshot.docs.map(doc => {
          const productData = doc.data();
          return {
            id: doc.id,
            ...productData,
            price: productData.price
          };
        });
        setData(productsList); // Cập nhật danh sách sản phẩm
      });

    return () => {
      // Hủy đăng ký khi component bị hủy
      unsubscribeSliders();
      unsubscribeCategories();
      unsubscribeProducts();
    };
  }, []);

  // Tự động chuyển slide sau mỗi 5 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % sliderList.length);
    }, 5000);
    return () => clearInterval(interval); // Dọn dẹp interval khi component bị hủy
  }, [sliderList]);

  const handleCategoryPress = (category) => {
    // Xử lý khi người dùng nhấn vào thể loại
    if (category.name === 'All') {
      setFilteredData(data); // Hiển thị tất cả sản phẩm
    } else {
      // Lọc sản phẩm dựa trên tên thể loại
      const filteredProducts = data.filter(item => item.category === category.name);
      navigation.navigate('ItemList', { categoryName: category.name, products: filteredProducts });
    }
  };

  useEffect(() => {
    filterDataByCategory(); // Lọc dữ liệu khi thể loại hoặc dữ liệu thay đổi
  }, [selectedCategory, data]);

  const filterDataByCategory = () => {
    // Lọc dữ liệu sản phẩm theo thể loại đã chọn
    if (selectedCategory === 'All') {
      setFilteredData(data); 
    } else {
      const filtered = data.filter(item => item.category === selectedCategory);
      setFilteredData(filtered);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>
      {/* <Header /> */}
      <Header />
      {/* Slider */ }
      <Slider sliderList={sliderList} currentSlide={currentSlide} />
      {/* Category */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollView}>
        {categories.map((category, index) => (
          <TouchableOpacity 
              key={index} 
            onPress={() => handleCategoryPress(category)} // Sử dụng hàm handleCategoryPress
            style={styles.categoryItem}
            >
            <Text style={[styles.categoryText, selectedCategory.name === category.name && styles.selectedCategoryText]}>
                {category.name} {/* Hiển thị tên thể loại */}
            </Text>
        </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Product */}
      <Text style={styles.sectionText}>Sản phẩm mới nhất</Text>

      <FlatList 
        horizontal
        showsHorizontalScrollIndicator={false}
        data={filteredData
          .sort((a, b) => a.index - b.index) // Sắp xếp sản phẩm theo index giảm dần
          .reverse() // Đảo ngược danh sách
          .slice(0, 4)} // Lấy 4 sản phẩm mới nhất
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('DetailScreen', { product: item })}>
            <View style={styles.itemContainer}>
              {item.imagelink_square ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item.imagelink_square }} style={styles.productImage} />
                  <Text style={styles.newLabel}>Mới</Text> 
                </View>
              ) : (
                <Text style={styles.emptyImageText}>No Image Available</Text>
              )}
              <View style={styles.productDetails}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productDescription} numberOfLines={1}>{item.special_ingredient}</Text>
                <Text style={styles.productPrice}>
                  Price: {item.price && item.price.S ? item.price.S.toLocaleString('en-US') : 'N/A'} VND
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.sectionText}>Sản phẩm nổi bật</Text>

      <FlatList 
        horizontal
        showsHorizontalScrollIndicator={false}
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('DetailScreen', { product: item })}>
            <View style={styles.itemContainer}>
              {item.imagelink_square ? (
                <Image source={{ uri: item.imagelink_square }} style={styles.productImage} />
              ) : (
                <Text style={styles.emptyImageText}>No Image Available</Text>
              )}
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.productDescription} numberOfLines={1}>{item.special_ingredient}</Text>
              <Text style={styles.productPrice}>
                Price: {item.price && item.price.S ? item.price.S.toLocaleString('en-US') : 'N/A'} VND
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    marginTop: 5,
  },
  scrollViewContent: {
    paddingBottom: 80,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 10,
    elevation: 3,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
  },
  categoryScrollView: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 10,
  },
  categoryItem: {
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginTop: 1,
    minHeight: 40,
    maxHeight: 40,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 16,
    color: 'grey',
  },
  sectionText: {
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333', 
    paddingHorizontal: 16, 
  },
  selectedCategoryText: {
    color: 'blue',
    fontWeight: 'bold',
  },
  itemContainer: {
    padding: width * 0.04, // Sử dụng tỷ lệ phần trăm của chiều rộng màn hình
    borderRadius: 10,
    backgroundColor: '#fff',
    margin: width * 0.02, // Sử dụng tỷ lệ phần trăm của chiều rộng màn hình
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    maxHeight: height * 0.4, // Tối đa chiều cao
    width: width * 0.4, // Đặt chiều rộng cố định cho mỗi item
  },
  productImage: {
    width: '100%', // Đặt chiều rộng hình ảnh bằng 100% của item
    height: height * 0.2, // Chiều cao hình ảnh dựa trên chiều cao màn hình
    borderRadius: 10,
    marginBottom: 8,
  },
  newLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  newLabel: {
    position: 'absolute',
    top: height * 0.01, // Đặt vị trí nhãn "Mới" dựa trên chiều cao màn hình
    left: width * 0.01, // Đặt vị trí nhãn "Mới" dựa trên chiều rộng màn hình
    backgroundColor: 'red',
    color: 'white',
    padding: 4,
    borderRadius: 5,
    fontSize: width * 0.03, // Kích thước chữ dựa trên chiều rộng màn hình
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: 12,
    color: 'grey',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: 'green',
    fontWeight: 'bold',
    marginBottom: 8, // Thêm khoảng cách dưới giá
  },
  emptyImageText: {
    textAlign: 'center',
    color: 'grey',
  },
  addToCartButton: {
    backgroundColor: '#D17842',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    marginTop: 10,
    minWidth: 100,
  },
  buttonText: {
    color: '#fff', // Đặt màu chữ cho nút
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative', // Để có thể đặt nhãn "Mới" ở góc
  },
});