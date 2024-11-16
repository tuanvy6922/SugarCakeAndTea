import React, { createContext, useState } from 'react';
import { firebase } from '@react-native-firebase/firestore';

// Tạo context cho giỏ hàng
export const CartContext = createContext();

// Tạo provider cho giỏ hàng
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]); // Khởi tạo giỏ hàng rỗng
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  // Hàm thêm sản phẩm vào giỏ hàng
  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.index === item.index && i.size === item.size);
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
      const updatedItems = prevItems.map((item) => {
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
  };

  const applyVoucher = async (code) => {
    try {
      const vouchersRef = firebase.firestore().collection('Vouchers');
      const snapshot = await vouchersRef
        .where('code', '==', code)
        .where('isActive', '==', true)
        .get();

      if (snapshot.empty) {
        return { success: false, message: 'Mã giảm giá không hợp lệ' };
      }

      const voucherData = snapshot.docs[0].data();
      const now = Date.now();

      if (now < voucherData.startDate || now > voucherData.endDate) {
        return { success: false, message: 'Mã giảm giá đã hết hạn' };
      }

      const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      if (cartTotal < voucherData.minimumAmount) {
        return { 
          success: false, 
          message: `Đơn hàng tối thiểu ${voucherData.minimumAmount.toLocaleString('en-US')} VND` 
        };
      }

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
    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discount = appliedVoucher ? cartTotal * appliedVoucher.discount : 0;
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
