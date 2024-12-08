import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { AntDesign, Entypo } from '@expo/vector-icons';

const OrderHistoryScreen = ({ navigation }) => {
  const [bills, setBills] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const unsubscribe = firestore()
      .collection('Bills')
      .where('user', '==', user.email)
      .onSnapshot(snapshot => {
        const billsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date ? data.date.toDate() : null,
          };
        });

        // Sắp xếp hóa đơn theo ngày giảm dần
        billsData.sort((a, b) => b.date - a.date);

        setBills(billsData);
      });

    return () => unsubscribe();
  }, []);

  // Chuyển đổi trạng thái hoá đơn sang tiếng Việt
  const getVietnameseStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'Thanh toán hoàn tất';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'processing':
        return 'Đang xử lý';
      default:
        return status || 'Không xác định';
    }
  };

  // Function lọc bills
  const getFilteredBills = () => {
    let filtered = [...bills];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(bill => bill.status === filterStatus);
    }

    if (filterDate === 'thisMonth') {
      const now = new Date();
      filtered = filtered.filter(bill => {
        const billDate = new Date(bill.date);
        return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
      });
    } else if (filterDate === 'lastMonth') {
      const now = new Date();
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      filtered = filtered.filter(bill => {
        const billDate = new Date(bill.date);
        return billDate.getMonth() === lastMonth && billDate.getFullYear() === year;
      });
    }

    return filtered;
  };

  // Component cho filter modal
  const FilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isFilterVisible}
      onRequestClose={() => setIsFilterVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Bộ lọc</Text>
            <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
              <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Trạng thái:</Text>
            <View style={styles.filterOptions}>
              {['all', 'confirmed', 'processing', 'completed', 'cancelled'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterOption,
                    filterStatus === status && styles.filterOptionActive
                  ]}
                  onPress={() => setFilterStatus(status)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filterStatus === status && styles.filterOptionTextActive
                  ]}>
                    {status === 'all' ? 'Tất cả' :
                     status === 'confirmed' ? 'Đã xác nhận' :
                     status === 'processing' ? 'Đang xử lý' :
                     status === 'completed' ? 'Hoàn tất' : 'Đã hủy'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Thời gian:</Text>
            <View style={styles.filterOptions}>
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'thisMonth', label: 'Tháng này' },
                { value: 'lastMonth', label: 'Tháng trước' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    filterDate === option.value && styles.filterOptionActive
                  ]}
                  onPress={() => setFilterDate(option.value)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filterDate === option.value && styles.filterOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderItem = ({ item }) => {
    const orderData = {
      ...item,
      date: item.date ? item.date.toISOString() : null,
    };
    
    return (
      <TouchableOpacity 
        style={styles.billContainer}
        onPress={() => navigation.navigate('OrderDetail', { order: orderData })}
      >
        <Text style={styles.billText}>Khách hàng: {item.fullName}</Text>
        <Text style={styles.billText}>
          Thời gian giao dịch: {item.date ? item.date.toLocaleString('vi-VN') : 'N/A'}
        </Text>
        <Text style={styles.billText}>Địa chỉ: {item.address}</Text>
        <Text style={styles.billText}>Trạng thái: {getVietnameseStatus(item.status)}</Text>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>
            Tổng tiền: {Number(item.totalAmount).toLocaleString('en-US')} VND
          </Text>
          <View style={styles.detailContainer}>
            <Text style={styles.detailText}>Xem chi tiết</Text>
            <AntDesign name="right" size={20} color="blue" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setIsFilterVisible(true)}
        >
          <Entypo name="sound-mix" size={24} color="#D17842" />
        </TouchableOpacity>
      </View>

      <FilterModal />
      
      {getFilteredBills().length > 0 ? (
        <FlatList
          data={getFilteredBills()}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.title}>Không tìm thấy đơn hàng nào!</Text>
        </View>
      )}
    </View>
  );
};

export default OrderHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
    paddingBottom: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  billContainer: {
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  billText: {
    fontSize: 16,
    marginVertical: 2,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
  },
  productImage: {
    width: 60,
    height: 60,
    marginRight: 15,
    borderRadius: 5,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#D17842',
  },
  productDetails: {
    flex: 1,
  },
  quantityPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  SizeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: 'orange',
    borderRadius: 20,
    backgroundColor: 'red',
    paddingHorizontal: 5,
    marginRight: 5,
  },
  quantityText: {
    fontSize: 16,
    paddingLeft:5,
    borderLeftWidth:2,
    marginBottom: 2,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'D17842',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  promptText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#888',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  detailText: {
    fontSize: 14,
    color: 'blue',
    marginRight: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    shadowColor: '#000',  // Thêm shadow để nổi bật
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D17842',
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: '#D17842',
  },
  filterOptionText: {
    color: '#D17842',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
});
