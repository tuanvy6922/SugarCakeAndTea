// src/contexts/FavoriteContext.js
import React, { createContext, useState, useContext } from 'react';

const FavoriteContext = createContext();

export const useFavorite = () => useContext(FavoriteContext);

export const FavoriteProvider = ({ children }) => {
  const [favoriteItems, setFavoriteItems] = useState([]);

  const addFavorite = (item, selectedSize) => {
    const itemWithSize = { 
      ...item, 
      selectedSize, 
      image: item.imagelink_square // Đảm bảo lưu hình ảnh
    }; 
    setFavoriteItems([...favoriteItems, itemWithSize]);
  };

  const removeFavorite = (itemId) => {
    setFavoriteItems(favoriteItems.filter(item => item.id !== itemId));
  };

  const isFavorite = (itemId) => {
    return favoriteItems.some(item => item.id === itemId);
  };

  return (
    <FavoriteContext.Provider value={{ favoriteItems, setFavoriteItems, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};
