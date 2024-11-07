import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

const ItemList = () => {
  const route = useRoute();
  const { categoryName, products } = route.params; // Nhận categoryName và products từ navigation
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('DetailScreen', { product: item })} style={styles.itemContainer}>
            <Image source={{ uri: item.imagelink_square }} style={styles.itemImage} />
            <View style={styles.textContainer}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.specialIngredient}>{item.special_ingredient}</Text>
              <Text style={styles.itemPrice}>Price: {item.price && item.price.S ? item.price.S.toLocaleString('en-US') : 'N/A'} VND</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  itemContainer: {
    flexDirection: 'row', // Sắp xếp theo hàng
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2, // Đổ bóng
    alignItems: 'center',
  },
  itemImage: {
    width: 80, // Chiều rộng hình ảnh
    height: 80, // Chiều cao hình ảnh
    borderRadius: 8,
    marginRight: 16, // Khoảng cách giữa hình ảnh và văn bản
  },
  textContainer: {
    flex: 1, // Để văn bản chiếm không gian còn lại
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemPrice: {
    color: 'green',
    fontWeight: 'bold',
    marginBottom: 4, // Thêm khoảng cách dưới giá
  },
  specialIngredient: {
    fontStyle: 'italic',
    color: 'gray',
  },
});

export default ItemList;