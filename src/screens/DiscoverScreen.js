import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { AntDesign, Entypo } from '@expo/vector-icons';

const DiscoverScreen = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    // Lắng nghe sự thay đổi từ collection Bills
    const unsubscribeBills = firestore()
      .collection('Bills')
      .onSnapshot(billsSnapshot => {
        const productQuantities = {};

        // Đếm số lượng mua của mỗi sản phẩm
        billsSnapshot.docs.forEach(doc => {
          const billData = doc.data();
          if (billData.items && Array.isArray(billData.items)) {
            billData.items.forEach(item => {
              const productIndex = item.index;
              const quantity = item.quantity || 0;
              productQuantities[productIndex] = (productQuantities[productIndex] || 0) + quantity;
            });
          }
        });

        // Lắng nghe sự thay đổi từ collection Product
        const unsubscribeProducts = firestore()
          .collection('Product')
          .onSnapshot(productsSnapshot => {
            const productsData = productsSnapshot.docs
              .map(doc => ({
                ...doc.data(),
                purchaseCount: productQuantities[doc.data().index] || 0
              }))
              .filter(product => product.purchaseCount > 0) // Chỉ lấy những sản phẩm đã được mua
              .sort((a, b) => b.purchaseCount - a.purchaseCount) // Sắp xếp theo số lượng bán giảm dần
              .slice(0, 6); // Lấy top 10

            setTopProducts(productsData);
            setLoading(false);
          });

        // Cleanup function cho Products listener
        return () => unsubscribeProducts();
      });

    // Cleanup function cho Bills listener
    return () => unsubscribeBills();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('DetailScreen', { product: item })}
    >
      <Image 
        source={{ uri: item.imagelink_square }} 
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productDescription}>
          {item.special_ingredient}
        </Text>
        <View style={styles.statsContainer}>
          <Text style={styles.priceText}>
            {item.price?.S?.toLocaleString('en-US')} VND
          </Text>
          <View style={styles.purchaseCount}>
            <AntDesign name="star" size={16} color="#FFD700" />
            <Text style={styles.countText}>
              Đã bán: {item.purchaseCount}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sản phẩm bán chạy</Text>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => navigation.navigate('SearchScreen')}
        >
          <Entypo name="magnifying-glass" size={24} color="#333" />
          <Text style={styles.searchText}>Tìm kiếm</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D17842" />
        </View>
      ) : (
        <FlatList
          data={topProducts}
          renderItem={renderItem}
          keyExtractor={item => item.index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.noDataText}>Không có dữ liệu sản phẩm</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D17842',
  },
  purchaseCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default DiscoverScreen;
