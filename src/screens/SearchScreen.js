import { StyleSheet, Image, Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import firestore from "@react-native-firebase/firestore";
import { useNavigation } from '@react-navigation/native';
import SearchProductAnimation from '../components/SearchProductAnimation';

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterProducts = (query) => { 
    if (query) {
      const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  };

  const handleSearchInputChange = (query) => {
    setSearchQuery(query);
    filterProducts(query);
  };

  const getAllProducts = async () => {
    try {
      const querySnapshot = await firestore().collection('Product').get();
      const productsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllProducts(productsList);
    } catch (error) {
      console.error("Error fetching products: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  const navigateToDetail = (product) => {
    navigation.navigate('DetailScreen', { product });
  };

  if (loading) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={24} color="grey" />
        <TextInput 
          placeholder='Tìm kiếm sản phẩm' 
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearchInputChange}
        />
      </View>
      
      {/* Danh sách sản phẩm */}
      {filteredProducts.length === 0 ? (
        <SearchProductAnimation />
      ) : (
        <FlatList 
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigateToDetail(item)} style={styles.productCard}>
              <Image source={{ uri: item.imagelink_square }} style={styles.itemImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productDescription}>{item.special_ingredient}</Text>
                <Text style={styles.productPrice}>
                  Giá: {item.price && item.price.S ? item.price.S.toLocaleString('en-US') : 'N/A'} VND
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: 'grey',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 25,
    elevation: 3,
    marginBottom: 10,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: 14,
    color: 'grey',
  },
  productPrice: {
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
  },
  flatListContent: {
    paddingBottom: 80,
  },
});