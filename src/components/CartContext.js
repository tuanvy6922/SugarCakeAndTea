import React, { createContext, useState } from 'react';
import { firebase } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tạo context cho giỏ hàng
export const CartContext = createContext();

// Tạo provider cho giỏ hàng
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]); // Khởi tạo giỏ hàng rỗng
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  // Hàm thêm sản phẩm vào giỏ hàng
  const addToCart = (item) => {
    setCartItems((prevItems) => {
      // Kiểm tra sản phẩm có tồn tại trong giỏ hàng hay không
      const existingItem = prevItems.find((i) => i.index === item.index && i.size === item.size);

      // Nếu sản phẩm tồn tại, tăng số lượng lên 1
      if (existingItem) {
        return prevItems.map((i) =>
          i.index === item.index && i.size === item.size ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      // Thêm sản phẩm mới với số lượng 1
      return [...prevItems, { ...item, quantity: 1 }];
    });
    console.log('Sản phẩm đã thêm vào giỏ hàng:', item); // Kiểm tra thông tin sản phẩm
  };

  // Hàm giảm số lượng sản phẩm trong giỏ hàng
  const removeFromCart = (index, size) => {
    setCartItems((prevItems) => {
      // Cập nhật số lượng sản phẩm trong giỏ hàng
      const updatedItems = prevItems.map((item) => {
        // Nếu sản phẩm tồn tại, giảm số lượng đi 1
        if (item.index === index && item.size === size) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }).filter(item => item.quantity > 0); // Xóa sản phẩm nếu số lượng bằng 0
      return updatedItems;
    });
    console.log('Sản phẩm đã giảm số lượng:', index, size); // Kiểm tra thông tin sản phẩm
  };

  // Hàm xóa sản phẩm hoàn toàn khỏi giỏ hàng
  const removeAllFromCart = (index, size) => {
    setCartItems((prevItems) => prevItems.filter(item => !(item.index === index && item.size === size)));
    console.log('Sản phẩm đã bị xóa khỏi giỏ hàng:', index, size); // Kiểm tra thông tin sản phẩm
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedVoucher(null);
  };

  const applyVoucher = async (code) => {
    try {
      // Thử lấy thông tin từ AsyncStorage trước
      const userString = await AsyncStorage.getItem('userData');
      let userCode;
      
      // Nếu có thông tin user trong AsyncStorage, lấy mã người dùng
      if (userString) {
        const userData = JSON.parse(userString);
        userCode = userData.userCode;
      }

      // Double check với Firebase nếu không có trong AsyncStorage
      if (!userCode) {
        const currentUser = auth().currentUser;
        if (!currentUser) {
          return { success: false, message: 'Vui lòng đăng nhập để sử dụng voucher' };
        }

        // Lấy thông tin người dùng từ Firebase
        const userDoc = await firestore()
          .collection('Customer')
          .doc(currentUser.email)
          .get();

        if (!userDoc.exists) {
          return { success: false, message: 'Không tìm thấy thông tin người dùng' };
        }

        userCode = userDoc.data().userCode;
        
        // Cập nhật lại AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(userDoc.data()));
      }

      if (!userCode) {
        return { success: false, message: 'Không tìm thấy mã người dùng' };
      }

      // Kiểm tra voucher
      const voucherSnapshot = await firestore()
        .collection('Vouchers')
        .where('code', '==', code)
        .where('isActive', '==', true)
        .get();

      if (voucherSnapshot.empty) {
        return { success: false, message: 'Mã giảm giá không hợp lệ' };
      }

      // Lấy thông tin voucher từ Firebase
      const voucherDoc = voucherSnapshot.docs[0];
      const voucherData = voucherDoc.data();
      const now = Date.now();

      // Kiểm tra thời hạn
      if (now < voucherData.startDate || now > voucherData.endDate) {
        return { success: false, message: 'Mã giảm giá đã hết hạn' };
      }

      // Kiểm tra giá trị đơn hàng tối thiểu
      const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      if (cartTotal < voucherData.minimumAmount) {
        return { 
          success: false, 
          message: `Đơn hàng tối thiểu ${voucherData.minimumAmount.toLocaleString('en-US')} VND` 
        };
      }

      // Kiểm tra xem user đã sử dụng voucher chưa
      if (voucherData.usedBy && voucherData.usedBy.includes(userCode)) {
        return { success: false, message: 'Bạn đã sử dụng mã giảm giá này' };
      }

      // Cập nhật danh sách người đã sử dụng
      await firestore()
        .collection('Vouchers')
        .doc(voucherDoc.id)
        .update({
          usedBy: firestore.FieldValue.arrayUnion(userCode)
        });

      // Cập nhật mã giảm giá đã áp dụng
      setAppliedVoucher(voucherData);
      return { success: true, message: 'Áp dụng mã giảm giá thành công' };

    } catch (error) {
      console.error('Lỗi khi áp dụng voucher:', error);
      return { success: false, message: 'Đã có lỗi xảy ra' };
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
  };

  const getFinalTotal = () => {
    // Tính tổng giá trị giỏ hàng
    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    // Tính giá trị giảm giá
    const discount = appliedVoucher ? cartTotal * appliedVoucher.discount : 0;
    // Trả về tổng giá trị sau khi áp dụng giảm giá
    return cartTotal - discount;
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      removeAllFromCart, 
      clearCart,
      applyVoucher,
      removeVoucher,
      appliedVoucher,
      getFinalTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};
