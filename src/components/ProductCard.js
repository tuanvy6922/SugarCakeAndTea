// import React from 'react';
// import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import { useNavigation } from '@react-navigation/native';

// const ItemList = () => {
//   const route = useRoute();
//   const { categoryName, products } = route.params; // Nhận categoryName và products từ navigation
//   const navigation = useNavigation();

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={products}
//         keyExtractor={(item) => item.id.toString()}
//         numColumns={2} // Chia thành 2 cột
//         key={products.length} // Thay đổi key để làm mới FlatList
//         renderItem={({ item }) => (
//           <TouchableOpacity onPress={() => navigation.navigate('DetailScreen', { product: item })} style={styles.itemContainer}>
//             <Image source={{ uri: item.imagelink_square }} style={styles.itemImage} />
//             <Text style={styles.itemName}>{item.name}</Text>
//             <Text style={styles.itemPrice}>Price: {item.price && item.price.S ? item.price.S : 'N/A'} VND</Text>
//             {item.special_ingredient && (
//               <Text style={styles.specialIngredient}>Nguyên liệu đặc biệt: {item.special_ingredient}</Text>
//             )}
//           </TouchableOpacity>
//         )}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#f0f0f0',
//   },
//   itemContainer: {
//     flex: 1,
//     padding: 8,
//     backgroundColor: '#fff',
//     margin: 8,
//     borderRadius: 8,
//     alignItems: 'flex-start',
//   },
//   itemImage: {
//     width: '100%',
//     height: 90, // Giảm chiều cao để phù hợp với hai cột
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   itemName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 4, // Thêm khoảng cách dưới tên sản phẩm
//   },
//   itemPrice: {
//     color: 'green',
//     fontWeight: 'bold',
//     marginBottom: 4, // Thêm khoảng cách dưới giá
//   },
//   specialIngredient: {
//     fontStyle: 'italic',
//     color: 'gray',
//     marginBottom: 8, // Thêm khoảng cách dưới nguyên liệu đặc biệt
//   },
//   addToCartButton: {
//     backgroundColor: '#D17842', // Màu nền xanh lá
//     borderRadius: 20, // Bo tròn góc
//     paddingVertical: 6, // Giảm khoảng cách dọc
//     paddingHorizontal: 16, // Giảm khoảng cách ngang
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 2, // Giảm độ đổ bóng
//     marginTop: 8, // Khoảng cách trên
//     minWidth: 100, // Đặt chiều rộng tối thiểu
//     height: 35, // Chiều cao cố định
//     alignSelf: 'center',
//   },
//   buttonText: {
//     color: '#fff', // Màu chữ
//     fontWeight: 'bold',
//     fontSize: 14, // Giảm kích thước chữ
//   },
// });

// export default ItemList;