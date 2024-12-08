// src/contexts/FavoriteContext.js
import React, { createContext, useState, useContext } from 'react';
// Tạo context cho favorite items
const FavoriteContext = createContext();

// Custom hook để sử dụng context
export const useFavorite = () => useContext(FavoriteContext);

// Provider để cung cấp context cho các component con
export const FavoriteProvider = ({ children }) => {
  const [favoriteItems, setFavoriteItems] = useState([]);

  // Hàm thêm sản phẩm vào danh sách favorite
  const addFavorite = (item, selectedSize) => {
    const itemWithSize = { 
      ...item, 
      selectedSize, 
      image: item.imagelink_square // Đảm bảo lưu hình ảnh
    }; 
    setFavoriteItems([...favoriteItems, itemWithSize]);
  };

  // Hàm xóa sản phẩm từ danh sách favorite
  const removeFavorite = (itemId) => {
    setFavoriteItems(favoriteItems.filter(item => item.id !== itemId));
  };

  // Hàm kiểm tra sản phẩm có trong danh sách favorite hay không
  const isFavorite = (itemId) => {
    return favoriteItems.some(item => item.id === itemId);
  };

  // Trả về provider với các giá trị context
  return (
    <FavoriteContext.Provider value={{ favoriteItems, setFavoriteItems, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};
