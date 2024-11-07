import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Image, TouchableOpacity, ToastAndroid } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { useFavorite } from '../components/FavoriteContext';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const FavoritesScreen = () => {
  const { favoriteItems, removeFavorite, setFavoriteItems } = useFavorite();
  const user = auth().currentUser;

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const favoriteRef = firestore().collection('USERS').doc(user.email).collection('Favorite');
        const snapshot = await favoriteRef.get();
        const favorites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFavoriteItems(favorites);
      }
    };

    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = async (itemId) => {
    const favoriteRef = firestore().collection('USERS').doc(user.email).collection('Favorite').doc(itemId);
    await favoriteRef.delete();
    removeFavorite(itemId);

    ToastAndroid.show("Sản phẩm đã được xoá khỏi danh sách yêu thích.", ToastAndroid.SHORT);
  };

  return (
    <View style={styles.container}>
      {favoriteItems.length > 0 ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={favoriteItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.favoriteItem}>
              <Image source={{ uri: item.image }} style={styles.favoriteImage} />
              <View style={styles.favoriteInfo}>
                <View style={styles.favoriteNameContainer}>
                  <Text style={styles.favoriteName}>{item.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveFavorite(item.id)}>
                    <Entypo name="heart" size={28} color="red" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.favoritePrice}>{(item.price[item.selectedSize] || 'N/A').toLocaleString('en-US')} VND</Text>
                <Text style={styles.favoriteDescription}>{item.description.substring(0, 100)}...</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.noFavoritesContainer}>  
          <Text style={styles.noFavoritesText}>Không có sản phẩm yêu thích nào.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Màu nền nhẹ nhàng
    padding: 20,
    marginBottom: 30,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff', // Màu nền cho mục yêu thích
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  favoriteImage: {
    width: 70, // Kích thước hình ảnh lớn hơn
    height: 70,
    borderRadius: 10,
    marginRight: 15,
  },
  favoriteInfo: {
    flex: 1,
    justifyContent: 'center', // Căn giữa thông tin
  },
  favoriteNameContainer: {
    flexDirection: 'row', // Đặt hướng nằm ngang
    alignItems: 'center', // Căn giữa biểu tượng và tên
    justifyContent: 'space-between',
  },
  favoriteName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333', // Màu chữ tối
  },
  favoritePrice: {
    fontSize: 16,
    color: '#4caf50', // Màu xanh lá cho giá
    marginBottom: 5,
  },
  favoriteDescription: {
    fontSize: 14,
    color: '#777', // Màu chữ nhạt hơn cho mô tả
  },
  noFavoritesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noFavoritesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default FavoritesScreen;
